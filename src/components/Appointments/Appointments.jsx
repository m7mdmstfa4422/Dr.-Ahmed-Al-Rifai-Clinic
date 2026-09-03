import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  DoorOpen,
  Plus,
  Users,
  User,
  Building2,
  Clock,
  ChevronLeft,
  Loader2,
  Stethoscope,
  BookOpen,
  Search,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
  Banknote,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../api';

export default function Appointments() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([]);
  const [patients, setPatients] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [attendanceFor, setAttendanceFor] = useState(null);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingPatient, setBookingPatient] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [queue, patientList, clinicList] = await Promise.all([
        api(`/appointments?date=${date}`),
        api('/patients'),
        api('/clinics'),
      ]);
      setItems(Array.isArray(queue) ? queue : []);
      setPatients(Array.isArray(patientList) ? patientList : []);
      setClinics(Array.isArray(clinicList) ? clinicList : []);
    } catch (error) {
      setMessage(error.message || 'تعذر تحميل المواعيد');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [date]);

  const add = async (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!bookingPatient?._id) {
      setMessage('ابحث بالاسم أو رقم الهاتف ثم اختر المريض قبل تأكيد الحجز.');
      return;
    }
    try {
      await api('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          patient: bookingPatient._id,
          clinic: form.get('clinic'),
          scheduledAt: new Date(`${date}T${form.get('time')}`).toISOString(),
          notes: form.get('notes'),
          status: 'محجوز',
        }),
      });
      setOpen(false);
      setBookingPatient(null);
      setBookingSearch('');
      load();
    } catch (error) {
      setMessage(error.message || 'تعذر تسجيل الموعد');
    }
  };

  const status = async (id, value) => {
    try {
      await api(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: value }),
      });
      load();
    } catch (error) {
      setMessage(error.message || 'تعذر تحديث الحالة');
    }
  };

  const removeBooking = async (id) => {
    if (!window.confirm('هل تريد حذف هذا الحجز نهائياً؟')) return;
    try {
      await api(`/appointments/${id}`, { method: 'DELETE' });
      load();
    } catch (error) {
      setMessage(error.message || 'تعذر حذف الحجز');
    }
  };

  const attend = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api(`/appointments/${attendanceFor._id}/attendance`, {
        method: 'PATCH',
        body: JSON.stringify({
          visitType: form.get('visitType'),
          amount: Number(form.get('amount') || 0),
          notes: form.get('notes') || ''
        })
      });
      setAttendanceFor(null);
      load();
    } catch (error) {
      setMessage(error.message || 'تعذر تسجيل الحضور');
    }
  };

  const filteredPatients = bookingSearch
    ? patients.filter(
      (p) =>
        p.fullName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        p.phone?.includes(bookingSearch)
    ).slice(0, 6)
    : [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-3 sm:p-6 lg:p-8 font-sans text-slate-800" dir="rtl">
      <div className="mx-auto max-w-[1550px] space-y-6">

        {/* التنبيهات والأخطاء */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-800 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
                <span className="font-medium">{message}</span>
              </div>
              <button
                onClick={() => setMessage('')}
                className="rounded-lg p-1 text-rose-500 hover:bg-rose-100 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* شريط التحكم العلوي */}
        <header className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-800 p-6 md:p-8 text-white shadow-xl shadow-sky-900/15">
          {/* إضاءات الخلفية */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white">
                  المواعيد وقائمة الانتظار
                </h1>
              </div>
              <p className="mt-1.5 text-xs sm:text-sm text-sky-100/90 max-w-xl">
                متابعة حركة الحالات اليومية والربط السريع بالملفات الطبية وسجل الكشوفات
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* اختيار اليوم */}
              <div className="flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3.5 backdrop-blur-md shadow-sm">
                <CalendarDays size={16} className="text-cyan-300 flex-shrink-0" />
                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  type="date"
                  className="bg-transparent text-xs sm:text-sm font-bold text-white outline-none cursor-pointer [color-scheme:dark]"
                />
              </div>

              {/* زر إضافة موعد */}
              <button
                onClick={() => setOpen(!open)}
                className={`inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-xs sm:text-sm font-black transition-all shadow-lg ${open
                    ? 'border border-white/20 bg-white/15 text-white hover:bg-white/25 backdrop-blur-md'
                    : 'bg-gradient-to-r from-cyan-400 to-sky-400 text-white font-bold shadow-sky-950/30 hover:brightness-105'
                  }`}
              >
                {open ? <X size={17} /> : <Plus size={17} />}
                <span>{open ? 'إلغاء النافذة' : 'حجز موعد جديد'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* نموذج حجز موعد جديد */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form
                onSubmit={add}
                className="rounded-3xl border border-sky-100 bg-white p-5 sm:p-7 shadow-sm ring-1 ring-sky-500/10 space-y-5"
              >
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <div className="grid size-8 place-items-center rounded-xl bg-sky-50 text-slate-600">
                    <Plus size={18} />
                  </div>
                  <h3 className="text-sm font-black text-slate-800">بيانات تسجيل حجز جديد</h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* البحث عن مريض */}
                  <div className="relative sm:col-span-2">
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <User size={14} className="text-slate-400" />
                      <span>اسم المريض أو رقم الهاتف</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        value={bookingSearch}
                        onChange={(e) => {
                          setBookingSearch(e.target.value);
                          setBookingPatient(null);
                        }}
                        placeholder="ابحث بالاسم أو رقم الهاتف..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pe-9 ps-3 text-xs sm:text-sm outline-none transition-colors focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
                      />
                      <Search size={16} className="absolute end-3 top-3 text-slate-400" />
                    </div>

                    {/* نتائج البحث */}
                    {bookingSearch && !bookingPatient && (
                      <div className="absolute z-30 mt-2 max-h-56 w-full overflow-y-auto rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl">
                        {filteredPatients.length > 0 ? (
                          filteredPatients.map((p) => (
                            <button
                              type="button"
                              key={p._id}
                              onClick={() => {
                                setBookingPatient(p);
                                setBookingSearch(`${p.fullName} — ${p.phone || 'بدون هاتف'}`);
                              }}
                              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-right text-xs transition-colors hover:bg-sky-50"
                            >
                              <div className="font-bold text-slate-800">{p.fullName}</div>
                              <span dir="ltr" className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600">
                                {p.phone || 'بدون هاتف'}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="p-3 text-center text-xs text-slate-400">
                            لا يوجد مريض مطابق. يرجى إضافته أولاً من دليل المرضى.
                          </div>
                        )}
                      </div>
                    )}

                    {bookingPatient && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-sky-700">
                        <CheckCircle2 size={14} />
                        <span>تم التحديد: {bookingPatient.fullName}</span>
                      </div>
                    )}
                  </div>

                  {/* العيادة */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Building2 size={14} className="text-slate-400" />
                      <span>العيادة المختصة</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      name="clinic"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs sm:text-sm outline-none transition-colors focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
                    >
                      <option value="">-- اختر العيادة --</option>
                      {clinics.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* وقت الكشف */}
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Clock size={14} className="text-slate-400" />
                      <span>وقت الموعد</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      required
                      name="time"
                      type="time"
                      defaultValue={new Date().toTimeString().slice(0, 5)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs sm:text-sm font-medium outline-none transition-colors focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
                    />
                  </div>

                  {/* ملاحظات الحجز */}
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <FileText size={14} className="text-slate-400" />
                      <span>ملاحظات إضافية</span>
                    </label>
                    <input
                      name="notes"
                      placeholder="اكتب أي توصيات أولية أو سبب الزيارة..."
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs sm:text-sm outline-none transition-colors focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-sky-500 to-cyan-600 px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-sky-600/20 hover:from-sky-600 hover:to-cyan-700 transition-all"
                  >
                    <Plus size={16} />
                    <span>تأكيد تسجيل الحجز</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* بطاقة استكمال الحضور والتحصيل */}
        <AnimatePresence>
          {attendanceFor && (
            <motion.form
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              onSubmit={attend}
              className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50/90 to-cyan-50/60 p-5 sm:p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-7 place-items-center rounded-lg bg-sky-600 text-xs font-black text-white">
                    #{attendanceFor.queueNumber || '—'}
                  </span>
                  <div className="text-sm font-black text-sky-950">
                    تأكيد وصول الحالة: {attendanceFor.patient?.fullName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttendanceFor(null)}
                  className="rounded-xl p-1 text-slate-400 hover:bg-sky-100 hover:text-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-bold text-sky-950">نوع الكشف</label>
                  <select
                    name="visitType"
                    className="w-full rounded-2xl border border-sky-200 bg-white p-2.5 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="كشف">كشف جديد</option>
                    <option value="متابعة">متابعة / استشارة</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-sky-950">قيمة التحصيل (ج)</label>
                  <div className="relative">
                    <input
                      required
                      name="amount"
                      type="number"
                      min="0"
                      placeholder="0"
                      className="w-full rounded-2xl border border-sky-200 bg-white p-2.5 pe-8 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500"
                    />
                    <Banknote size={16} className="absolute end-2.5 top-3 text-sky-600" />
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-sky-950">ملاحظات الاستقبال</label>
                  <input
                    name="notes"
                    placeholder="تم السداد / كشف مستعجل..."
                    className="w-full rounded-2xl border border-sky-200 bg-white p-2.5 text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-sky-900 via-sky-800 to-cyan-800 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all"
                >
                  <CheckCircle2 size={16} />
                  <span>تأكيد الحضور ونقل الحالة للانتظار</span>
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* عرض الأعمدة (Kanban Columns) */}
        {loading ? (
          <div className="flex min-h-[380px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white p-8">
            <Loader2 className="h-9 w-9 animate-spin text-sky-600" />
            <p className="text-xs sm:text-sm font-bold text-slate-500">جارٍ مزامنة قوائم الانتظار والمواعيد...</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">

            {/* عمود الحجز المسبق */}
            <QueueSection
              title="حجز مسبق"
              badgeTheme="bg-blue-50 text-blue-700 border-blue-200"
              icon={CalendarDays}
              iconColor="text-blue-600 bg-blue-50"
              rows={items.filter((x) => x.status === 'محجوز')}
              action={(x) => (
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => setAttendanceFor(x)}
                    className="flex-1 sm:flex-initial rounded-xl bg-sky-800 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    تسجيل الحضور
                  </button>
                  <button
                    onClick={() => removeBooking(x._id)}
                    title="حذف الحجز"
                    className="rounded-xl border border-rose-100 bg-rose-50 p-2 text-rose-600 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            />

            {/* عمود صالة الانتظار */}
            <QueueSection
              title="قائمة الانتظار بالصالة"
              badgeTheme="bg-sky-50 text-sky-700 border-sky-200"
              icon={Users}
              iconColor="text-sky-600 bg-sky-50"
              rows={items.filter((x) => x.status === 'انتظار')}
              action={(x) => (
                <button
                  onClick={() => status(x._id, 'دخل للطبيب')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-l from-sky-900 via-sky-800 to-cyan-800 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all"
                >
                  <Stethoscope size={14} />
                  <span>دخول الكشف</span>
                </button>
              )}
            />

            {/* عمود عند الطبيب حالياً */}
            <QueueSection
              title="عند الطبيب حالياً"
              badgeTheme="bg-cyan-50 text-cyan-800 border-cyan-200"
              icon={Stethoscope}
              iconColor="text-cyan-600 bg-cyan-50"
              rows={items.filter((x) => x.status === 'دخل للطبيب')}
              action={(x) => (
                <button
                  onClick={() => status(x._id, 'غادر')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
                >
                  <DoorOpen size={14} />
                  <span>إنهاء ومغادرة</span>
                </button>
              )}
            />

          </div>
        )}
      </div>
    </div>
  );
}

function QueueSection({ title, icon: Icon, iconColor, rows, action, badgeTheme }) {
  return (
    <section className="flex flex-col rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* رأس العمود */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className={`grid size-8 place-items-center rounded-xl ${iconColor}`}>
            <Icon size={17} />
          </div>
          <h2 className="text-sm font-black text-slate-900">{title}</h2>
        </div>
        <span className={`rounded-xl border px-2.5 py-0.5 font-mono text-xs font-black ${badgeTheme}`}>
          {rows.length}
        </span>
      </div>

      {/* قائمة البطاقات */}
      <div className="flex-1 space-y-3">
        {rows.length > 0 ? (
          rows.map((item) => {
            const patientId = item.patient?._id || item.patient;
            return (
              <div
                key={item._id}
                className="group flex flex-col justify-between gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-sky-200 hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    {/* رابط المريض */}
                    <Link
                      to={`/patient-profile/${patientId}`}
                      className="group/link inline-flex items-center gap-1.5 font-bold text-slate-900 hover:text-sky-600 transition-colors"
                    >
                      <User className="h-4 w-4 text-slate-400 group-hover/link:text-sky-600 flex-shrink-0" />
                      <span className="truncate text-sm">{item.patient?.fullName || 'مريض غير مسجل'}</span>
                      <ChevronLeft className="h-3.5 w-3.5 text-slate-400 opacity-0 transition-all group-hover/link:opacity-100 group-hover/link:-translate-x-0.5" />
                    </Link>

                    {/* بيانات إضافية */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        {item.clinic?.name || 'العيادة العامة'}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {new Date(item.scheduledAt).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* رقم الدور */}
                  <span
                    title="رقم الدور"
                    className="grid size-8 flex-shrink-0 place-items-center rounded-xl bg-slate-900 font-mono text-xs font-black text-white shadow-sm"
                  >
                    {item.queueNumber || '—'}
                  </span>
                </div>

                {/* بادج نوع الكشف / التحصيل */}
                {(item.visitType || item.title) && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700">
                      <Stethoscope size={11} />
                      <span>{item.visitType || item.title}</span>
                    </span>

                    {item.paymentStatus === 'محصل' && (
                      <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                        {Number(item.amount || 0).toLocaleString('ar-EG')} ج
                      </span>
                    )}
                  </div>
                )}

                {/* أزرار التفاعل */}
                <div className="flex items-center justify-end pt-1 border-t border-slate-100/70">
                  {action(item)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex h-36 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/30 p-4 text-center">
            <span className="text-xs text-slate-400">لا توجد حالات حالياً في هذا القسم</span>
          </div>
        )}
      </div>
    </section>
  );
}