import { useState, useContext } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity } from 'lucide-react';

import Sidebar from './components/Sidebar/Sidebar';
import Topbar from './components/Topbar/Topbar';
import PatientRegistration from './components/PatientRegistration/PatientRegistration';
import PatientSearch from './components/PatientSearch/PatientSearch';
import FinancialDashboard from './components/FinancialDashboard/FinancialDashboard';
import PatientProfile from './components/PatientProfile/PatientProfile';
import Settings from './components/Settings/Settings';
import Reports from './components/Reports/Reports';
import Home from './components/Home/Home';
import UiFeedback from './components/UiFeedback/UiFeedback';
import Login from './components/Login/Login';
import AuthProvider, { AuthContext } from './AuthProvider';
import SubscriptionProvider, { SubscriptionContext } from './SubscriptionProvider';
import SubscriptionRenewal from './components/SubscriptionRenewal/SubscriptionRenewal';
import DeveloperConsole from './components/DeveloperConsole/DeveloperConsole';
import Appointments from './components/Appointments/Appointments';
import SystemProvider from './SystemProvider';
import DeveloperControl from './components/DeveloperControl/DeveloperControl';

const UnderDevelopment = () => (
  <div className="grid min-h-[45vh] place-items-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
    <div>
      <Activity size={42} className="mx-auto mb-4 text-blue-500" />
      <h2 className="text-lg font-bold text-slate-800">هذه الصفحة قيد التطوير</h2>
      <p className="mt-2 text-sm text-slate-500">اختر إحدى الصفحات المتاحة من القائمة الجانبية.</p>
    </div>
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();
  const { isAuthenticated, admin } = useContext(AuthContext);
  const { subscription } = useContext(SubscriptionContext);
  const hasPermission = (permission) => admin?.role === 'developer' || admin?.permissions?.includes(permission);

  if (isAuthenticated && subscription && !subscription.active) return <Routes><Route path="/developer" element={admin?.role === 'developer' ? <DeveloperConsole /> : <SubscriptionRenewal />} /><Route path="*" element={<SubscriptionRenewal />} /></Routes>;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/Login" replace />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/developer" element={admin?.role === 'developer' ? <DeveloperConsole /> : <Navigate to="/" replace />} />
          <Route path="/developer-control" element={admin?.role === 'developer' ? <DeveloperControl /> : <Navigate to="/" replace />} />
          <Route path="/register" element={isAuthenticated ? <PatientRegistration /> : <Navigate to="/Login" replace />} />
          <Route path="/appointments" element={hasPermission('appointments') ? <Appointments /> : <Navigate to="/" replace />} />
          <Route path="/search" element={isAuthenticated ? <PatientSearch /> : <Navigate to="/Login" replace />} />
          <Route path="/finance" element={hasPermission('finance') ? <FinancialDashboard /> : <Navigate to="/" replace />} />
          <Route path="/patient-profile/:id" element={isAuthenticated ? <PatientProfile /> : <Navigate to="/Login" replace />} />
          <Route path="/operations" element={isAuthenticated ? <UnderDevelopment /> : <Navigate to="/Login" replace />} />
          <Route path="/reports" element={hasPermission('reports') ? <Reports /> : <Navigate to="/" replace />} />
          <Route path="/settings" element={hasPermission('settings') ? <Settings /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/Login'} replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      {/* 1. السايدبار يظهر للمسجلين فقط */}
      {isAuthenticated && (
        <Sidebar
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          mobileOpen={menuOpen}
          setMobileOpen={setMenuOpen}
        />
      )}

      {/* 2. حاوية المحتوى تأخذ باقي العرض تلقائياً دون تداخل */}
      <div className="flex min-w-0 flex-1 flex-col">
        {isAuthenticated && <Topbar onMenuClick={() => setMenuOpen(true)} />}

        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <AnimatedRoutes />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider><SubscriptionProvider><SystemProvider><UiFeedback><BrowserRouter><Layout /></BrowserRouter></UiFeedback></SystemProvider></SubscriptionProvider></AuthProvider>
  );
}
