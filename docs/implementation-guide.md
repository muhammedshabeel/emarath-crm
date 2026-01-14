# Emarath CRM Implementation Guide

This guide captures the end-to-end steps to build, configure, and launch the CRM based on the Airtable exports and DoubleTick (WhatsApp) integration.

## 1) Inputs we still need from you

To complete the DoubleTick integration and import the Airtable data, please provide:

- **DoubleTick API credentials**
  - Base URL (if not the default)
  - API key / token
  - Any required account or workspace IDs
- **DoubleTick webhook details**
  - Webhook signing secret/token (if they support signing)
  - Sample webhook payload (for lead creation and message events)
- **Airtable export ZIP**
  - The latest CSV files (one per table)
  - Clarify which table is the source-of-truth for users, leads, vendors, and products
- **Initial user list + roles**
  - Confirm role for each email (ADMIN vs AGENT)
  - The list you provided is captured below and can be updated if needed
- **Production infrastructure preferences**
  - Database provider (Postgres via Supabase, Neon, RDS, etc.)
  - Hosting (Render, Fly.io, AWS, etc.)
  - Domain and SSL requirements

## 2) Default roles and access rules

- **Admins**
  - Full access to leads, vendors, products, analytics, and user management.
- **Agents**
  - Access to assigned leads, lead activity, and vendor catalog read-only.

## 3) Data model mapping (Airtable → CRM)

Use these mappings when importing CSVs:

- **Staff**: Staff ID, Staff Name, Role, Country
- **Products**: Product Code, Product Name
- **Customers**: Customer ID, Phone Key, Phone 1, Phone 2, Name, Country, City, Address
- **Leads**: Lead ID, Lead Date, Country, Customer Path, Customer ID, Assigned Staff ID, Lead Source, Ad Source, Language, City, Address, Product 1, Qty 1, Product 2, Qty 2, Value, Status, Reason, Notes, Dispatch Flag, Payment Method, CS Remarks
- **Orders**: Order Key, EM Number, Order Date, Country, Customer ID, Sales Staff ID, Source Lead ID, Product 1, Qty 1, Product 2, Qty 2, Value, Order Status, Payment Method, Dispatch Flag, CS Remarks, Delivery Staff ID, Tracking #, Cancellation Reason, Notes
- **Order Items**: Order Item ID, Order Key, Product Code, Product, Quantity, Line Value
- **Payments**: Payment ID, Order Key, EM Number, Country, Amount, Payment Status, Payment Method, Payment Date
- **Complaints**: Complaint ID, Order Key, EM Number, Order Date, Customer Name, Phone 1, Phone 2, Complaint, Department, Notes 1, Notes 2, CS
- **Customer Feedback**: Feedback ID, Order Key, EM Number, Country, Order Date, Sales Staff ID, Customer Name, Phone 1, Phone 2, Feedback, Notes, Google Review Link, Recommended Perfume
- **Delivery Followups**: Follow-up ID, Order Key, EM Number, Date, Delivery Staff ID, Sales Staff ID, Customer Name, Customer Phone 1, Customer Phone 2, Sales Instructions, Sales Remarks, CS Update, CS Remarks, Delivered/Cancelled Date
- **EM Series Settings**: Series ID, Country, Prefix, Next Counter, Active
- **Users**: name, email, role (ADMIN/AGENT), status
- **Lead activities**: lead, status, remarks, follow-up date, value
- **Vendors**: name, contact name, email, phone, status
- **Vendor products**: vendor, product name, sku, price, description

## 4) Local setup (developer machines)

1. **Install dependencies**
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`
2. **Configure environment variables**
   - Copy `.env.example` (create if missing) and set `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`.
3. **Run database migrations**
   - `cd backend && npm run prisma:migrate`
4. **Run the apps**
   - Backend: `npm run dev`
   - Frontend: `npm run dev`

## 5) Airtable CSV import steps

1. Place the Airtable ZIP in a local folder (e.g., `data/airtable-export/`).
2. Unzip into individual CSVs.
3. Import each table in order:
   1. Staff
   2. Products
   3. Customers
   4. Leads
   5. Orders
   6. Order Items
   7. Payments
   8. Complaints
   9. Customer Feedback
   10. Delivery Followups
   11. EM Series Settings
   12. Users
   13. Vendors
   14. Vendor products
   15. Lead activities
4. Validate lead ownership (assigned agent IDs or email mappings).

## 6) DoubleTick integration plan

1. **Webhook ingestion**
   - Configure DoubleTick to POST new lead events to:
     - `POST /integrations/doubletick/webhook`
   - Set the webhook token to match `DOUBLE_TICK_WEBHOOK_TOKEN`.
2. **Agent matching**
   - Lead payload should include agent email. This is used to match to CRM users.
   - If no match is found, the lead is assigned to the `DOUBLE_TICK_DEFAULT_ASSIGNEE_EMAIL`.
3. **Payload requirements**
   - Must include lead name and phone at a minimum.
4. **Data synchronization**
   - When the lead has an external ID, the system will upsert (update or create) the lead.

## 7) Production deployment steps

1. **Provision Postgres**
   - Create a production database and set `DATABASE_URL` in the backend environment.
2. **Deploy backend**
   - Set env variables: `DATABASE_URL`, `JWT_SECRET`, `DOUBLE_TICK_WEBHOOK_TOKEN`, `DOUBLE_TICK_DEFAULT_ASSIGNEE_EMAIL`.
   - Deploy backend as a Node service (Render/Fly/AWS).
3. **Deploy frontend**
   - Point API base URL to the deployed backend.
4. **DNS + SSL**
   - Add domain records and enable SSL.
5. **Webhook validation**
   - Use DoubleTick to fire test webhook calls and verify leads are created.

## 8) Initial user list (provided)

- admin-info@emarath.com (ADMIN)
- sales-suhail.emarath@gmail.com (AGENT)
- anshad.emirath@gmail.com (AGENT)
- emarath.sadiq@gmail.com (AGENT)
- shamseena.emarath@gmail.com (AGENT)
- nithya.emarath@gmail.com (AGENT)
- reshmi.emarath@gmail.com (AGENT)
- dhiyana.emirath@gmail.com (AGENT)
- remcy.emarath@gmail.com (AGENT)
- shabee2815@gmail.com (AGENT)
- liya.emarath@gmail.com (AGENT)
- ansar.emirath@gmail.com (AGENT)
- shabanaemarath@gmail.com (AGENT)

> Confirm if any of these should be ADMINs.
