import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  UserPlus, 
  CalendarDays, 
  ChevronLeft, 
  Phone, 
  Building2, 
  FileText, 
  Loader2, 
  Calendar, 
  Clock, 
  Stethoscope, 
  X, 
  FolderHeart, 
  History, 
  Plus, 
  Check, 
  ExternalLink, 
  ShieldAlert, 
  Layers
} from 'lucide-react';
import { api } from '../../api';
import { AuthContext } from '../../AuthProvider';

export default function PatientSearch() {
  const { admin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // حالات نافذة الهستري الطبي
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showAddVisitForm, setShowAddVisitForm] = useState(false);
  const [submittingVisit, setSubmittingVisit] = useState(false);
  const [editingMedicalNotes, setEditingMedicalNotes] = useState(false);
  const [medicalNotesDraft, setMedicalNotesDraft] = useState('');
  const [editingVisitId, setEditingVisitId] = useState(null);
  const [visitNotesDraft, setVisitNotesDraft] = useState('');
  const canEditNotes = admin?.role === 'developer' || admin?.username === 'drahmed' || admin?.permissions?.includes('medicalNotes');

  // تحميل قائمة المرضى والعيادات
  const loadData = async () => {
    try {
      setLoading(true);
      const [patientsData, clinicsData] = await Promise.all([
        api('/patients'),
        api('/clinics'),
      ]);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setClinics(Array.isArray(clinicsData) ? clinicsData : []);
    } catch (err) {
      setMessage(err.message || 'تعذر تحميل بيانات المرضى');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // فتح الملف الطبي واستدعاء الهستري للمريض
  const handleOpenMedicalHistory = async (patient) => {
    setSelectedPatient(patient);
    setHistoryLoading(true);
    setShowAddVisitForm(false);
    setEditingMedicalNotes(false);
    setEditingVisitId(null);
    setMedicalNotesDraft(patient.medicalNotes || '');
    setPatientHistory([]);

    try {
      const res = await api(`/patients/${patient._id}`);
      const visitsList = Array.isArray(res?.visits) ? res.visits : [];
      setPatientHistory(visitsList);

      // مزامنة عدد الزيارات مع الواجهة الرئيسية
      setPatients((prev) =>
        prev.map((p) =>
          p._id === patient._id ? { ...p, visitsCount: visitsList.length } : p
        )
      );
    } catch (err) {
      setMessage('تعذر استدعاء السجل الطبي');
    } finally {
      setHistoryLoading(false);
    }
  };

  const saveMedicalNotes = async () => {
    try {
      const updated = await api(`/patients/${selectedPatient._id}`, { method: 'PUT', body: JSON.stringify({ medicalNotes: medicalNotesDraft }) });
      setSelectedPatient((current) => ({ ...current, medicalNotes: updated.medicalNotes }));
      setPatients((current) => current.map((p) => p._id === selectedPatient._id ? { ...p, medicalNotes: updated.medicalNotes } : p));
      setEditingMedicalNotes(false);
      setMessage('تم حفظ الملاحظات الطبية في قاعدة البيانات.');
    } catch (err) { setMessage(err.message || 'تعذر حفظ الملاحظات الطبية'); }
  };

  const saveVisitNotes = async (visitId) => {
    try {
      const updated = await api(`/visits/${visitId}`, { method: 'PUT', body: JSON.stringify({ notes: visitNotesDraft }) });
      setPatientHistory((current) => current.map((item) => String(item._id) === String(visitId) || String(item.appointmentId) === String(updated.appointmentId) ? { ...item, notes: updated.notes } : item));
      setEditingVisitId(null);
      setMessage('تم حفظ ملاحظة الكشف في قاعدة البيانات.');
    } catch (err) { setMessage(err.message || 'تعذر حفظ ملاحظة الكشف'); }
  };

  // حفظ الزيارة في قاعدة البيانات وإضافتها للانتظار وزيادة العداد
  const handleAddNewVisit = async (e) => {
    e.preventDefault();
    setSubmittingVisit(true);
    setMessage('');

    const form = new FormData(e.currentTarget);
    const visitDate = form.get('date') || new Date().toISOString().slice(0, 10);
    const visitTime = form.get('time') || new Date().toTimeString().slice(0, 5);
    const rawClinic = form.get('clinic');
    const clinicId = rawClinic && rawClinic.trim() !== '' ? rawClinic : undefined;

    const payload = {
      patient: selectedPatient._id,
      clinic: clinicId,
      title: form.get('title') || 'كشف عيادة',
      amount: Number(form.get('amount') || 0),
      scheduledAt: new Date(`${visitDate}T${visitTime}`).toISOString(),
      notes: form.get('notes') || '',
      status: 'انتظار',
    };

    try {
      const res = await api('/appointments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // اقرأ السجل من قاعدة البيانات بعد نجاح الحفظ، ولا تعتمد على بيانات مؤقتة.
      const refreshed = await api(`/patients/${selectedPatient._id}`, { showLoading: false });
      const persistedVisits = Array.isArray(refreshed?.visits) ? refreshed.visits : [];
      setPatientHistory(persistedVisits);
      setPatients((prev) => prev.map((p) => p._id === selectedPatient._id ? { ...p, visitsCount: persistedVisits.length } : p));

      setShowAddVisitForm(false);
      setMessage(`تم حفظ الزيارة بنجاح في قاعدة البيانات وإدراج المريض (${selectedPatient.fullName}) في صالة الانتظار.`);
    } catch (err) {
      console.error('خطأ في حفظ الزيارة:', err);
      setMessage(`فشل حفظ الزيارة: ${err.message}`);
    } finally {
      setSubmittingVisit(false);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search) ||
    p.nationalId?.includes(search)
  );

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_right,_#e0f2fe_0,_transparent_28%),linear-gradient(135deg,_#f8fafc_0%,_#f0fdfa_52%,_#eff6ff_100%)] p-4 text-slate-800 md:p-6 lg:p-8" dir="rtl">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        
        {/* شريط التحكم العلوي بعرض الشاشة الكامل */}
      <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-800 p-6 md:p-8 text-white shadow-xl shadow-sky-900/15">
  {/* تأثيرات الإضاءة التدرجية بالخلفية */}
  <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
  <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

  <div className="relative flex flex-wrap items-center justify-between gap-4">
    <div>
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold text-cyan-200 backdrop-blur-md">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        <span>إدارة الرعاية الصحية</span>
      </div>
      <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">سجل المرضى العام</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-sky-100/90">
        إدارة الملفات الطبية، استعراض الهستري، ومتابعة عدد الزيارات المسجلة.
      </p>
    </div>

    <div className="flex flex-wrap items-center gap-3">
      <Link
        to="/appointments"
        className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/20 hover:border-white/30"
      >
        <CalendarDays size={18} className="text-cyan-300" />
        <span>شاشة المواعيد وقائمة الانتظار</span>
      </Link>

      <Link
        to="/register"
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-sky-950/30 transition-all hover:-translate-y-0.5 hover:brightness-105"
      >
        <UserPlus size={18} />
        <span>تسجيل مريض جديد</span>
      </Link>
    </div>
  </div>
</header>

        <section className="rounded-[1.75rem] border border-white/90 bg-white/80 p-4 shadow-[0_14px_40px_-24px_rgba(15,23,42,0.25)] backdrop-blur md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute right-4 top-3.5 h-5 w-5 text-cyan-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو الهاتف أو الرقم القومي..."
                className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3.5 pr-12 pl-4 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-100"
              />
            </div>
            <div className="min-w-28 rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-sky-50 px-4 py-2.5 text-center">
              <b className="block text-lg font-black text-cyan-900">{filteredPatients.length}</b>
              <span className="text-[11px] font-bold text-cyan-700">{search ? 'نتيجة مطابقة' : 'ملف مسجل'}</span>
            </div>
          </div>
        </section>

        {/* شبكة بطاقات المرضى مع عرض عدد الزيارات */}
        {loading ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center gap-3">
            <Loader2 className="h-9 w-9 animate-spin text-sky-600" />
            <p className="text-sm font-medium text-slate-500">جارٍ تحميل سجلات المرضى...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPatients.length ? (
              filteredPatients.map((p) => (
                <div
                  key={p._id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[1.75rem] border border-white bg-white/90 p-5 shadow-[0_14px_35px_-24px_rgba(15,23,42,0.32)] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_22px_45px_-22px_rgba(8,145,178,0.34)]"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 text-sm font-black text-white shadow-lg shadow-sky-500/20">
                          {(p.fullName || 'م').trim().slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-black text-slate-900 transition-colors group-hover:text-cyan-700">{p.fullName}</h3>
                          <span className="block text-xs text-slate-400">مسجل: {new Date(p.createdAt || Date.now()).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                      <span className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-800">
                        {p.clinic?.name || 'عيادة عامة'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-slate-500">
                      <p className="flex items-center gap-2">
                        <Phone size={14} className="text-sky-600" />
                        <span dir="ltr">{p.phone || 'بدون هاتف'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar size={14} className="text-sky-600" />
                        <span>{p.gender || '—'} · {p.age ? `${p.age} سنة` : 'السن غير مسجل'}</span>
                      </p>
                      <p className="truncate rounded-lg bg-slate-50 px-2.5 py-2 text-[11px] text-slate-500">الرقم القومي: <b dir="ltr">{p.nationalId || 'غير مسجل'}</b></p>
                      
                      {/* عرض عدد الزيارات المسجلة في البطاقة */}
                      <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-gradient-to-l from-slate-50 to-cyan-50/60 px-3 py-2">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Layers size={14} className="text-sky-600" />
                          عدد الزيارات:
                        </span>
                        <span className="rounded-full bg-gradient-to-l from-cyan-500 to-sky-600 px-2.5 py-0.5 text-xs font-black text-white shadow-sm">
                          {p.visitsCount || 0}
                        </span>
                      </div>

                      {p.medicalNotes && (
                        <p className="flex items-center gap-2 truncate rounded-xl border  border-indigo-100 bg-indigo-50/60 p-2 text-indigo-800">
                          <FileText size={14} className="text-indigo-500 shrink-0" />
                          <span className="truncate"><b>ملاحظة طبية:</b> {p.medicalNotes}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* زر عرض الهستري الطبي */}
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => navigate(`/patient-profile/${p._id}`)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-xs font-bold text-slate-700 transition-all hover:bg-gradient-to-l hover:from-cyan-500 hover:to-sky-600 hover:text-white"
                    >
                      <FolderHeart size={16} />
                      <span>الملف الطبي وتاريخ الزيارات</span>
                      <ChevronLeft size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center text-slate-400">
                <Users className="mx-auto mb-2 h-12 w-12 opacity-30" />
                <p className="text-base">لا توجد نتائج مطابقة لعملية البحث.</p>
              </div>
            )}
          </div>
        )}

        {/* نافذة عرض الملف الطبي والهستري الكامل */}
        <AnimatePresence>
          {selectedPatient && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-[2rem] border border-white/80 bg-white/95 p-6 shadow-2xl md:p-8"
              >
                {/* رأس النافذة وإحصائيات الزيارات */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-sky-500/20">
                      <FolderHeart size={26} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black text-slate-900">{selectedPatient.fullName}</h2>
                        <span className="rounded-full bg-sky-100 px-3 py-0.5 text-xs font-bold text-sky-800">
                          {selectedPatient.age ? `${selectedPatient.age} سنة` : 'ملف طبي'}
                        </span>
                        
                        {/* بادج إجمالي عدد الزيارات بالهيدر */}
                        <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-black text-emerald-800">
                          إجمالي الزيارات: {patientHistory.length}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        هاتف: {selectedPatient.phone || 'بدون هاتف'} · الفرع: {selectedPatient.clinic?.name || 'عام'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAddVisitForm(!showAddVisitForm)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-cyan-500 to-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition-all hover:-translate-y-0.5"
                    >
                      <Plus size={16} />
                      <span>{showAddVisitForm ? 'إلغاء النموذج' : 'إضافة زيارة وهستري جديد'}</span>
                    </button>

                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <X size={22} />
                    </button>
                  </div>
                </div>

                {/* نموذج إضافة الزيارة وحفظها مباشرة في قاعدة البيانات */}
                <AnimatePresence>
                  {showAddVisitForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleAddNewVisit}
                      className="mt-4 overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-l from-cyan-50/70 to-sky-50/70 p-5"
                    >
                      <div className="mb-3 flex items-center gap-2 text-xs font-bold text-sky-900">
                        <Stethoscope size={16} className="text-sky-600" />
                        <span>حفظ كشف جديد في قاعدة البيانات وإدراجه بصالة الانتظار</span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">عنوان الكشف / الخدمة</label>
                          <input
                            required
                            name="title"
                            defaultValue="كشف عيادة"
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">العيادة</label>
                          <select
                            name="clinic"
                            defaultValue={selectedPatient.clinic?._id || ''}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                          >
                            <option value="">اختر العيادة (اختياري)</option>
                            {clinics.map((c) => (
                              <option key={c._id} value={c._id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">تاريخ الكشف</label>
                          <input
                            required
                            type="date"
                            name="date"
                            defaultValue={new Date().toISOString().slice(0, 10)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">وقت الكشف</label>
                          <input
                            required
                            type="time"
                            name="time"
                            defaultValue={new Date().toTimeString().slice(0, 5)}
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">المبلغ المدفوع (ج)</label>
                          <input
                            name="amount"
                            type="number"
                            min="0"
                            placeholder="0"
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">التشخيص أو التوصيات</label>
                          <input
                            name="notes"
                            placeholder="الأعراض أو التوصيات..."
                            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                          />
                        </div>

                        <div className="pt-2 md:col-span-3">
                          <button
                            disabled={submittingVisit}
                            type="submit"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-cyan-500 to-sky-600 py-3 text-xs font-bold text-white shadow-md shadow-sky-500/20 transition hover:brightness-105"
                          >
                            {submittingVisit ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check size={16} />}
                            <span>حفظ الزيارة بالـ DB وإضافتها للهستري والانتظار</span>
                          </button>
                        </div>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* الملاحظات الطبية والأمراض المزمنة */}
                {(selectedPatient.medicalNotes || canEditNotes) && (
                  <div className="mt-4 flex items-start gap-2 rounded-2xl border border-indigo-200 bg-indigo-50/60 p-3.5 text-xs text-indigo-900">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0 text-indigo-600" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2"><b className="block font-bold">الملاحظات الطبية والأمراض المزمنة:</b>{canEditNotes && !editingMedicalNotes && <button onClick={() => setEditingMedicalNotes(true)} className="rounded-lg bg-white px-2 py-1 font-bold text-sky-700 shadow-sm">تعديل</button>}</div>
                      {editingMedicalNotes ? <><textarea value={medicalNotesDraft} onChange={(e) => setMedicalNotesDraft(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-indigo-200 bg-white p-2 text-xs outline-none focus:border-sky-500" placeholder="الحساسية، الأمراض المزمنة، والتنبيهات الطبية..." /><div className="mt-2 flex gap-2"><button onClick={saveMedicalNotes} className="rounded-lg bg-sky-600 px-3 py-1.5 font-bold text-white">حفظ</button><button onClick={() => setEditingMedicalNotes(false)} className="rounded-lg border border-indigo-200 px-3 py-1.5">إلغاء</button></div></> : <span>{selectedPatient.medicalNotes || 'لا توجد ملاحظات طبية عامة.'}</span>}
                    </div>
                  </div>
                )}

                {/* قائمة السجل وتاريخ الزيارات */}
                <div className="mt-4 flex-1 overflow-y-auto pr-1 pl-2 [scrollbar-color:#7dd3fc_transparent] [scrollbar-width:thin]">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                      <History size={16} className="text-sky-600" />
                      تاريخ الزيارات والكشوفات السابقة ({patientHistory.length})
                    </span>
                  </div>

                  {historyLoading ? (
                    <div className="flex min-h-[220px] flex-col items-center justify-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                      <p className="text-xs text-slate-500">جارٍ قراءة الهستري الطبي...</p>
                    </div>
                  ) : patientHistory.length ? (
                    <div className="relative space-y-4 border-r-2 border-sky-100 pr-5 mr-2">
                      {patientHistory.map((item) => {
                        const vDate = new Date(item.date || item.scheduledAt || item.visitDate || item.createdAt);
                        return (
                          <div
                            key={item._id}
                            className="relative rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 transition-all hover:border-sky-200 hover:bg-white"
                          >
                            <div className="absolute -right-[27px] top-5 h-3 w-3 rounded-full border-2 border-white bg-sky-600 shadow-sm" />

                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">{item.title || 'كشف عيادة'}</h4>
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                    item.status === 'دخل للطبيب'
                                      ? 'bg-indigo-100 text-indigo-800'
                                      : item.status === 'انتظار' || item.status === 'محجوز'
                                      ? 'bg-sky-100 text-sky-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {item.status || 'مكتمل'}
                                </span>
                              </div>

                              <span className="text-sm font-black text-sky-900">
                                {Number(item.amount || 0).toLocaleString('ar-EG')} ج
                              </span>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar size={13} className="text-sky-600" />
                                {vDate.toLocaleDateString('ar-EG')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={13} className="text-sky-600" />
                                {vDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {item.clinic?.name && (
                                <span className="flex items-center gap-1">
                                  <Building2 size={13} className="text-sky-600" />
                                  {item.clinic.name}
                                </span>
                              )}
                            </div>

                            <div className="mt-3 rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-600">
                              <div className="mb-1 flex items-center justify-between gap-2"><b className="text-[11px] text-slate-400">ملاحظة الطبيب بعد الكشف:</b>{canEditNotes && editingVisitId !== item._id && <button onClick={() => { setEditingVisitId(item._id); setVisitNotesDraft(item.notes || ''); }} className="font-bold text-sky-700">تعديل</button>}</div>
                              {editingVisitId === item._id ? <><textarea value={visitNotesDraft} onChange={(e) => setVisitNotesDraft(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-200 p-2 outline-none focus:border-sky-500" placeholder="اكتب التشخيص، العلاج، أو التوصيات بعد الكشف..." /><div className="mt-2 flex gap-2"><button onClick={() => saveVisitNotes(item._id)} className="rounded-lg bg-sky-600 px-3 py-1.5 font-bold text-white">حفظ في DB</button><button onClick={() => setEditingVisitId(null)} className="rounded-lg border px-3 py-1.5">إلغاء</button></div></> : <span>{item.notes || 'لا توجد ملاحظة مسجلة لهذا الكشف.'}</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-14 text-center text-xs text-slate-400">
                      <History className="mx-auto mb-2 h-9 w-9 opacity-30" />
                      <p>لا توجد كشوفات مسجلة للمريض حتى الآن.</p>
                    </div>
                  )}
                </div>

                {/* أسفل النافذة */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <Link
                    to={`/patient-profile/${selectedPatient._id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 hover:text-sky-800"
                  >
                    <span>فتح الصفحة الشاملة للملف الطبي</span>
                    <ExternalLink size={14} />
                  </Link>

                  <button
                    onClick={() => setSelectedPatient(null)}
                    className="rounded-xl border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    إغلاق
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {message && (
          <p className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center text-xs font-semibold text-sky-800">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
