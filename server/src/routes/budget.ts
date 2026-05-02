import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authenticate, getVisibleUserIds } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

/**
 * GET /api/budget/summary
 * Returns aggregated budget metrics for a specific fiscal year
 */
router.get('/summary', async (req: Request, res: Response) => {
    try {
        const { fiscal_year } = req.query;
        if (!fiscal_year) {
            return res.status(400).json({ error: 'fiscal_year parameter is required' });
        }

        const visibleIds = await getVisibleUserIds(req.user!);
        
        let query = `
            SELECT 
                COUNT(*) as total_proposals,
                SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as proposals_won,
                SUM(quotation_amount) as total_pipeline_value,
                SUM(CASE WHEN status = 'won' THEN revised_fee ELSE 0 END) as total_won_value
            FROM proposals
            WHERE fiscal_year = $1
        `;
        
        const params: any[] = [fiscal_year];
        
        if (visibleIds !== null) {
            params.push(visibleIds);
            query += ` AND (responsible_partner = ANY($2) OR prepared_by = ANY($2))`;
        }

        const result = await pool.query(query, params);
        const stats = result.rows[0];

        // Calculate conversion rate
        const conversionRate = stats.total_proposals > 0 
            ? (stats.proposals_won / stats.total_proposals) * 100 
            : 0;

        res.json({
            fiscal_year,
            total_proposals: parseInt(stats.total_proposals || '0'),
            proposals_won: parseInt(stats.proposals_won || '0'),
            total_pipeline_value: parseFloat(stats.total_pipeline_value || '0'),
            total_won_value: parseFloat(stats.total_won_value || '0'),
            conversion_rate: parseFloat(conversionRate.toFixed(2))
        });
    } catch (err) {
        console.error('[Budget API] Error in /summary:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * GET /api/budget/comparative
 * Returns YoY growth and trend data across fiscal years
 */
router.get('/comparative', async (req: Request, res: Response) => {
    try {
        const visibleIds = await getVisibleUserIds(req.user!);
        
        let query = `
            SELECT 
                fiscal_year,
                SUM(CASE WHEN status = 'won' THEN revised_fee ELSE 0 END) as won_value,
                SUM(quotation_amount) as pipeline_value,
                COUNT(*) as proposal_count
            FROM proposals
            WHERE 1=1
        `;
        
        const params: any[] = [];
        
        if (visibleIds !== null) {
            params.push(visibleIds);
            query += ` AND (responsible_partner = ANY($1) OR prepared_by = ANY($1))`;
        }

        query += ` GROUP BY fiscal_year ORDER BY fiscal_year ASC`;

        const result = await pool.query(query, params);
        const years = result.rows.map(r => ({
            fiscal_year: r.fiscal_year,
            won_value: parseFloat(r.won_value || '0'),
            pipeline_value: parseFloat(r.pipeline_value || '0'),
            proposal_count: parseInt(r.proposal_count || '0')
        }));

        // Calculate YoY Growth
        const comparative = years.map((year, index) => {
            let yoy_growth = 0;
            if (index > 0) {
                const prevYear = years[index - 1];
                if (prevYear.won_value > 0) {
                    yoy_growth = ((year.won_value - prevYear.won_value) / prevYear.won_value) * 100;
                }
            }
            return {
                ...year,
                yoy_growth: parseFloat(yoy_growth.toFixed(2))
            };
        });

        res.json(comparative);
    } catch (err) {
        console.error('[Budget API] Error in /comparative:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * GET /api/budget/forecasting
 * Returns projections based on current and historical performance
 */
router.get('/forecasting', async (req: Request, res: Response) => {
    try {
        const { current_fy } = req.query;
        if (!current_fy) {
            return res.status(400).json({ error: 'current_fy parameter is required' });
        }

        // Fetch performance for last 3 years
        const visibleIds = await getVisibleUserIds(req.user!);
        let query = `
            SELECT 
                fiscal_year,
                SUM(CASE WHEN status = 'won' THEN revised_fee ELSE 0 END) as won_value
            FROM proposals
            WHERE 1=1
        `;
        const params: any[] = [];
        if (visibleIds !== null) {
            params.push(visibleIds);
            query += ` AND (responsible_partner = ANY($1) OR prepared_by = ANY($1))`;
        }
        query += ` GROUP BY fiscal_year ORDER BY fiscal_year DESC LIMIT 3`;

        const result = await pool.query(query, params);
        const history = result.rows;

        // Basic CAGR calculation if we have enough data
        let projected_growth = 15; // default 15% growth
        if (history.length >= 2) {
            const latest = parseFloat(history[0].won_value);
            const oldest = parseFloat(history[history.length - 1].won_value);
            if (oldest > 0) {
                projected_growth = (Math.pow(latest / oldest, 1 / (history.length - 1)) - 1) * 100;
            }
        }

        // Projection for next year
        const latestValue = history.length > 0 ? parseFloat(history[0].won_value) : 0;
        const projectedValue = latestValue * (1 + projected_growth / 100);

        res.json({
            projected_growth_rate: parseFloat(projected_growth.toFixed(2)),
            current_value: latestValue,
            projected_next_year_value: parseFloat(projectedValue.toFixed(2)),
            confidence_level: history.length >= 3 ? 'High' : 'Low'
        });
    } catch (err) {
        console.error('[Budget API] Error in /forecasting:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
