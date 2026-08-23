/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useMemo } from 'react';

export const AuthContext = createContext(null);

const STORAGE_KEYS = {
  TOKEN: 'clinicToken',
  ADMIN: 'clinicAdmin',
};

// دالة مساعدة لقراءة البيانات الأولية بأمان
function getStoredAuth() {
  try {
    const rawAdmin = localStorage.getItem(STORAGE_KEYS.ADMIN) || sessionStorage.getItem(STORAGE_KEYS.ADMIN);
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || sessionStorage.getItem(STORAGE_KEYS.TOKEN);
    const admin = rawAdmin ? JSON.parse(rawAdmin) : null;
    return { admin, token };
  } catch (error) {
    console.error('فشل قراءة بيانات الجلسة:', error);
    return { admin: null, token: null };
  }
}

export default function AuthProvider({ children }) {
  const [{ admin, token }, setAuthState] = useState(getStoredAuth);

  // تسجيل الدخول مع خيار التذكر
  const login = useCallback(({ token: newToken, admin: newUser, remember = true }) => {
    try {
      // تنظيف أي بيانات سابقة من التخزينين لعدم حدوث تضارب
      [localStorage, sessionStorage].forEach((store) => {
        store.removeItem(STORAGE_KEYS.TOKEN);
        store.removeItem(STORAGE_KEYS.ADMIN);
      });

      const targetStore = remember ? localStorage : sessionStorage;
      if (newToken) targetStore.setItem(STORAGE_KEYS.TOKEN, newToken);
      if (newUser) targetStore.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(newUser));

      setAuthState({ admin: newUser, token: newToken });
    } catch (error) {
      console.error('تعذر حفظ بيانات الجلسة:', error);
    }
  }, []);

  // تسجيل الخروج وتنظيف التخزين
  const logout = useCallback(() => {
    try {
      [localStorage, sessionStorage].forEach((store) => {
        store.removeItem(STORAGE_KEYS.TOKEN);
        store.removeItem(STORAGE_KEYS.ADMIN);
      });
    } catch (error) {
      console.error('خطأ أثناء تسجيل الخروج:', error);
    } finally {
      setAuthState({ admin: null, token: null });
    }
  }, []);

  // تحديث بيانات المشرف النشط محلياً
  const updateAdmin = useCallback((updatedFields) => {
    setAuthState((prev) => {
      if (!prev.admin) return prev;
      const updatedAdmin = { ...prev.admin, ...updatedFields };

      try {
        const store = localStorage.getItem(STORAGE_KEYS.ADMIN) ? localStorage : sessionStorage;
        store.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(updatedAdmin));
      } catch (error) {
        console.error('تعذر تحديث بيانات المشرف في التخزين:', error);
      }

      return { ...prev, admin: updatedAdmin };
    });
  }, []);

  // تجهيز كائن القيمة مع الحفاظ على الأداء
  const value = useMemo(() => ({
    admin,
    token,
    isAuthenticated: Boolean(admin && token),
    isSuperAdmin: admin?.username === 'drahmed',
    login,
    logout,
    updateAdmin,
  }), [admin, token, login, logout, updateAdmin]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook مخصص للاستخدام السريع
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('يجب استخدام useAuth داخل نطاق AuthProvider');
  }
  return context;
}