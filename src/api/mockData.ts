import type { Client, Project, Invoice, Task, ProjectResource, AgencySettings, UserProfile } from '@/types/crm';
import type { Proposal } from '@/types/proposal';

export const MOCK_CLIENTS: Client[] = [
    {
        id: 'mock-client-1',
        name: 'Tech Corp',
        email: 'contact@techcorp.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        commercialName: 'Tech Corp International',
        logoUrl: '', // Placeholder URL removed to avoid network error
        phone: '+1 555 0123',
        website: 'https://techcorp.com',
        taxId: 'US123456789',
        legalName: 'Tech Corp LLC',
        fiscalAddress: '123 Tech Blvd, Silicon Valley, CA',
    },
    {
        id: 'mock-client-2',
        name: 'Design Studio',
        email: 'hello@designstudio.agency',
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'lead',
        commercialName: 'DS Agency',
        logoUrl: '',
        phone: '+34 600 000 000',
        website: 'https://designstudio.agency',
        taxId: 'ESB12345678',
        legalName: 'Design Studio S.L.',
        fiscalAddress: 'Calle Diseño 1, Madrid, Spain',
    }
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'mock-project-1',
        clientId: 'mock-client-1',
        name: 'Website Redesign 2024',
        status: 'active',
        currency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Complete overhaul of the corporate website.',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        budget: 15000
    },
    {
        id: 'mock-project-2',
        clientId: 'mock-client-2',
        name: 'Mobile App MVP',
        status: 'lead',
        currency: 'EUR',
        createdAt: new Date(),
        updatedAt: new Date(),
        description: 'Initial MVP for the new mobile application.',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // +60 days
        budget: 8500
    }
];

export const MOCK_INVOICES: Invoice[] = [
    {
        id: 'mock-invoice-1',
        number: 'INV-2024-001',
        clientId: 'mock-client-1',
        projectId: 'mock-project-1',
        date: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'paid',
        currency: 'USD',
        items: [
            { id: '1', description: 'Initial Deposit', quantity: 1, price: 5000, total: 5000 }
        ],
        subtotal: 5000,
        taxRate: 0,
        taxAmount: 0,
        total: 5000,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: 'mock-invoice-2',
        number: 'INV-2024-002',
        clientId: 'mock-client-2',
        projectId: 'mock-project-2',
        date: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'sent',
        currency: 'EUR',
        items: [
            { id: '1', description: 'Consulting Hours', quantity: 10, price: 85, total: 850 }
        ],
        subtotal: 850,
        taxRate: 21,
        taxAmount: 178.5,
        total: 1028.5,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

export const MOCK_TASKS: Task[] = [
    {
        id: 'mock-task-1',
        projectId: 'mock-project-1',
        title: 'Design Homepage Mockup',
        status: 'in_progress',
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    },
    {
        id: 'mock-task-2',
        projectId: 'mock-project-1',
        title: 'Setup React Project',
        status: 'done',
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    }
];

export const MOCK_RESOURCES: ProjectResource[] = [
    {
        id: 'mock-res-1',
        projectId: 'mock-project-1',
        name: 'Figma Design System',
        url: 'https://figma.com/file/mock',
        type: 'figma',
        createdAt: new Date()
    }
];

export const MOCK_SETTINGS: AgencySettings = {
    name: 'Kingdom Agency',
    commercialName: 'Kingdom',
    email: 'admin@kingdom.agency',
    currency: 'EUR',
    defaultTaxRate: 21,
    logoUrl: '', // Placeholder URL removed
    primaryColor: '#000000',
    secondaryColor: '#ffffff'
};

export const MOCK_USERS: UserProfile[] = [
    {
        id: 'mock-user-1',
        email: 'admin@kingdom.agency',
        displayName: 'Admin User',
        role: 'admin',
        createdAt: new Date()
    },
    {
        id: 'mock-user-2',
        email: 'member@kingdom.agency',
        displayName: 'Team Member',
        role: 'member',
        createdAt: new Date()
    }
];

export const MOCK_PROPOSALS: Proposal[] = [
    {
        id: 'mock-prop-1',
        title: 'E-commerce Proposal',
        clientId: 'mock-client-1',
        status: 'published',
        type: 'proposal',
        createdAt: new Date(),
        updatedAt: new Date(),
        modules: [],
        currency: 'USD',
        total: 15000,
        slug: 'ecommerce-proposal-techcorp',
        history: [],
        theme: { font: 'inter', primaryColor: '#000000' },
        settings: { validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), showTotal: true }
    },
    {
        id: 'mock-prop-2',
        title: 'Branding Proposal',
        clientId: 'mock-client-2',
        status: 'accepted',
        type: 'proposal',
        createdAt: new Date(),
        updatedAt: new Date(),
        modules: [],
        currency: 'EUR',
        total: 5000,
        slug: 'branding-proposal-designstudio',
        history: [],
        theme: { font: 'inter', primaryColor: '#000000' },
        settings: { validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), showTotal: true }
    }
];
