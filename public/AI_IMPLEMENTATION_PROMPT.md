# KP-AMS Portal Modifications - AI Implementation Prompt

**Copy everything below and paste it to your AI assistant (Claude, ChatGPT, etc.)**

---

## SYSTEM CONTEXT

I have an **Enterprise Resource Planning (ERP) portal** called KP-AMS (Kirtane & Pandit Assignment Management System) built for a professional accounting/consulting firm.

### Tech Stack:
- **Frontend**: Next.js 15+ (React 19), App Router, Tailwind CSS, Zustand (state), Axios (API calls)
- **Backend**: Node.js + Express.js + TypeScript (tsx)
- **Database**: PostgreSQL (Supabase)
- **File Storage**: Cloudflare R2 (S3-compatible)
- **Authentication**: JWT tokens stored in localStorage
- **Project Structure**: Views consolidated in `src/views`, routing in `src/app`, API routes follow RESTful patterns

### Current System Features:
1. Proposals & Bidding (auto-numbered via `proposal_sequences` table)
2. Assignments (once a proposal is won, includes Category A-F, fee allocations)
3. Billing & Invoices (with UDIN support for Chartered Accountants)
4. Client & SPOC Management (hierarchical CRM with GST tracking)
5. Audit Trail (`change_history` table records every field change)
6. Role-based Access: 4 roles currently (admin, partner, director, manager)

---

## USER ROLES & ACCESS HIERARCHY

### Role Structure (IMPORTANT - Implement exactly as shown):

**Super Admin**
- Access: All Access
- Default Dashboard: Director Page
- Views: Overall Page + Partner-wise bifurcation

**Partners** (2 users)
1. Milind Limaye - All Access
2. Tanmay Bodhe - All Access
Both: Overall Page + Partner-wise bifurcation

**Director**
- Name: Rishabh Thakkar
- Access: All Access
- Default Dashboard: Director Page
- Views: Overall Page + Partner-wise bifurcation

**Managers** (6 users) - Individual Access ONLY
1. Sanjeev Deshpande
2. Bhushan Patil
3. Mohit Joshi
4. Vibhuti Narang
5. Hamza Momin
6. Dhanashree Dekhane

---

## 23 MODIFICATIONS TO IMPLEMENT

### Priority Phase 1: Core CRUD Operations (Do First)

**1. Client Addition**
- Create backend endpoint: `POST /api/clients`
- Frontend form for adding new clients
- Fields: Client Name, GST Number, Contact Info, Address, Billing Details
- Store in database with proper validation

**2. Client Dropdown in Proposal and Assignments**
- Add client dropdown selector to proposal creation form
- Add client dropdown selector to assignment creation form
- Populate from existing clients database
- Make it a required field

**3. Table/Form Creation for New Proposal**
- Build proposal creation form with fields:
  - Client (dropdown - see #2)
  - Proposal Type
  - Amount
  - Description
  - Timeline (Start/End dates)
  - Assignment Type (for auto-numbering)
  - Fiscal Year (auto-filled)
- Use existing `proposal_sequences` table for auto-numbering
- Endpoint: `POST /api/proposals`

**4. Table/Form Creation for Revise Proposal**
- Allow editing of existing proposals before they're marked as Won/Lost
- Track version history (who revised, when, what changed)
- Endpoint: `PUT /api/proposals/:id`
- Display revision history in a collapsible section

**5. Table/Form Creation for New Assignments**
- Build assignment creation form with fields:
  - Client (link to won proposal)
  - Category (dropdown A-F + new categories from #20)
  - Responsible Partner
  - Manager (assign to one of the 6 managers)
  - Start Date
  - End Date
  - Total Fee
- Automatically create 12 monthly fee allocations
- Endpoint: `POST /api/assignments`

**6. Edit Assignment - Form Creation & Logic Connection**
- Create edit form for existing assignments
- Allow updating: Partner, Manager, End Date, Category
- When fees change, recalculate monthly allocations proportionally
- Endpoint: `PUT /api/assignments/:id`
- Update related invoices (drafts only, not finalized ones)

**7. Invoice Generation**
- Create endpoint: `GET /api/invoices/:assignmentId`
- Generate invoice from fee allocations
- Include fields:
  - UDIN (Unique Document Identification Number - CA requirement)
  - Professional Fees
  - Out of Pocket Expenses
  - Monthly breakdown
  - Total Amount Due
  - Client GST Number
- Invoices generated as DRAFT initially
- Allow marking as FINAL (after review)
- Support PDF export

---

### Priority Phase 2: Role & Admin Features

**8. SPOC Details - Add Contact Designation**
- Add "Designation" field to SPOC (Single Point of Contact) form
- Update database schema to include designation column
- Display designation in SPOC list/view
- Endpoint: `PUT /api/spoc/:id`

**9. Manager Creation by Senior Roles**
- **Who can create**: SuperAdmin, Director, Partners only
- Create endpoint: `POST /api/managers` (protected route, check auth)
- Form for creating new Manager or Assistant Manager
- Fields: Name, Email, Phone, Role, Department
- Auto-generate login credentials or send invite link
- Log this action in audit trail

**10. New Staff Roles - Add to System**
- Add these new role options to the `roles` enum:
  1. Assistant Manager
  2. Executive
  3. Senior Executive (Sr. Exec)
  4. Analyst
- Update role dropdown everywhere roles are selected
- Implement role-based access control for each new role:
  - Assistant Manager: Similar to Manager but maybe limited dashboard view
  - Executive: View-only access to assigned work
  - Sr. Exec: Elevated access (to be defined)
  - Analyst: Limited access to specific assignments

---

### Priority Phase 3: Admin & User Experience

**11. Enhanced Audit Log - Detailed Changes**
- Current: `change_history` table records field changes
- **Enhance**: Add detailed before/after values
- For each change record: what field, old value, new value, who changed it, timestamp
- Frontend: Display audit log viewer with:
  - Chronological list of all changes
  - Expandable rows showing before/after values
  - Filter by date range, user, entity type
- Endpoint: `GET /api/audit-log/:entityType/:entityId`

**12. Admin Panel - Login As User**
- SuperAdmin and Director roles only
- Feature: Ability to login as any user to test their experience
- Security: 
  - Log all "login as" actions in audit trail
  - Include IP address, timestamp, original admin user
  - Prevent infinite loops (can't login as a superadmin from superadmin)
- UI: Add "Login As" button next to each user in admin panel
- Endpoint: `POST /api/auth/login-as/:userId` (protected)

**13. Support Tickets - Multiple Submission Options**
- Option 1: Email-based tickets (send to support@company.com)
- Option 2: Dedicated Ticket Tab in Admin Panel
- Create `tickets` table with fields:
  - Title
  - Description
  - Priority
  - Status (Open, In Progress, Resolved)
  - Submitted by (user_id)
  - Created/Updated timestamps
- Endpoint: `POST /api/tickets`
- Admin panel shows all tickets with status updates
- Users can see their own tickets in a "My Tickets" section

**14. Notification Area - Bell Icon Enhancement**
- Update notification system:
  - Display unread count badge on bell icon
  - Click bell opens notification center (dropdown or modal)
  - Show notification history (last 20 notifications)
  - Ability to mark notifications as read/unread
  - Ability to clear all notifications
- Notifications should trigger for:
  - Assignment status changes
  - Proposal updates
  - Invoice generation
  - Ticket responses
  - System alerts

**15. Profile Edit Option**
- Create user profile editing page
- Allow users to update:
  - First Name / Last Name
  - Email (with verification if changed)
  - Phone Number
  - Job Title (read-only, auto-filled from role)
  - Department (read-only)
  - Password (requires current password verification)
  - Preferences (theme, notifications, email frequency)
- Endpoint: `PUT /api/profile/:userId`
- Store changes in user profiles table

**16. Logout & Profile Navigation**
- Change logout button behavior:
  - Instead of redirecting to login, go to profile/settings page
  - Show user's current info
  - Provide links to: Edit Profile, Change Password, View Activity, Logout
- Create profile landing page with:
  - User avatar/name
  - Recent activity (last 5 assignments, proposals worked on)
  - Quick stats (assignments managed, revenue generated)
  - Links to main features

---

### Priority Phase 4: Dashboard Updates

**17. Dashboard - Recent Assignments Dropdown**
- Change: Remove category field from new assignment creation shortcut
- Add: Dropdown showing recently accessed/worked assignments
- Display: Assignment name, status, client, amount
- Clicking assignment opens assignment details
- Purpose: Quick navigation to ongoing work

**18. Dashboard - Update Proposals Listing**
- Improve proposals list visibility
- Add filtering options: Status (Draft, Sent, Won, Lost), Client, Date Range
- Add sorting: By Date (newest first), By Amount, By Client, By Status
- Show columns: Proposal ID, Client, Amount, Status, Last Modified, Assigned To

**19. Data Setup - Hamza Momin**
- Create complete user profile for Hamza Momin (Manager role)
- Assign demo assignments to his profile for testing
- Set up his dashboard view
- Configure his email address and contact info

**20. Assignment Categories - Add New Options**
- Current categories: A, B, C, D, E, F
- **Add these new categories**:
  1. SOP Designing, Drafting, Review
  2. Management Consulting
- Update assignment category dropdown everywhere
- Update database to support new categories
- These can coexist with A-F or replace them (clarify with team)

**21. Dashboard Analytics - Revenue & Billing Updates**
- **Update 1: Total Revenue Projected**
  - Calculate: Sum of all assignment fees for current fiscal year
  - Display prominently on dashboard
  - Show trend vs last year

- **Update 2: Billing Progress**
  - **Format**: Show numbers WITH percentage in brackets
  - **Example**: `1,250,000 (52%)`
  - **Location**: Make this a 2nd tab on the dashboard
  - Show: 
    - Total Revenue Projected (Tab 1)
    - Billing Progress (Tab 2) - amount invoiced / total projected
  - Update calculation in real-time as invoices are created

**22. UI Fix - Button Positioning**
- **Issue**: A button is hidden or positioned behind other elements ("button peeche chale gaya")
- **Action**: Identify which button (likely in Dashboard, Forms, or Invoice section)
- **Fix**: Adjust CSS z-index, margins, or layout to make it visible
- **Test**: Verify button is clickable and properly positioned

**23. Backend Variable Connections - Complete**
- Review entire database schema
- Identify any NaN/null/undefined values that should be connected
- Update backend logic to populate these values correctly
- Ensure all form submissions properly save data to database
- Add validation to prevent empty/invalid data

---

## IMPLEMENTATION INSTRUCTIONS

### Before Starting:
1. I will provide you with my codebase (you may need to ask me for it)
2. Review the file structure, existing patterns, and coding conventions
3. Ask clarifying questions about any ambiguous modifications

### While Coding:
1. Follow Next.js/Express best practices
2. Add proper error handling and validation
3. Use TypeScript for type safety
4. Implement proper JWT authentication checks
5. Write SQL migrations for database schema changes
6. Add try-catch blocks and logging

### After Each Feature:
1. Create corresponding tests (unit or integration)
2. Test all happy paths and edge cases
3. Verify role-based access control works
4. Ensure audit log records changes

### Database Changes:
- Create migration files for each schema change
- Update TypeScript interfaces to match new schema
- Test migrations on a dev database first

### API Endpoints Summary (All Needed):
```
POST   /api/clients
POST   /api/proposals
PUT    /api/proposals/:id
POST   /api/assignments
PUT    /api/assignments/:id
GET    /api/invoices/:assignmentId
POST   /api/managers
PUT    /api/spoc/:id
POST   /api/tickets
PUT    /api/profile/:userId
GET    /api/audit-log/:entityType/:entityId
POST   /api/auth/login-as/:userId
```

### Frontend Components Needed:
- ClientForm
- ProposalForm (create & edit modes)
- AssignmentForm (create & edit modes)
- InvoiceGenerator
- SPOCForm
- ManagerCreationForm
- AuditLogViewer
- TicketForm & TicketList
- ProfileEditPage
- NotificationCenter
- DashboardRevised (with tabs for revenue/billing)

---

## IMPORTANT NOTES

- **Security First**: Every modification affecting data or admin features must verify user permissions
- **Audit Trail**: Log all create/update/delete operations
- **Validation**: Validate all inputs (frontend AND backend)
- **Testing**: Test with all 10 users in different roles to ensure access control works
- **Database Integrity**: Use transactions for operations that affect multiple tables
- **Backward Compatibility**: Ensure existing proposals/assignments still work with new features

---

**Next Step**: Provide your codebase (or relevant file snippets), and I'll start implementing these modifications.

