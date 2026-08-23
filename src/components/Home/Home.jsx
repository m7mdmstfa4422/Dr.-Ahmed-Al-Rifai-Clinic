import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarPlus, ShieldCheck, Sparkles, Stethoscope, Users } from 'lucide-react';
import { AuthContext } from '../../AuthProvider';

export default function Home() {
  const { admin } = useContext(AuthContext);
  const today = new Intl.DateTimeFormat('ar-EG', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(new Date());

  return (
    <section className="relative min-h-[calc(100vh-10rem)] overflow-hidden rounded-[2.5rem] border border-sky-100 bg-[#F8FAFC] p-6 text-slate-800 shadow-sm md:p-12" dir="rtl">
      {/* Animated Light Auras */}
      <motion.div 
        animate={{ x: [0, 80, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }} 
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} 
        className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-sky-200/60 blur-3xl" 
      />
      <motion.div 
        animate={{ x: [0, -90, 0], y: [0, -40, 0], scale: [1, 1.25, 1] }} 
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} 
        className="absolute -bottom-40 -left-20 h-[28rem] w-[28rem] rounded-full bg-cyan-200/50 blur-3xl" 
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(14,165,233,0.06),transparent_40%)]" />

      {/* Decorative Watermark Icon */}
      <Stethoscope className="pointer-events-none absolute -bottom-10 left-10 h-72 w-72 -rotate-12 text-sky-900/[0.03]" />

      <div className="relative z-10 flex min-h-[70vh] flex-col justify-between">
        <div>
          {/* Top Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-xs font-semibold text-sky-800 shadow-sm backdrop-blur-xl"
          >
            <Sparkles size={15} className="text-sky-600" />
            نظام عيادتي الطبي الذكي
          </motion.div>

          {/* Hero Welcome Text */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.15 }} 
            className="mt-10 max-w-3xl"
          >
            <p className="text-sm font-semibold text-sky-700">{today}</p>
            <h1 className="mt-3 text-4xl font-black leading-tight text-slate-900 md:text-6xl">
              مرحبًا، {admin?.name || admin?.username}
              <br />
              <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
                في عيادة د. أحمد الرفاعي
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
              المنظومة السحابية الموحدة لإدارة المراجعين، متابعة الزيارات، وفحص تقارير الفروع بكل سلاسة واحترافية.
            </p>
          </motion.div>
        </div>

        {/* Quick Action Navigation Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 25 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }} 
          className="grid gap-5 md:grid-cols-3"
        >
          <Link 
            to="/register" 
            className="group relative overflow-hidden rounded-3xl border border-sky-100 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700 transition-colors group-hover:bg-sky-600 group-hover:text-white">
              <CalendarPlus size={20} />
            </div>
            <b className="mt-4 block text-base font-bold text-slate-900">تسجيل مريض جديد</b>
            <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-sky-700">
              فتح ملف طبي <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            </span>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-sky-600 to-cyan-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>

          <Link 
            to="/search" 
            className="group relative overflow-hidden rounded-3xl border border-sky-100 bg-white/80 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-300 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700 transition-colors group-hover:bg-sky-600 group-hover:text-white">
              <Users size={20} />
            </div>
            <b className="mt-4 block text-base font-bold text-slate-900">السجلات الطبية</b>
            <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-sky-700">
              بحث ومتابعة الحالات <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
            </span>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-sky-600 to-cyan-400 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>

          <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white/80 p-6 shadow-sm backdrop-blur-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
              <ShieldCheck size={20} />
            </div>
            <b className="mt-4 block text-base font-bold text-slate-900">جلسة محمية وموثقة</b>
            <span className="mt-1 block text-xs text-slate-500 font-medium">
              متصل كـ: <b className="text-slate-700">@{admin?.username}</b>
            </span>
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-sky-600 to-indigo-900 opacity-20" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}