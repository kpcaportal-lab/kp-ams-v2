import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to handle validation errors and respond with details
 */
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation Error on', req.path, ':', JSON.stringify(errors.array(), null, 2));
        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Request validation failed',
                details: errors.array().map(err => ({
                    field: err.type === 'field' ? (err as any).path : 'unknown',
                    message: err.msg
                }))
            }
        });
    }
    next();
};

/**
 * Validation chains for Proposals
 */
export const validateCreateProposal = [
    body('client_id')
        .isUUID()
        .withMessage('client_id must be a valid UUID'),
    body('proposal_type')
        .isIn(['new', 'revision', 'renewal'])
        .withMessage('proposal_type must be "new", "revision" or "renewal"'),
    body('assignment_type')
        .isIn(['internal_audit', 'forensic', 'overseas', 'mcs', 'ifc'])
        .withMessage('invalid assignment_type'),
    body('scope_areas')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('scope_areas is required'),
    body('quotation_amount')
        .isFloat({ min: 0 })
        .withMessage('quotation_amount must be a positive number'),
    body('fee_category')
        .optional()
        .isString()
        .trim(),
    body('increment_details')
        .optional()
        .isString()
        .trim(),
    body('revised_fee')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('revised_fee must be a positive number'),
    body('proposal_date')
        .optional()
        .isISO8601()
        .withMessage('proposal_date must be a valid ISO 8601 date'),
    body('responsible_partner')
        .optional({ values: 'falsy' })
        .isUUID()
        .withMessage('responsible_partner must be a valid UUID'),
    body('revision_flag')
        .optional()
        .isBoolean()
        .withMessage('revision_flag must be boolean'),
    body('revision_details')
        .optional()
        .isString()
        .trim(),
    body('notes')
        .optional()
        .isString()
        .trim(),
    body('fiscal_year')
        .optional()
        .matches(/^\d{4}-\d{2}$/)
        .withMessage('fiscal_year must be in YYYY-YY format'),
    body('template_id')
        .optional()
        .isUUID()
        .withMessage('template_id must be a valid UUID'),
    body('status')
        .optional()
        .isIn(['pending', 'won', 'lost'])
        .withMessage('status must be pending, won, or lost'),
    handleValidationErrors
];

