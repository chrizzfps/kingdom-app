import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { Toaster } from '@/components/ui/sonner';
import { SEO } from '@/components/common/SEO';
import { ChatProvider } from '@/components/chat/ChatContext';
import { TeamChatWidget } from '@/components/chat/TeamChatWidget';

function ChatWidgetGuard() {
  const { pathname } = useLocation();
  if (pathname === '/login') return null;
  return <TeamChatWidget />;
}

// Lazy Load Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ProposalsPage = lazy(() => import('./pages/ProposalsPage'));
const PortfoliosPage = lazy(() => import('./pages/PortfoliosPage'));
const SocialCenter = lazy(() => import('./pages/admin/SocialCenter'));
const ClientsPage = lazy(() => import('./pages/crm/ClientsPage'));
const ClientDetailPage = lazy(() => import('./pages/crm/ClientDetailPage'));
const ProjectsPage = lazy(() => import('./pages/crm/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/crm/ProjectDetailPage'));
const InvoicesPage = lazy(() => import('./pages/finance/InvoicesPage'));
const FinancePage = lazy(() => import('./pages/finance/FinancePage'));
const InvoiceEditorPage = lazy(() => import('./pages/finance/InvoiceEditorPage'));
const ProposalBuilder = lazy(() => import('./pages/ProposalBuilder'));
const PublicProposalView = lazy(() => import('./pages/PublicProposalView'));
const PreviewProposalView = lazy(() => import('./pages/PreviewProposalView'));
const SetupPage = lazy(() => import('./pages/SetupPage'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const GlobalTasksPage = lazy(() => import('./pages/tasks/GlobalTasksPage'));

import { ThemeIsolator } from '@/components/common/ThemeIsolator';
import { RequireRole } from '@/components/auth/RequireRole';

function App() {
  useEffect(() => {
    // Hide preloader when app is ready
    document.body.classList.add('app-ready');
  }, []);

  return (
    <Router>
      <ThemeIsolator />
      <SEO />
      <Toaster />
      <ChatProvider>
        <ChatWidgetGuard />
        <Suspense fallback={<KingdomLoader fullscreen />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="proposals" element={<RequireRole allowedRoles={['admin']}><ProposalsPage /></RequireRole>} />
              <Route path="portfolios" element={<PortfoliosPage />} />
              <Route path="builder/:id" element={<RequireRole allowedRoles={['admin']}><ProposalBuilder /></RequireRole>} />
              <Route path="config" element={<RequireRole allowedRoles={['admin']}><SetupPage /></RequireRole>} />
              <Route path="settings" element={<RequireRole allowedRoles={['admin']}><SetupPage /></RequireRole>} />

              {/* Future Routes (Placeholders for now) */}
              <Route path="clients" element={<ClientsPage />} />
              <Route path="clients/:id" element={<ClientDetailPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
              <Route path="finance" element={<FinancePage />} />
              <Route path="finance/:id" element={<InvoiceEditorPage />} />
              <Route path="invoices" element={<RequireRole allowedRoles={['admin']}><InvoicesPage /></RequireRole>} />
              <Route path="invoices/:id" element={<RequireRole allowedRoles={['admin']}><InvoiceEditorPage /></RequireRole>} />
              <Route path="tasks" element={<GlobalTasksPage />} />
              <Route path="users" element={<RequireRole allowedRoles={['admin']}><UsersPage /></RequireRole>} />
            </Route>

            <Route path="/admin/social" element={<SocialCenter />} />
            <Route path="/p/:slug" element={<PublicProposalView />} />
            <Route path="/preview/:id" element={<PreviewProposalView />} />

            <Route path="/" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Suspense>
      </ChatProvider>
    </Router>
  );
}

export default App;
