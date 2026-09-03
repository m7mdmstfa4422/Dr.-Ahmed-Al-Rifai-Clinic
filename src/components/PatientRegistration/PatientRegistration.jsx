import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  User,
  Calendar,
  Phone,
  Globe2,
  CreditCard,
  Building2,
  FileText,
  Check,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { api } from '../../api';

// --- أنماط التحقق (Regular Expressions) ---
const REGEX = {
  // اسم ثلاثي على الأقل (عربي فقط أو إنجليزي فقط مع مسافات فاصلة)
  NAME: /^([\u0621-\u064A]{2,}\s+[\u0621-\u064A]{2,}\s+[\u0621-\u064A]{2,}(\s+[\u0621-\u064A]{2,})*|[a-zA-Z]{2,}\s+[a-zA-Z]{2,}\s+[a-zA-Z]{2,}(\s+[a-zA-Z]{2,})*)$/,
  // الرقم القومي: 14 رقم بالضبط
  NATIONAL_ID: /^[0-9]{14}$/,
  // رقم هاتف يدعم الأرقام الدولية والمحلية
  INTERNATIONAL_PHONE: /^(\+|00)?[0-9\s\-()]{7,20}$/
};

// النموذج خالي تماماً من أي حقول زيارات أو رسوم
const initialForm = {
  fullName: '',
  age: '',
  gender: 'ذكر',
  nationality: 'مصري',
  nationalId: '',
  phone: '',
  clinic: '',
  medicalNotes: ''
};

// Custom Toast Hook لإدارة التنبيهات
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

const inputClass = (hasError) =>
  `w-full text-sm px-3.5 py-3 bg-slate-50/60 border ${hasError ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-100' : 'border-slate-200 focus:border-sky-600 focus:ring-sky-100'
  } rounded-2xl text-slate-800 placeholder-slate-400 outline-none transition-all focus:bg-white focus:ring-2`;

