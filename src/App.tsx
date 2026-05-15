/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import ProfessorDashboard from './pages/ProfessorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, profile, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#F57C00] animate-spin mb-4" />
        <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Carregando Sistema...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return isAdmin ? <AdminDashboard /> : <ProfessorDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

