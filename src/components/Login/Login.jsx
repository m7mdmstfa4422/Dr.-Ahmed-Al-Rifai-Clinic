import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../AuthProvider';
import img from '/docpoint-logo.svg';
import { api } from '../../api';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Stethoscope,
  Sparkles,
  HeartPulse,
  CheckCircle2,
  Code
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await api('/auth/login', { method: 'POST', body: JSON.stringify(formData) });
      auth.login({ ...result, remember: formData.rememberMe });
      navigate(result.admin.role === 'developer' ? '/developer' : '/');
    } catch (err) {
      setError(err.message || 'بيانات الدخول غير صحيحة، يرجى المحاولة مجدداً');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-100 p-3 text-slate-800 antialiased sm:p-6" dir="rtl">

      {/* هالات خلفية تفاعلية ومتحركة باستمرار */}
      <motion.div
        animate={{
          x: [0, 80, 0],
          y: [0, 50, 0],
          scale: [1, 1.25, 1]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-24 -right-24 h-[30rem] w-[30rem] rounded-full bg-sky-200/55 blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -90, 0],
          y: [0, -60, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="pointer-events-none absolute -bottom-28 -left-28 h-[32rem] w-[32rem] rounded-full bg-cyan-200/45 blur-3xl"
      />

      {/* لوحة تسجيل الدخول المقسمة (Split 100vh Layout) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 grid min-h-[620px] w-full max-w-6xl grid-cols-1 overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-2xl shadow-sky-950/15 md:grid-cols-[1.05fr_0.95fr] md:rounded-[2.5rem]"
      >

        {/* الجانب الأيمن: صورة طبية تفاعلية ومعلومات المنظومة */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-950 via-sky-900 to-cyan-800 p-10 text-white md:flex">
          <div className="absolute -left-24 -top-20 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]" />

          {/* رأس القسم البصري */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-md">
              <Sparkles size={14} className="text-cyan-300" />
              منظومة الرعاية الذكية
            </div>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-cyan-300"
            >
              <HeartPulse size={22} />
            </motion.div>
          </div>

          {/* محتوى وسطي وترحيبي */}
          <div className="relative z-10 my-auto space-y-4">
            <img src={img} alt="DocPoint" className="mb-5 h-16 w-20 object-contain object-right brightness-0 invert" />
            <h2 className="text-3xl font-black leading-snug tracking-tight text-white lg:text-4xl">إدارة العيادة،<br />بهدوء ووضوح.</h2>
            <p className="max-w-sm text-sm leading-relaxed text-sky-100/80">ملفات المرضى والمواعيد وسجل الزيارات في مكان واحد آمن وسهل الاستخدام.</p>

            <div className="space-y-2 pt-2 text-xs font-medium text-sky-100/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-cyan-300" />
                <span>حفظ تلقائي للتقارير والزيارات الطبية</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-cyan-300" />
                <span>تتبع أداء وإيرادات الفروع لحظياً</span>
              </div>
            </div>
          </div>

          {/* تذييل القسم البصري */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-sky-200/60">
            <Stethoscope size={16} />
            <span>نظام الإدارة الطبية الموحد v2.0</span>
          </div>
        </div>

        {/* الجانب الأيسر: نموذج تسجيل الدخول متموضع في المنتصف */}
        <div className="flex flex-col justify-between overflow-y-auto p-6 sm:p-10 md:p-12">

          <div className="my-auto flex w-full max-w-sm flex-col justify-center self-center">
            {/* الشعار والعنوان */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <img src={img} alt="Clinic Logo" className="h-12 w-14 object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900">مرحبًا بعودتك</h1>
                  <p className="mt-0.5 text-[11px] font-semibold text-sky-700">سجّل الدخول للمتابعة إلى لوحة العيادة</p>
                </div>
              </div>
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/90 p-3 text-xs font-semibold text-rose-600"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* نموذج تسجيل الدخول */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* اسم المستخدم */}
              <div className="space-y-1.5 text-right">
                <label className="text-xs font-semibold text-slate-600" htmlFor="username">
                  اسم المستخدم
                </label>
                <div className="relative flex items-center">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="أدخل اسم المستخدم"
                    autoComplete="username"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pr-11 pl-4 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
                  />
                  <User size={18} className="absolute right-3.5 text-slate-400" />
                </div>
              </div>

              {/* كلمة المرور */}
              <div className="space-y-1.5 text-right">
                <div className="flex items-center justify-between">

                  <label className="text-xs font-semibold text-slate-600" htmlFor="password">
                    كلمة المرور
                  </label>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="أدخل كلمة المرور"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pr-11 pl-11 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
                  />
                  <Lock size={18} className="absolute right-3.5 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 text-slate-400 transition-colors hover:text-slate-600"
                    aria-label="تبديل ظهور كلمة المرور"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* تذكرني */}
              <div className="flex items-center gap-2 pt-1 text-right">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded-md border-slate-300 text-sky-600 accent-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="rememberMe" className="text-xs font-medium text-slate-500 select-none">
                  تذكر بيانات الدخول
                </label>
              </div>

              {/* زر الدخول */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="group relative mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-800 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-900/20 transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin text-white" />
                ) : (
                  <>
                    <span>دخول لوحة التحكم</span>
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* تذييل البطاقة مع بيانات المطور والرابط */}
          <div className="mt-4 flex flex-col items-center justify-center gap-1.5 border-t border-slate-100 pt-3 text-center text-[11px] font-medium text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>بوابة وصول طبية مشفرة 256-bit</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Code size={13} className="text-sky-500" />
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

        </div>

      </motion.div>
    </div>
  );
}
