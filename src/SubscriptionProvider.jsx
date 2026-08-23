/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';
import { AuthContext } from './AuthProvider';

export const SubscriptionContext = createContext();
export default function SubscriptionProvider({ children }) {
  const { isAuthenticated } = useContext(AuthContext); const [subscription, setSubscription] = useState(null);
  const refresh = async () => { if (!isAuthenticated) return setSubscription(null); try { setSubscription(await api('/subscription')); } catch { setSubscription({ active: false }); } };
  useEffect(() => { refresh(); }, [isAuthenticated]);
  return <SubscriptionContext.Provider value={{ subscription, refresh }}>{children}</SubscriptionContext.Provider>;
}
