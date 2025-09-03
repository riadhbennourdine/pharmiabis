
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MemoFiche } from '../types';
import FlashcardDeck from '../components/FlashcardDeck';
import QuizSection from '../components/QuizSection';
import GlossaryList from '../components/GlossaryList';
import ContentSection from '../components/ContentSection';
import { BookOpenIcon, VideoCameraIcon, QuestionMarkCircleIcon, SparklesIcon, DocumentTextIcon, ChevronRightIcon, TrashIcon, DocumentDuplicateIcon } from '../components/icons';
import { useData } from '../contexts/DataContext';

interface DetailPageProps {
  memoFiche: MemoFiche;
}

type Tab = 'memo' | 'summary' | 'flashcards' | 'quiz' | 'glossary' | 'resources';

const DetailPage: React.FC<DetailPageProps> = ({ memoFiche }) => {
  const [activeTab, setActiveTab] = useState<Tab>('memo');
  const [scroll, setScroll] = useState(0);
  const { deleteMemoFiche } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
        const scrollTop = window.scrollY;
        // Adjust for sticky header height
        const contentNode = document.documentElement;
        const adjustedScrollTop = Math.max(0, scrollTop - 64);
        const adjustedHeight = contentNode.scrollHeight - window.innerHeight - 64;
        
        if (adjustedHeight > 0) {
            const scrollPercent = (adjustedScrollTop / adjustedHeight) * 100;
            setScroll(Math.min(100, Math.max(0, scrollPercent)));
        } else {
            setScroll(scrollTop > 64 ? 100 : 0);
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation
    return () => window.removeEventListener('scroll', handleScroll);
  }, [memoFiche]);
  
  const handleDelete = () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette mémofiche ? Cette action est irréversible.")) {
      deleteMemoFiche(memoFiche.id);
      navigate('/fiches');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'memo':
        return <ContentSection sections={memoFiche.memoContent} glossaryTerms={memoFiche.glossaryTerms} />;
      case 'summary':
        return (
          <div className="prose max-w-none text-gray-700">
             <h3 className="text-xl font-bold text-gray-800 mb-2">Résumé Flash</h3>
            <p>{memoFiche.flashSummary}</p>
          </div>
        );
      case 'flashcards':
        return <FlashcardDeck flashcards={memoFiche.flashcards} />;
      case 'quiz':
        return <QuizSection quiz={memoFiche.quiz} />;
      case 'glossary':
        return <GlossaryList terms={memoFiche.glossaryTerms} />;
      case 'resources':
        return (
            <div>
                 <h3 className="text-xl font-bold text-gray-800 mb-4">Ressources Externes</h3>
                {memoFiche.externalResources && memoFiche.externalResources.length > 0 ? (
                    <div className="space-y-4">
                        {memoFiche.externalResources.map((resource, index) => (
                             <a key={index} href={resource.url} target="_blank" rel="noopener noreferrer" className="block p-4 bg-slate-50 rounded-lg border border-gray-200 hover:bg-slate-100 hover:border-gray-300 transition-colors group">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-green-700 group-hover:text-green-800">{resource.title}</p>
                                        <span className="text-sm text-gray-500 capitalize">{resource.type}</span>
                                    </div>
                                    <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                   <p className="text-gray-500">Aucune ressource externe disponible.</p>
                )}
            </div>
        );
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tab: Tab; label: string; icon: React.ReactNode }> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tab
          ? 'bg-green-600 text-white shadow'
          : 'text-gray-600 hover:bg-green-100 hover:text-green-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <div className="fixed top-16 left-0 w-full h-1 bg-gray-200 z-40">
        <div className="h-1 bg-green-600 transition-all duration-75" style={{ width: `${scroll}%` }}></div>
      </div>
      <div className="container mx-auto p-4 md:p-8 mt-1">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="relative">
              <img src={memoFiche.imageUrl} alt={memoFiche.title} className="w-full h-48 md:h-64 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
               <button
                  onClick={handleDelete}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  aria-label="Supprimer la fiche"
                >
                  <TrashIcon className="w-6 h-6" />
                </button>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                  <div className="flex flex-wrap gap-2 text-xs mb-2">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full font-semibold">{memoFiche.theme.Nom}</span>
                      <span className="bg-slate-600 text-white px-3 py-1 rounded-full font-semibold">{memoFiche.systeme_organe.Nom}</span>
                      <span className="bg-slate-500 text-white px-3 py-1 rounded-full font-semibold">{memoFiche.level}</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">{memoFiche.title}</h1>
                  {memoFiche.createdAt && (
                     <p className="text-white/80 font-medium text-sm">
                        Créé le {new Date(memoFiche.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
              </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
               <p className="text-lg text-gray-600">{memoFiche.shortDescription}</p>
            </div>

            <div className="border-b border-gray-200 mb-6">
              <nav className="flex flex-wrap gap-2 md:gap-4 -mb-px">
                <TabButton tab="memo" label="Mémo" icon={<DocumentTextIcon className="w-5 h-5"/>} />
                <TabButton tab="summary" label="Résumé" icon={<SparklesIcon className="w-5 h-5"/>} />
                <TabButton tab="flashcards" label="Fiches Flash" icon={<DocumentDuplicateIcon className="w-5 h-5"/>} />
                <TabButton tab="quiz" label="Quiz" icon={<QuestionMarkCircleIcon className="w-5 h-5"/>} />
                <TabButton tab="glossary" label="Glossaire" icon={<BookOpenIcon className="w-5 h-5"/>} />
                <TabButton tab="resources" label="Ressources" icon={<VideoCameraIcon className="w-5 h-5"/>} />
              </nav>
            </div>
            
            <div className="min-h-[200px]">
              {renderContent()}
            </div>

             <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500">
                <p>Des questions ? Demande au <span className="font-semibold text-green-700">Chatbot IA</span> pour approfondir.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DetailPage;