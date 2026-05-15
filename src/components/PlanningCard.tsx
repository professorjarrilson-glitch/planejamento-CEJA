import React from 'react';
import { Planning } from '../types';
import { Download, Edit2, Calendar, BookOpen, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { generatePDF } from '../lib/pdf';
import { motion } from 'motion/react';

interface PlanningCardProps {
  planning: Planning;
  onEdit?: (planning: Planning) => void;
  onDelete?: (id: string) => void;
  showProfessor?: boolean;
}

const PlanningCard: React.FC<PlanningCardProps> = ({ planning, onEdit, onDelete, showProfessor }) => {
  const handleDownload = () => {
    generatePDF(`planning-content-${planning.id}`, `Planejamento_${planning.professorName}_${planning.date}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all overflow-hidden group border-l-4 border-brand-orange"
    >
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold bg-brand-orange/10 text-brand-orange uppercase tracking-widest mb-3">
              {planning.subject}
            </span>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight leading-tight">{planning.className}</h3>
            {showProfessor && (
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">{planning.professorName}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="bg-slate-50 p-2 rounded-xl text-slate-400">
              <Calendar size={18} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">
              {format(new Date(planning.date), "dd MMM", { locale: ptBR })}
            </span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed font-medium">{planning.content}</p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
          <div className="flex gap-1">
            {onDelete && (
              <button 
                onClick={() => onDelete(planning.id!)}
                className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                title="Excluir"
              >
                <Trash2 size={18} />
              </button>
            )}
            {onEdit && (
              <button 
                onClick={() => onEdit(planning)}
                className="p-2.5 text-slate-300 hover:text-brand-blue hover:bg-brand-blue/5 rounded-xl transition-all"
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
            )}
          </div>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue hover:brightness-110 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-brand-blue/20 uppercase tracking-widest"
          >
            <Download size={14} />
            PDF
          </button>
        </div>
      </div>

      {/* Hidden printable content */}
      <div id={`planning-content-${planning.id}`} className="hidden print:block p-10 bg-white min-h-[297mm] w-[210mm]">
        <div className="border-4 border-[#F57C00] p-8 h-full">
          <div className="flex justify-between items-center border-b-2 border-[#F57C00] pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-black text-[#F57C00]">CEJAMPM</h1>
              <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">Planejamento Pedagógico</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-800">{format(new Date(planning.date), "dd/MM/yyyy")}</p>
              <p className="text-sm text-slate-500">{planning.className}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-xs font-black text-[#F57C00] uppercase mb-1">Professor(a)</p>
              <p className="text-xl font-bold text-slate-800">{planning.professorName}</p>
            </div>
            <div>
              <p className="text-xs font-black text-[#F57C00] uppercase mb-1">Disciplina</p>
              <p className="text-xl font-bold text-slate-800">{planning.subject}</p>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h4 className="text-sm font-black text-white bg-[#F57C00] px-3 py-1 inline-block uppercase mb-3">Conteúdo / Objetivos</h4>
              <p className="text-[#141414] leading-relaxed whitespace-pre-wrap">{planning.content}</p>
            </section>

            <section>
              <h4 className="text-sm font-black text-white bg-[#F57C00] px-3 py-1 inline-block uppercase mb-3">Metodologia</h4>
              <p className="text-[#141414] leading-relaxed whitespace-pre-wrap">{planning.methodology}</p>
            </section>

            <section>
              <h4 className="text-sm font-black text-white bg-[#F57C00] px-3 py-1 inline-block uppercase mb-3">Recursos Didáticos</h4>
              <p className="text-[#141414] leading-relaxed whitespace-pre-wrap">{planning.resources}</p>
            </section>

            <section>
              <h4 className="text-sm font-black text-white bg-[#F57C00] px-3 py-1 inline-block uppercase mb-3">Avaliação</h4>
              <p className="text-[#141414] leading-relaxed whitespace-pre-wrap">{planning.evaluation}</p>
            </section>

            {planning.observations && (
              <section>
                <h4 className="text-sm font-black text-white bg-[#F57C00] px-3 py-1 inline-block uppercase mb-3">Observações</h4>
                <p className="text-[#141414] leading-relaxed whitespace-pre-wrap">{planning.observations}</p>
              </section>
            )}
          </div>

          <div className="mt-20 pt-10 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 italic">
            <p>Gerado automaticamente pelo Sistema Planejamento CEJAMPM</p>
            <p>Página 1 de 1</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlanningCard;