export const validateUpdateProposal = [
    body('client_id')
        .optional()
        .isString()
        .trim(),
    body('proposal_type')
        .optional()
        .isIn(['new', 'revision', 'renewal'])
        .withMessage('proposal_type must be "new", "revision" or "renewal"'),
    body('assignment_type')
        .optional()
        .isIn(['internal_audit', 'forensic', 'overseas', 'mcs', 'ifc'])
        .withMessage('invalid assignment_type'),
    body('quotation_amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('quotation_amount must be a positive number'),
    body('responsible_partner')
        .optional()
        .isUUID()
        .withMessage('responsible_partner must be a valid UUID'),
    body('status')
        .optional()
        .isIn(['pending', 'won', 'lost'])
        .withMessage('status must be pending, won, or lost'),
    handleValidationErrors
];

/**
 * Validation chains for Assignments
 */
export const validateCreateAssignment = [
    body('proposal_id')
        .optional()
        .isUUID()
        .withMessage('proposal_id must be a valid UUID'),
    body('client_id')
        .isString()
        .trim(),
    body('gstn')
        .optional()
        .isString()
        .trim(),
    body('category')
        .optional()
        .isString()
        .trim(),
    body('scope_areas')
        .optional()
        .isString()
        .trim(),
    body('total_fees')
        .isFloat({ min: 0 })
        .withMessage('total_fees must be a positive number'),
    body('billing_cycle')
        .optional()
        .isString()
        .trim(),
    body('partner_id')
        .optional({ values: 'falsy' })
        .isString()
        .trim(),
    body('manager_id')
        .optional({ values: 'falsy' })
        .isString()
        .trim(),
    body('start_date')
        .optional()
        .isISO8601()
        .withMessage('start_date must be a valid ISO 8601 date'),
    body('end_date')
        .optional()
        .isISO8601()
        .withMessage('end_date must be a valid ISO 8601 date'),
    body('notes')
        .optional()
        .isString()
        .trim(),
    body('fiscal_year')
        .optional()
        .matches(/^\d{4}-\d{2}$/)
        .withMessage('fiscal_year must be in YYYY-YY format'),
    body('subcategory')
        .optional()
        .isString()
        .trim(),
    body('assessment_year')
        .optional()
        .isString()
        .trim(),
    body('scope_item')
        .optional()
        .isString()
        .trim(),
    handleValidationErrors
];

export const validateUpdateAssignment = [
    body('category')
        .optional()
        .isString()
        .trim(),
    body('scope_areas')
        .optional()
        .isString()
        .trim(),
    body('total_fees')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('total_fees must be a positive number'),
    body('billing_cycle')
        .optional()
        .isString()
        .trim(),
    body('partner_id')
        .optional({ values: 'falsy' })
        .isString()
        .trim(),
    body('manager_id')
        .optional({ values: 'falsy' })
        .isString()
        .trim(),
    body('start_date')
        .optional()
        .isISO8601()
        .withMessage('start_date must be a valid ISO 8601 date'),
    body('end_date')
        .optional()
        .isISO8601()
        .withMessage('end_date must be a valid ISO 8601 date'),
    body('notes')
        .optional()
        .isString()
        .trim(),
    body('gstn')
        .optional()
        .isString()
        .trim(),
    body('subcategory')
        .optional()
        .isString()
        .trim(),
    body('assessment_year')
        .optional()
        .isString()
        .trim(),
    body('scope_item')
        .optional()
        .isString()
        .trim(),
    handleValidationErrors
];

/**
 * Validation chains for Invoices
 */
export const validateCreateInvoice = [
    body('assignment_id')
        .isUUID()
        .withMessage('assignment_id must be a valid UUID'),
    body('invoice_number')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('invoice_number is required'),
    body('invoice_date')
        .isISO8601()
        .withMessage('invoice_date must be a valid ISO 8601 date'),
    body('due_date')
        .isISO8601()
        .withMessage('due_date must be a valid ISO 8601 date'),
    body('amount')
        .isFloat({ min: 0 })
        .withMessage('amount must be a positive number'),
    body('gst_rate')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('gst_rate must be between 0 and 100'),
    body('status')
        .optional()
        .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
        .withMessage('invalid status'),
    body('notes')
        .optional()
        .isString()
        .trim(),
    handleValidationErrors
];

export const validateUpdateInvoice = [
    body('invoice_number')
        .optional()
        .isString()
        .trim(),
    body('invoice_date')
        .optional()
        .isISO8601()
        .withMessage('invoice_date must be a valid ISO 8601 date'),
    body('due_date')
        .optional()
        .isISO8601()
        .withMessage('due_date must be a valid ISO 8601 date'),
    body('amount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('amount must be a positive number'),
    body('status')
        .optional()
        .isIn(['draft', 'sent', 'paid', 'overdue', 'cancelled'])
        .withMessage('invalid status'),
    body('notes')
        .optional()
        .isString()
        .trim(),
    handleValidationErrors
];

/**
 * Validation chains for Invoice Batch Creation
 * Used for creating invoices via /api/invoices POST
 */
export const validateCreateInvoiceBatch = [
    body('invoices')
        .isArray({ min: 1 })
        .withMessage('invoices must be a non-empty array'),
    body('invoices.*.assignment_id')
        .isString()
        .trim(),
    body('invoices.*.invoice_date')
        .isISO8601()
        .withMessage('invoice_date must be a valid ISO 8601 date'),
    body('invoices.*.kind_attention')
        .optional()
        .isString()
        .trim(),
    body('invoices.*.reference')
        .optional()
        .isString()
        .trim(),
    body('invoices.*.address')
        .optional()
        .isString()
        .trim(),
    body('invoices.*.gst_no')
        .optional()
        .isString()
        .trim(),
    body('invoices.*.new_sales_ledger')
        .optional()
        .isString()
        .trim(),
    body('invoices.*.narration')
        .optional()
        .isString()
        .trim(),
    body('invoices.*.professional_fees')
        .isFloat({ min: 0 })
        .withMessage('professional_fees must be a positive number'),
    body('invoices.*.out_of_pocket')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('out_of_pocket must be a positive number'),
    body('invoices.*.udin')
        .optional()
        .isString()
        .trim(),
    body('batch')
        .optional()
        .isBoolean()
        .withMessage('batch must be boolean'),
    handleValidationErrors
];

/**
 * Validation chains for Tickets
 */
export const validateCreateTicket = [
    body('title')
        .isString()
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('title must be between 3 and 255 characters'),
    body('description')
        .isString()
        .trim()
        .isLength({ min: 10 })
        .withMessage('description must be at least 10 characters'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('priority must be low, medium, or high'),
    body('attachment_url')
        .optional()
        .isString()
        .trim(),
    handleValidationErrors
];

export const validateUpdateTicketStatus = [
    body('status')
        .isIn(['open', 'in_progress', 'resolved', 'closed'])
        .withMessage('status must be open, in_progress, resolved, or closed'),
    handleValidationErrors
];

/**
 * Validation chains for Clients
 */
export const validateCreateClient = [
    body('name')
        .isString()
        .trim()
        .isLength({ min: 3 })
        .withMessage('name must be at least 3 characters'),
    body('gstn')
        .optional()
        .isString()
        .trim(),
    body('industry')
        .optional()
        .isString()
        .trim(),
    body('status')
        .optional()
        .isIn(['active', 'inactive', 'prospect'])
        .withMessage('status must be active, inactive, or prospect'),
    handleValidationErrors
];

export const validateUpdateClient = [
    body('name')
        .optional()
        .isString()
        .trim()
        .isLength({ min: 3 })
        .withMessage('name must be at least 3 characters'),
    body('gstn')
        .optional()
        .isString()
        .trim(),
    body('industry')
        .optional()
        .isString()
        .trim(),
    body('status')
        .optional()
        .isIn(['active', 'inactive', 'prospect'])
        .withMessage('status must be active, inactive, or prospect'),
    handleValidationErrors
];

/**
 * Validation chains for Auth
 */
export const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('email must be a valid email address'),
    body('password')
        .isString()
        .isLength({ min: 6 })
        .withMessage('password must be at least 6 characters'),
    handleValidationErrors
];

export const validateCreateUser = [
    body('email')
        .isEmail()
        .withMessage('email must be a valid email address'),
    body('full_name')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('full_name is required'),
    body('role')
        .isIn(['admin', 'partner', 'director', 'manager', 'assistant_manager', 'staff', 'sr_executive', 'executive', 'analyst'])
        .withMessage('invalid role'),
    body('password')
        .optional()
        .isString()
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters'),
    handleValidationErrors
];
