import { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Building2, 
  User, 
  Check, 
  Sparkles, 
  Save, 
  Loader2, 
  Terminal, 
  Lock, 
  AlertCircle,
  Users,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../api';
import { SystemContext } from '../../SystemProvider';

const permissions = [
  ['patients', 'المرضى والملفات'],
  ['appointments', 'المواعيد والانتظار'],
  ['reports', 'التقارير والإحصائيات'],
  ['finance', 'الحسابات والخزينة'],
  ['settings', 'إعدادات النظام'],
  ['medicalNotes', 'تعديل الملاحظات الطبية'],
];

export default function DeveloperControl() {
  const [admins, setAdmins] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [togglingKey, setTogglingKey] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  const { clinicName, refresh } = useContext(SystemContext);

  const showNotification = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const load = async () => {
    try {
      setLoading(true);
      const data = await api('/admins');
      setAdmins(Array.isArray(data) ? data : []);
    } catch (e) {
      showNotification(e.message || 'تعذر تحميل قائمة الحسابات', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setName(clinicName || 'DocPoint');
    load();
  }, [clinicName]);

  const saveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSavingName(true);
      await api('/developer/system', {
        method: 'PUT',
        body: JSON.stringify({ clinicName: name.trim() }),
      });
      await refresh();
      showNotification('تم تحديث هوية واسم العيادة في النظام بنجاح');
    } catch (error) {
      showNotification(error.message || 'فشل تحديث الاسم', 'error');
    } finally {
      setSavingName(false);
    }
  };

  const toggle = async (admin, permission) => {
    const current = admin.permissions || [];
    const next = current.includes(permission)
      ? current.filter((x) => x !== permission)
      : [...current, permission];

    const actionId = `${admin._id}-${permission}`;
    setTogglingKey(actionId);

    try {
      await api(`/developer/admins/${admin._id}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions: next }),
      });

      setAdmins((prev) =>
        prev.map((a) => (a._id === admin._id ? { ...a, permissions: next } : a))
      );
      showNotification(`تم تعديل صلاحيات الحساب (@${admin.username})`);
    } catch (error) {
      showNotification(error.message || 'تعذر تحديث الصلاحية', 'error');
    } finally {
      setTogglingKey(null);
    }
  };

  const staffAdmins = admins.filter((a) => a.role !== 'developer');

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] p-4 md:p-8 text-slate-800" dir="rtl">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-7 text-white shadow-xl md:p-9"
        >
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-500/10 px-3.5 py-1 text-xs font-bold text-sky-300">
                <Terminal size={14} />
                <span>Developer Engine & Control Panel</span>
              </div>
              <h1 className="text-2xl font-black md:text-3xl">لوحة تحكم وإدارة المطوّر</h1>
              <p className="text-xs text-slate-400 md:text-sm">
                ضبط هوية المنظومة، تخصيص اسم العيادة، ومزامنة مصفوفة أذونات وصلاحيات الطاقم الطبي.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 text-xs font-semibold text-slate-300">
                <Users size={16} className="text-sky-400" />
                <span>{staffAdmins.length} حسابات نشطة</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* System Branding Card */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8"
        >
          <div className="mb-4 flex items-center gap-2.5 text-slate-900 font-bold">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold">هوية النظام واسم العيادة</h2>
              <p className="text-xs text-slate-400">الاسم الظاهر في الترويسات والتقارير والملفات الطبية</p>
            </div>
          </div>

          <form onSubmit={saveName} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسم العيادة أو المركز الطبي..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3.5 text-sm font-bold text-slate-800 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-4 focus:ring-sky-100"
              />
            </div>

            <button
              type="submit"
              disabled={savingName || !name.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-7 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-900/10 transition-all hover:brightness-105 disabled:opacity-60"
            >
              {savingName ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>حفظ التعديل</span>
            </button>
          </form>
        </motion.section>

        {/* Roles & Permissions Matrix */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-6 md:p-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">مصفوفة صلاحيات الحسابات</h2>
                <p className="text-xs text-slate-400">تفعيل أو تعطيل الوصول لأقسام العيادة بنقرة واحدة</p>
              </div>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {staffAdmins.length} مستخدمين
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
              <p className="text-xs text-slate-400">جارٍ قراءة الحسابات والصلاحيات...</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {staffAdmins.length ? (
                staffAdmins.map((admin) => (
                  <div key={admin._id} className="p-6 transition-colors hover:bg-slate-50/50 md:p-7">
                    <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 font-bold border border-sky-100">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <b className="text-sm font-black text-slate-900">{admin.name || admin.username}</b>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                              {admin.role === 'admin' ? 'مدير' : 'موظف / استقبال'}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-slate-400" dir="ltr">
                            @{admin.username}
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] font-bold text-slate-400">
                        {admin.permissions?.length || 0} من {permissions.length} صلاحيات مفعّلة
                      </span>
                    </div>

                    {/* Permissions Badges */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {permissions.map(([key, label]) => {
                        const isGranted = admin.permissions?.includes(key);
                        const isProcessing = togglingKey === `${admin._id}-${key}`;

                        return (
                          <motion.button
                            key={key}
                            whileTap={{ scale: 0.96 }}
                            disabled={isProcessing}
                            onClick={() => toggle(admin, key)}
                            className={`group inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${
                              isGranted
                                ? 'border-sky-300 bg-sky-50/80 text-sky-800 shadow-sm shadow-sky-500/5 hover:bg-sky-100 hover:border-sky-400'
                                : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600'
                            }`}
                          >
                            {isProcessing ? (
                              <Loader2 size={13} className="animate-spin text-sky-600" />
                            ) : isGranted ? (
                              <Check size={13} className="text-sky-600 stroke-[2.5]" />
                            ) : (
                              <Lock size={12} className="opacity-40" />
                            )}
                            <span>{label}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-slate-400">
                  <ShieldAlert className="mx-auto mb-2 h-10 w-10 opacity-30" />
                  <p className="text-sm">لا توجد حسابات موظفين مسجلة في الوقت الحالي.</p>
                </div>
              )}
            </div>
          )}
        </motion.section>

        {/* Notification Toast */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl border px-5 py-3.5 text-xs font-bold shadow-xl backdrop-blur-xl ${
                message.type === 'error'
                  ? 'border-rose-200 bg-rose-50/95 text-rose-700'
                  : 'border-sky-200 bg-white/95 text-slate-800'
              }`}
            >
              {message.type === 'error' ? (
                <AlertCircle size={16} className="text-rose-500 shrink-0" />
              ) : (
                <Check size={16} className="text-emerald-500 shrink-0" />
              )}
              <span>{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}