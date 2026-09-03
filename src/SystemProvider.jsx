/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthProvider';
import { api } from './api';
export const SystemContext = createContext({ clinicName: 'DocPoint' });
export default function SystemProvider({ children }) { const { isAuthenticated } = useContext(AuthContext); const [system, setSystem] = useState({ clinicName: 'DocPoint' }); const refresh = async () => { if (isAuthenticated) try { setSystem(await api('/system')); } catch { /* الاسم الافتراضي كافٍ عند تعذر التحميل */ } }; useEffect(() => { refresh(); }, [isAuthenticated]); return <SystemContext.Provider value={{ ...system, refresh }}>{children}</SystemContext.Provider>; }
