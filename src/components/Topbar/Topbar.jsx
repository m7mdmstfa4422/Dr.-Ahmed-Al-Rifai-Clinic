import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LogOut, 
  Menu, 
  Search, 
  User, 
  ShieldCheck 
} from 'lucide-react';
import { AuthContext } from '../../AuthProvider';

export default function Topbar({ onMenuClick }) {
  const { admin, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      navigate(`/search?q=${encodeURIComponent(e.target.value.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-sky-100/80 bg-white/80 px-4 backdrop-blur-xl md:px-8" dir="rtl">
      
      {/* الجزء الأيمن: زر القائمة للشاشات الصغيرة وشريط البحث */}
      <div className="flex flex-1 items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50/60 text-sky-700 transition-colors hover:bg-sky-100 lg:hidden"
          aria-label="فتح القائمة"
        >
          <Menu size={20} />
        </motion.button>

        {/* شريط البحث الذكي */}
        <div className="relative hidden w-full max-w-md md:block">
          <Search
            size={18}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sky-600/60"
          />
          <input
            type="search"
            onKeyDown={handleSearchKeyDown}
            placeholder="بحث سريع عن مريض، هاتف، أو رقم ملف..."
            className="h-11 w-full rounded-2xl border border-slate-200/90 bg-slate-50/70 pr-10 pl-4 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
            Enter ↵
          </span>
        </div>
      </div>

      {/* الجزء الأيسر: بيانات الحساب وتسجيل الخروج */}
      <div className="flex items-center gap-3">
        {/* بطاقة المسؤول */}
        <div className="flex items-center gap-3 rounded-2xl border border-sky-100/80 bg-slate-50/60 p-1.5 pl-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 font-bold text-white shadow-xs">
            {admin?.name ? admin.name.charAt(0) : <User size={16} />}
          </div>

          <div className="hidden text-right leading-tight sm:block">
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-slate-900">
                {admin?.name || 'د. أحمد الرفاعي'}
              </span>
              {admin?.username === 'drahmed' && (
                <ShieldCheck size={13} className="text-sky-600" />
              )}
            </div>
            <span className="text-[10px] font-semibold text-slate-400">
              @{admin?.username || 'admin'}
            </span>
          </div>

          {/* زر تسجيل الخروج */}
          {logout && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={logout}
              title="تسجيل الخروج"
              className="mr-1 inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={16} />
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}