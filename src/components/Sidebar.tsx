import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  BookOpen, 
  FileText, 
  FolderRoot, 
  LayoutDashboard, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  History
} from 'lucide-react';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { profile, isAdmin } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = isAdmin 
    ? [
        { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
        { id: 'plannings', label: 'Planejamentos', icon: FileText },
        { id: 'projects', label: 'Projetos', icon: FolderRoot },
        { id: 'users', label: 'Usuários', icon: Users },
      ]
    : [
        { id: 'new', label: 'Novo Planejamento', icon: PlusCircle },
        { id: 'history', label: 'Histórico', icon: History },
        { id: 'view-projects', label: 'Projetos', icon: BookOpen },
      ];

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 z-30"
    >
      <div className="p-8 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <img src="/logo_ceja.png" alt="Logo CEJA" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">CEJAMPM</span>
          </motion.div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {!isCollapsed && (
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-3 mt-4">Menu Principal</p>
        )}
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative font-medium",
              activeTab === item.id 
                ? "sidebar-item-active" 
                : "text-slate-500 hover:bg-slate-50 transition-colors"
            )}
          >
            <item.icon size={20} className={cn(activeTab === item.id ? "text-brand-orange" : "text-slate-400 group-hover:text-slate-600")} />
            {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-50">
        {!isCollapsed && (
          <div className="mb-4 bg-slate-50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xs">
              {profile?.name?.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{profile?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{profile?.email}</p>
            </div>
          </div>
        )}
        <button 
          onClick={() => auth.signOut()}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors font-medium",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut size={20} />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
