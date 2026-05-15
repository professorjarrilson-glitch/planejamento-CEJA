import React from 'react';
import { Project } from '../types';
import { Download, BookOpen, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-[#F57C00]/10 overflow-hidden hover:shadow-md transition-all group"
    >
      <div className="p-6">
        <div className="w-12 h-12 bg-[#F57C00]/10 rounded-xl flex items-center justify-center text-[#F57C00] mb-4 group-hover:scale-110 transition-transform">
          <BookOpen size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2 truncate">{project.title}</h3>
        <p className="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed">
          {project.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex gap-2">
            {onEdit && (
               <button onClick={() => onEdit(project)} className="text-xs font-semibold text-slate-400 hover:text-[#1565C0] transition-colors">Editar</button>
            )}
            {onDelete && (
               <button onClick={() => onDelete(project.id!)} className="text-xs font-semibold text-slate-400 hover:text-red-500 transition-colors">Excluir</button>
            )}
          </div>
          
          {project.pdfUrl ? (
            <a 
              href={project.pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#F57C00] hover:bg-[#E65100] text-white text-xs font-bold rounded-xl transition-all"
            >
              <Download size={14} />
              Baixar PDF
            </a>
          ) : (
             <span className="text-xs text-slate-400 italic">Sem anexo</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
