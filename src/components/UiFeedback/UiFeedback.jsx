import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, AlertCircle, Loader2, X } from 'lucide-react';

export default function UiFeedback({ children }) {
  const [pending, setPending] = useState(0);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    const start = () => setPending((value) => value + 1);
    const end = () => setPending((value) => Math.max(0, value - 1));
    const result = (event) => {
      const { type, message } = event.detail;
      setNotice({ type, message, id: Date.now() });
      setTimeout(() => setNotice(null), 3500);
    };

    window.addEventListener('clinic:request-start', start);
    window.addEventListener('clinic:request-end', end);
    window.addEventListener('clinic:notice', result);

    return () => {
      window.removeEventListener('clinic:request-start', start);
      window.removeEventListener('clinic:request-end', end);
      window.removeEventListener('clinic:notice', result);
    };
  }, []);

  return (
    <>
      {children}

      {/* Global Request Loader */}
      <AnimatePresence>
        {pending > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/20 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden flex flex-col items-center gap-3.5 rounded-3xl border border-sky-100 bg-white/95 px-8 py-7 shadow-xl shadow-sky-950/5 backdrop-blur-xl"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-900">جارٍ تنفيذ العملية...</p>
                <p className="mt-0.5 text-xs text-slate-400">يرجى الانتظار لحظات</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <div className="fixed bottom-6 left-6 z-[110] pointer-events-none" dir="rtl">
        <AnimatePresence>
          {notice && (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="pointer-events-auto flex max-w-sm items-center gap-3.5 rounded-2xl border border-sky-100 bg-white/95 px-5 py-4 text-slate-800 shadow-xl shadow-slate-200/60 backdrop-blur-xl"
            >
              {notice.type === 'success' ? (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                  <Check className="h-4 w-4" />
                </span>
              ) : (
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-500">
                  <AlertCircle className="h-4 w-4" />
                </span>
              )}
              <p className="text-xs font-bold leading-relaxed text-slate-800">{notice.message}</p>
              <button
                onClick={() => setNotice(null)}
                className="mr-auto rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
