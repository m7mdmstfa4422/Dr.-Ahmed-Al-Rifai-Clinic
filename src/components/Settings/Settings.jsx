import { useEffect, useState, useCallback, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  ShieldCheck, 
  Plus, 
  MapPin, 
  Stethoscope, 
  Phone, 
  UserPlus, 
  Sparkles, 
  Check, 
  AlertCircle, 
  X, 
  Pencil,
  Loader2
} from 'lucide-react';
import { api } from '../../api';
import { AuthContext } from '../../AuthProvider';

// Custom Toast Hook بنظام أنيمشن مدمج
function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const ToastContainer = () => (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-sky-100 bg-white/95 px-5 py-3.5 text-slate-800 shadow-xl shadow-slate-200/60 backdrop-blur-xl"
          >
            {toast.type === 'success' ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-50 text-sky-600 border border-sky-200">
                <Check className="h-3.5 w-3.5" />
              </span>
            ) : (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 text-rose-500 border border-rose-200">
                <AlertCircle className="h-3.5 w-3.5" />
              </span>
            )}
            <p className="text-xs font-semibold text-slate-700">{toast.msg}</p>
            <button
              onClick={() => setToast(null)}
              className="mr-2 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return { showToast, ToastContainer };
}

export default function Settings() {
  const { admin: currentAdmin } = useContext(AuthContext);
  const [clinics, setClinics] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const { showToast, ToastContainer } = useToast();

  const loadClinics = useCallback(async () => {
    try {
      const data = await api('/clinics');
      setClinics(data);
    } catch (err) {
      showToast(err.message || 'فشل جلب العيادات', 'error');
    }
  }, [showToast]);

  const loadAdmins = useCallback(async () => {
    try {
      const data = await api('/admins');
      setAdmins(data.filter((admin) => currentAdmin?.role === 'developer' || (admin.role !== 'developer' && admin.username !== 'developer')));
    } catch (err) {
      showToast(err.message || 'فشل جلب المشرفين', 'error');
    }
  }, [showToast, currentAdmin?.role]);

  useEffect(() => {
    loadClinics();
    loadAdmins();
  }, [loadClinics, loadAdmins]);

  const handleAddClinic = async (e) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await api('/clinics', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(form))
      });
      e.target.reset();
      showToast('تم تسجيل الفرع بنجاح');
      loadClinics();
    } catch (err) {
      showToast(err.message || 'تعذر إضافة العيادة', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await api('/admins', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(form))
      });
      e.target.reset();
      showToast('تم إنشاء حساب المشرف بنجاح');
      loadAdmins();
    } catch (err) {
      showToast(err.message || 'تعذر إنشاء الحساب', 'error');
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;
    try {
      await api(`/admins/${editingAdmin._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editingAdmin.name,
          username: editingAdmin.username,
          ...(editingAdmin.password ? { password: editingAdmin.password } : {})
        })
      });
      showToast('تم تحديث بيانات المشرف');
      setEditingAdmin(null);
      loadAdmins();
    } catch (err) {
      showToast(err.message || 'فشل حفظ التعديلات', 'error');
    }
  };

  const handleDeleteAdmin = async (admin) => {
    if (admin.username === 'drahmed' || !window.confirm(`هل تريد حذف حساب ${admin.name}؟`)) return;
    try { await api(`/admins/${admin._id}`, { method: 'DELETE' }); showToast('تم حذف حساب المشرف.'); loadAdmins(); }
    catch (err) { showToast(err.message || 'تعذر حذف الحساب', 'error'); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 text-slate-800 md:p-10" dir="rtl">
      <ToastContainer />

      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
       <motion.header
  initial={{ opacity: 0, y: -15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-800 p-6 text-white shadow-xl shadow-sky-900/15 md:p-8"
>
  {/* إضاءات الخلفية التدرجية */}
  <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

  <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-cyan-200 backdrop-blur-md">
        <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
        <span>النظام الطبي الذكي</span>
      </div>

      <h1 className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
        إدارة المراكز والعيادات والصلاحيات
      </h1>

      <p className="mt-1.5 max-w-xl text-xs text-sky-100/90 md:text-sm">
        لوحة التحكم المركزية بالصلاحيات الطبية والسحابية
      </p>
    </div>
  </div>
</motion.header>

        {/* Add Clinic Section */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-2.5 font-bold text-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
              <Plus className="h-4 w-4" />
            </div>
            <span>إضافة منشأة أو فرع طبي جديد</span>
          </div>

          <form onSubmit={handleAddClinic} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Building2 className="absolute right-3.5 top-3.5 h-4 w-4 text-sky-700/50" />
              <input
                required
                name="name"
                placeholder="اسم العيادة"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pr-10 pl-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute right-3.5 top-3.5 h-4 w-4 text-sky-700/50" />
              <input
                required
                name="location"
                placeholder="الموقع الجغرافي / الفرع"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pr-10 pl-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div className="relative">
              <Stethoscope className="absolute right-3.5 top-3.5 h-4 w-4 text-sky-700/50" />
              <input
                name="specialty"
                placeholder="التخصص الطبي"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pr-10 pl-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div className="relative">
              <Phone className="absolute right-3.5 top-3.5 h-4 w-4 text-sky-700/50" />
              <input
                name="phone"
                placeholder="رقم التواصل"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 py-3 pr-10 pl-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 from-sky-600 to-cyan-400 py-3.5 font-bold text-white shadow-md shadow-blue-900/15 transition-all hover:brightness-105 md:col-span-2 lg:col-span-4"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <>
                  <span>تأكيد وحفظ الفرع</span>
                  <Plus className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>
        </motion.section>

        {/* Clinics Grid */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              الفروع والمراكز المسجلة ({clinics.length})
            </h3>
          </div>
          <motion.div 
            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
          >
            {clinics.map((clinic) => (
              <motion.div
                key={clinic._id}
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:border-sky-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                      <Building2 className="h-5 w-5" />
                    </div>
                    {clinic.specialty && (
                      <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                        {clinic.specialty}
                      </span>
                    )}
                  </div>
                  <h4 className="mt-4 text-lg font-bold text-slate-900">{clinic.name}</h4>
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-sky-700" />
                      <span>{clinic.location}</span>
                    </p>
                    {clinic.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-sky-700" />
                        <span>{clinic.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Admins Management */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">إدارة حسابات المشرفين</h3>
              <p className="text-xs text-slate-400">التحكم في وصول المستخدمين للوحة الإدارة</p>
            </div>
          </div>

          <form onSubmit={handleAddAdmin} className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
            <input
              required
              name="name"
              placeholder="اسم المشرف"
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
            <input
              required
              name="username"
              placeholder="اسم المستخدم"
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
            <input
              required
              name="password"
              type="password"
              placeholder="كلمة المرور"
              className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:brightness-105"
            >
              <UserPlus className="h-4 w-4" />
              <span>إضافة مشرف</span>
            </motion.button>
          </form>

          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/40">
            {admins.map((admin) => (
              <div key={admin._id} className="flex items-center justify-between p-4 transition-colors hover:bg-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 font-bold text-sky-800">
                    {admin.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{admin.name}</div>
                    <div className="text-xs text-slate-400">@{admin.username}</div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEditingAdmin({ ...admin, password: '' })}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-sky-600 hover:text-sky-700"
                >
                  <Pencil className="h-3 w-3" />
                  <span>تعديل</span>
                </motion.button>
                {admin.username !== 'drahmed' && <button onClick={() => handleDeleteAdmin(admin)} className="mr-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-100">حذف</button>}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Edit Modal */}
        <AnimatePresence>
          {editingAdmin && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingAdmin(null)}
                className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h4 className="font-bold text-slate-900">تعديل بيانات الحساب</h4>
                  <button 
                    onClick={() => setEditingAdmin(null)} 
                    className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <form onSubmit={handleUpdateAdmin} className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">الاسم</label>
                    <input
                      value={editingAdmin.name}
                      onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 outline-none transition-all focus:border-sky-600 focus:bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">اسم المستخدم</label>
                    <input
                      value={editingAdmin.username}
                      onChange={(e) => setEditingAdmin({ ...editingAdmin, username: e.target.value })}
                      disabled={editingAdmin.username === 'drahmed'}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 outline-none transition-all focus:border-sky-600 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">كلمة مرور جديدة (اختياري)</label>
                    <input
                      type="password"
                      value={editingAdmin.password || ''}
                      onChange={(e) => setEditingAdmin({ ...editingAdmin, password: e.target.value })}
                      placeholder="••••••••"
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm text-slate-800 outline-none transition-all focus:border-sky-600 focus:bg-white"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      className="flex-1 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-400 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:brightness-105"
                    >
                      حفظ التعديلات
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => setEditingAdmin(null)}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
