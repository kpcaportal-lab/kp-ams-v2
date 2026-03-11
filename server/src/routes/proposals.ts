import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authenticate, getVisibleUserIds, logAuditEvent } from '../middleware/auth.js';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();
router.use(authenticate);

// ── Helpers ─────────────────────────────────────────────────────

const getNextProposalNumber = async (assignmentType: string, fiscalYear: string): Promise<string> => {
    const typeMap: Record<string, string> = {
        internal_audit: 'IA', forensic: 'FOR', overseas: 'OS', mcs: 'MCS', ifc: 'IFC'
    };
    const code = typeMap[assignmentType] || 'GEN';

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const seq = await client.query(
            `INSERT INTO proposal_sequences (assignment_type, fiscal_year, last_sequence)
       VALUES ($1, $2, 1)
       ON CONFLICT (assignment_type, fiscal_year) 
       DO UPDATE SET last_sequence = proposal_sequences.last_sequence + 1
       RETURNING last_sequence`,
            [assignmentType, fiscalYear]
        );
        const num = seq.rows[0].last_sequence.toString().padStart(3, '0');
        await client.query('COMMIT');
        return `KP/${code}/${fiscalYear}/${num}`;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

// ── Static routes (must be before /:id) ─────────────────────────

// GET /api/proposals/users/partners — list of partners (for dropdowns)
router.get('/users/partners', async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(
            "SELECT id, full_name, display_name FROM profiles WHERE role='partner' AND is_active=true ORDER BY full_name"
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// GET /api/proposals/templates — list active proposal templates
router.get('/templates', async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM proposal_templates WHERE is_active=true ORDER BY name'
        );
        res.json(result.rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/proposals/subcategories — assignment subcategory options
router.get('/subcategories', async (_req: Request, res: Response) => {
    const subcategories = [
        { value: 'compliance', label: 'Compliance' },
        { value: 'tax_filing', label: 'Tax Filing' },
        { value: 'statutory_audit', label: 'Statutory Audit' },
        { value: 'internal_audit', label: 'Internal Audit' },
        { value: 'advisory', label: 'Advisory' },
        { value: 'ifc_testing', label: 'IFC Testing' },
        { value: 'forensic_investigation', label: 'Forensic Investigation' },
        { value: 'transfer_pricing', label: 'Transfer Pricing' },
        { value: 'gst', label: 'GST' },
        { value: 'fema', label: 'FEMA' },
        { value: 'company_law', label: 'Company Law' },
        { value: 'due_diligence', label: 'Due Diligence' },
        { value: 'valuations', label: 'Valuations' },
        { value: 'certification', label: 'Certification' },
        { value: 'other', label: 'Other' },
    ];
    res.json(subcategories);
});

// ── CRUD routes ─────────────────────────────────────────────────

// GET /api/proposals
router.get('/', async (req: Request, res: Response) => {
    try {
        const { status, assignment_type, fiscal_year, partner_id, search } = req.query;

        let query = `
      SELECT p.*, c.name as client_name, 
        pr.full_name as prepared_by_name, pa.full_name as partner_name
      FROM proposals p
      LEFT JOIN clients c ON c.id = p.client_id
      LEFT JOIN profiles pr ON pr.id = p.prepared_by
      LEFT JOIN profiles pa ON pa.id = p.responsible_partner
      WHERE 1=1`;
        const params: any[] = [];

        // ── RBAC filtering ──
        const visibleIds = await getVisibleUserIds(req.user!);
        if (visibleIds !== null) {
            params.push(visibleIds);
            query += ` AND (p.prepared_by = ANY($${params.length}) OR p.responsible_partner = ANY($${params.length}))`;
        }

        if (status) { params.push(status); query += ` AND p.status = $${params.length}`; }
        if (assignment_type) { params.push(assignment_type); query += ` AND p.assignment_type = $${params.length}`; }
        if (fiscal_year) { params.push(fiscal_year); query += ` AND p.fiscal_year = $${params.length}`; }
        if (partner_id) { params.push(partner_id); query += ` AND p.responsible_partner = $${params.length}`; }
        if (search) { params.push(`%${search}%`); query += ` AND c.name ILIKE $${params.length}`; }

        query += ' ORDER BY p.created_at DESC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// GET /api/proposals/:id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT p.*, c.name as client_name, c.gstn as client_gstn,
        pr.full_name as prepared_by_name, pa.full_name as partner_name
      FROM proposals p
      LEFT JOIN clients c ON c.id = p.client_id
      LEFT JOIN profiles pr ON pr.id = p.prepared_by
      LEFT JOIN profiles pa ON pa.id = p.responsible_partner
      WHERE p.id = $1`, [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Not found' });

        // Also fetch version history
        const versions = await pool.query(
            `SELECT pv.*, pr.full_name as created_by_name
       FROM proposal_versions pv
       LEFT JOIN profiles pr ON pr.id = pv.created_by
       WHERE pv.proposal_id = $1
       ORDER BY pv.version_number DESC`, [req.params.id]
        );

        // Fetch linked assignments count
        const assignmentCount = await pool.query(
            'SELECT COUNT(*) as count FROM assignments WHERE proposal_id = $1', [req.params.id]
        );

        res.json({
            ...result.rows[0],
            versions: versions.rows,
            assignment_count: parseInt(assignmentCount.rows[0].count)
        });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// POST /api/proposals
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            client_id, proposal_type, assignment_type, scope_areas, quotation_amount,
            fee_category, increment_details, revised_fee, proposal_date, responsible_partner,
            revision_flag, revision_details, notes, fiscal_year, template_id
        } = req.body;

        const number = await getNextProposalNumber(assignment_type, fiscal_year || '2025-26');

        const result = await pool.query(`
      INSERT INTO proposals (
        number, client_id, proposal_type, assignment_type, scope_areas, quotation_amount,
        fee_category, increment_details, revised_fee, proposal_date, prepared_by,
        responsible_partner, revision_flag, revision_details, notes, fiscal_year,
        version_number, template_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
            [number, client_id, proposal_type || 'new', assignment_type, scope_areas,
                quotation_amount, fee_category || null, increment_details || null, revised_fee || null,
                proposal_date, req.user!.id, responsible_partner, revision_flag || false,
                revision_details || null, notes || null, fiscal_year || '2025-26',
                1, template_id || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// PUT /api/proposals/:id
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const fields = ['client_id', 'proposal_type', 'assignment_type', 'scope_areas', 'quotation_amount',
            'fee_category', 'increment_details', 'revised_fee', 'proposal_date', 'responsible_partner',
            'revision_flag', 'revision_details', 'file_url', 'notes', 'template_id'];
        const updates: string[] = [];
        const params: any[] = [];

        for (const f of fields) {
            if (req.body[f] !== undefined) {
                params.push(req.body[f]);
                updates.push(`${f} = $${params.length}`);
            }
        }
        if (!updates.length) return res.status(400).json({ error: 'No fields to update' });
        params.push(req.params.id);
        const result = await pool.query(
            `UPDATE proposals SET ${updates.join(', ')}, updated_at=NOW() WHERE id = $${params.length} RETURNING *`,
            params
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
        res.json(result.rows[0]);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Status — fully reversible (Won ↔ Lost ↔ Pending) ───────────

router.patch('/:id/status', async (req: Request, res: Response) => {
    try {
        const { status, gstn } = req.body;
        if (!['pending', 'won', 'lost'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be pending, won, or lost.' });
        }

        const proposal = await pool.query('SELECT * FROM proposals WHERE id=$1', [req.params.id]);
        if (!proposal.rows.length) return res.status(404).json({ error: 'Not found' });

        const current = proposal.rows[0];

        // Update proposal status — no restrictions, fully reversible
        await pool.query(
            'UPDATE proposals SET status=$1, status_date=NOW(), updated_at=NOW() WHERE id=$2',
            [status, req.params.id]
        );

        // If won, update client GSTN if provided
        if (status === 'won' && gstn) {
            await pool.query(
                "UPDATE clients SET gstn=$1, status='active', updated_at=NOW() WHERE id=$2",
                [gstn, current.client_id]
            );
        }

        // Log the change
        await pool.query(
            'INSERT INTO change_history (entity_type,entity_id,field_name,old_value,new_value,changed_by) VALUES ($1,$2,$3,$4,$5,$6)',
            ['proposal', req.params.id, 'status', current.status, status, req.user!.id]
        );

        res.json({ success: true, status });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Revisions ──────────────────────────────────────────────────

// POST /api/proposals/:id/revise — create a new revision (copy + snapshot old)
router.post('/:id/revise', async (req: Request, res: Response) => {
    const dbClient = await pool.connect();
    try {
        await dbClient.query('BEGIN');

        const { revision_details } = req.body;

        // Get the current proposal
        const current = await dbClient.query('SELECT * FROM proposals WHERE id=$1', [req.params.id]);
        if (!current.rows.length) {
            await dbClient.query('ROLLBACK');
            return res.status(404).json({ error: 'Proposal not found' });
        }

        const original = current.rows[0];
        const currentVersion = original.version_number || 1;

        // Snapshot the current state into proposal_versions
        await dbClient.query(
            `INSERT INTO proposal_versions (proposal_id, version_number, snapshot, changes_summary, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
            [original.id, currentVersion, JSON.stringify(original), revision_details || 'Revision created', req.user!.id]
        );

        // Generate new proposal number for the revision
        const newNumber = await getNextProposalNumber(original.assignment_type, original.fiscal_year);

        // Create a new proposal (copy of original) with incremented version
        const newProposal = await dbClient.query(`
      INSERT INTO proposals (
        number, client_id, proposal_type, assignment_type, scope_areas, quotation_amount,
        fee_category, increment_details, revised_fee, proposal_date, prepared_by,
        responsible_partner, revision_flag, revision_details, notes, fiscal_year,
        version_number, parent_proposal_id, template_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true,$13,$14,$15,$16,$17,$18) RETURNING *`,
            [newNumber, original.client_id, original.proposal_type, original.assignment_type,
                original.scope_areas, original.quotation_amount, original.fee_category,
                original.increment_details, original.revised_fee, new Date().toISOString().split('T')[0],
                req.user!.id, original.responsible_partner,
                revision_details || null, original.notes, original.fiscal_year,
                currentVersion + 1, original.id, original.template_id]
        );

        await dbClient.query('COMMIT');
        res.status(201).json(newProposal.rows[0]);
    } catch (err) {
        await dbClient.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to create revision' });
    } finally {
        dbClient.release();
    }
});

// GET /api/proposals/:id/versions — get all versions for a proposal chain
router.get('/:id/versions', async (req: Request, res: Response) => {
    try {
        // Get all versions stored for this proposal
        const versions = await pool.query(
            `SELECT pv.*, pr.full_name as created_by_name
       FROM proposal_versions pv
       LEFT JOIN profiles pr ON pr.id = pv.created_by
       WHERE pv.proposal_id = $1
       ORDER BY pv.version_number ASC`, [req.params.id]
        );

        // Also find all proposals in the same revision chain
        const chainProposals = await pool.query(`
      SELECT p.id, p.number, p.version_number, p.status, p.quotation_amount,
             p.created_at, p.parent_proposal_id, pr.full_name as prepared_by_name
      FROM proposals p
      LEFT JOIN profiles pr ON pr.id = p.prepared_by
      WHERE p.id = $1 OR p.parent_proposal_id = $1
         OR p.id = (SELECT parent_proposal_id FROM proposals WHERE id = $1)
         OR p.parent_proposal_id = (SELECT parent_proposal_id FROM proposals WHERE id = $1)
      ORDER BY p.version_number ASC`, [req.params.id]);

        res.json({
            versions: versions.rows,
            chain: chainProposals.rows
        });
    } catch (err) { console.error(err); res.status(500).json({ error: 'Server error' }); }
});

// ── Assignment Generation from Scope ────────────────────────────

// POST /api/proposals/:id/generate-assignments
router.post('/:id/generate-assignments', async (req: Request, res: Response) => {
    const dbClient = await pool.connect();
    try {
        await dbClient.query('BEGIN');

        const proposal = await dbClient.query(
            `SELECT p.*, c.gstn FROM proposals p
       LEFT JOIN clients c ON c.id = p.client_id
       WHERE p.id = $1`, [req.params.id]
        );
        if (!proposal.rows.length) {
            await dbClient.query('ROLLBACK');
            return res.status(404).json({ error: 'Proposal not found' });
        }

        const p = proposal.rows[0];

        // scope_items from request body — structured array
        // Each item: { scope_item: "...", subcategory: "compliance", assessment_year: "2025-26", fees: 50000 }
        const { scope_items, partner_id, manager_id, billing_cycle } = req.body;

        if (!scope_items || !Array.isArray(scope_items) || scope_items.length === 0) {
            await dbClient.query('ROLLBACK');
            return res.status(400).json({ error: 'scope_items array is required' });
        }

        const createdAssignments: any[] = [];

        for (const item of scope_items) {
            const result = await dbClient.query(`
        INSERT INTO assignments (
          proposal_id, client_id, gstn, category, scope_areas, total_fees,
          billing_cycle, partner_id, manager_id, fiscal_year, status,
          subcategory, assessment_year, scope_item
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'draft',$11,$12,$13) RETURNING *`,
                [p.id, p.client_id, p.gstn || item.gstn || '',
                item.category || 'A', item.scope_item || '',
                item.fees || 0,
                billing_cycle || item.billing_cycle || 'monthly',
                partner_id || p.responsible_partner,
                manager_id || req.user!.id,
                item.assessment_year || p.fiscal_year,
                item.subcategory || 'other',
                item.assessment_year || p.fiscal_year,
                item.scope_item || ''
                ]
            );

            const assignment = result.rows[0];
            createdAssignments.push(assignment);

            // Initialize 12 empty fee allocations
            const fiscalYr = item.assessment_year || p.fiscal_year;
            for (let m = 1; m <= 12; m++) {
                await dbClient.query(
                    'INSERT INTO fee_allocations (assignment_id,month,fiscal_year,amount) VALUES ($1,$2,$3,0) ON CONFLICT DO NOTHING',
                    [assignment.id, m, fiscalYr]
                );
            }
        }

        await dbClient.query('COMMIT');
        res.status(201).json({
            success: true,
            message: `${createdAssignments.length} assignment(s) created`,
            assignments: createdAssignments
        });
    } catch (err) {
        await dbClient.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Failed to generate assignments' });
    } finally {
        dbClient.release();
    }
});

// ── Document Export ──────────────────────────────────────────────

// GET /api/proposals/:id/export/pdf
router.get('/:id/export/pdf', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT p.*, c.name as client_name, c.gstn as client_gstn,
        pr.full_name as prepared_by_name, pa.full_name as partner_name
      FROM proposals p
      LEFT JOIN clients c ON c.id = p.client_id
      LEFT JOIN profiles pr ON pr.id = p.prepared_by
      LEFT JOIN profiles pa ON pa.id = p.responsible_partner
      WHERE p.id = $1`, [req.params.id]);

        if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
        const p = result.rows[0];

        // Dynamic import for PDFKit (ESM)
        const PDFDocument = (await import('pdfkit')).default;
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Proposal_${p.number.replace(/\//g, '_')}.pdf"`);
        doc.pipe(res);

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text('Kirtane & Pandit LLP', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text('Chartered Accountants', { align: 'center' });
        doc.moveDown(2);

        // Title
        doc.fontSize(16).font('Helvetica-Bold').text('PROPOSAL', { align: 'center' });
        doc.moveDown();

        // Proposal details
        const details = [
            ['Proposal Number', p.number],
            ['Client', p.client_name || 'N/A'],
            ['GSTN', p.client_gstn || 'N/A'],
            ['Assignment Type', (p.assignment_type || '').replace(/_/g, ' ').toUpperCase()],
            ['Proposal Type', (p.proposal_type || '').toUpperCase()],
            ['Fiscal Year', p.fiscal_year],
            ['Proposal Date', p.proposal_date ? new Date(p.proposal_date).toLocaleDateString('en-IN') : 'N/A'],
            ['Responsible Partner', p.partner_name || 'N/A'],
            ['Prepared By', p.prepared_by_name || 'N/A'],
            ['Status', (p.status || '').toUpperCase()],
            ['Version', `v${p.version_number || 1}`],
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
        doc.font('Helvetica-Bold').text('Quotation Amount: ', { continued: true });
        doc.font('Helvetica').text(`₹${Number(p.quotation_amount).toLocaleString('en-IN')}`);
        if (p.revised_fee) {
            doc.font('Helvetica-Bold').text('Revised Fee: ', { continued: true });
            doc.font('Helvetica').text(`₹${Number(p.revised_fee).toLocaleString('en-IN')}`);
        }
        if (p.fee_category) {
            doc.font('Helvetica-Bold').text('Fee Category: ', { continued: true });
            doc.font('Helvetica').text(p.fee_category.toUpperCase());
        }

        doc.moveDown(2);

        // Scope of Work
        if (p.scope_areas) {
            doc.fontSize(14).font('Helvetica-Bold').text('Scope of Work');
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica').text(p.scope_areas);
        }

        if (p.notes) {
            doc.moveDown(2);
            doc.fontSize(14).font('Helvetica-Bold').text('Notes');
            doc.moveDown(0.5);
            doc.fontSize(11).font('Helvetica').text(p.notes);
        }

        doc.end();
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to generate PDF' }); }
});

// GET /api/proposals/:id/export/pptx
router.get('/:id/export/pptx', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
      SELECT p.*, c.name as client_name, c.gstn as client_gstn,
        pr.full_name as prepared_by_name, pa.full_name as partner_name
      FROM proposals p
      LEFT JOIN clients c ON c.id = p.client_id
      LEFT JOIN profiles pr ON pr.id = p.prepared_by
      LEFT JOIN profiles pa ON pa.id = p.responsible_partner
      WHERE p.id = $1`, [req.params.id]);

        if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
        const p = result.rows[0];

        const PptxGenJS = (await import('pptxgenjs')).default;
        const pptx = new (PptxGenJS as any)();

        pptx.author = 'Kirtane & Pandit LLP';
        pptx.title = `Proposal - ${p.client_name}`;

        // Title slide
        const slide1 = pptx.addSlide();
        slide1.addText('Kirtane & Pandit LLP', {
            x: 0.5, y: 1.0, w: '90%', fontSize: 28, bold: true,
            color: '1a3a5c', align: 'center'
        });
        slide1.addText('Chartered Accountants', {
            x: 0.5, y: 1.8, w: '90%', fontSize: 16, color: '555555', align: 'center'
        });
        slide1.addText(`Proposal for ${p.client_name || 'Client'}`, {
            x: 0.5, y: 3.0, w: '90%', fontSize: 22, bold: true,
            color: '2b5797', align: 'center'
        });
        slide1.addText(`${p.number} | ${p.fiscal_year}`, {
            x: 0.5, y: 3.8, w: '90%', fontSize: 14, color: '888888', align: 'center'
        });

        // Details slide
        const slide2 = pptx.addSlide();
        slide2.addText('Proposal Details', {
            x: 0.5, y: 0.5, w: '90%', fontSize: 22, bold: true, color: '1a3a5c'
        });

        const detailRows: Array<Array<{ text: string; options?: Record<string, any> }>> = [
            [{ text: 'Client', options: { bold: true } }, { text: p.client_name || 'N/A' }],
            [{ text: 'GSTN', options: { bold: true } }, { text: p.client_gstn || 'N/A' }],
            [{ text: 'Assignment Type', options: { bold: true } }, { text: (p.assignment_type || '').replace(/_/g, ' ').toUpperCase() }],
            [{ text: 'Proposal Type', options: { bold: true } }, { text: (p.proposal_type || '').toUpperCase() }],
            [{ text: 'Fiscal Year', options: { bold: true } }, { text: p.fiscal_year }],
            [{ text: 'Partner', options: { bold: true } }, { text: p.partner_name || 'N/A' }],
            [{ text: 'Status', options: { bold: true } }, { text: (p.status || '').toUpperCase() }],
            [{ text: 'Version', options: { bold: true } }, { text: `v${p.version_number || 1}` }],
        ];

        slide2.addTable(detailRows, {
            x: 0.5, y: 1.5, w: 9, fontSize: 12,
            border: { type: 'solid', pt: 0.5, color: 'CCCCCC' },
            colW: [3, 6]
        });

        // Fees slide
        const slide3 = pptx.addSlide();
        slide3.addText('Fee Summary', {
            x: 0.5, y: 0.5, w: '90%', fontSize: 22, bold: true, color: '1a3a5c'
        });

        const feeRows: Array<Array<{ text: string; options?: Record<string, any> }>> = [
            [{ text: 'Quotation Amount', options: { bold: true } }, { text: `₹${Number(p.quotation_amount).toLocaleString('en-IN')}` }],
        ];
        if (p.revised_fee) feeRows.push([{ text: 'Revised Fee', options: { bold: true } }, { text: `₹${Number(p.revised_fee).toLocaleString('en-IN')}` }]);
        if (p.fee_category) feeRows.push([{ text: 'Fee Category', options: { bold: true } }, { text: p.fee_category.toUpperCase() }]);

        slide3.addTable(feeRows, {
            x: 0.5, y: 1.5, w: 9, fontSize: 14,
            border: { type: 'solid', pt: 0.5, color: 'CCCCCC' },
            colW: [4, 5]
        });

        // Scope slide
        if (p.scope_areas) {
            const slide4 = pptx.addSlide();
            slide4.addText('Scope of Work', {
                x: 0.5, y: 0.5, w: '90%', fontSize: 22, bold: true, color: '1a3a5c'
            });
            slide4.addText(p.scope_areas, {
                x: 0.5, y: 1.5, w: '90%', h: 4.5, fontSize: 12, color: '333333', valign: 'top'
            });
        }

        // Generate and send
        const buffer = await pptx.write({ outputType: 'nodebuffer' }) as Buffer;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', `attachment; filename="Proposal_${p.number.replace(/\//g, '_')}.pptx"`);
        res.send(buffer);
    } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to generate PPTX' }); }
});

export default router;
