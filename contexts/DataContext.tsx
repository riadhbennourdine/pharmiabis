
import React, { createContext, useContext } from 'react';
import { PharmIaData, MemoFiche } from '../types';

export interface DataContextType {
  data: PharmIaData | null;
  loading: boolean;
  error: string | null;
  getMemoFicheById: (id: string) => MemoFiche | undefined;
  addMemoFiche: (fiche: MemoFiche) => Promise<void>;
  deleteMemoFiche: (id: string) => Promise<void>;
}

export const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};