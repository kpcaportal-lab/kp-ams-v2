import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../db/pool.js';
import { authenticate } from '../middleware/auth.js';
import { sendInvoiceEmail } from '../services/email.js';

const router = Router();
router.use(authenticate);

// POST /api/invoices — generate single or batch
router.post('/', async (req: Request, res: Response) => {
    try {
        const { invoices, batch } = req.body;
        // invoices = array of invoice objects
        const batchId = batch ? uuidv4() : undefined;
        const results = [];

        for (const inv of invoices) {
            const { assignment_id, invoice_date, udin, kind_attention, reference, address,
                gst_no, new_sales_ledger, narration, professional_fees, out_of_pocket } = inv;

            const netAmount = Number(professional_fees) + Number(out_of_pocket || 0);

            const result = await pool.query(`
        INSERT INTO invoices (
          assignment_id, invoice_date, udin, kind_attention, reference, address,
          gst_no, new_sales_ledger, narration, professional_fees, out_of_pocket,
          net_amount, batch_id, generated_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
                [assignment_id, invoice_date, udin || null, kind_attention, reference, address,
                    gst_no, new_sales_ledger || null, narration, professional_fees,
                    out_of_pocket || 0, netAmount, batchId || null, req.user!.id]
            );

            const invoiceRow = result.rows[0];
            results.push(invoiceRow);

            // Update billed amount in fee allocations
            const invoiceDateObj = new Date(invoice_date);
            // Month in fiscal year: April=1, so month index = (month - 4 + 12) % 12 + 1
            const calMonth = invoiceDateObj.getMonth() + 1;
            const fiscalMonth = calMonth >= 4 ? calMonth - 3 : calMonth + 9;
            await pool.query(
                `UPDATE fee_allocations SET billed_amount = billed_amount + $1, updated_at=NOW()
         WHERE assignment_id=$2 AND month=$3`,
                [professional_fees, assignment_id, fiscalMonth]
            );

            // Send email
            const assignmentData = await pool.query(`
        SELECT a.*, c.name as client_name, pm.email as manager_email, pm.full_name as manager_name
        FROM assignments a
        LEFT JOIN clients c ON c.id = a.client_id
        LEFT JOIN profiles pm ON pm.id = a.manager_id
        LEFT JOIN proposals p ON p.id = a.proposal_id
        WHERE a.id = $1`, [assignment_id]);

            if (assignmentData.rows.length) {
                const asgn = assignmentData.rows[0];
                try {
                    const emailResult = await sendInvoiceEmail({
                        invoiceId: invoiceRow.id,
                        assignmentRef: asgn.proposal_number || assignment_id,
                        clientName: asgn.client_name,
                        invoiceDate: invoice_date,
                        udin, kindAttention: kind_attention, reference, address, gstNo: gst_no,
                        newSalesLedger: new_sales_ledger, narration,
                        professionalFees: Number(professional_fees),
                        outOfPocket: Number(out_of_pocket || 0),
                        netAmount,
                        managerEmail: asgn.manager_email,
                        managerName: asgn.manager_name,
                        category: asgn.category,
                        billingCycle: asgn.billing_cycle,
                        batchId,
                    });
                    await pool.query(
                        `INSERT INTO email_logs (invoice_id, recipient, cc, subject, status, sent_at)
             VALUES ($1,$2,$3,$4,$5,NOW())`,
                        [invoiceRow.id, process.env.ACCOUNTS_EMAIL, asgn.manager_email,
                        `Invoice Request – ${asgn.client_name} – ${invoice_date}`,
                        emailResult.stubbed ? 'sent' : 'sent']
                    );
                } catch (emailErr: any) {
                    await pool.query(
                        `INSERT INTO email_logs (invoice_id, recipient, subject, status, error_msg)
             VALUES ($1,$2,$3,'failed',$4)`,
                        [invoiceRow.id, process.env.ACCOUNTS_EMAIL,
                        `Invoice Request – ${asgn.client_name} – ${invoice_date}`, emailErr.message]
                    );
                }
            }
        }

        res.status(201).json({ success: true, invoices: results, batchId });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/invoices — list invoices
router.get('/', async (req: Request, res: Response) => {
    try {
        const role = req.user!.role;
        const userId = req.user!.id;
        let query = `
      SELECT i.*, c.name as client_name, a.category, pm.full_name as manager_name,
        el.status as email_status
      FROM invoices i
      LEFT JOIN assignments a ON a.id = i.assignment_id
      LEFT JOIN clients c ON c.id = a.client_id
      LEFT JOIN profiles pm ON pm.id = i.generated_by
      LEFT JOIN email_logs el ON el.invoice_id = i.id
      WHERE 1=1`;
        const params: any[] = [];
        if (role === 'manager' || role === 'staff') { params.push(userId); query += ` AND i.generated_by = $${params.length}`; }
        query += ' ORDER BY i.created_at DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// POST /api/invoices/:id/retry-email
router.post('/:id/retry-email', async (req: Request, res: Response) => {
    try {
        const invoiceData = await pool.query(`
      SELECT i.*, a.category, a.billing_cycle, c.name as client_name,
        pm.email as manager_email, pm.full_name as manager_name
      FROM invoices i
      LEFT JOIN assignments a ON a.id = i.assignment_id
      LEFT JOIN clients c ON c.id = a.client_id
      LEFT JOIN profiles pm ON pm.id = i.generated_by
      WHERE i.id = $1`, [req.params.id]);
        if (!invoiceData.rows.length) return res.status(404).json({ error: 'Not found' });
        const inv = invoiceData.rows[0];
        await sendInvoiceEmail({
            invoiceId: inv.id, assignmentRef: inv.assignment_id,
            clientName: inv.client_name, invoiceDate: inv.invoice_date,
            kindAttention: inv.kind_attention, reference: inv.reference, address: inv.address,
            gstNo: inv.gst_no, narration: inv.narration,
            professionalFees: Number(inv.professional_fees), outOfPocket: Number(inv.out_of_pocket),
            netAmount: Number(inv.net_amount), managerEmail: inv.manager_email,
            managerName: inv.manager_name, category: inv.category, billingCycle: inv.billing_cycle,
        });
        await pool.query('UPDATE email_logs SET status=\'sent\', sent_at=NOW(), retry_count=retry_count+1 WHERE invoice_id=$1', [req.params.id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Failed to resend email' }); }
});

// GET /api/invoices/:id/download
router.get('/:id/download', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT i.*, a.category, a.billing_cycle, c.name as client_name, c.gstn as client_gstn,
        pm.full_name as manager_name, a.proposal_number
      FROM invoices i
      LEFT JOIN assignments a ON a.id = i.assignment_id
      LEFT JOIN clients c ON c.id = a.client_id
      LEFT JOIN profiles pm ON pm.id = i.generated_by
      WHERE i.id = $1`, [req.params.id]);

        if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
        const inv = result.rows[0];

        // Dynamic import for PDFKit (ESM)
        const PDFDocument = (await import('pdfkit')).default;
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Invoice_${inv.id}.pdf"`);
        doc.pipe(res);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('Kirtane & Pandit LLP', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text('Chartered Accountants', { align: 'center' });
        doc.moveDown(2);

        // Title
        doc.fontSize(16).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
        doc.moveDown();

        // Invoice details
        const details = [
            ['Invoice ID', inv.id],
            ['Invoice Date', inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-IN') : 'N/A'],
            ['Client Name', inv.client_name || 'N/A'],
            ['GSTN', inv.gst_no || 'N/A'],
            ['Kind Attention', inv.kind_attention || 'N/A'],
            ['Reference', inv.reference || 'N/A'],
            ['Address', inv.address || 'N/A'],
            ['Category', (inv.category || '').replace(/_/g, ' ').toUpperCase()],
            ['Billing Cycle', (inv.billing_cycle || '').toUpperCase()],
            ['UDIN', inv.udin || 'N/A'],
        ];

        doc.fontSize(11).font('Helvetica');
        for (const [label, value] of details) {
            doc.font('Helvetica-Bold').text(`${label}: `, { continued: true });
            doc.font('Helvetica').text(String(value));
        }

        doc.moveDown(2);

        // Fees section
        doc.fontSize(14).font('Helvetica-Bold').text('Fee Details');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica');
        
        doc.font('Helvetica-Bold').text('Professional Fees: ', { continued: true });
        doc.font('Helvetica').text(`₹${Number(inv.professional_fees).toLocaleString('en-IN')}`);
        
        doc.font('Helvetica-Bold').text('Out of Pocket Expenses: ', { continued: true });
        doc.font('Helvetica').text(`₹${Number(inv.out_of_pocket).toLocaleString('en-IN')}`);
        
        doc.font('Helvetica-Bold').text('Net Amount: ', { continued: true });
        doc.font('Helvetica').text(`₹${Number(inv.net_amount).toLocaleString('en-IN')}`);

        if (inv.narration) {
            doc.moveDown(2);
            doc.fontSize(14).font('Helvetica-Bold').text('Narration');
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica').text(inv.narration);
        }

        doc.end();
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to generate PDF' }); }
});

export default router;
