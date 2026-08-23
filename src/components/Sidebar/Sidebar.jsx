import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../AuthProvider';
import { SubscriptionContext } from '../../SubscriptionProvider';
import img from '../../assets/logo.png';

import {
  FileText,
  LayoutDashboard,
  Settings,
  UserPlus,
  Users,
  Wallet,
  X,
  Sparkles,
  LogOut,
  ChevronLeft,
  ShieldCheck
} from 'lucide-react';

const sidebarItems = [
  { name: 'الرئيسية', path: '/', icon: LayoutDashboard },
  { name: 'المرضى', path: '/search', icon: Users },
  { name: 'إضافة مريض', path: '/register', icon: UserPlus },
  { name: 'التقارير', path: '/reports', icon: FileText },
  { name: 'الحسابات', path: '/finance', icon: Wallet },
  { name: 'الإعدادات', path: '/settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { admin, logout } = useContext(AuthContext);
  const { subscription } = useContext(SubscriptionContext);

  const visibleItems = sidebarItems.filter(
    (item) => !['/finance', '/reports', '/settings'].includes(item.path) || admin?.username === 'drahmed' || admin?.role === 'developer'
  );

  return (
    <>
      {/* خلفية التعتيم للشاشات الصغيرة */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-sm lg:hidden"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* الشريط الجانبي */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col justify-between border-l border-sky-100/80 bg-white/90 p-5 shadow-2xl shadow-sky-950/5 backdrop-blur-2xl transition-transform duration-300 ease-out lg:translate-x-0 lg:shadow-none ${open ? 'translate-x-0' : 'translate-x-full'
          }`}
        dir="rtl"
      >
        <div className="space-y-6">
          {/* هيدر الشريط الجانبي */}
          <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/70 to-white p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <img src={img} alt="Clinic Logo" className="h-12 w-16   object-center " />
                </div>
                <div>
                  <h1 className="text-sm font-black text-slate-900 tracking-tight">
                    عيادة د. أحمد الرفاعي
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700">
                    <Sparkles size={10} /> نظام طبي ذكي
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-white hover:text-slate-700 lg:hidden"
                aria-label="إغلاق القائمة"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* روابط التنقل */}
          <nav className="space-y-1.5">
            <div className="px-3 pb-1 text-[11px] font-bold tracking-wider text-slate-400">
              القائمة الرئيسية
            </div>

            {visibleItems.map(({ name, path, icon: Icon }) => (
              <NavLink
                end={path === '/'}
                key={path}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between overflow-hidden rounded-2xl px-3.5 py-3 text-sm font-bold transition-all duration-200 ${isActive
                    ? 'border border-sky-200 bg-sky-50/80 text-sky-800 shadow-sm shadow-sky-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${isActive
                          ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/30'
                          : 'bg-slate-100/70 text-slate-500 group-hover:bg-sky-100/60 group-hover:text-sky-700'
                          }`}
                      >
                        <Icon size={17} className="stroke-[2.2]" />
                      </div>
                      <span>{name}</span>
                    </div>

                    <ChevronLeft
                      size={14}
                      className={`transition-transform duration-200 ${isActive
                        ? 'text-sky-600 -translate-x-0.5'
                        : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 text-slate-400'
                        }`}
                    />

                    {isActive && (
                      <motion.div
                        layoutId="activeBar"
                        className="absolute right-0 top-2 bottom-2 w-1 rounded-l-full bg-sky-600"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* بطاقة الحساب وحالة النظام */}
        <div className="space-y-3 pt-4">
          <div className="rounded-2xl border border-sky-100/80 bg-slate-50/70 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-100/60 font-bold text-sky-800">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    {admin?.name || admin?.username || 'المسؤول'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    @{admin?.username || 'admin'}
                  </div>
                </div>
              </div>

              {logout && (
                <button
                  onClick={logout}
                  title="تسجيل الخروج"
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                >
                  <LogOut size={16} />
                </button>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-200/50 pt-2 text-[11px]">
              <span className="flex items-center gap-1.5 font-medium text-slate-500">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                متصل بالسحابة
              </span>
              <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-sky-700 shadow-2xs">
                V 2.0
              </span>
            </div>
            <div className="mt-2 rounded-xl border border-amber-100 bg-amber-50/70 p-2 text-[10px] text-amber-800">
              <b>انتهاء الاشتراك</b>
              <span className="mt-1 block" dir="ltr">{subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleString('ar-EG') : 'جارٍ التحقق...'}</span>
            </div>
             <div className="flex items-center gap-1 text-center text-[11px] text-slate-400">
                <span>تم التطوير بواسطة</span>
                <a
                  href="https://m7mdmstfa4422.github.io/MoMustafa/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-sky-600 transition-colors hover:text-sky-700 hover:underline"
                >
                  Mohamed
                </a>
              </div>
          </div>
        </div>
      </aside>
    </>
  );
}
