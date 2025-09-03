
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { PharmIaData, MemoFiche } from './types';
import HomePage from './pages/HomePage';
import FichesPage from './pages/FichesPage';
import DetailPage from './pages/DetailPage';
import GeneratorPage from './pages/GeneratorPage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { INITIAL_DATA } from './data/initialData';
import { getAllData, addMemoFicheToServer, deleteMemoFicheFromServer } from './services/apiService';
import { DataContext } from './contexts/DataContext';

interface AuthContextType {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('token'));

  const login = (token: string) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const CACHE_KEY = 'pharmIaData';

const App: React.FC = () => {
  const [data, setData] = useState<PharmIaData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const serverData = await getAllData();
            setData(serverData);
            localStorage.setItem(CACHE_KEY, JSON.stringify(serverData));
        } catch (e) {
            console.warn("Could not connect to server, trying local cache.", e);
            setError("Connexion au serveur échouée. Affichage des données locales.");
            try {
                const cachedData = localStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    setData(JSON.parse(cachedData));
                } else {
                    setData(INITIAL_DATA);
                    setError("Connexion au serveur échouée. Aucune donnée locale trouvée. Affichage des données par défaut.");
                }
            } catch (cacheError) {
                console.error("Failed to load data from cache", cacheError);
                setData(INITIAL_DATA); // fallback
                setError("Erreur critique lors du chargement des données.");
            }
        } finally {
            setLoading(false);
        }
    };

    loadData();
  }, []);

  const addMemoFiche = async (newFiche: MemoFiche) => {
    try {
        // Optimistic UI update
        setData(prevData => {
            const currentData = prevData || INITIAL_DATA;

            const newThemes = [...currentData.themes];
            if (!newThemes.some(t => t.id === newFiche.theme.id)) {
                newThemes.push(newFiche.theme);
            }

            const newSystems = [...currentData.systemesOrganes];
            if (!newSystems.some(s => s.id === newFiche.systeme_organe.id)) {
                newSystems.push(newFiche.systeme_organe);
            }
            
            const newMemoFiches = [newFiche, ...currentData.memofiches];

            const newData: PharmIaData = {
                themes: newThemes,
                systemesOrganes: newSystems,
                memofiches: newMemoFiches,
            };

            localStorage.setItem(CACHE_KEY, JSON.stringify(newData));
            return newData;
        });
        
        // Sync with server
        await addMemoFicheToServer(newFiche);

    } catch (error) {
        console.error("Failed to save MemoFiche to server:", error);
        setError("La sauvegarde sur le serveur a échoué. Vos modifications sont enregistrées localement.");
        // The optimistic update is kept, but an error is shown.
    }
  };
  
  const deleteMemoFiche = async (id: string) => {
    const originalData = data;
    // Optimistic UI update
    setData(prevData => {
        if (!prevData) return null;
        const newMemoFiches = prevData.memofiches.filter(mf => mf.id !== id);
        const newData = { ...prevData, memofiches: newMemoFiches };
        localStorage.setItem(CACHE_KEY, JSON.stringify(newData));
        return newData;
    });
    
    // Sync with server
    try {
        await deleteMemoFicheFromServer(id);
    } catch (error) {
        console.error("Failed to delete MemoFiche from server:", error);
        setError("La suppression sur le serveur a échoué. La modification est annulée.");
        // Revert UI change if server call fails
        setData(originalData);
        if (originalData) {
          localStorage.setItem(CACHE_KEY, JSON.stringify(originalData));
        }
    }
  };

  const getMemoFicheById = (id: string): MemoFiche | undefined => {
    return data?.memofiches.find(mf => mf.id === id);
  };

  const MemoFicheDetailWrapper = () => {
    const { id } = useParams<{ id: string }>();
    if (!id) return <div className="text-center text-red-500 p-8">ID de mémofiche manquant.</div>;
    const memoFiche = getMemoFicheById(id);
    if (loading && !data) return <div className="mt-20"><LoadingSpinner /></div>;
    if (!memoFiche) return <div className="text-center text-red-500 p-8">Mémofiche non trouvée.</div>;
    return <DetailPage memoFiche={memoFiche} />;
  };

  return (
    <DataContext.Provider value={{ data, loading, error, getMemoFicheById, addMemoFiche, deleteMemoFiche }}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
            <Header />
            <main>
               {error && (
                  <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 container mx-auto my-4 rounded-md">
                      <p className="font-bold">Avertissement</p>
                      <p>{error}</p>
                  </div>
              )}
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/fiches" element={<FichesPage />} />
                <Route path="/fiches/:id" element={<MemoFicheDetailWrapper />} />
                <Route path="/generateur" element={<GeneratorPage />} />
                <Route path="/connexion" element={<LoginPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </DataContext.Provider>
  );
};

export default App;