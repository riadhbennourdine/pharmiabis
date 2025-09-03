
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { generateSingleMemoFiche } from '../services/geminiService';
import { MemoFiche, Theme, SystemeOrgane } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import MemoCard from '../components/MemoCard';
import { SparklesIcon, CheckCircleIcon } from '../components/icons';

interface CategoryCardProps {
    item: { id: string; Nom: string; description?: string };
    isSelected: boolean;
    onSelect: (id: string) => void;
    disabled: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ item, isSelected, onSelect, disabled }) => (
    <button
        type="button"
        onClick={() => onSelect(item.id)}
        disabled={disabled}
        className={`relative text-left p-4 h-full border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 ${
            isSelected
                ? 'bg-green-50 border-green-500 shadow-md'
                : 'bg-white border-gray-200 hover:border-green-400 hover:shadow-sm'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
        {isSelected && <CheckCircleIcon className="w-6 h-6 text-green-500 absolute top-2 right-2" />}
        <h4 className="font-bold text-gray-800 text-base">{item.Nom}</h4>
        {item.description && (
            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
        )}
    </button>
);


const GeneratorPage: React.FC = () => {
    const { data, addMemoFiche } = useData();
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState('');
    const [generatedFiche, setGeneratedFiche] = useState<MemoFiche | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const [themeSelection, setThemeSelection] = useState('');
    const [systemSelection, setSystemSelection] = useState('');
    const [newThemeName, setNewThemeName] = useState('');
    const [newSystemName, setNewSystemName] = useState('');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const isThemeReady = themeSelection && (themeSelection !== 'CREATE_NEW' || (themeSelection === 'CREATE_NEW' && newThemeName.trim()));
        const isSystemReady = systemSelection && (systemSelection !== 'CREATE_NEW' || (systemSelection === 'CREATE_NEW' && newSystemName.trim()));

        if (!prompt || loading || !isThemeReady || !isSystemReady) return;

        if (!data) {
            setError("Les données de base ne sont pas encore chargées. Veuillez patienter ou rafraîchir la page.");
            return;
        }

        setLoading(true);
        setError(null);
        setGeneratedFiche(null);
        setIsSuccess(false);

        try {
            let themeForApi: Theme;
            if (themeSelection === 'CREATE_NEW') {
                themeForApi = { id: crypto.randomUUID(), Nom: newThemeName.trim() };
            } else {
                themeForApi = data.themes.find(t => t.id === themeSelection)!;
            }

            let systemForApi: SystemeOrgane;
            if (systemSelection === 'CREATE_NEW') {
                systemForApi = { id: crypto.randomUUID(), Nom: newSystemName.trim() };
            } else {
                systemForApi = data.systemesOrganes.find(s => s.id === systemSelection)!;
            }

            const newFiche = await generateSingleMemoFiche(prompt, themeForApi, systemForApi);
            await addMemoFiche(newFiche);
            setGeneratedFiche(newFiche);
            setIsSuccess(true);
            
            // Reset form
            setPrompt('');
            setThemeSelection('');
            setSystemSelection('');
            setNewThemeName('');
            setNewSystemName('');

        } catch (err: any) {
            setError(err.message || "Une erreur inconnue est survenue lors de la génération.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isReadyToSubmit = prompt.trim() &&
        (themeSelection && (themeSelection !== 'CREATE_NEW' || (themeSelection === 'CREATE_NEW' && newThemeName.trim()))) &&
        (systemSelection && (systemSelection !== 'CREATE_NEW' || (systemSelection === 'CREATE_NEW' && newSystemName.trim())));

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-8 border border-gray-200 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <SparklesIcon className="w-8 h-8 text-green-500" />
                        <h1 className="text-3xl font-bold text-gray-800">Générateur de Mémofiches</h1>
                    </div>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Collez un texte brut (cas clinique, description de pathologie...) et laissez l'IA le transformer en une mémofiche pédagogique complète en trois étapes simples.
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
                    <form onSubmit={handleGenerate} className="space-y-10">
                        {/* THEMES */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-1">Étape 1 : Choisissez un Thème</h2>
                            <p className="text-gray-500 mb-4">Sélectionnez la catégorie thématique principale de votre mémofiche.</p>
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {data?.themes.sort((a,b) => a.Nom.localeCompare(b.Nom)).map(theme => (
                                    <CategoryCard key={theme.id} item={theme} isSelected={themeSelection === theme.id} onSelect={setThemeSelection} disabled={loading} />
                                ))}
                                <button type="button" onClick={() => setThemeSelection('CREATE_NEW')} disabled={loading} className={`relative text-left p-4 h-full border-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center text-center focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 ${themeSelection === 'CREATE_NEW' ? 'bg-green-50 border-green-500 shadow-md' : 'bg-slate-50 border-gray-200 hover:border-green-400 hover:shadow-sm'}`}>
                                    {themeSelection === 'CREATE_NEW' && <CheckCircleIcon className="w-6 h-6 text-green-500 absolute top-2 right-2" />}
                                    <span className="font-bold text-gray-800 text-base">+ Créer un thème</span>
                                </button>
                            </div>
                            {themeSelection === 'CREATE_NEW' && (
                                <div className="mt-4">
                                    <input type="text" value={newThemeName} onChange={e => setNewThemeName(e.target.value)} placeholder="Nom du nouveau thème" className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" required disabled={loading} />
                                </div>
                            )}
                        </div>

                        {/* SYSTEMS */}
                         <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-1">Étape 2 : Choisissez un Organe / Système</h2>
                            <p className="text-gray-500 mb-4">Associez la mémofiche au système corporel pertinent.</p>
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {data?.systemesOrganes.sort((a, b) => a.Nom.localeCompare(b.Nom)).map(sys => (
                                    <CategoryCard key={sys.id} item={sys} isSelected={systemSelection === sys.id} onSelect={setSystemSelection} disabled={loading} />
                                ))}
                                 <button type="button" onClick={() => setSystemSelection('CREATE_NEW')} disabled={loading} className={`relative text-left p-4 h-full border-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center text-center focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 ${systemSelection === 'CREATE_NEW' ? 'bg-green-50 border-green-500 shadow-md' : 'bg-slate-50 border-gray-200 hover:border-green-400 hover:shadow-sm'}`}>
                                    {systemSelection === 'CREATE_NEW' && <CheckCircleIcon className="w-6 h-6 text-green-500 absolute top-2 right-2" />}
                                    <span className="font-bold text-gray-800 text-base">+ Créer un système</span>
                                </button>
                            </div>
                            {systemSelection === 'CREATE_NEW' && (
                                 <div className="mt-4">
                                    <input type="text" value={newSystemName} onChange={e => setNewSystemName(e.target.value)} placeholder="Nom du nouveau système" className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500" required disabled={loading} />
                                 </div>
                            )}
                        </div>
                        
                        {/* PROMPT */}
                        <div>
                           <h2 className="text-xl font-bold text-gray-800 mb-1">Étape 3 : Texte brut à analyser</h2>
                           <p className="text-gray-500 mb-4">Collez ici le cas clinique, la description de la pathologie ou la situation officinale.</p>
                            <textarea
                                id="topic"
                                rows={10}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Collez votre texte ici..."
                                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                                disabled={loading}
                                required
                            />
                        </div>
                        
                        {/* SUBMIT */}
                        <div>
                            <button
                                type="submit"
                                disabled={!isReadyToSubmit || loading}
                                className="w-full flex items-center justify-center gap-3 bg-green-600 text-white font-bold px-6 py-4 rounded-lg shadow-md hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-lg"
                            >
                                <SparklesIcon className="w-6 h-6"/>
                                {loading ? 'Génération en cours...' : 'Générer la Mémofiche'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* RESULTS */}
                {loading && (
                    <div className="mt-8 flex flex-col items-center justify-center">
                        <LoadingSpinner />
                        <p className="text-green-700 mt-4 text-lg">L'IA travaille sur votre mémofiche...</p>
                        <p className="text-gray-500">Cela peut prendre jusqu'à 30 secondes.</p>
                    </div>
                )}

                {error && (
                    <div className="mt-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                        <p className="font-bold">Erreur de Génération</p>
                        <p>{error}</p>
                    </div>
                )}

                {isSuccess && generatedFiche && (
                    <div className="mt-8 text-center p-6 bg-green-50 border border-green-200 rounded-lg shadow-md">
                        <h2 className="text-2xl font-bold text-green-800 mb-2">Succès !</h2>
                        <p className="text-gray-700 mb-4">La mémofiche "{generatedFiche.title}" a été ajoutée à votre bibliothèque.</p>
                        <div className="max-w-sm mx-auto mb-6">
                           <MemoCard memofiche={generatedFiche} />
                        </div>
                        <div className="flex justify-center gap-4">
                             <button
                                onClick={() => navigate(`/fiches/${generatedFiche.id}`)}
                                className="bg-white border border-green-600 text-green-600 font-bold px-6 py-2 rounded-lg hover:bg-green-50 transition-transform hover:scale-105"
                            >
                                Voir la fiche
                            </button>
                            <button
                                onClick={() => navigate('/fiches')}
                                className="bg-green-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-green-700 transition-transform hover:scale-105"
                            >
                                Voir toutes les mémofiches
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeneratorPage;