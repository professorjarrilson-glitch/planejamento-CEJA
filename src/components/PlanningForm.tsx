import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Planning, Project, OperationType } from '../types';
import { handleFirestoreError } from '../lib/utils';
import { Save, Loader2, BookCopy } from 'lucide-react';
import { motion } from 'motion/react';

interface PlanningFormProps {
  initialData?: Planning;
  onSuccess: () => void;
}

const PlanningForm: React.FC<PlanningFormProps> = ({ initialData, onSuccess }) => {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProjects, setFetchingProjects] = useState(true);

  const [formData, setFormData] = useState({
    subject: initialData?.subject || profile?.subject || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    className: initialData?.className || '',
    content: initialData?.content || '',
    methodology: initialData?.methodology || '',
    resources: initialData?.resources || '',
    evaluation: initialData?.evaluation || '',
    observations: initialData?.observations || '',
    projectId: initialData?.projectId || '',
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const q = query(collection(db, 'projects'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects", error);
      } finally {
        setFetchingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    try {
      const data = {
        ...formData,
        professorId: profile.uid,
        professorName: profile.name,
        updatedAt: serverTimestamp(),
      };

      if (initialData?.id) {
        await updateDoc(doc(db, 'plannings', initialData.id), data);
      } else {
        await addDoc(collection(db, 'plannings'), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      onSuccess();
    } catch (error) {
      handleFirestoreError(error, initialData ? OperationType.UPDATE : OperationType.CREATE, 'plannings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden"
    >
      <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-slate-800 font-bold text-xl tracking-tight">
            {initialData ? 'Editar Planejamento' : 'Novo Planejamento'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">Preencha todos os campos obrigatórios abaixo</p>
        </div>
        <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
          <BookCopy size={20} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Disciplina</label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-orange outline-none transition-all font-medium text-slate-700"
              placeholder="Ex: Matemática"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Data</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-orange outline-none transition-all font-medium text-slate-700"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Turma</label>
            <input
              type="text"
              required
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-orange outline-none transition-all font-medium text-slate-700"
              placeholder="Ex: 9º Ano A"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Vincular a Projeto</label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-orange outline-none transition-all font-medium text-slate-700 appearance-none"
            >
              <option value="">Nenhum projeto selecionado</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Conteúdo / Objetivos</label>
          <textarea
            required
            rows={4}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-orange outline-none transition-all font-medium text-slate-700 resize-none"
            placeholder="Descreva o conteúdo e os objetivos da aula..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Metodologia</label>
          <textarea
            required
            rows={3}
            value={formData.methodology}
            onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-orange outline-none transition-all font-medium text-slate-700 resize-none"
            placeholder="Como a aula será conduzida?"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Recursos Didáticos</label>
            <textarea
              required
              rows={3}
              value={formData.resources}
              onChange={(e) => setFormData({ ...formData, resources: e.target.value })}
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-orange outline-none transition-all font-medium text-slate-700 resize-none"
              placeholder="Livros, slides, vídeos..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Avaliação</label>
            <textarea
              required
              rows={3}
              value={formData.evaluation}
              onChange={(e) => setFormData({ ...formData, evaluation: e.target.value })}
              className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-orange outline-none transition-all font-medium text-slate-700 resize-none"
              placeholder="Como os alunos serão avaliados?"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Observações Adicionais</label>
          <textarea
            rows={2}
            value={formData.observations}
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            className="w-full px-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-brand-orange outline-none transition-all font-medium text-slate-700 resize-none"
            placeholder="Notas adicionais para este planejamento..."
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-orange hover:brightness-110 text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-brand-orange/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
            {initialData ? 'Atualizar Planejamento' : 'Publicar Planejamento'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default PlanningForm;
