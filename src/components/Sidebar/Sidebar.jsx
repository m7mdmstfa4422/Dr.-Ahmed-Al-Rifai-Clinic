'use client';

import { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../AuthProvider';
import { SubscriptionContext } from '../../SubscriptionProvider';
import { SystemContext } from '../../SystemProvider';
import { api } from '../../api';

import {
  CalendarDays,
  ChevronLeft,
  Clock,
  Code,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  Wallet,
  X,
} from 'lucide-react';

const sidebarItems = [
  { name: 'الرئيسية', path: '/', icon: LayoutDashboard, label: 'نظرة عامة' },
  { name: 'المرضى', path: '/search', icon: Users, label: 'إدارة المرضى' },
  { name: 'إضافة مريض', path: '/register', icon: UserPlus, label: 'تسجيل جديد' },
  { name: 'المواعيد', path: '/appointments', icon: CalendarDays, label: 'جدول اليوم' },
  { name: 'التقارير', path: '/reports', icon: FileText, label: 'التحليلات' },
  { name: 'الحسابات', path: '/finance', icon: Wallet, label: 'المدفوعات' },
  { name: 'الإعدادات', path: '/settings', icon: Settings, label: 'تخصيص النظام' },
];

function PulseLogo() {
  return (
    <motion.div
      className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-500 shadow-md shadow-cyan-500/20"
      whileHover={{ scale: 1.05 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
      <motion.svg viewBox="0 0 64 36" className="relative h-5 w-8" fill="none" aria-label="نبض صحي">
        <motion.path
          d="M2 19h11l4-9 7 19 7-25 7 15h10l4-6 4 6h6"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0.15, opacity: 0.55 }}
          animate={{ pathLength: [0.15, 1, 0.15], opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.svg>
    </motion.div>
  );
}

export default function Sidebar({ open, onClose, mobileOpen, setMobileOpen }) {
  const { admin, logout } = useContext(AuthContext);
  const { subscription } = useContext(SubscriptionContext);
  const { clinicName } = useContext(SystemContext);
  const [liveCounts, setLiveCounts] = useState({ patients: null, appointments: null });
  const [currentTime, setCurrentTime] = useState(new Date());

  // تحديث الساعة لحظياً كل ثانية
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const formattedDate = currentTime.toLocaleDateString('ar-EG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const isOpen = mobileOpen ?? open;
  const close = () => {
    onClose?.();
    setMobileOpen?.(false);
  };

  const hasPermission = (permission) =>
    admin?.role === 'developer' ||
    admin?.permissions?.includes(permission) ||
    (admin?.role === 'admin' && ['patients', 'appointments'].includes(permission));

  const requiredPermission = {
    '/appointments': 'appointments',
    '/reports': 'reports',
    '/finance': 'finance',
    '/settings': 'settings',
  };

  const visibleItems = sidebarItems.filter(
    (item) => !requiredPermission[item.path] || hasPermission(requiredPermission[item.path])
  );

  useEffect(() => {
    let mounted = true;
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      api('/patients').catch(() => []),
      hasPermission('appointments') ? api(`/appointments?date=${today}`).catch(() => []) : Promise.resolve([]),
    ]).then(([patients, appointments]) => {
      if (mounted)
        setLiveCounts({
          patients: Array.isArray(patients) ? patients.length : 0,
          appointments: Array.isArray(appointments) ? appointments.length : 0,
        });
    });
    return () => {
      mounted = false;
    };
  }, [admin]);

  return (
    <>
      {/* خلفية التعتيم للشاشات الصغيرة */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-xs lg:hidden"
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* الحاوية الجانبية */}
      <aside
        dir="rtl"
        className={`fixed inset-y-0 right-0 z-50 flex h-screen w-64 shrink-0 flex-col border-l border-slate-200 bg-white p-3.5 text-slate-800 shadow-2xl transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* الترويسة والشعار */}
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-800 p-2.5 shadow-md shadow-sky-900/15">
          <div className="flex min-w-0 items-center gap-2.5">
            <PulseLogo />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-black tracking-tight text-white">
                {clinicName}
              </h1>
              <p className="flex items-center gap-1 text-[10px] font-bold text-cyan-200">
                <Sparkles className="size-2.5" /> نظام طبي ذكي
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="إغلاق القائمة"
            className="rounded-xl p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* قائمة روابط التنقل */}
        <div className="mt-4 flex flex-1 flex-col overflow-y-auto pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            مساحة العمل
          </p>
          <nav className="flex flex-col gap-1" aria-label="القائمة الرئيسية">
            {visibleItems.map(({ name, path, icon: Icon, label }) => {
              const count =
                path === '/search' ? liveCounts.patients : path === '/appointments' ? liveCounts.appointments : null;
              return (
                <NavLink key={path} end={path === '/'} to={path} onClick={close} className="group">
                  {({ isActive }) => (
                    <motion.div
                      whileHover={{ x: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-800 text-white shadow-md shadow-sky-900/20'
                          : 'text-slate-600 hover:bg-sky-50 hover:text-sky-800'
                      }`}
                    >
                      <span
                        className={`flex size-7 items-center justify-center rounded-lg transition ${
                          isActive
                            ? 'bg-white/20'
                            : 'bg-sky-50 text-sky-700 group-hover:bg-sky-100 group-hover:text-sky-900'
                        }`}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {name}
                        <small
                          className={`block text-[8px] font-normal ${
                            isActive ? 'text-white/75' : 'text-slate-400'
                          }`}
                        >
                          {label}
                        </small>
                      </span>
                      {count !== null && (
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[9px] ${
                            isActive ? 'bg-white/20 text-white' : 'bg-sky-50 text-sky-700'
                          }`}
                        >
                          {count}
                        </span>
                      )}
                      <ChevronLeft
                        className={`size-3.5 transition ${
                          isActive ? 'text-white/75' : 'text-slate-300 opacity-0 group-hover:opacity-100'
                        }`}
                      />
                    </motion.div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-3 border-t border-slate-100 pt-2">
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              الحماية والإدارة
            </p>
            {hasPermission('settings') && (
              <NavLink
                to="/settings"
                onClick={close}
                className="group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-teal-50/70 hover:text-teal-700"
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-700">
                  <ShieldCheck className="size-3.5" />
                </span>
                <span className="flex-1 truncate">الأمان والخصوصية</span>
              </NavLink>
            )}
            {admin?.role === 'developer' && (
              <>
                <NavLink
                  to="/developer"
                  onClick={close}
                  className="group mt-1 flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-teal-50/70 hover:text-teal-700"
                >
                  <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Settings className="size-3.5" />
                  </span>
                  <span className="flex-1 truncate">لوحة المطوّر</span>
                </NavLink>
                <NavLink
                  to="/developer-control"
                  onClick={close}
                  className="group mt-1 flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-600 transition hover:bg-teal-50/70 hover:text-teal-700"
                >
                  <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Settings className="size-3.5" />
                  </span>
                  <span className="flex-1 truncate">صلاحيات واسم النظام</span>
                </NavLink>
              </>
            )}
          </div>
        </div>

        {/* الجزء السفلي: حالة الحساب والوقت والاشتراك */}
        <div className="mt-auto space-y-2 pt-2">
          <div className="rounded-xl border border-slate-900/10 bg-gradient-to-br from-slate-900 to-teal-950 p-2.5 text-white shadow-lg shadow-teal-950/10">
            <div className="flex items-center gap-2">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-teal-300 to-sky-400 text-xs font-black text-teal-950">
                {admin?.name?.slice(0, 2) || 'دأ'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">{admin?.name || admin?.username || 'المسؤول'}</p>
                <p className="truncate text-[9px] text-white/50">@{admin?.username || 'admin'}</p>
              </div>
              {logout && (
                <button
                  type="button"
                  onClick={logout}
                  title="تسجيل الخروج"
                  className="rounded-lg p-1.5 text-white/50 transition hover:bg-rose-400/20 hover:text-rose-200"
                >
                  <LogOut className="size-3.5" />
                </button>
              )}
            </div>

            {/* بطاقة الوقت والتاريخ بتنسيق زجاجي متناسق */}
            <div className="mt-2.5 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-sm">
              <Clock className="size-4 shrink-0 text-cyan-300 animate-pulse" />
              <div className="flex flex-col text-right leading-tight">
                <span className="font-mono text-xs font-extrabold tracking-wide text-white" dir="ltr">
                  {formattedTime}
                </span>
                <span className="mt-0.5 text-[10px] font-medium text-cyan-200/70">
                  {formattedDate}
                </span>
              </div>
            </div>

            <div className="mt-2 border-t border-white/10 pt-1.5 text-[9px] text-white/60">
              انتهاء الاشتراك:{' '}
              <span className="font-bold text-teal-200" dir="ltr">
                {subscription?.expiresAt
                  ? new Date(subscription.expiresAt).toLocaleDateString('ar-EG')
                  : 'جارٍ التحقق...'}
              </span>
            </div>
          </div>

          {/* شريط المطور */}
          <div className="flex items-center justify-center gap-1 text-center text-[10px] text-slate-400">
            <Code className="size-3 text-sky-500" />
            <span>تم التطوير بواسطة</span>
            <a
              href="https://m7mdmstfa4422.github.io/MoMustafa/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sky-600 transition-colors hover:text-sky-700 hover:underline"
            >
              Mohammed Mustafa
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

export { PulseLogo };
export const SidebarMenuIcon = Menu;