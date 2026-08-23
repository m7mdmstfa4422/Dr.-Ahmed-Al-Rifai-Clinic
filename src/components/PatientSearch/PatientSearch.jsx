import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  User,
  Phone,
  Building2,
  UserCheck,
  Sparkles,
  ArrowUpRight,
  Loader2,
  X,
  Users,
  FileText,
} from 'lucide-react';
import { api } from '../../api';

export default function PatientSearch() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async (value = '') => {
    try {
      setLoading(true);
      setMessage('');

      const data = await api(`/patients?search=${encodeURIComponent(value)}`);
      const rows = Array.isArray(data) ? data : data?.patients || [];

      setPatients(rows);

      if (!rows.length) {
        setMessage('لم يتم العثور على أي نتائج مطابقة.');
      }
    } catch (error) {
      setMessage(error.message || 'تعذر جلب سجلات المرضى.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submit = (event) => {
    event.preventDefault();
    load(search);
  };

  const handleClear = () => {
    setSearch('');
    load('');
  };

  const openPatient = (id) => {
    navigate(`/patient-profile/${id}`);
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[#F8FAFC] p-3 text-slate-800 sm:p-5 md:p-8"
      dir="rtl"
    >
      <div className="mx-auto w-full max-w-7xl space-y-4 sm:space-y-5 md:space-y-7">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-sky-200/50 blur-3xl sm:h-64 sm:w-64"
          />

          <motion.div
            animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.45, 0.2] }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-cyan-200/40 blur-3xl sm:h-64 sm:w-64"
          />

          <div className="relative z-10 flex flex-col gap-4 sm:gap-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-800 sm:gap-2 sm:px-3 sm:text-xs">
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                <span>قاعدة السجلات الطبية</span>
              </div>

              <h1 className="mt-2 text-xl font-black leading-tight text-slate-900 sm:text-2xl md:text-3xl">
                دليل وسجلات المرضى
              </h1>

              <p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-500 sm:text-xs md:text-sm">
                استعلام فوري عن السجلات الطبية والوصول السريع للملف الشامل
              </p>
            </div>

            <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2.5 text-[11px] font-bold text-sky-900 sm:w-auto sm:justify-start sm:rounded-2xl sm:px-4 sm:text-xs">
              <Users className="h-4 w-4 shrink-0 text-sky-600" />
              <span>إجمالي السجلات: {patients.length}</span>
            </div>
          </div>
        </motion.header>

        {/* Search */}
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={submit}
          className="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm sm:rounded-3xl sm:p-4"
        >
          <div className="flex flex-col gap-2.5 sm:gap-3 md:flex-row md:items-center">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute right-3.5 top-3.5 h-4.5 w-4.5 text-sky-700/50 sm:right-4 sm:h-5 sm:w-5" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث بالاسم، رقم الهاتف، أو الرقم القومي..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pr-10 pl-9 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100 sm:h-12 sm:rounded-2xl sm:pr-12 sm:text-sm"
              />

              {search && (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="مسح البحث"
                  className="absolute left-2.5 top-3 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 sm:left-3.5 sm:top-3.5"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 text-xs font-bold text-white shadow-sm transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:rounded-2xl sm:text-sm md:w-auto md:min-w-[120px]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              <span>بحث</span>
            </motion.button>
          </div>
        </motion.form>

        {/* Results */}
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm sm:rounded-3xl"
        >
          {/* Section header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-3 py-3 sm:px-5 sm:py-4">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700 sm:h-9 sm:w-9 sm:rounded-xl">
                <FileText className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-xs font-black text-slate-900 sm:text-sm">
                  سجلات المرضى
                </h2>
                <p className="text-[9px] text-slate-400 sm:text-[10px]">
                  اضغط على اسم المريض لفتح الملف
                </p>
              </div>
            </div>

            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-500 sm:text-[10px]">
              {patients.length} سجل
            </span>
          </div>

          {/* Desktop / Tablet table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] table-fixed text-right">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-600 lg:text-xs">
                <tr>
                  <th className="w-[32%] px-4 py-3.5 lg:px-6">اسم المريض</th>
                  <th className="w-[22%] px-4 py-3.5 lg:px-6">رقم الهاتف</th>
                  <th className="w-[25%] px-4 py-3.5 lg:px-6">الفرع / العيادة</th>
                  <th className="w-[21%] px-4 py-3.5 lg:px-6">أضيف بواسطة</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-sm">
                <AnimatePresence mode="popLayout">
                  {patients.length > 0 ? (
                    patients.map((patient) => (
                      <motion.tr
                        key={patient._id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="group transition-colors hover:bg-sky-50/40"
                      >
                        <td className="px-4 py-3.5 lg:px-6">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 font-bold text-sky-700 transition group-hover:bg-sky-100">
                              <User className="h-4 w-4" />
                            </div>

                            <button
                              type="button"
                              onClick={() => openPatient(patient._id)}
                              className="flex min-w-0 items-center gap-1.5 text-right font-bold text-slate-900 transition-colors hover:text-sky-700"
                            >
                              <span className="truncate">{patient.fullName}</span>
                              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-70" />
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3.5 lg:px-6">
                          <span
                            className="inline-flex items-center gap-1.5 text-xs text-slate-600"
                            dir="ltr"
                          >
                            <Phone className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                            {patient.phone || '—'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 lg:px-6">
                          <span className="inline-flex max-w-full items-center gap-1.5 text-xs text-slate-600">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                            <span className="truncate">{patient.clinic?.name || '—'}</span>
                          </span>
                        </td>

                        <td className="px-4 py-3.5 lg:px-6">
                          <span className="inline-flex max-w-full items-center gap-1.5 text-xs text-slate-500">
                            <UserCheck className="h-3.5 w-3.5 shrink-0 text-sky-600" />
                            <span className="truncate">
                              {patient.createdBy?.name || 'سجل قديم'}
                            </span>
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-14 text-center text-sm text-slate-400">
                        {loading
                          ? 'جارٍ البحث في السجلات...'
                          : message || 'لا توجد بيانات متاحة.'}
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="block md:hidden">
            <div className="border-b border-slate-100 bg-slate-50/60 px-3 py-2 text-center text-[9px] font-medium text-sky-700 sm:text-[10px]">
              اضغط على اسم المريض لعرض الملف الطبي
            </div>

            <div className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <motion.article
                      key={patient._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-3 transition-colors active:bg-sky-50/50 sm:p-4"
                    >
                      {/* Patient name */}
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700 sm:h-11 sm:w-11 sm:rounded-2xl">
                          <User className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                        </div>

                        <button
                          type="button"
                          onClick={() => openPatient(patient._id)}
                          className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl text-right"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-black text-slate-900 sm:text-sm">
                              {patient.fullName || 'بدون اسم'}
                            </p>
                            <p className="mt-0.5 text-[9px] text-slate-400 sm:text-[10px]">
                              عرض الملف الطبي
                            </p>
                          </div>

                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </span>
                        </button>
                      </div>

                      {/* Patient information - صف واحد مقسم إلى 3 أعمدة */}
                      <div className="mt-2.5 grid grid-cols-3 gap-1.5 border-t border-slate-100 pt-2.5">
                        {/* رقم الهاتف */}
                        <div className="flex min-w-0 flex-col rounded-xl border border-slate-100 bg-slate-50/70 p-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-[8px] font-bold text-slate-400">
                            <Phone className="h-3 w-3 shrink-0 text-sky-600" />
                            <span>الهاتف</span>
                          </div>
                          <p
                            className="mt-0.5 truncate text-[10px] font-semibold text-slate-700"
                            dir="ltr"
                          >
                            {patient.phone || '—'}
                          </p>
                        </div>

                        {/* الفرع / العيادة */}
                        <div className="flex min-w-0 flex-col rounded-xl border border-slate-100 bg-slate-50/70 p-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-[8px] font-bold text-slate-400">
                            <Building2 className="h-3 w-3 shrink-0 text-sky-600" />
                            <span>العيادة</span>
                          </div>
                          <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-700">
                            {patient.clinic?.name || '—'}
                          </p>
                        </div>

                        {/* أضيف بواسطة */}
                        <div className="flex min-w-0 flex-col rounded-xl border border-slate-100 bg-slate-50/70 p-2 text-center">
                          <div className="flex items-center justify-center gap-1 text-[8px] font-bold text-slate-400">
                            <UserCheck className="h-3 w-3 shrink-0 text-sky-600" />
                            <span>المسؤول</span>
                          </div>
                          <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-700">
                            {patient.createdBy?.name || 'سجل قديم'}
                          </p>
                        </div>
                      </div>
                    </motion.article>
                  ))
                ) : (
                  <div className="px-4 py-14 text-center text-xs text-slate-400 sm:text-sm">
                    {loading
                      ? 'جارٍ البحث في السجلات...'
                      : message || 'لا توجد بيانات متاحة.'}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}