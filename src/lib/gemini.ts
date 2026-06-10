/**
 * KINGDOM AI SERVICE - Gemini 2.0 Flash Edition
 * High-performance AI integration with professional prompt engineering.
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

export interface BrandContext {
    name: string;
    industry: string;
    tone: string;
    audience: string;
    context: string;
    sources: string;
}

export interface AIResponseSuggestion {
    title: string;
    content: string;
    tone_check: string;
}

export interface AIPostsResponse {
    instagram: string;
    x: string;
    tiktok: string;
    youtube_long: string;
    youtube_short: string;
}

/**
 * Internal helper for API communication
 */
async function callGemini(prompt: string, media?: { mimeType: string, data: string }) {
    if (!API_KEY) throw new Error("VITE_GEMINI_API_KEY is missing in .env");

    console.log(`[Kingdom AI] Ejecutando motor Gemini 2.0 Flash...`);
    const API_URL = `${BASE_URL}/models/gemini-2.0-flash:generateContent`;

    const payload = {
        contents: [{
            parts: [
                { text: prompt },
                ...(media ? [{ inline_data: { mime_type: media.mimeType, data: media.data } }] : [])
            ]
        }],
        generation_config: {
            temperature: 0.7,
            top_p: 0.8,
            top_k: 40,
            max_output_tokens: 4096, // Increased for complex copy tasks
        }
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': API_KEY
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[Kingdom AI] Error detallado:", errorData);
        throw new Error(`${errorData.error?.message || "Error en IA"} (Status: ${response.status})`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Security: Remove any potential Markdown wrapping from AI
    return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

/**
 * Specialized AI Methods for Kingdom OS
 */
export const KingdomAI = {
    /**
     * UTILITY: Analiza fuentes desestructuradas
     */
    async analyzeBrandVoice(context: string): Promise<string> {
        const prompt = `Actúa como un Analista de Estrategia de Marca.
        TAREA: Analiza el siguiente material y genera un Contexto de Marca profesional.
        MATERIAL: "${context}"
        SALIDA: Solo el texto del resumen, enfocado en USP y perfil de marca.`;
        return await callGemini(prompt);
    },

    /**
     * FASE 1: Estrategia y Conceptos (Brainstorming)
     */
    async generateCreativeSuggestions(
        brand: BrandContext,
        userInput: string,
        media?: { mimeType: string, data: string }
    ): Promise<AIResponseSuggestion[]> {
        const prompt = `Actúa como un Director Creativo Senior especializado en Marketing Digital. Tu objetivo es analizar la información de una marca y una idea inicial para proponer 3 conceptos estratégicos distintos para redes sociales.

CONTEXTO DE MARCA (BRAND KNOWLEDGE BASE):
- Cliente: ${brand.name} (${brand.industry})
- Tono de Voz (OBLIGATORIO): ${brand.tone}
- Audiencia Objetivo: ${brand.audience}
- Contexto General: ${brand.context}
- Fuentes y Recursos Clave: ${brand.sources}

INSTRUCCIONES DE SALIDA:
1. Analiza el input del usuario y el material visual si lo hay.
2. Mantén estrictamente el "Tono de Voz" definido.
3. Genera 3 ángulos creativos distintos (ej. uno educativo, uno venta directa, uno entretenimiento).
4. Responde ÚNICAMENTE con un Array JSON válido. No uses bloques de código markdown (\`\`\`json).

FORMATO JSON ESPERADO:
[
  {
    "title": "Título corto y pegadizo del concepto",
    "content": "Desarrollo breve de la idea (2-3 frases)",
    "tone_check": "Explicación de una línea de por qué esto encaja con la marca"
  },
  ... (repetir 3 veces)
]

Aquí tienes el briefing para la nueva publicación:
"${userInput}"

Analízalo y genera los 3 conceptos.`;

        const raw = await callGemini(prompt, media);
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error("JSON Parse Error in FASE 1", raw);
            throw new Error("Error en el formato de respuesta de la IA.");
        }
    },

    /**
     * FASE 2: Producción de Copys (Ejecución Multi-Plataforma)
     */
    async generateFinalPosts(
        brand: { name: string, tone: string, audience: string },
        selectedIdea: string
    ): Promise<AIPostsResponse> {
        const prompt = `Eres el Community Manager y Copywriter Senior de la marca ${brand.name}.
Tu tarea es redactar los textos finales para redes sociales basándote en un concepto aprobado.

REFERENCIAS DE MARCA:
- Tono: ${brand.tone}
- Audiencia: ${brand.audience}

REGLAS TÉCNICAS ESTRICTAS (CRÍTICO):
1. NO uses negritas con asteriscos (**) ni formato Markdown en el texto final. Solo texto plano y emojis.
2. Adapta el lenguaje nativo de cada plataforma.

ESPECIFICACIONES POR RED SOCIAL:

1. INSTAGRAM:
   - Objetivo: Engagement visual y Guardados.
   - Estructura: Gancho fuerte en la primera línea + Cuerpo de valor espaciado + CTA.
   - Emojis: Úsalos con moderación según el tono.
   - Hashtags: Añade un bloque de 15-20 hashtags estratégicos al final, separados del texto.

2. X (TWITTER):
   - Objetivo: Viralidad y conversación.
   - Longitud: Máximo 280 caracteres.
   - Estilo: Directo, sin rodeos. Usa saltos de línea para dar ritmo.
   - Hashtags: Máximo 2 hashtags integrados en el texto o al final.

3. TIKTOK (IMPORTANTE):
   - Objetivo: SEO (Búsqueda) y Retención.
   - OJO: NO escribas un guion técnico de cámara. Escribe la DESCRIPCIÓN (Caption) del post.
   - Estructura: Frase gancho (Hook) que detenga el scroll + Palabras clave SEO en el texto.
   - Hashtags: 4-5 hashtags de nicho y tendencia.

4. YOUTUBE LONG (Video Largo):
   - Genera 3 secciones claras:
     - TÍTULO: Clickbait ético, optimizado para CTR (menos de 60 caracteres idealmente).
     - DESCRIPCIÓN: Introducción fuerte + Puntos clave del video + CTA de suscripción.
     - ETIQUETAS: Lista de 10 tags separados por comas.

5. YOUTUBE SHORTS:
   - Genera 2 secciones:
     - COPY: Título explosivo + Breve descripción (2 líneas máx).
     - ETIQUETAS: Lista de 5 tags incluyendo #shorts.

FORMATO DE SALIDA (JSON ÚNICO):
Responde ÚNICAMENTE con un objeto JSON válido. Sin markdown.

{
  "instagram": "Texto completo...",
  "x": "Texto completo...",
  "tiktok": "Texto completo...",
  "youtube_long": "TÍTULO: ...\\n\\nDESCRIPCIÓN: ...\\n\\nETIQUETAS: ...",
  "youtube_short": "COPY: ...\\n\\nETIQUETAS: ..."
}

El concepto aprobado para desarrollar es:
"${selectedIdea}"

Genera los copys definitivos siguiendo todas las reglas.`;

        const raw = await callGemini(prompt);
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error("JSON Parse Error in FASE 2", raw);
            throw new Error("Error estructurando los posts finales.");
        }
    }
};
