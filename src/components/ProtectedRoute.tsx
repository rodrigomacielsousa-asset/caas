import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { planService, UserPlan } from '../services/planService';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  adminOnly?: boolean;
  requiredModule?: string;
}

export default function ProtectedRoute({ children, adminOnly = false, requiredModule }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const userPlan = await planService.getUserPlan(u.uid);
        setPlan(userPlan);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // If user is not logged in, redirect to login with the current path as redirect param
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname.substring(1))}`} replace />;
  }

  if (adminOnly && user.email !== 'rodrigomaciel.sousa@gmail.com') {
    return <Navigate to="/dashboard" replace />;
  }

  // Paywall check
  if (requiredModule && plan) {
    const hasAccess = planService.checkAccess(plan, requiredModule);
    if (!hasAccess) {
      // Redirect to checkout or dashboard if no access
      return <Navigate to="/dashboard?paywall=true" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