export default function PatientRegistration() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    api('/clinics')
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setClinics(list);
        if (list.length > 0) {
          setForm((prev) => ({ ...prev, clinic: prev.clinic || list[0]._id }));
        }
      })
      .catch(() => showToast('تعذر تحميل قائمة العيادات. تأكد من تشغيل الخادم.', 'error'));
  }, [showToast]);

  const validateField = (name, value) => {
    let error = '';
    const trimmed = typeof value === 'string' ? value.trim() : value;

    switch (name) {
      case 'fullName':
        if (!trimmed) {
          error = 'اسم المريض مطلوب';
        } else if (!REGEX.NAME.test(trimmed)) {
          error = 'يجب إدخال اسم ثلاثي صحيح (عربي فقط أو إنجليزي فقط)';
        }
        break;

      case 'age': {
        const ageNum = Number(value);
        if (!value || isNaN(ageNum)) {
          error = 'العمر مطلوب';
        } else if (ageNum < 0 || ageNum >= 100) {
          error = 'يجب أن يكون العمر أقل من 100 سنة وأكبر من 0';
        }
        break;
      }

      case 'nationalId':
        if (trimmed && !REGEX.NATIONAL_ID.test(trimmed)) {
          error = 'الرقم القومي يجب أن يتكون من 14 رقم بالضبط';
        }
        break;

      case 'phone':
        if (!trimmed) {
          error = 'رقم الهاتف مطلوب';
        } else if (!REGEX.INTERNATIONAL_PHONE.test(trimmed)) {
          error = 'رقم الهاتف غير صالح (يدعم الأرقام الدولية والمحلية)';
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const update = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    validateField(name, value);
  };

  const submit = async (event) => {
    event.preventDefault();

    const isNameValid = validateField('fullName', form.fullName);
    const isAgeValid = validateField('age', form.age);
    const isPhoneValid = validateField('phone', form.phone);
    const isNationalIdValid = validateField('nationalId', form.nationalId);

    if (!isNameValid || !isAgeValid || !isPhoneValid || !isNationalIdValid) {
      showToast('يرجى مراجعة وتصحيح الحقول المميزة باللون الأحمر', 'error');
      return;
    }

    setLoading(true);
    try {
      // إرسال بيانات ملف المريض فقط دون أي زيارات
      await api('/patients', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          age: Number(form.age),
          gender: form.gender,
          nationality: form.nationality.trim(),
          nationalId: form.nationalId.trim() || undefined,
          phone: form.phone.trim(),
          clinic: form.clinic || undefined,
          medicalNotes: form.medicalNotes.trim() || ''
        })
      });

      setForm({ ...initialForm, clinic: clinics[0]?._id || '' });
      setErrors({});
      showToast('✨ تم تسجيل ملف المريض بنجاح في قاعدة البيانات');
    } catch (error) {
      if (error.field === 'nationalId') setErrors((prev) => ({ ...prev, nationalId: error.message }));
      showToast(error.message || 'تعذر حفظ البيانات. تأكد من تشغيل الخادم.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 text-slate-800 md:p-8" dir="rtl">
      <ToastContainer />

      <div className="mx-auto max-w-5xl space-y-8">
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
                <span>تسجيل السجلات الطبية</span>
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
                إضافة ملف مريض جديد
              </h1>

              <p className="mt-1.5 max-w-xl text-xs text-sky-100/90 md:text-sm">
                تسجيل البيانات الشخصية والطبية للمريض فقط دون فتح زيارة كشف
              </p>
            </div>
          </div>
        </motion.header>

        {/* Registration Form */}
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={submit}
          className="rounded-3xl border border-sky-100 bg-white p-6 shadow-sm space-y-8 md:p-8"
        >
          {/* Personal Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-900 font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
                <User className="h-4 w-4" />
              </div>
              <span>البيانات الشخصية والأساسية</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="اسم المريض ثلاثي" icon={User} error={errors.fullName}>
                <input
                  required
                  name="fullName"
                  value={form.fullName}
                  onChange={update}
                  onBlur={handleBlur}
                  placeholder="مثال: أحمد محمد عبد الرحمن"
                  className={inputClass(!!errors.fullName)}
                />
              </Field>

              <Field label="العمر" icon={Calendar} error={errors.age}>
                <input
                  required
                  name="age"
                  value={form.age}
                  onChange={update}
                  onBlur={handleBlur}
                  type="number"
                  min="0"
                  max="99"
                  placeholder="مثال: 32"
                  className={inputClass(!!errors.age)}
                />
              </Field>

              <Field label="الجنس" icon={User}>
                <div className="relative">
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={update}
                    className={`${inputClass(false)} appearance-none pr-3.5 pl-10`}
                  >
                    <option value="ذكر">ذكر</option>
                    <option value="أنثى">أنثى</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </Field>

              <Field label="الجنسية" icon={Globe2}>
                <input
                  required
                  name="nationality"
                  value={form.nationality}
                  onChange={update}
                  placeholder="مثال: مصري، سعودي..."
                  className={inputClass(false)}
                />
              </Field>

              <Field label="الرقم القومي (14 رقم)" icon={CreditCard} error={errors.nationalId}>
                <input
                  name="nationalId"
                  value={form.nationalId}
                  onChange={update}
                  onBlur={handleBlur}
                  placeholder="14 رقم قومي (اختياري)"
                  maxLength={14}
                  className={inputClass(!!errors.nationalId)}
                />
              </Field>

              <Field label="العيادة التابع لها المريض" icon={Building2}>
                <div className="relative">
                  <select
                    name="clinic"
                    value={form.clinic}
                    onChange={update}
                    className={`${inputClass(false)} appearance-none pr-3.5 pl-10`}
                  >
                    <option value="">اختر العيادة (اختياري)...</option>
                    {clinics.map((clinic) => (
                      <option key={clinic._id} value={clinic._id}>
                        {clinic.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                </div>
              </Field>
            </div>
          </section>

          {/* Contact Information */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-900 font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
                <Phone className="h-4 w-4" />
              </div>
              <span>بيانات التواصل والاتصال</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="رقم الهاتف" icon={Phone} error={errors.phone}>
                <input
                  required
                  name="phone"
                  value={form.phone}
                  onChange={update}
                  onBlur={handleBlur}
                  type="tel"
                  placeholder="+201xxxxxxxxx / 01xxxxxxxxx"
                  className={inputClass(!!errors.phone)}
                  dir="ltr"
                />
              </Field>
            </div>
          </section>

          {/* Medical Notes */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 text-slate-900 font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-700 border border-sky-100">
                <FileText className="h-4 w-4" />
              </div>
              <span>الملاحظات الطبية والتاريخ المرضي</span>
            </div>

            <div>
              <Field label="الملاحظات الطبية الأولية (حساسية، أمراض مزمنة)">
                <textarea
                  name="medicalNotes"
                  value={form.medicalNotes}
                  onChange={update}
                  rows={3}
                  placeholder="اكتب هنا أي تفاصيل أو أمراض مزمنة تخص ملف المريض..."
                  className={inputClass(false)}
                />
              </Field>
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-900/15 transition-all hover:brightness-105 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              <span>حفظ ملف المريض فقط</span>
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, error, children }) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        {Icon && <Icon className="h-3.5 w-3.5 text-sky-600" />}
        <span>{label}</span>
      </label>
      {children}
      {error && (
        <p className="text-[11px] font-medium text-rose-500 animate-in fade-in">
          {error}
        </p>
      )}
    </div>
  );
}