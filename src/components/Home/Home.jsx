import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  Clock,
  Activity,
  UserPlus,
  ChevronLeft,
  CalendarDays,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { api } from '../../api';
import { SystemContext } from '../../SystemProvider';

export default function Home() {
  const [todayDate, setTodayDate] = useState(new Date().toISOString().slice(0, 10));
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, patientsData] = await Promise.all([
        api(`/appointments?date=${todayDate}`),
        api('/patients'),
      ]);
      setTodayAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (err) {
      setMessage(err.message || 'تعذر تحميل بيانات لوحة التحكم.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [todayDate]);

  // تحديث حالة الكشف من لوحة التحكم
  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      setActionLoading(true);
      await api(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });
      setMessage(
        nextStatus === 'غادر'
          ? 'تم حفظ الزيارة وحذف الموعد من قائمة اليوم.'
          : 'تم تحديث حالة الموعد.'
      );
      await loadDashboardData();
    } catch (err) {
      setMessage(err.message || 'تعذر تحديث حالة الموعد.');
    } finally {
      setActionLoading(false);
    }
  };

  // التصنيفات والإحصائيات
  const waitingList = todayAppointments.filter((a) => a.status === 'انتظار');
  const inDoctorRoom = todayAppointments.filter((a) => a.status === 'دخل للطبيب');
  const bookedList = todayAppointments.filter((a) => a.status === 'محجوز');
  const currentValue = todayAppointments.reduce((sum, a) => sum + Number(a.amount || 0), 0);

  const statsCards = [
    {
      title: 'حالات في صالة الانتظار',
      value: waitingList.length,
      subtext: 'تم تسجيل حضورهم وينتظرون الطبيب',
      icon: Users,
      bg: 'from-sky-500/10 to-sky-500/5',
      border: 'border-sky-200/80',
      iconColor: 'text-sky-600',
      badgeColor: 'bg-sky-50 text-sky-700',
    },
    {
      title: 'داخل غرفة الكشف الآن',
      value: inDoctorRoom.length,
      subtext: 'حالات قيد الفحص الطبي المباشر',
      icon: Activity,
      bg: 'from-amber-500/10 to-amber-500/5',
      border: 'border-amber-200/80',
      iconColor: 'text-amber-600',
      badgeColor: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'مواعيد لم تبدأ بعد',
      value: bookedList.length,
      subtext: 'بانتظار تسجيل الحضور بالعيادة',
      icon: CheckCircle2,
      bg: 'from-emerald-500/10 to-emerald-500/5',
      border: 'border-emerald-200/80',
      iconColor: 'text-emerald-600',
      badgeColor: 'bg-emerald-50 text-emerald-700',
    },
  ];

  const { clinicName } = useContext(SystemContext);

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] p-4 md:p-6 lg:p-8 text-slate-800" dir="rtl">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* هيدر الترحيب الرئيسي */}
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-800 p-6 md:p-8 text-white shadow-lg shadow-sky-900/10"
        >
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md">
                <Sparkles size={14} className="text-cyan-300" />
                <span>{clinicName || 'DocPoint'}</span>
              </div>

              <h1 className="text-2xl font-black md:text-3xl leading-snug">
                مرحباً بك، نتمنى لك يوماً طبياً موفقاً
              </h1>

              <p className="text-xs md:text-sm text-sky-100/90 max-w-xl leading-relaxed">
                لديك اليوم <b className="text-white underline decoration-cyan-400">{todayAppointments.length} حالة مسجلة</b> بالعيادة، يمكنك متابعة حركة المرضى وصالة الانتظار لحظياً من هنا.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 text-xs font-bold text-white backdrop-blur-md">
                <CalendarDays size={16} />
                <input
                  type="date"
                  value={todayDate}
                  onChange={(e) => setTodayDate(e.target.value)}
                  className="bg-transparent text-white outline-none cursor-pointer [color-scheme:dark]"
                />
              </label>

              <button
                type="button"
                onClick={loadDashboardData}
                disabled={loading}
                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-white/20 disabled:opacity-60"
              >
                {loading ? 'جارٍ التحديث…' : 'تحديث البيانات'}
              </button>
            </div>
          </div>
        </motion.section>

        {/* شبكة الإحصائيات (متناسقة على 3 أعمدة) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {statsCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`relative overflow-hidden rounded-3xl border ${stat.border} bg-white bg-gradient-to-br ${stat.bg} p-5 md:p-6 shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">{stat.title}</span>
                  <div className={`rounded-2xl p-2.5 ${stat.badgeColor}`}>
                    <Icon size={20} className={stat.iconColor} />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                  <p className="mt-1 text-xs text-slate-400">{stat.subtext}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* مساحة العمل الرئيسية */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
          
          {/* العمود الأيمن (2/3): قائمة صالة الانتظار المباشرة */}
          <section className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-sm lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                  <Clock size={20} />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold text-slate-900">صالة الانتظار المباشرة اليوم</h2>
                  <p className="text-xs text-slate-400">الحالات الحالية المجدولة والمنتظرة في صالة الاستقبال</p>
                </div>
              </div>

              <Link
                to="/appointments"
                className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-800 transition-colors"
              >
                <span>شاشة الانتظار الكاملة</span>
                <ChevronLeft size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
                <p className="text-xs text-slate-400">جارٍ قراءة بيانات الحالات المباشرة...</p>
              </div>
            ) : bookedList.length + waitingList.length + inDoctorRoom.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[
                  {
                    title: 'محجوز',
                    hint: 'لم يسجل الحضور',
                    items: bookedList,
                    icon: Calendar,
                    palette: 'border-violet-200 bg-violet-50/40 text-violet-700',
                    badge: 'bg-violet-100 text-violet-800',
                    action: null,
                    next: null,
                  },
                  {
                    title: 'في الانتظار',
                    hint: 'جاهزون للكشف',
                    items: waitingList,
                    icon: Users,
                    palette: 'border-sky-200 bg-sky-50/40 text-sky-700',
                    badge: 'bg-sky-100 text-sky-800',
                    btnColor: 'bg-sky-600 hover:bg-sky-700',
                    action: 'دخول للطبيب',
                    next: 'دخل للطبيب',
                  },
                  {
                    title: 'عند الطبيب',
                    hint: 'تحت الفحص الآن',
                    items: inDoctorRoom,
                    icon: Activity,
                    palette: 'border-amber-200 bg-amber-50/40 text-amber-700',
                    badge: 'bg-amber-100 text-amber-800',
                    btnColor: 'bg-slate-900 hover:bg-slate-800',
                    action: 'إنهاء ومغادرة',
                    next: 'غادر',
                  },
                ].map((column) => {
                  const Icon = column.icon;
                  return (
                    <div
                      key={column.title}
                      className={`flex flex-col rounded-2xl border p-3.5 ${column.palette}`}
                    >
                      {/* ترويسة العمود */}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon size={16} />
                          <div>
                            <h3 className="text-xs md:text-sm font-black text-slate-900">{column.title}</h3>
                            <p className="text-[10px] font-medium opacity-70">{column.hint}</p>
                          </div>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-black ${column.badge}`}>
                          {column.items.length}
                        </span>
                      </div>

                      {/* بطاقات الحالات */}
                      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-0.5">
                        {column.items.length ? (
                          column.items.map((item) => (
                            <div
                              key={item._id}
                              className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-slate-200"
                            >
                              <Link
                                to={`/patient-profile/${item.patient?._id || item.patient}`}
                                className="block truncate text-xs font-bold text-slate-900 hover:text-sky-600"
                              >
                                {item.patient?.fullName || 'مريض غير مسجل'}
                              </Link>

                              <p className="mt-1 text-[11px] text-slate-400">
                                {item.clinic?.name || 'العيادة'} ·{' '}
                                {new Date(item.scheduledAt).toLocaleTimeString('ar-EG', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>

                              {column.action && (
                                <button
                                  disabled={actionLoading}
                                  onClick={() => handleUpdateStatus(item._id, column.next)}
                                  className={`mt-2.5 w-full rounded-lg py-2 text-[11px] font-bold text-white transition disabled:opacity-50 ${column.btnColor}`}
                                >
                                  {column.action}
                                </button>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="rounded-xl border border-dashed border-slate-200/80 bg-white/40 py-8 text-center text-xs font-medium text-slate-400">
                            لا توجد حالات حالياً
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400">
                <CalendarDays className="mx-auto mb-2 h-10 w-10 opacity-25 text-sky-600" />
                <p className="text-sm font-medium">لا توجد حالات في صالة الانتظار لليوم المحدد.</p>
                <Link
                  to="/appointments"
                  className="mt-2 inline-block text-xs font-bold text-sky-600 hover:underline"
                >
                  إضافة حالة لقائمة الانتظار الآن
                </Link>
              </div>
            )}
          </section>

          {/* العمود الأيسر (1/3): الإجراءات السريعة وملخص السجل */}
          <aside className="space-y-4">
            
            {/* بطاقة الإجراءات السريعة */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-xs md:text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-sky-600" />
                <span>إجراءات سريعة</span>
              </h3>

              <div className="space-y-2">
                <Link
                  to="/register"
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-sky-200 hover:bg-sky-50/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm border border-slate-100">
                      <UserPlus size={16} />
                    </div>
                    <div>
                      <b className="block text-xs font-bold text-slate-900">فتح ملف مريض جديد</b>
                      <span className="text-[11px] text-slate-400">تسجيل البيانات الأساسية</span>
                    </div>
                  </div>
                  <ChevronLeft size={16} className="text-slate-400" />
                </Link>

                <Link
                  to="/finance"
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-sky-200 hover:bg-sky-50/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm border border-slate-100">
                      <Wallet size={16} />
                    </div>
                    <div>
                      <b className="block text-xs font-bold text-slate-900">التقارير والخزينة</b>
                      <span className="text-[11px] text-slate-400">متابعة الإيرادات والتحصيل</span>
                    </div>
                  </div>
                  <ChevronLeft size={16} className="text-slate-400" />
                </Link>
              </div>
            </div>

            {/* بطاقة ملخص قاعدة بيانات المرضى */}
            <div className="rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/40 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400">إجمالي قاعدة المرضى</span>
                  <h4 className="mt-1 text-2xl font-black text-slate-900">{patients.length} مريض</h4>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-600/20">
                  <Users size={20} />
                </div>
              </div>

              <p className="text-xs leading-relaxed text-slate-500">
                جميع الملفات الطبية مؤمنة ومربوطة بسجلات الكشوفات وقاعدة بيانات أطلس.
              </p>

              <Link
                to="/search"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-white border border-sky-200 py-2.5 text-xs font-bold text-sky-700 hover:bg-sky-50 transition-colors shadow-sm"
              >
                <span>استعراض كل السجلات</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

          </aside>
        </div>

        {/* رسائل الإشعار السفلية */}
        {message && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-center text-xs font-bold text-sky-800 shadow-sm">
            {message}
          </div>
        )}

      </div>
    </div>
  );
}