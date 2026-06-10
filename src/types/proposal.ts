export type ModuleType = 'HERO' | 'INTRO' | 'OPTIONS' | 'PRICING' | 'TIMELINE' | 'PAYMENT' | 'CTA' | 'TEXT' | 'REFERENCES' | 'PROJECT' | 'PORTFOLIO_HERO' | 'PORTFOLIO_CTA' | 'WHITEBOARD';

export type ProposalType = 'proposal' | 'portfolio';
export type PortfolioType = 'logo' | 'web' | 'design' | 'photo' | 'video' | 'social';

export interface ProjectItem {
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    category?: string; // e.g. "Minimalist", "3D", etc.
    link?: string; // For web projects
}

export interface ProposalModule {
    id: string;
    type: ModuleType;
    isVisible: boolean;
    order?: number;
    data: any;
    createdAt?: any;
    updatedAt?: any;
}

export interface Proposal {
    id: string;
    slug: string;
    title?: string; // Display title
    type: ProposalType; // New field
    portfolioType?: PortfolioType; // Specific type if it is a portfolio
    clientName?: string;
    clientId?: string;
    clientLogoUrl?: string;
    status: 'draft' | 'published' | 'accepted' | 'rejected';
    createdAt: any;
    updatedAt: any;
    currency: 'USD' | 'EUR';
    total?: number;
    modules: ProposalModule[];
    history?: any[];
    theme?: { font?: string; primaryColor?: string };
    settings?: { validUntil?: Date; showTotal?: boolean };
}

export const DEFAULT_MODULE_DATA: Record<ModuleType, any> = {
    HERO: {
        title: "Propuesta de Desarrollo Web",
        subtitle: "Elevando la presencia digital de [Cliente]",
        backgroundImageUrl: "",
    },
    INTRO: {
        heading: "El Desafío",
        content: "Análisis del problema actual...",
        solutionSummary: "Nuestra estrategia...",
    },
    OPTIONS: {
        options: [
            {
                id: "opt1",
                title: "Portafolio Profesional Ágil",
                description: "Solución eficiente montada sobre CMS robusto.",
                advantage: "Ideal si buscas velocidad de implementación.",
                coreServices: ["Diseño UX/UI Minimalista", "Carga de proyectos", "Integración Vimeo/YouTube"],
                badge: "Popular"
            }
        ]
    },
    PRICING: {
        title: "Cotización Estimada",
        validUntil: "15 días hábiles",
        clientLocation: "",
        clientType: "",
        globalItems: [
            { id: "item1", name: "Diseño UX/UI", price: 500 },
            { id: "item2", name: "Desarrollo CMS", price: 700 },
        ],
        allocations: {
            "opt1": ["item1", "item2"]
        }
    },
    TIMELINE: {
        steps: [
            { phase: "Semana 1", task: "Discovery", optionId: "opt1" }
        ]
    },
    PAYMENT: {
        terms: "50% al inicio del proyecto, 50% al finalizar la entrega.",
        methods: [],
        milestones: []
    },
    CTA: {
        title: "¿Listos para construir algo grande?",
        buttonText: "Hablemos",
        buttonLink: "#",
        whatsapp: "",
        email: ""
    },
    TEXT: {
        content: "Contenido libre..."
    },
    REFERENCES: {
        title: "Referencias visuales",
        items: []
    },
    PROJECT: {
        title: "Nuevo Proyecto",
        description: "",
        imageUrl: "",
        mediaType: "image", // 'image' | 'video'
        videoUrl: "",
        category: "General",
        link: ""
    },
    PORTFOLIO_HERO: {
        title: "Mi Portafolio",
        subtitle: "Explora mi trabajo creativo",
        backgroundImageUrl: "",
        showSocialLinks: true,
        socialLinks: {
            instagram: "",
            linkedin: "",
            behance: "",
            website: "",
            twitter: ""
        }
    },
    PORTFOLIO_CTA: {
        title: "¿Te gustó lo que viste?",
        subtitle: "Hablemos de tu próximo proyecto",
        buttonText: "Contactar",
        buttonLink: "#",
        email: ""
    },
    WHITEBOARD: {
        title: "",
        elements: [],
    }
};
