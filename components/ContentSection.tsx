
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Section, GlossaryTerm } from '../types';
import { ChevronRightIcon } from './icons';

interface HighlightedTextProps {
    text: string;
    terms: GlossaryTerm[];
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, terms }) => {
    if (!terms || terms.length === 0) {
        return <>{text}</>;
    }
    const termRegex = new RegExp(`\\b(${terms.map(t => t.term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})\\b`, 'gi');
    const parts = text.split(termRegex);

    return (
        <>
            {parts.map((part, i) => {
                const matchingTerm = terms.find(t => t.term.toLowerCase() === part.toLowerCase());
                if (matchingTerm) {
                    return (
                        <span key={i} className="relative group cursor-pointer font-semibold text-green-700 underline decoration-green-300 decoration-2 underline-offset-2">
                            {part}
                            <span className="absolute bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none transform -translate-x-1/2 left-1/2">
                                <strong className="font-bold block mb-1">{matchingTerm.term}</strong>
                                {matchingTerm.definition}
                                <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                            </span>
                        </span>
                    );
                }
                return <span key={i}>{part}</span>;
            })}
        </>
    );
};

const renderWithHighlighting = (children: React.ReactNode, terms: GlossaryTerm[]): React.ReactNode => {
    return React.Children.map(children, child => {
        if (typeof child === 'string') {
            return <HighlightedText text={child} terms={terms} />;
        }
        if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
            return React.cloneElement(child, {
                ...child.props,
                children: renderWithHighlighting(child.props.children, terms),
            });
        }
        return child;
    });
};

interface ContentSectionProps {
    sections: Section[];
    glossaryTerms: GlossaryTerm[];
    level?: number;
}

const ContentSection: React.FC<ContentSectionProps> = ({ sections, glossaryTerms, level = 0 }) => {
    if (!sections || sections.length === 0) {
        return <div className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">Aucun contenu détaillé disponible pour cette fiche.</div>;
    }

    const customRenderers = {
        p: ({ children }: { children?: React.ReactNode }) => <p className="mb-4 leading-relaxed">{renderWithHighlighting(children, glossaryTerms)}</p>,
        li: ({ children }: { children?: React.ReactNode }) => <li className="mb-2">{renderWithHighlighting(children, glossaryTerms)}</li>,
        ul: ({ children }: { children?: React.ReactNode }) => <ul className="list-disc list-inside mb-4 pl-4">{renderWithHighlighting(children, glossaryTerms)}</ul>,
        ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside mb-4 pl-4">{renderWithHighlighting(children, glossaryTerms)}</ol>,
        strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-semibold text-gray-800">{renderWithHighlighting(children, glossaryTerms)}</strong>,
        h1: () => null, h2: () => null, h3: () => null, h4: () => null, // Titles are handled by the <summary>
    };

    return (
        <div className="space-y-4">
            {sections.map((section) => (
                <details key={section.id} open className="group bg-white rounded-lg border border-gray-200 overflow-hidden" style={{ marginLeft: `${level * 20}px` }}>
                    <summary className="flex items-center gap-2 p-4 font-semibold text-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <ChevronRightIcon className="w-5 h-5 text-green-600 transform transition-transform group-open:rotate-90" />
                        <span>{section.title}</span>
                    </summary>
                    <div className="p-4 pt-0 border-t border-gray-200">
                        <ReactMarkdown
                            components={customRenderers}
                            remarkPlugins={[remarkGfm]}
                        >
                            {section.content}
                        </ReactMarkdown>
                        {section.children && section.children.length > 0 && (
                            <div className="mt-4">
                               <ContentSection sections={section.children} glossaryTerms={glossaryTerms} level={level + 1} />
                            </div>
                        )}
                    </div>
                </details>
            ))}
        </div>
    );
};

export default ContentSection;