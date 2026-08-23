import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  KeyRound,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  Lock,
  ArrowLeft,
  Code2
} from 'lucide-react';
import { api } from '../../api';
import { SubscriptionContext } from '../../SubscriptionProvider';

export default function SubscriptionRenewal() {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { refresh } = useContext(SubscriptionContext);

  const renew = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const data = await api('/subscription/renew', {
        method: 'POST',
        body: JSON.stringify({ code: code.trim() })
      });
      setResult(data);
      if (refresh) await refresh();
    } catch (error) {
      setResult({ error: error.message || 'كود التفعيل غير صالح، يرجى التأكد والمحاولة مجدداً.' });
    } finally {
      setLoading(false);
    }
  };

  const copyNextCode = () => {
    if (!result?.nextCode) return;
    navigator.clipboard.writeText(result.nextCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-white p-4 text-slate-800 antialiased" dir="rtl">

      {/* هالات خلفية ناعمة */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-sky-100/75 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-cyan-100/65 blur-3xl"
      />

      {/* بطاقة تجديد الاشتراك */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 my-8 w-full max-w-md rounded-[2.5rem] border border-sky-100 bg-white/95 p-7 shadow-2xl shadow-sky-950/5 backdrop-blur-xl sm:p-9"
      >

        {/* الترويسة والأيقونة */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.05 }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white shadow-lg shadow-amber-500/20"
            >
              <KeyRound size={28} className="stroke-[2.2]" />
            </motion.div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-[9px] text-white">
              !
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800">
            <Sparkles size={12} className="text-amber-600" />
            صلاحية النظام السحابي
          </div>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            انتهى اشتراك المنظومة
          </h1>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            يرجى إدخال مفتاح الترخيص المعتمد لتمديد الخدمة وتفعيل الوصول لمدة ستة أشهر.
          </p>
        </div>

        {/* رسالة الخطأ */}
        {result?.error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/90 p-3 text-xs font-semibold text-rose-600"
          >
            <AlertCircle size={16} className="shrink-0" />
            <span>{result.error}</span>
          </motion.div>
        )}

        {/* نموذج إدخال الكود */}
        <form onSubmit={renew} className="space-y-4">
          <div className="space-y-1.5 text-right">
            <label className="text-xs font-semibold text-slate-700">
              مفتاح الترخيص (License Key)
            </label>
            <div className="relative flex items-center">
              <input
                autoFocus
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CLINIC-YYYY-XXXXXX"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pr-10 pl-4 text-center font-mono text-xs font-bold tracking-widest text-slate-800 transition-all placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 focus:border-sky-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-sky-100"
              />
              <Lock size={17} className="absolute right-3.5 text-slate-400" />
            </div>
          </div>

          {/* زر التجديد */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading || !code.trim()}
            className="group relative mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-sky-600 via-sky-700 to-indigo-900 py-3.5 text-xs font-bold text-white shadow-lg shadow-sky-900/15 transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin text-white" />
            ) : (
              <>
                <span>تجديد وتفعيل الاشتراك</span>
                <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
              </>
            )}
          </motion.button>
        </form>

        {/* بطاقة نجاح التجديد والكود القادم */}
        <AnimatePresence>
          {result?.nextCode && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-right"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>تم تجديد الاشتراك السنوي بنجاح!</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">
                احتفظ بمفتاح التجديد للدورة القادمة في مكان آمن:
              </p>

              <div className="mt-2.5 flex items-center justify-between rounded-xl border border-emerald-200 bg-white p-2.5 shadow-2xs">
                <code className="font-mono text-xs font-bold tracking-wider text-emerald-950">
                  {result.nextCode}
                </code>
                <button
                  type="button"
                  onClick={copyNextCode}
                  className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 transition-colors hover:bg-emerald-100"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* فوتر الأمان ومطور النظام */}
        <div className="mt-6 flex flex-col items-center gap-2 border-t border-slate-100 pt-3.5 text-center text-[10px] font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>نظام الحماية السحابي الموحد 256-bit</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Code2 size={13} className="text-sky-600" />
            <span>تم التطوير بواسطة</span>
            <a
              href="https://m7mdmstfa4422.github.io/MoMustafa/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-700 transition-colors hover:text-sky-600 hover:underline"
            >
              م/ محمد مصطفى
            </a>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
