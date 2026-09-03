import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../AuthProvider';
import img from '/docpoint-logo.png';
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
    <div className="fixed inset-0 flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-sky-50/60 to-slate-200 p-3 sm:p-5" dir="rtl">
      
      {/* هالات الإضاءة الخلفية */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-sky-200/50 blur-3xl sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl sm:h-96 sm:w-96" />

      {/* لوحة تسجيل الدخول */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative z-10 grid h-full max-h-[580px] w-full max-w-4xl grid-cols-1 overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-2xl shadow-sky-950/10 backdrop-blur-md md:grid-cols-2 md:rounded-3xl"
      >

        {/* الجانب البصري - الهوية الإنجليزية المتناسقة */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-950 via-slate-900 to-cyan-950 p-8 text-white md:flex lg:p-9">
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/15 blur-2xl" />
          <div className="absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-sky-500/15 blur-2xl" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:20px_20px]" />

          {/* رأس البطاقة البصرية */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium tracking-wide text-cyan-200 backdrop-blur-md">
              <Sparkles size={13} className="text-cyan-300" />
              <span>Smart Medical Platform</span>
            </div>
            <HeartPulse size={20} className="text-cyan-400" />
          </div>

          {/* كتلة البراند بالإنجليزية والمحتوى التوضيحي */}
          <div className="relative z-10 space-y-4">
            <div className="space-y-2">              
              <div dir="ltr" className="text-left">
                <h2 className="text-3xl font-black tracking-tight text-white lg:text-4xl">
                  DocPoint<span className="text-cyan-400">.</span>
                </h2>
                <span className="text-[11px] font-semibold uppercase tracking-widest text-cyan-200/80">
                  Clinic Management System
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-300">
              منظومة إلكترونية متكاملة لإدارة المواعيد، ملفات المرضى، وسجل الزيارات اليومية بكل دقة وأمان.
            </p>

            <div className="space-y-1.5 pt-1 text-[11px] text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>أرشفة سريعة للبيانات والزيارات الطبية</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>إحصائيات فورية للمواعيد والإيرادات</span>
              </div>
            </div>
          </div>

          {/* التذييل البصري */}
          <div className="relative z-10 flex items-center gap-2 text-[11px] text-slate-400">
            <Stethoscope size={14} className="text-cyan-400" />
            <span dir="ltr" className="font-mono text-[10px] tracking-wider text-slate-400">
              DocPoint OS v2.0 • Medical Edition
            </span>
          </div>
        </div>

        {/* جانب النموذج وإدخال البيانات */}
        <div className="flex h-full flex-col justify-between p-5 sm:p-7 md:p-8">
          
          {/* الشعار والهيدر الموحد */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50/80 p-1.5">
                <img src={img} alt="DocPoint" className="h-full w-full object-contain" />
              </div>
              <div>
                <h1 className="flex items-center gap-1.5 text-base font-bold text-slate-900 sm:text-lg">
                  <span>تسجيل الدخول</span>
                  <span className="text-slate-300">|</span>
                  <span dir="ltr" className="font-extrabold tracking-tight text-sky-700">DocPoint</span>
                </h1>
                <p className="text-[11px] font-medium text-slate-500">أدخل بيانات الحساب للوصول إلى اللوحة</p>
              </div>
            </div>
          </div>

          {/* محتوى الحقول */}
          <div className="my-auto w-full max-w-sm self-center">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-semibold text-rose-600"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* اسم المستخدم */}
              <div className="space-y-1 text-right">
                <label className="text-[11px] font-semibold text-slate-600" htmlFor="username">
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pr-9 pl-3 text-xs text-slate-800 transition-all placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 sm:text-sm"
                  />
                  <User size={16} className="absolute right-3 text-slate-400" />
                </div>
              </div>

              {/* كلمة المرور */}
              <div className="space-y-1 text-right">
                <label className="text-[11px] font-semibold text-slate-600" htmlFor="password">
                  كلمة المرور
                </label>
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pr-9 pl-9 text-xs text-slate-800 transition-all placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 sm:text-sm"
                  />
                  <Lock size={16} className="absolute right-3 text-slate-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 text-slate-400 transition-colors hover:text-slate-600"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* تذكرني */}
              <div className="flex items-center gap-2 pt-0.5">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 accent-sky-600 focus:ring-0"
                />
                <label htmlFor="rememberMe" className="select-none text-[11px] font-medium text-slate-500">
                  تذكر بيانات الدخول
                </label>
              </div>

              {/* زر الدخول */}
              <motion.button
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.985 }}
                type="submit"
                disabled={isLoading}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-900 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-950/15 transition-all hover:brightness-110 disabled:opacity-70 sm:py-3 sm:text-sm"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>دخول لوحة التحكم</span>
                    <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
                  </>
                )}
              </motion.button>
            </form>
          </div>

          {/* التذييل */}
          <div className="flex flex-col items-center gap-1 border-t border-slate-100 pt-2.5 text-center text-[10px] text-slate-400">
            <div className="flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>اتصال مشفر وآمن بالكامل</span>
            </div>
            <div className="flex items-center gap-1">
              <Code size={11} className="text-sky-500" />
              <span>تم التطوير بواسطة</span>
              <a
                href="https://m7mdmstfa4422.github.io/MoMustafa/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sky-600 hover:underline"
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