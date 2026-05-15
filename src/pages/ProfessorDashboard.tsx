import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Planning, Project } from '../types';
import Sidebar from '../components/Sidebar';
import PlanningForm from '../components/PlanningForm';
import PlanningCard from '../components/PlanningCard';
import ProjectCard from '../components/ProjectCard';
import { Loader2, Plus, LayoutGrid, List as ListIcon, Search, Calendar as CalendarIcon, Filter, History, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ProfessorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('new');
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlanning, setEditingPlanning] = useState<Planning | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPlannings = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'plannings'),
        where('professorId', '==', profile.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Planning));
      setPlannings(data);
    } catch (error) {
      console.error("Error fetching plannings", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') fetchPlannings();
    if (activeTab === 'view-projects') fetchProjects();
  }, [activeTab]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este planejamento?')) {
      try {
        await deleteDoc(doc(db, 'plannings', id));
        setPlannings(plannings.filter(p => p.id !== id));
      } catch (error) {
        console.error("Error deleting planning", error);
      }
    }
  };

  const handleEdit = (planning: Planning) => {
    setEditingPlanning(planning);
    setActiveTab('new');
  };

  const filteredPlannings = plannings.filter(p => 
    p.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.className.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={(tab) => {
        setActiveTab(tab);
        if (tab !== 'new') setEditingPlanning(null);
      }} />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="h-24 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-20 -mx-8 -mt-8 mb-8">
          <div className="flex items-center gap-4">
            <img src="/logo_ceja.png" alt="Logo CEJA" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {activeTab === 'new' ? (editingPlanning ? 'Editar Planejamento' : 'Novo Registro') : 
                 activeTab === 'history' ? 'Histórico' : 
                 'Biblioteca de Projetos'}
              </h1>
              <p className="text-sm text-slate-500">Bem-vindo, Prof. {profile?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {(activeTab === 'history' || activeTab === 'view-projects') && (
              <div className="relative group">
                <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-brand-orange transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-brand-orange outline-none transition-all"
                />
              </div>
            )}
            {activeTab !== 'new' && (
              <button 
                onClick={() => setActiveTab('new')}
                className="bg-brand-orange text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:brightness-95 transition-all shadow-sm"
              >
                <Plus size={18} />
                Novo
              </button>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'new' && (
            <motion.div
              key="new"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl"
            >
              <PlanningForm 
                initialData={editingPlanning || undefined} 
                onSuccess={() => {
                  setEditingPlanning(null);
                  setActiveTab('history');
                }} 
              />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Loader2 className="animate-spin mb-4" size={40} />
                  <p className="font-medium">Carregando seus planejamentos...</p>
                </div>
              ) : filteredPlannings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlannings.map((planning) => (
                    <PlanningCard 
                      key={planning.id} 
                      planning={planning} 
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <History className="text-slate-300" size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Nenhum planejamento encontrado</h3>
                  <p className="text-slate-500 mt-2">Comece criando seu primeiro planejamento acadêmico.</p>
                  <button 
                    onClick={() => setActiveTab('new')}
                    className="mt-6 bg-[#F57C00] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto"
                  >
                    <Plus size={20} />
                    Criar Agora
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'view-projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl">
                  <BookOpen className="text-slate-200 mx-auto mb-4" size={60} />
                  <p className="text-slate-500">Nenhum projeto pedagógico disponível no momento.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ProfessorDashboard;
