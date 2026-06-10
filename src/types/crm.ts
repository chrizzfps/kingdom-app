export type Currency = 'USD' | 'EUR';
export type ClientStatus = 'lead' | 'active' | 'inactive';

export interface Client {
    id: string;
    createdAt: Date;
    updatedAt: Date;

    // Identity
    name: string; // Internal name
    commercialName?: string; // Brand name
    logoUrl?: string;
    status: ClientStatus;

    // Contact
    website?: string;
    email: string;
    phone?: string;
    address?: string;

    // Legal / Fiscal
    taxId?: string; // CIF/RFC/VAT
    legalName?: string; // Razón Social
    fiscalAddress?: string;

    // Relations
    tags?: string[];
    notes?: string;
}

export type ProjectStatus = 'lead' | 'active' | 'review' | 'completed' | 'hold' | 'archived';

export interface Project {
    id: string;
    clientId: string;
    createdAt: Date;
    updatedAt: Date;

    name: string;
    description?: string;
    status: ProjectStatus;

    // Dates
    startDate?: Date;
    deadline?: Date;
    launchDate?: Date; // Social Media / Launch

    // Team
    managerId?: string; // User ID
    teamIds?: string[]; // User IDs

    // Financial
    budget?: number;
    currency: Currency;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface Task {
    id: string;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;

    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;

    // Assignment
    assigneeId?: string; // User ID
    reporterId?: string; // User ID

    // Dates
    dueDate?: Date;

    // Meta
    isLaunchEvent?: boolean; // If true, shows prominently on calendar
    resources?: { title: string; url: string; type: 'link' | 'file' }[]; // Linked resources
}

export interface ProjectResource {
    id: string;
    projectId: string;
    name: string;
    url: string;
    type: 'drive' | 'file' | 'link' | 'figma' | 'other';
    createdAt: Date;
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    price: number;
    total: number;
}

export interface Invoice {
    id: string;
    number: string;
    clientId: string;
    projectId?: string;
    date: Date;
    dueDate: Date;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    items: InvoiceItem[];
    subtotal: number;
    discount?: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    notes?: string;
    currency: string;
    // Branding Overrides
    logoUrl?: string;
    headerBgUrl?: string;
    footerBgUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface AgencySettings {
    name: string;
    commercialName?: string;
    taxId?: string;
    address?: string;
    email?: string;
    phone?: string;
    website?: string;
    logoUrl?: string; // URL
    isotypeUrl?: string; // URL
    headerBgUrl?: string; // URL
    footerBgUrl?: string; // URL

    // Branding
    primaryColor?: string; // Hex code
    secondaryColor?: string; // Hex code

    // Legal Documents
    termsAndConditions?: string;
    privacyPolicy?: string;
    legalNotice?: string;

    // Financial defaults
    currency: string; // 'EUR' | 'USD'
    defaultTaxRate: number; // 21
    invoiceTerms?: string; // Default notes for invoices
}

export interface UserProfile {
    id: string; // UID
    email: string;
    displayName?: string;
    photoURL?: string;
    role: 'admin' | 'member' | 'viewer';
    createdAt?: Date;
    updatedAt?: Date;

    // Expanded Employee Data
    phone?: string;
    position?: string; // e.g. "Diseñador Senior", "Media Buyer"
    salary?: number; // Monthly base or per project
    currency?: Currency;
    paymentMethod?: string; // e.g. "PayPal", "Transferencia", "Crypto"
    paymentDetails?: string; // Account info
    notes?: string;
    status?: 'active' | 'on_vacation' | 'inactive';
}

export interface UserPayment {
    id: string;
    userId: string;
    amount: number;
    currency: Currency;
    date: Date;
    description: string;
    status: 'pending' | 'completed' | 'cancelled';
    paymentMethod?: string;
    receiptUrl?: string; // Link to a screenshot or PDF
    createdAt: Date;
}
