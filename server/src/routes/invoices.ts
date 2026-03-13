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
        const { getVisibleUserIds } = await import('../middleware/auth.js');
        const visibleIds = await getVisibleUserIds(req.user!);

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
        if (visibleIds) {
            params.push(visibleIds);
            query += ` AND i.generated_by = ANY($${params.length})`;
        }
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
        pm.full_name as manager_name
      FROM invoices i
      LEFT JOIN assignments a ON a.id = i.assignment_id
      LEFT JOIN clients c ON c.id = a.client_id
      LEFT JOIN profiles pm ON pm.id = i.generated_by
      WHERE i.id = $1`, [req.params.id]);

        if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
        const inv = result.rows[0];

        // Dynamic import for PDFKit (ESM)
        const PDFDocument = (await import('pdfkit')).default;
        const fs = (await import('fs')).default;
        const path = (await import('path')).default;
        
        const MARGIN = 50;
        const doc = new PDFDocument({ margin: MARGIN, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Invoice_${inv.id.substring(0,8)}.pdf"`);
        doc.pipe(res);

        const primaryColor = '#0f172a'; // slate-900
        const secondaryColor = '#64748b'; // slate-500
        const lightGray = '#f8fafc'; // slate-50
        const borderColor = '#e2e8f0'; // slate-200

        // --- 1. HEADER ---
        const logoPath = path.join(process.cwd(), '..', 'public', 'logo.png');
        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, MARGIN, MARGIN, { width: 140 });
        } else {
            doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold')
               .text('Kirtane & Pandit LLP', MARGIN, MARGIN);
        }
        
        doc.fillColor(secondaryColor).fontSize(10).font('Helvetica')
           .text('Chartered Accountants', doc.page.width - MARGIN - 200, MARGIN, { width: 200, align: 'right' })
           .text('123 Business Park', { width: 200, align: 'right' })
           .text('Mumbai, MH 400001', { width: 200, align: 'right' })
           .text('contact@kirtanepandit.com', { width: 200, align: 'right' });

        doc.moveDown(2);
        
        // Separator line
        doc.lineWidth(1).strokeColor(borderColor)
           .moveTo(MARGIN, Math.max(doc.y, MARGIN + 60)).lineTo(doc.page.width - MARGIN, Math.max(doc.y, MARGIN + 60)).stroke();
        doc.y = Math.max(doc.y, MARGIN + 60) + 20;

        // --- 2. TITLE & META ---
        const invoiceStartY = doc.y;
        
        doc.fillColor(primaryColor).fontSize(28).font('Helvetica-Bold')
           .text('INVOICE', MARGIN, invoiceStartY);
           
        const shortId = inv.id.split('-')[0].toUpperCase();
        const invoiceDate = inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-IN') : 'N/A';

        doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold')
           .text('Invoice Number:', doc.page.width - MARGIN - 200, invoiceStartY + 5)
           .font('Helvetica').fillColor(secondaryColor).text(`INV-${shortId}`, doc.page.width - MARGIN - 100, invoiceStartY + 5, { width: 100, align: 'right' });
           
        doc.fillColor(primaryColor).font('Helvetica-Bold')
           .text('Date:', doc.page.width - MARGIN - 200, invoiceStartY + 20)
           .font('Helvetica').fillColor(secondaryColor).text(invoiceDate, doc.page.width - MARGIN - 100, invoiceStartY + 20, { width: 100, align: 'right' });

        if (inv.reference) {
            doc.fillColor(primaryColor).font('Helvetica-Bold')
               .text('Reference:', doc.page.width - MARGIN - 200, invoiceStartY + 35)
               .font('Helvetica').fillColor(secondaryColor).text(inv.reference, doc.page.width - MARGIN - 100, invoiceStartY + 35, { width: 100, align: 'right' });
        }

        doc.y = invoiceStartY + 70;
        
        // --- 3. TWO COLUMNS (BILL TO & PROJECT DETAILS) ---
        const detailsY = doc.y;
        const colWidth = (doc.page.width - (MARGIN * 2) - 40) / 2;

        // Column 1: Bill To
        doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold')
           .text('Bill To:', MARGIN, detailsY);
        doc.moveDown(0.5);
        
        doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor)
           .text(inv.client_name || 'N/A', MARGIN, doc.y, { width: colWidth });
        
        doc.font('Helvetica').fillColor(secondaryColor);
        if (inv.kind_attention) doc.text(`Attn: ${inv.kind_attention}`, { width: colWidth });
        if (inv.address) doc.text(inv.address, { width: colWidth });
        if (inv.client_gstn) doc.text(`GSTN: ${inv.client_gstn}`, { width: colWidth });

        // Column 2: Project Details
        doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold')
           .text('Project Details:', MARGIN + colWidth + 40, detailsY);
        doc.moveDown(0.5);
        doc.fontSize(10);
        
        const projY = doc.y;
        doc.font('Helvetica-Bold').fillColor(primaryColor).text('Category:', MARGIN + colWidth + 40, projY, { continued: true })
           .font('Helvetica').fillColor(secondaryColor).text(` ${(inv.category || '').replace(/_/g, ' ').toUpperCase()}`);
           
        doc.font('Helvetica-Bold').fillColor(primaryColor).text('Billing Cycle:', MARGIN + colWidth + 40, doc.y, { continued: true })
           .font('Helvetica').fillColor(secondaryColor).text(` ${(inv.billing_cycle || '').toUpperCase()}`);
           
        if (inv.udin) {
            doc.font('Helvetica-Bold').fillColor(primaryColor).text('UDIN:', MARGIN + colWidth + 40, doc.y, { continued: true })
               .font('Helvetica').fillColor(secondaryColor).text(` ${inv.udin}`);
        }

        doc.moveDown(4);

        // --- 4. FEE TABLE ---
        const tableTop = Math.max(doc.y, detailsY + 80) + 10;
        
        // Table Header
        doc.rect(MARGIN, tableTop, doc.page.width - MARGIN * 2, 25).fill(lightGray);
        doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold');
        doc.text('Description', MARGIN + 15, tableTop + 8);
        doc.text('Amount (INR)', doc.page.width - MARGIN - 110, tableTop + 8, { width: 95, align: 'right' });
        
        // Table Rows
        let rowY = tableTop + 35;
        doc.fontSize(10).font('Helvetica');
        
        const drawRow = (desc: string, amount: string | number, isTotal = false) => {
            if (isTotal) {
                doc.lineWidth(1).strokeColor(borderColor)
                   .moveTo(MARGIN, rowY - 10).lineTo(doc.page.width - MARGIN, rowY - 10).stroke();
                doc.font('Helvetica-Bold').fillColor(primaryColor);
            } else {
                doc.font('Helvetica').fillColor(secondaryColor);
            }
            
            doc.text(desc, MARGIN + 15, rowY);
            doc.text(amount.toLocaleString('en-IN'), doc.page.width - MARGIN - 110, rowY, { width: 95, align: 'right' });
            
            if (isTotal) {
                doc.lineWidth(2).strokeColor(primaryColor)
                   .moveTo(MARGIN, rowY + 20).lineTo(doc.page.width - MARGIN, rowY + 20).stroke();
            }
            rowY += 30;
        };

        const profFees = Number(inv.professional_fees);
        const oop = Number(inv.out_of_pocket);
        const net = Number(inv.net_amount);

        drawRow('Professional Fees', `Rs. ${profFees.toLocaleString('en-IN')}`);
        if (oop > 0) {
            drawRow('Out of Pocket Expenses', `Rs. ${oop.toLocaleString('en-IN')}`);
        }
        
        rowY += 5;
        drawRow('Total Net Amount', `Rs. ${net.toLocaleString('en-IN')}`, true);

        // --- 5. NARRATION / NOTES ---
        if (inv.narration) {
            doc.y = rowY + 10;
            doc.fontSize(11).font('Helvetica-Bold').fillColor(primaryColor).text('Narration / Notes');
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').fillColor(secondaryColor).text(inv.narration, { lineGap: 4 });
        }

        // --- 6. FOOTER ---
        const bottomY = doc.page.height - 70;
        doc.lineWidth(1).strokeColor(borderColor)
           .moveTo(MARGIN, bottomY).lineTo(doc.page.width - MARGIN, bottomY).stroke();
           
        doc.fontSize(9).font('Helvetica').fillColor(secondaryColor)
           .text('Kirtane & Pandit LLP  •  Chartered Accountants  •  www.kirtanepandit.com', MARGIN, bottomY + 15, { align: 'center', width: doc.page.width - MARGIN * 2 });
           
        doc.fontSize(8).fillColor('#94a3b8')
           .text('This is a computer-generated document. No signature is required.', MARGIN, bottomY + 30, { align: 'center', width: doc.page.width - MARGIN * 2 });

        doc.end();
    } catch (err: any) {
        console.error('=== INVOICE DOWNLOAD ERROR ===');
        console.error('Error message:', err?.message);
        console.error('Error detail:', err?.detail);
        console.error('Error code:', err?.code);
        console.error('Error stack:', err?.stack);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to generate PDF', detail: err?.message });
        }
    }
});

export default router;
