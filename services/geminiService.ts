

import { GoogleGenAI, Type } from "@google/genai";
import { MemoFiche, Theme, SystemeOrgane } from '../types';

if (!import.meta.env.VITE_API_KEY) {
    throw new Error("VITE_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

const sectionSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        content: { type: Type.STRING, description: "Content in Markdown format." },
        children: {
            type: Type.ARRAY,
            description: "Nested sub-sections. Keep this one level deep.",
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    content: { type: Type.STRING, description: "Content in Markdown format." },
                },
                required: ["id", "title", "content"],
            }
        }
    },
    required: ["id", "title", "content"]
};

const externalResourceSchema = {
    type: Type.OBJECT,
    properties: {
        type: { type: Type.STRING, enum: ['video', 'podcast', 'quiz', 'article'], description: "Type of the external resource." },
        title: { type: Type.STRING, description: "Title of the resource." },
        url: { type: Type.STRING, description: "Direct URL to the resource." }
    },
    required: ["type", "title", "url"]
};

const memoFicheItemSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "Unique ID for the memo fiche. Use a UUID-like string." },
        title: { type: Type.STRING, description: "Titre de la mémofiche." },
        shortDescription: { type: Type.STRING, description: "A very brief, one-sentence summary for card previews." },
        imageUrl: { type: Type.STRING, description: "A placeholder image URL from picsum.photos" },
        flashSummary: { type: Type.STRING, description: "Synthèse flash de 2-3 phrases (résumé)." },
        level: { type: Type.STRING, description: "Niveau de difficulté (e.g., 'Débutant', 'Intermédiaire', 'Expert')." },
        createdAt: { type: Type.STRING, description: "Date of creation in YYYY-MM-DD format." },
        memoContent: {
            type: Type.ARRAY,
            description: "Exactly 6 sections with titles: 'Étape 1/6 : Définition', 'Étape 2/6 : Symptômes', 'Étape 3/6 : Questions à poser', 'Étape 4/6 : Conseils', 'Étape 5/6 : Signes d’alerte', 'Étape 6/6 : Contre-indications'.",
            items: sectionSchema
        },
        theme: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                Nom: { type: Type.STRING },
            },
                required: ["id", "Nom"],
        },
        systeme_organe: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                Nom: { type: Type.STRING },
            },
                required: ["id", "Nom"],
        },
        flashcards: {
            type: Type.ARRAY,
            description: "Exactly 10 flashcards (question/answer format).",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                },
                required: ["question", "answer"],
            },
        },
        quiz: {
            type: Type.ARRAY,
            description: "Exactly 10 quiz questions (MCQ or true/false) with answers and pedagogical explanations.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    type: { type: Type.STRING, enum: ["mcq", "truefalse"] },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                },
                    required: ["question", "type", "options", "correctAnswer", "explanation"],
            },
        },
        glossaryTerms: {
            type: Type.ARRAY,
            description: "Exactly 10 technical terms with their simple definitions, derived from the source text.",
            items: {
                type: Type.OBJECT,
                properties: {
                    term: { type: Type.STRING },
                    definition: { type: Type.STRING },
                },
                required: ["term", "definition"],
            },
        },
        externalResources: {
            type: Type.ARRAY,
            description: "1-2 relevant external resources (video, podcast, interactive quiz, etc.). For videos, use embed URLs.",
            items: externalResourceSchema
        },
    },
    required: ["id", "title", "shortDescription", "imageUrl", "flashSummary", "memoContent", "theme", "systeme_organe", "flashcards", "quiz", "glossaryTerms", "level", "createdAt", "externalResources"],
};


export const generateSingleMemoFiche = async (rawText: string, theme: Theme, system: SystemeOrgane): Promise<MemoFiche> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `
                Tu es un expert en pharmacie d’officine et en pédagogie active. À partir du texte brut ci-dessous, génère une mémofiche pédagogique complète en FRANÇAIS.
                La réponse DOIT être un objet JSON valide qui respecte scrupuleusement le schéma fourni.

                **Texte Brut à Analyser:**
                ---
                ${rawText}
                ---

                **Instructions de Génération:**
                - **Structure Complète**: Génère tous les champs requis par le schéma JSON.
                - **Titre, Niveau, Date**: Déduis ces informations du texte. Le niveau doit être 'Débutant', 'Intermédiaire', ou 'Expert'. La date doit être la date du jour au format YYYY-MM-DD.
                - **Catégorisation Imposée**: Tu DOIS utiliser les informations suivantes pour la classification. Ne les modifie PAS.
                  - Thème: { id: "${theme.id}", Nom: "${theme.Nom}" }
                  - Système/Organe: { id: "${system.id}", Nom: "${system.Nom}" }
                - **Réponse JSON**: Remplis les champs 'theme' et 'systeme_organe' de l'objet JSON de sortie avec EXACTEMENT ces valeurs.
                - **Sections Collapsibles**: Crée exactement 6 sections avec les titres suivants : "Étape 1/6 : Définition", "Étape 2/6 : Symptômes", "Étape 3/6 : Questions à poser", "Étape 4/6 : Conseils", "Étape 5/6 : Signes d’alerte", "Étape 6/6 : Contre-indications". Le contenu doit être en Markdown.
                - **Synthèse Flash**: Rédige un résumé de 2-3 phrases.
                - **Termes Techniques**: Identifie 10 termes techniques pertinents dans le texte et fournis leurs définitions pour le glossaire.
                - **Contenu Pédagogique**: Crée EXACTEMENT 10 flashcards, et 10 questions de quiz (variées, QCM et Vrai/Faux).
                - **Ressources Externes**: Suggère 1 ou 2 liens pertinents (vidéos YouTube, articles, podcasts). Pour les vidéos, utilise des URLs "embed".
                - **Image**: Utilise 'https://picsum.photos/800/600' pour imageUrl.
                - **IDs**: Assure-toi que l'ID de la fiche et les IDs des sections sont des chaînes de caractères uniques (similaire à un UUID).
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: memoFicheItemSchema,
            }
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data as MemoFiche;
    } catch (error) {
        console.error("Error generating single memo fiche with Gemini:", error);
        throw new Error("Impossible de générer la mémofiche depuis l'IA. Veuillez réessayer.");
    }
};
