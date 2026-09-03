import { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  ChevronDown,
  Users,
  DoorOpen,
  CalendarDays,
  Activity,
  CheckCircle2,
  FileCheck,
  BookOpen
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
  const [editingPatient, setEditingPatient] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [message, setMessage] = useState('');

  // نافذة تسجيل التشخيص وإنهاء الكشف
  const [showExitModal, setShowExitModal] = useState(false);
  const [doctorExitNotes, setDoctorExitNotes] = useState('');
  const [editingVisitId, setEditingVisitId] = useState(null);
  const [visitNotesDraft, setVisitNotesDraft] = useState('');

  // قائمة الانتظار العامة لليوم
  const [queueDate, setQueueDate] = useState(new Date().toISOString().slice(0, 10));
  const [queueItems, setQueueItems] = useState([]);

  const load = useCallback(async () => {
    try {
      const res = await api(`/patients/${id}`);
      setData(res);
    } catch (error) {
      setMessage(error.message || 'تعذر تحميل ملف المريض');
    }
  }, [id]);

  const loadQueue = useCallback(async () => {
    try {
      const queue = await api(`/appointments?date=${queueDate}`);
      setQueueItems(Array.isArray(queue) ? queue : []);
    } catch (error) {
      console.error('تعذر تحميل قائمة الانتظار:', error);
    }
  }, [queueDate]);

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

  const { patient, visits = [], bookings = [] } = data;
  const canEditPatient = admin?.role === 'developer' || admin?.role === 'admin' || admin?.permissions?.includes('patients');
  const totalPaid = visits
    .filter((v) => v.status === 'مكتمل' || v.status === 'غادر' || !v.status)
    .reduce((sum, v) => sum + Number(v.amount || 0), 0);

  const activeVisit = visits.find(
    (v) => v.status === 'انتظار' || v.status === 'محجوز' || v.status === 'دخل للطبيب'
  );

  const handleUpdateStatus = async (appointmentId, nextStatus, exitNotes = '') => {
    setLoadingAction(true);
    try {
      await api(`/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: nextStatus,
          notes: exitNotes || undefined,
        }),
      });

      setShowExitModal(false);
      setDoctorExitNotes('');
      setMessage(nextStatus === 'غادر' ? 'تم إنهاء الكشف وإضافة الزيارة رسمياً إلى السجل الطبي.' : `تم تغيير الحالة إلى "${nextStatus}"`);

      await load();
      if (showQueue) loadQueue();
    } catch (error) {
      setMessage(error.message || 'تعذر تحديث الحالة');
    } finally {
      setLoadingAction(false);
    }
  };

  const addVisit = async (event) => {
    event.preventDefault();
    setLoadingAction(true);
    const form = new FormData(event.currentTarget);
    const visitDate = form.get('date') || new Date().toISOString().slice(0, 10);
    const visitTime = form.get('time') || new Date().toTimeString().slice(0, 5);
    const clinicId = form.get('clinic');
    const payload = {
      title: form.get('title') || 'كشف عيادة',
      notes: form.get('notes') || '',
      amount: Number(form.get('amount') || 0),
      clinic: clinicId,
      patient: id,
      scheduledAt: new Date(`${visitDate}T${visitTime}`).toISOString(),
      status: 'انتظار',
    };

    try {
      const created = await api('/appointments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setShowForm(false);
      setMessage(`تم حفظ الحجز في قاعدة البيانات. رقم الدور: #${created.queueNumber || '—'} — استكمل بيانات الكشف عند حضور المريض من صفحة المواعيد.`);
      await load();
      if (showQueue) loadQueue();
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

  const handleUpdatePatient = async (event) => {
    event.preventDefault();
    setLoadingAction(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      await api(`/patients/${id}/details`, { method: 'PUT', body: JSON.stringify(payload) });
      setEditingPatient(false);
      setMessage('تم تحديث بيانات المريض وحفظها في قاعدة البيانات.');
      await load();
    } catch (error) {
      setMessage(error.message || 'تعذر حفظ بيانات المريض.');
    } finally {
      setLoadingAction(false);
    }
  };

  const saveVisitNotes = async (visitId) => {
    setLoadingAction(true);
    try {
      await api(`/visits/${visitId}`, { method: 'PUT', body: JSON.stringify({ notes: visitNotesDraft }) });
      setEditingVisitId(null);
      setMessage('تم حفظ ملاحظة الزيارة في قاعدة البيانات.');
      await load();
    } catch (error) {
      setMessage(error.message || 'تعذر حفظ ملاحظة الزيارة');
    } finally { setLoadingAction(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 text-slate-800 md:p-8" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* هيدر ملف المريض مع أزرار الربط العام */}
     <motion.header
  initial={{ opacity: 0, y: -15 }}
  animate={{ opacity: 1, y: 0 }}
  className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-800 p-6 text-white shadow-xl shadow-sky-900/15 md:p-8"
>
  {/* إضاءات ناعمة بالخلفية */}
  <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

  <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
    <div className="flex items-start gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-cyan-100 backdrop-blur-md">
        <User className="h-7 w-7" />
      </div>

      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-black text-white md:text-3xl">
            {patient.fullName}
          </h1>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-xs font-bold text-cyan-100 backdrop-blur-md">
            ملف طبي رقمي
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sky-100/80 md:text-sm">
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="h-3.5 w-3.5 text-cyan-100" />
            {patient.age} سنة
          </span>

          {patient.birthDate && (
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="h-3.5 w-3.5 text-cyan-100" />
              تاريخ الميلاد: {new Date(patient.birthDate).toLocaleDateString('ar-EG')}
            </span>
          )}

          <span className="flex items-center gap-1.5 font-medium" dir="ltr">
            <Phone className="h-3.5 w-3.5 text-cyan-100" />
            {patient.phone || 'بدون هاتف'}
          </span>

          <span className="flex items-center gap-1.5 font-medium">
            <Globe2 className="h-3.5 w-3.5 text-cyan-100" />
            {patient.nationality || 'غير محددة'}
          </span>

          <span className="flex items-center gap-1.5 font-medium">
            <Building2 className="h-3.5 w-3.5 text-cyan-100" />
            {patient.clinic?.name || 'غير محددة'}
          </span>
        </div>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2.5">
      {canEditPatient && (
        <button
          type="button"
          onClick={() => setEditingPatient((value) => !value)}
          className="inline-flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-xs font-bold text-white backdrop-blur-md transition hover:border-white/30 hover:bg-white/20"
        >
          <Edit3 size={16} className="text-cyan-100" />
          <span>{editingPatient ? 'إغلاق التعديل' : 'تعديل البيانات'}</span>
        </button>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowForm(!showForm)}
        className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-400 px-5 py-3 text-xs font-black text-white shadow-lg shadow-sky-950/30 transition hover:brightness-105"
      >
        <Plus size={16} />
        <span>{showForm ? 'إلغاء الحجز' : 'حجز حالة جديدة'}</span>
      </motion.button>
    </div>
  </div>
</motion.header>

        <AnimatePresence>
          {editingPatient && canEditPatient && (
            <motion.form
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              onSubmit={handleUpdatePatient}
              className="overflow-hidden rounded-3xl border border-sky-200 bg-white p-5 shadow-sm md:p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="font-black text-slate-900">تعديل بيانات المريض</h2><p className="mt-1 text-xs text-slate-500">سيتم حفظ التغييرات مباشرة في قاعدة البيانات.</p></div><button type="button" onClick={() => setEditingPatient(false)} className="text-xs font-bold text-slate-500 hover:text-slate-900">إلغاء</button></div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <label className="text-xs font-bold text-slate-600">الاسم الكامل<input required name="fullName" defaultValue={patient.fullName} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-sky-500 focus:bg-white" /></label>
                <label className="text-xs font-bold text-slate-600">رقم الهاتف<input required name="phone" defaultValue={patient.phone} dir="ltr" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-sky-500 focus:bg-white" /></label>
                <label className="text-xs font-bold text-slate-600">الرقم القومي<input name="nationalId" defaultValue={patient.nationalId || ''} dir="ltr" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-sky-500 focus:bg-white" /></label>
                <label className="text-xs font-bold text-slate-600">العمر<input required min="0" max="150" type="number" name="age" defaultValue={patient.age} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-sky-500 focus:bg-white" /></label>
                <label className="text-xs font-bold text-slate-600">النوع<select required name="gender" defaultValue={patient.gender} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-sky-500 focus:bg-white"><option value="ذكر">ذكر</option><option value="أنثى">أنثى</option></select></label>
                <label className="text-xs font-bold text-slate-600">الجنسية<input required name="nationality" defaultValue={patient.nationality} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-sky-500 focus:bg-white" /></label>
                <label className="text-xs font-bold text-slate-600">العيادة<select name="clinic" defaultValue={patient.clinic?._id || ''} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-sky-500 focus:bg-white"><option value="">بدون عيادة محددة</option>{clinics.map((clinic) => <option key={clinic._id} value={clinic._id}>{clinic.name}</option>)}</select></label>
              </div>
              <button disabled={loadingAction} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"><Check size={16} />{loadingAction ? 'جارٍ الحفظ…' : 'حفظ بيانات المريض'}</button>
            </motion.form>
          )}
        </AnimatePresence>

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"><span className="text-xs font-bold text-slate-400">رقم الملف</span><b className="mt-1 block truncate text-sm text-slate-900" dir="ltr">{patient.nationalId || `#${patient._id.slice(-6)}`}</b></div>
          <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"><span className="text-xs font-bold text-slate-400">النوع</span><b className="mt-1 block text-sm text-slate-900">{patient.gender || 'غير مسجل'}</b></div>
          <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"><span className="text-xs font-bold text-slate-400">الزيارات المكتملة</span><b className="mt-1 block text-sm text-emerald-700">{visits.filter((visit) => visit.status === 'مكتمل').length} زيارة</b></div>
          <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm"><span className="text-xs font-bold text-slate-400">آخر تحديث</span><b className="mt-1 block text-sm text-slate-900">{new Date(patient.updatedAt || patient.createdAt).toLocaleDateString('ar-EG')}</b></div>
        </section>

        {bookings.length > 0 && (
          <section className="rounded-3xl border border-violet-200 bg-violet-50/60 p-5">
            <h2 className="mb-3 text-sm font-black text-violet-900">حجوزات مسبقة محفوظة ({bookings.length})</h2>
            <div className="flex flex-wrap gap-3">{bookings.map((booking) => <div key={booking._id} className="rounded-2xl border border-violet-100 bg-white px-4 py-3 text-xs text-slate-700"><b className="text-violet-800">رقم الدور #{booking.queueNumber || '—'}</b><span className="mx-2">·</span>{booking.clinic?.name || 'العيادة'}<span className="mx-2">·</span>{new Date(booking.scheduledAt).toLocaleDateString('ar-EG')}</div>)}</div>
          </section>
        )}

        {/* بطاقة متابعة حالة المريض المتواجد بالعيادة */}
        {activeVisit && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-amber-200 bg-amber-50/80 p-5 sm:flex-row sm:items-center"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-sm">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-900">
                  المريض متواجد الآن: {activeVisit.status === 'دخل للطبيب' ? 'داخل غرفة الكشف' : 'في صالة الانتظار'}
                </h4>
                <p className="text-xs text-amber-700">
                  الزيارة: {activeVisit.title || 'كشف'} · {new Date(activeVisit.scheduledAt || activeVisit.date || activeVisit.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">


              {activeVisit.status === 'دخل للطبيب' && (
                <button
                  disabled={loadingAction}
                  onClick={() => {
                    setDoctorExitNotes(activeVisit.notes || '');
                    setShowExitModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
                >
                  <DoorOpen className="h-4 w-4" />
                  <span>إنهاء الكشف وإضافة للسجل</span>
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* نافذة كتابة التشخيص وترحيل الزيارة للسجل الطبي */}
        <AnimatePresence>
          {showExitModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">إنهاء الكشف وحفظ التقرير الطبي</h3>
                    <p className="text-xs text-slate-500">سيتم ترحيل الزيارة إلى السجل الطبي الدائم وتاريخ الزيارات.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">التشخيص، العلاج، وتوصيات الطبيب</label>
                  <textarea
                    value={doctorExitNotes}
                    onChange={(e) => setDoctorExitNotes(e.target.value)}
                    placeholder="اكتب التشخيص النهائي، الأدوية المقررة، أو موعد الإعادة..."
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-800 outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    disabled={loadingAction}
                    onClick={() => handleUpdateStatus(activeVisit.appointment || activeVisit._id, 'غادر', doctorExitNotes)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 py-3 text-xs font-bold text-white shadow-sm hover:brightness-105"
                  >
                    {loadingAction ? 'جارٍ الحفظ والترحيل...' : 'تأكيد الخروج والإضافة للسجل الطبي'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExitModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    إلغاء
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* نموذج حجز موعد جديد */}
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
                <span>حجز موعد جديد وإضافة المريض للانتظار</span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">نوع الزيارة / الخدمة</label>
                  <div className="relative">
                    <select
                      required
                      name="title"
                      defaultValue="كشف"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-800 outline-none transition-all focus:border-sky-600 focus:bg-white cursor-pointer"
                    >
                      <option value="كشف">كشف</option>
                      <option value="متابعة">متابعة</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">تاريخ الموعد</label>
                  <input
                    required
                    name="date"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-800 outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">وقت الموعد</label>
                  <input
                    required
                    name="time"
                    type="time"
                    defaultValue={new Date().toTimeString().slice(0, 5)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-800 outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>



                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">الفرع / العيادة</label>
                  <div className="relative">
                    <select
                      required
                      name="clinic"
                      defaultValue={patient.clinic?._id || ''}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/60 p-3 pr-4 pl-10 text-sm text-slate-800 outline-none focus:border-sky-600 focus:bg-white"
                    >
                      <option value="">اختر العيادة</option>
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
                  <label className="mb-1 block text-xs font-semibold text-slate-600">ملاحظات الحجز</label>
                  <input
                    name="notes"
                    placeholder="ملاحظات أو توصيات..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-800 outline-none focus:border-sky-600 focus:bg-white"
                  />
                </div>

                <div className="pt-2 md:col-span-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={loadingAction}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 py-3.5 text-sm font-bold text-white shadow-sm hover:brightness-105"
                  >
                    {loadingAction ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    <span>تأكيد الحجز والإضافة للهستري وقائمة الانتظار</span>
                  </motion.button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

   

        {/* الشبكة الرئيسية لملف المريض */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* الشريط الجانبي للملاحظات والحسابات */}
          <aside className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
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

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-800 outline-none focus:border-sky-600 focus:bg-white"
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

          {/* السجل الطبي وتاريخ الزيارات المعتمدة */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
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
                  {visits.map((visit) => {
                    const visitDateObj = new Date(
                      visit.date || visit.scheduledAt || visit.visitDate || visit.createdAt
                    );

                    return (
                      <motion.div
                        key={visit._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative rounded-2xl border border-slate-100 bg-[#F8FAFC]/70 p-5 transition-all hover:border-sky-200 hover:bg-white hover:shadow-sm"
                      >
                        <div className="absolute -right-[31px] top-6 h-3.5 w-3.5 rounded-full border-2 border-white bg-sky-600 shadow-sm" />

                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-slate-900">{visit.title || 'كشف عيادة'}</h4>
                              {visit.status && (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${visit.status === 'دخل للطبيب'
                                      ? 'bg-amber-100 text-amber-800'
                                      : visit.status === 'انتظار' || visit.status === 'محجوز'
                                        ? 'bg-sky-100 text-sky-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                >
                                  {visit.status}
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-sky-600" />
                                {visitDateObj.toLocaleDateString('ar-EG')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-sky-600" />
                                {visitDateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {visit.clinic?.name && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3 text-sky-600" />
                                  {visit.clinic.name}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {(visit.status === 'انتظار' || visit.status === 'محجوز') && (
                              <button
                                onClick={() => handleUpdateStatus(visit.appointment || visit._id, 'دخل للطبيب')}
                                className="rounded-xl bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
                              >
                                تم الدخول
                              </button>
                            )}
                            {visit.status === 'دخل للطبيب' && (
                              <button
                                onClick={() => {
                                  setDoctorExitNotes(visit.notes || '');
                                  setShowExitModal(true);
                                }}
                                className="inline-flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-slate-700"
                              >
                                <DoorOpen className="h-3.5 w-3.5" />
                                غادر
                              </button>
                            )}

                            <span className="inline-flex self-start rounded-xl border border-sky-100 bg-sky-50 px-3 py-1 text-sm font-black text-sky-900">
                              {Number(visit.amount || 0).toLocaleString('ar-EG')} ج
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 rounded-xl border border-slate-100 bg-white p-3 text-xs leading-relaxed text-slate-600">
                          <div className="mb-1 flex items-center justify-between gap-2"><b className="text-[11px] text-slate-400">ملاحظات الكشف:</b>{(admin?.username === 'drahmed' || admin?.role === 'developer') && editingVisitId !== visit._id && <button type="button" onClick={() => { setEditingVisitId(visit._id); setVisitNotesDraft(visit.notes || ''); }} className="font-bold text-sky-700 hover:text-sky-900">تعديل</button>}</div>
                          {editingVisitId === visit._id ? <><textarea value={visitNotesDraft} onChange={(e) => setVisitNotesDraft(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-sky-500" placeholder="اكتب التشخيص والعلاج والتوصيات..." /><div className="mt-2 flex gap-2"><button type="button" disabled={loadingAction} onClick={() => saveVisitNotes(visit._id)} className="rounded-lg bg-sky-600 px-3 py-1.5 font-bold text-white">حفظ في DB</button><button type="button" onClick={() => setEditingVisitId(null)} className="rounded-lg border px-3 py-1.5">إلغاء</button></div></> : <span>{visit.notes || 'لا توجد ملاحظة مسجلة لهذا الكشف.'}</span>}
                        </div>
                      </motion.div>
                    );
                  })}
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
          <p className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center text-xs font-semibold text-sky-800">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
