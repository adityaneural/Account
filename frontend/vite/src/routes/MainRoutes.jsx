import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import ProtectedRoute from './ProtectedRoute';

// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const ModulePlaceholder = Loadable(lazy(() => import('pages/modules/ModulePlaceholder')));
const IdentityPage = Loadable(lazy(() => import('pages/identity/IdentityPage')));
const CompaniesPage = Loadable(lazy(() => import('pages/companies/CompaniesPage')));
const AccountingPage = Loadable(lazy(() => import('pages/accounting/AccountingPage')));
const InventoryPage = Loadable(lazy(() => import('pages/inventory/InventoryPage')));
const PurchasePage = Loadable(lazy(() => import('pages/purchase/PurchasePage')));
const SalesPage = Loadable(lazy(() => import('pages/sales/SalesPage')));
const GstPage = Loadable(lazy(() => import('pages/gst/GstPage')));

// render - color
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'saas',
      element: (
        <ModulePlaceholder
          title="SaaS Admin"
          description="Manage tenants, plans, subscriptions, trials, billing status, and platform-wide controls."
          features={['Tenant onboarding', 'Subscription plans', 'Usage limits', 'Super admin controls']}
        />
      )
    },
    {
      path: 'companies',
      element: <CompaniesPage />
    },
    {
      path: 'users',
      element: <IdentityPage />
    },
    {
      path: 'accounting',
      element: <AccountingPage />
    },
    {
      path: 'sales',
      element: <SalesPage />
    },
    {
      path: 'purchase',
      element: <PurchasePage />
    },
    {
      path: 'inventory',
      element: <InventoryPage />
    },
    {
      path: 'gst',
      element: <GstPage />
    },
    {
      path: 'manufacturing',
      element: (
        <ModulePlaceholder
          title="Manufacturing"
          description="Support industrial workflows for BOM, production, raw material consumption, finished goods, and job work."
          features={['Bill of materials', 'Production orders', 'Wastage/scrap', 'Job work']}
        />
      )
    },
    {
      path: 'payroll',
      element: (
        <ModulePlaceholder
          title="Payroll"
          description="Manage employees, attendance, salary structures, payslips, and statutory payroll deductions."
          features={['Employee records', 'Salary processing', 'Payslips', 'PF/ESI/TDS']}
        />
      )
    },
    {
      path: 'banking',
      element: (
        <ModulePlaceholder
          title="Banking"
          description="Manage bank ledgers, reconciliation, cheque controls, payment advice, and payment workflows."
          features={['Bank reconciliation', 'Cheque management', 'Payment advice', 'Cash and bank books']}
        />
      )
    },
    {
      path: 'reports',
      element: (
        <ModulePlaceholder
          title="Reports & MIS"
          description="Generate financial, inventory, tax, branch, and management reports with export support."
          features={['Balance sheet', 'Profit & loss', 'Stock summary', 'Outstanding reports']}
        />
      )
    },
    {
      path: 'audit',
      element: (
        <ModulePlaceholder
          title="Audit & Security"
          description="Track edit history, voucher changes, user actions, permissions, and compliance-sensitive events."
          features={['Audit log', 'Edit log', 'Voucher verification', 'Security controls']}
        />
      )
    },
    {
      path: 'marketplace',
      element: (
        <ModulePlaceholder
          title="Marketplace"
          description="Install and manage add-ons, external integrations, webhooks, API apps, and paid extensions."
          features={['Plugin installation', 'Public API apps', 'Webhooks', 'Paid add-ons']}
        />
      )
    },
    {
      path: 'compliance',
      element: (
        <ModulePlaceholder
          title="Compliance Rules"
          description="Version tax, payroll, invoice, numbering, and statutory rules by country, state, and effective date."
          features={['Tax rule versions', 'Invoice rules', 'State-wise setup', 'Effective dates']}
        />
      )
    },
    {
      path: 'approvals',
      element: (
        <ModulePlaceholder
          title="Approvals"
          description="Build approval chains for vouchers, invoices, payments, purchase orders, stock adjustments, and add-ons."
          features={['Approval policies', 'Maker-checker flow', 'Escalations', 'Approval audit trail']}
        />
      )
    },
    {
      path: 'typography',
      element: <Typography />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    }
  ]
};

export default MainRoutes;
