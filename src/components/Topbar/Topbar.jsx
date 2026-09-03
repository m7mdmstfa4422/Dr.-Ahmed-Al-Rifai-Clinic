import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  Menu, 
  User, 
  ShieldCheck,
  Clock,
  Activity,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { AuthContext } from '../../AuthProvider';

export default function Topbar({ onMenuClick }) {
  const { admin, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // حالة لتحديث الوقت والتاريخ لحظياً
  const [time, setTime] = useState(new Date());
  const [historyIndex, setHistoryIndex] = useState(() => window.history.state?.idx ?? 0);
  const [furthestIndex, setFurthestIndex] = useState(() => Number(sessionStorage.getItem('clinicHistoryMax')) || (window.history.state?.idx ?? 0));

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncHistory = () => {
      const index = window.history.state?.idx ?? 0;
      setHistoryIndex(index);
      setFurthestIndex((previous) => {
        const next = Math.max(previous, index);
        sessionStorage.setItem('clinicHistoryMax', String(next));
        return next;
      });
    };
    syncHistory();
    window.addEventListener('popstate', syncHistory);
    return () => window.removeEventListener('popstate', syncHistory);
  }, [location.key]);

  const goBack = () => historyIndex > 0 ? navigate(-1) : navigate('/');
  const goForward = () => { if (historyIndex < furthestIndex) navigate(1); };

  // تنسيق الوقت (مثال: 10:45:12 م)
  const formattedTime = time.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // تنسيق التاريخ (مثال: الخميس، 24 أكتوبر)
  const formattedDate = time.toLocaleDateString('ar-EG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/70 px-4 backdrop-blur-2xl transition-all md:px-8" dir="rtl">
      
      {/* القسم الأيمن: زر القائمة والشعار / مؤشر النظام */}
      <div className="flex items-center gap-3 md:gap-5">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/80 text-slate-700 shadow-sm transition-all hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 lg:hidden"
          aria-label="فتح القائمة"
        >
          <Menu size={20} />
        </motion.button>

        <div className="flex items-center gap-1 lg:hidden" aria-label="التنقل بين الصفحات">
          <button
            type="button"
            onClick={goBack}
            disabled={historyIndex <= 0}
            aria-label="الرجوع للصفحة السابقة"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sky-800 shadow-sm transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowRight size={18} />
          </button>
          <button
            type="button"
            onClick={goForward}
            disabled={historyIndex >= furthestIndex}
            aria-label="الانتقال للصفحة التالية"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sky-800 shadow-sm transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        {/* مؤشر حالة النظام النشط (مكاني بديل للسيرش) */}
        <div className="hidden items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-emerald-700 sm:flex">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          </span>
          <Activity size={15} className="text-emerald-600" />
          <span className="text-xs font-bold">النظام متصل</span>
        </div>
      </div>

      {/* القسم الأيسر: الوقت والتاريخ + كارت البروفايل */}
      <div className="flex items-center gap-3 sm:gap-5">
        
        {/* العرض الحي للوقت والتاريخ (بديل الإشعارات) */}
        <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2 shadow-2xs backdrop-blur-md">
          <Clock size={16} className="text-sky-600 animate-pulse" />
          <div className="flex flex-col text-right leading-none">
            <span className="text-xs font-extrabold text-slate-800 tracking-wide font-mono">
              {formattedTime}
            </span>
            <span className="mt-1 text-[10px] font-semibold text-slate-400">
              {formattedDate}
            </span>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200/80 hidden sm:block" />

        {/* كارت المسؤول */}
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-1.5 pl-3 shadow-sm backdrop-blur-md">
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 font-bold text-white shadow-md shadow-sky-500/20">
            {admin?.name ? (
              <span className="text-sm font-extrabold">{admin.name.charAt(0)}</span>
            ) : (
              <User size={18} />
            )}
          </div>

          <div className="hidden text-right leading-tight sm:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">
                {admin?.name || 'د. أحمد '}
              </span>
              {admin?.username === 'drahmed' && (
                <ShieldCheck size={14} className="text-sky-500" />
              )}
            </div>
            <span className="text-[10px] font-medium text-slate-400">
              @{admin?.username || 'admin'}
            </span>
          </div>

          {/* زر تسجيل الخروج */}
          {logout && (
            <motion.button
              whileHover={{ scale: 1.08, rotate: -5 }}
              whileTap={{ scale: 0.92 }}
              onClick={logout}
              title="تسجيل الخروج"
              className="mr-1 inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={17} />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
