import { useContext, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  User, 
  Calendar, 
  Phone, 
  Globe2, 
  Building2, 
  FileText, 
  Wallet, 
  Clock, 
  Edit3, 
  Check, 
  Loader2, 
  Stethoscope,
  ChevronDown
} from 'lucide-react';
import { api } from '../../api';
import { AuthContext } from '../../AuthProvider';

export default function PatientProfile() {
  const { id } = useParams();
  const { admin } = useContext(AuthContext);

  const [data, setData] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await api(`/patients/${id}`);
      setData(res);
    } catch (error) {
      setMessage(error.message || 'تعذر تحميل ملف المريض');
    }
  }, [id]);

  useEffect(() => {
    load();
    api('/clinics').then((res) => setClinics(Array.isArray(res) ? res : []));
  }, [load]);

  if (!data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3" dir="rtl">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
        <p className="text-sm font-medium text-slate-500">{message || 'جارٍ تحميل ملف المريض...'}</p>
      </div>
    );
  }

  const { patient, visits = [] } = data;
  const totalPaid = visits
    .filter((v) => v.status === 'مكتمل' || !v.status)
    .reduce((sum, v) => sum + Number(v.amount || 0), 0);

  const addVisit = async (event) => {
    event.preventDefault();
    setLoadingAction(true);
    const form = new FormData(event.currentTarget);

    try {
      await api(`/patients/${id}/visits`, {
        method: 'POST',
        body: JSON.stringify({
          title: form.get('title'),
          notes: form.get('notes'),
          amount: Number(form.get('amount')),
          clinic: form.get('clinic'),
          status: 'مكتمل',
        }),
      });
      setShowForm(false);
      load();
    } catch (error) {
      setMessage(error.message || 'تعذر تسجيل الزيارة');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateNotes = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    const medicalNotes = new FormData(e.currentTarget).get('medicalNotes');
    try {
      await api(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ medicalNotes }),
      });
      setEditingNotes(false);
      load();
    } catch (error) {
      setMessage(error.message || 'تعذر تحديث الملاحظات');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 text-slate-800 md:p-8" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Patient Header Profile */}
        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white p-6 shadow-sm md:p-8"
        >
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl"
          />
          <motion.div 
            animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.45, 0.2] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-200/40 blur-3xl"
          />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700">
                <User className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 md:text-3xl">
                    {patient.fullName}
                  </h1>
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-0.5 text-xs font-bold text-sky-800">
                    ملف طبي رقمي
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 md:text-sm">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-sky-600" />
                    {patient.age} سنة
                  </span>
                  {patient.birthDate && <span className="flex items-center gap-1.5 font-medium"><Calendar className="h-3.5 w-3.5 text-sky-600" />تاريخ الميلاد: {new Date(patient.birthDate).toLocaleDateString('ar-EG')}</span>}
                  <span className="flex items-center gap-1.5 font-medium" dir="ltr">
                    <Phone className="h-3.5 w-3.5 text-sky-600" />
                    {patient.phone || 'بدون هاتف'}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Globe2 className="h-3.5 w-3.5 text-sky-600" />
                    {patient.nationality || 'غير محددة'}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Building2 className="h-3.5 w-3.5 text-sky-600" />
                    {patient.clinic?.name || 'غير محددة'}
                  </span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-3 font-bold text-white shadow-md shadow-sky-900/15 transition-all hover:brightness-105"
            >
              <Plus className="h-4 w-4" />
              <span>{showForm ? 'إغلاق النموذج' : 'إضافة زيارة جديدة'}</span>
            </motion.button>
          </div>
        </motion.header>

        {/* Add Visit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={addVisit}
              className="overflow-hidden rounded-3xl border border-sky-100 bg-white p-6 shadow-sm md:p-8"
            >
              <div className="mb-5 flex items-center gap-2.5 font-bold text-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-sky-700">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <span>تسجيل بيانات الزيارة أو الإجراء الطبي</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">عنوان الزيارة / الخدمة</label>
                  <input
                    required
                    name="title"
                    placeholder="مثال: كشف باطنة / متابعة دورية"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-800 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">المبلغ المدفوع (ج)</label>
                  <input
                    required
                    name="amount"
                    type="number"
                    min="0"
                    placeholder="0"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-800 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">الفرع / العيادة</label>
                  <div className="relative">
                    <select
                      required
                      name="clinic"
                      defaultValue={patient.clinic?._id || ''}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/60 p-3 pr-4 pl-10 text-sm text-slate-800 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    >
                      {clinics.map((clinic) => (
                        <option key={clinic._id} value={clinic._id}>
                          {clinic.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">ملاحظات الزيارة أو التشخيص</label>
                  <input
                    name="notes"
                    placeholder="تفاصيل الفحص، الدواء، أو التوصيات..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-800 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div className="pt-2 md:col-span-2">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loadingAction}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:brightness-105"
                  >
                    {loadingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    <span>حفظ واعتماد الزيارة</span>
                  </motion.button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Sidebar */}
          <aside className="space-y-6">
            
            {/* Visits & Financial Summary */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-800">
                <Wallet className="h-4 w-4 text-sky-600" />
                <span>ملخص الحسابات والزيارات</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-center">
                  <span className="block text-xs font-semibold text-slate-400">عدد الزيارات</span>
                  <b className="mt-1 block text-2xl font-black text-slate-900">{visits.length}</b>
                </div>
                <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 text-center">
                  <span className="block text-xs font-semibold text-sky-700">إجمالي المدفوع</span>
                  <b className="mt-1 block text-2xl font-black text-sky-900">
                    {totalPaid.toLocaleString('ar-EG')} ج
                  </b>
                </div>
              </div>
            </motion.div>

            {/* Medical Notes */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-800">
                  <FileText className="h-4 w-4 text-sky-600" />
                  <span>الملاحظات الطبية العامة</span>
                </div>
                {!editingNotes && admin?.username === 'drahmed' && (
                  <button
                    onClick={() => setEditingNotes(true)}
                    className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>تعديل</span>
                  </button>
                )}
              </div>

              {editingNotes ? (
                <form onSubmit={handleUpdateNotes} className="space-y-3">
                  <textarea
                    name="medicalNotes"
                    defaultValue={patient.medicalNotes || ''}
                    placeholder="اكتب الملاحظات الطبية، الحساسية، الأمراض المزمنة..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-800 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loadingAction}
                      className="flex-1 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 py-2.5 text-xs font-bold text-white shadow-sm hover:brightness-105"
                    >
                      {loadingAction ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : 'حفظ التعديل'}
                    </motion.button>
                    <button
                      type="button"
                      onClick={() => setEditingNotes(false)}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm leading-relaxed text-slate-600">
                  {patient.medicalNotes || 'لا توجد ملاحظات طبية عامة مسجلة في ملف المريض حتى الآن.'}
                </p>
              )}
            </motion.div>
          </aside>

          {/* Visits Timeline History */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm lg:col-span-2"
          >
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Clock className="h-5 w-5 text-sky-700" />
                <span>السجل الطبي وتاريخ الزيارات ({visits.length})</span>
              </div>
            </div>

            {visits.length ? (
              <div className="max-h-[620px] overflow-y-auto pl-2 pr-1 [scrollbar-color:#7dd3fc_transparent] [scrollbar-width:thin]">
              <div className="relative space-y-6 border-r-2 border-sky-100 pr-6 mr-3">
                {visits.map((visit) => (
                  <motion.div
                    key={visit._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative rounded-2xl border border-slate-100 bg-[#F8FAFC]/70 p-5 transition-all hover:border-sky-200 hover:bg-white hover:shadow-sm"
                  >
                    {/* Node Dot on Timeline */}
                    <div className="absolute -right-[31px] top-6 h-3.5 w-3.5 rounded-full border-2 border-white bg-sky-600 shadow-sm" />

                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{visit.title}</h4>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-sky-600" />
                            {new Date(visit.visitDate || visit.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                          {visit.clinic?.name && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-sky-600" />
                              {visit.clinic.name}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="inline-flex self-start rounded-xl border border-sky-100 bg-sky-50 px-3 py-1 text-sm font-black text-sky-900">
                        {Number(visit.amount || 0).toLocaleString('ar-EG')} ج
                      </span>
                    </div>

                    {visit.notes && (
                      <div className="mt-3 rounded-xl border border-slate-100 bg-white p-3 text-xs leading-relaxed text-slate-600">
                        {visit.notes}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-slate-400">
                <FileText className="mx-auto mb-2 h-8 w-8 opacity-30" />
                <p>لا توجد زيارات مسجلة للمريض حتى الآن.</p>
              </div>
            )}
          </motion.section>

        </div>

        {message && (
          <p className="rounded-2xl bg-rose-50 p-4 text-center text-xs font-semibold text-rose-500 border border-rose-100">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
