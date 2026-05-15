import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, orderBy, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Planning, Project, User } from '../types';
import { cn } from '../lib/utils';
import Sidebar from '../components/Sidebar';
import PlanningCard from '../components/PlanningCard';
import ProjectCard from '../components/ProjectCard';
import { 
  Loader2, 
  Users, 
  FileText, 
  FolderRoot, 
  TrendingUp,
  Search,
  Plus,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Project Form State
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectData, setProjectData] = useState({ title: '', description: '', pdfUrl: '' });
  const [savingProject, setSavingProject] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const planningsSnap = await getDocs(query(collection(db, 'plannings'), orderBy('date', 'desc')));
      const projectsSnap = await getDocs(query(collection(db, 'projects'), orderBy('createdAt', 'desc')));
      const usersSnap = await getDocs(collection(db, 'users'));

      setPlannings(planningsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      setProjects(projectsSnap.docs.map(d => ({ id: d.id, ...d.data() } as any)));
      setUsers(usersSnap.docs.map(d => ({ ...d.data() } as User)));
    } catch (error) {
      console.error("Error fetching admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProject(true);
    try {
      const data = {
        ...projectData,
        updatedAt: serverTimestamp(),
      };

      if (editingProject?.id) {
        await updateDoc(doc(db, 'projects', editingProject.id), data);
      } else {
        await addDoc(collection(db, 'projects'), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      setShowProjectForm(false);
      setEditingProject(null);
      setProjectData({ title: '', description: '', pdfUrl: '' });
      fetchData();
    } catch (error) {
      console.error("Error saving project", error);
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Excluir este projeto?')) {
      await deleteDoc(doc(db, 'projects', id));
      fetchData();
    }
  };

  const stats = [
    { label: 'Total de Planejamentos', value: plannings.length, icon: FileText, color: 'bg-orange-500' },
    { label: 'Professores Ativos', value: users.filter(u => u.role === 'professor').length, icon: Users, color: 'bg-blue-600' },
    { label: 'Projetos Cadastrados', value: projects.length, icon: FolderRoot, color: 'bg-green-500' },
    { label: 'Disciplinas Atendidas', value: new Set(plannings.map(p => p.subject)).size, icon: TrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="h-24 bg-white border-b border-slate-100 px-8 flex items-center justify-between sticky top-0 z-20 -mx-8 -mt-8 mb-8">
          <div className="flex items-center gap-4">
            <img src="/logo_ceja.png" alt="Logo CEJA" className="w-16 h-16 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Administração</h1>
              <p className="text-sm text-slate-500">Gestão centralizada do CEJAMPM</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {activeTab !== 'dashboard' && (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-100 border-none rounded-lg py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-brand-orange outline-none transition-all"
                />
              </div>
            )}
            {activeTab === 'projects' && (
              <button 
                onClick={() => { setShowProjectForm(true); setEditingProject(null); setProjectData({ title: '', description: '', pdfUrl: '' }); }}
                className="bg-brand-orange text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:brightness-95 transition-all shadow-sm"
              >
                <Plus size={18} />
                Novo Projeto
              </button>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <Loader2 className="animate-spin text-[#F57C00] mb-4" size={48} />
            <p className="text-slate-400 font-medium">Sincronizando dados escolares...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {stats.map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "stat-card",
                      i === 0 ? "border-brand-orange" : 
                      i === 1 ? "border-brand-blue" : 
                      i === 2 ? "border-amber-400" : "border-emerald-400"
                    )}
                  >
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <div className="flex justify-between items-end">
                      <span className="text-3xl font-bold text-slate-800">{stat.value}</span>
                      <stat.icon size={20} className="text-slate-200 mb-1" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'plannings' && (
              <motion.div 
                key="plannings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {plannings
                  .filter(p => p.professorName.toLowerCase().includes(searchTerm.toLowerCase()) || p.subject.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(p => <PlanningCard key={p.id} planning={p} showProfessor />)
                }
              </motion.div>
            )}

            {activeTab === 'projects' && (
              <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-800">Projetos Pedagógicos</h2>
                  <button 
                    onClick={() => { setShowProjectForm(true); setEditingProject(null); setProjectData({ title: '', description: '', pdfUrl: '' }); }}
                    className="bg-[#1565C0] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#0D47A1] transition-all shadow-lg shadow-[#1565C0]/20"
                  >
                    <Plus size={18} />
                    Novo Projeto
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map(p => (
                    <ProjectCard 
                      key={p.id} 
                      project={p} 
                      onEdit={(proj) => { setEditingProject(proj); setProjectData({ title: proj.title, description: proj.description, pdfUrl: proj.pdfUrl || '' }); setShowProjectForm(true); }}
                      onDelete={handleDeleteProject}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#FFFFFF]">
                      <tr className="table-header">
                        <th className="px-8 py-5">Nome</th>
                        <th className="px-8 py-5">E-mail</th>
                        <th className="px-8 py-5">Função</th>
                        <th className="px-8 py-5">Disciplina</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.map(user => (
                        <tr key={user.uid} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-8 py-5 font-semibold text-slate-700">{user.name}</td>
                          <td className="px-8 py-5 text-slate-500 text-sm">{user.email}</td>
                          <td className="px-8 py-5">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                              user.role === 'admin' ? 'bg-red-50 text-red-600' : 'bg-brand-blue/10 text-brand-blue'
                            )}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-slate-500 text-sm">{user.subject || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Floating Project Form Modal */}
        <AnimatePresence>
          {showProjectForm && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
              >
                <div className="bg-[#1565C0] p-6 flex justify-between items-center text-white">
                  <h3 className="text-xl font-bold">{editingProject ? 'Editar Projeto' : 'Novo Projeto Pedagógico'}</h3>
                  <button onClick={() => setShowProjectForm(false)} className="hover:bg-white/10 p-1 rounded-full"><X size={24} /></button>
                </div>
                <form onSubmit={handleSaveProject} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Título do Projeto</label>
                    <input 
                      required
                      value={projectData.title}
                      onChange={e => setProjectData({...projectData, title: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10 transition-all font-medium"
                      placeholder="Ex: Projeto Leitura 2026"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Descrição</label>
                    <textarea 
                      required
                      rows={4}
                      value={projectData.description}
                      onChange={e => setProjectData({...projectData, description: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10 transition-all font-medium resize-none"
                      placeholder="Descreva os objetivos do projeto..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">URL do PDF (Opcional)</label>
                    <input 
                      value={projectData.pdfUrl}
                      onChange={e => setProjectData({...projectData, pdfUrl: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#1565C0] focus:ring-4 focus:ring-[#1565C0]/10 transition-all font-medium"
                      placeholder="Link para o arquivo PDF"
                    />
                  </div>
                  <button 
                    disabled={savingProject}
                    className="w-full bg-[#1565C0] hover:bg-[#0D47A1] text-white font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {savingProject ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {editingProject ? 'Salvar Alterações' : 'Cadastrar Projeto'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
