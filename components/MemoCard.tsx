

import React from 'react';
import { MemoFiche } from '../types';
import { TrashIcon } from './icons';

interface MemoCardProps {
  memofiche: MemoFiche;
  onDelete?: (e: React.MouseEvent, id: string) => void;
}

const MemoCard: React.FC<MemoCardProps> = ({ memofiche, onDelete }) => {
  const { id, title, shortDescription, imageUrl, theme, systeme_organe } = memofiche;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden transition-colors duration-300 flex flex-col h-full border border-gray-200 hover:border-gray-300">
      {onDelete && (
        <button
          onClick={(e) => onDelete(e, id)}
          className="absolute top-2 right-2 z-10 p-2 bg-white/70 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
          aria-label="Supprimer la fiche"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      )}
      <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{shortDescription}</p>
        <div className="flex flex-wrap gap-2 text-xs text-gray-700 mt-auto">
          {theme?.Nom && (
            <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full font-medium">
              {theme.Nom}
            </span>
          )}
          {systeme_organe?.Nom && (
            <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full font-medium">
              {systeme_organe.Nom}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoCard;