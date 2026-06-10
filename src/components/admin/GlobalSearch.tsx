import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, FolderKanban, Receipt, FileText, Settings, LayoutDashboard, Sparkles, Server, Briefcase } from 'lucide-react';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { getClients, getProjects, getInvoices } from '@/api/crm';
import type { Client, Project, Invoice } from '@/types/crm';
import { cn } from '@/lib/utils';

// Navigation items for quick access
const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard', keywords: ['inicio', 'home', 'panel'] },
    { icon: FileText, label: 'Propuestas', href: '/admin/proposals', keywords: ['propuestas', 'proposals', 'cotizacion'] },
    { icon: Briefcase, label: 'Portafolios', href: '/admin/portfolios', keywords: ['portafolios', 'portfolio', 'trabajos'] },
    { icon: Users, label: 'Clientes', href: '/admin/clients', keywords: ['clientes', 'clients', 'cuentas'] },
    { icon: FolderKanban, label: 'Proyectos', href: '/admin/projects', keywords: ['proyectos', 'projects'] },
    { icon: Receipt, label: 'Facturas', href: '/admin/invoices', keywords: ['facturas', 'invoices', 'pagos'] },
    { icon: Sparkles, label: 'SocialCenter', href: '/admin/social', keywords: ['social', 'redes', 'media'] },
    { icon: Settings, label: 'Configuración', href: '/admin/settings', keywords: ['configuracion', 'settings', 'ajustes'] },
    { icon: Server, label: 'Sistema', href: '/admin/system', keywords: ['sistema', 'system', 'servidor'] },
];

interface GlobalSearchProps {
    collapsed?: boolean;
}

export function GlobalSearch({ collapsed }: GlobalSearchProps) {
    const [open, setOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Keyboard shortcut ⌘K or Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Load data when dialog opens
    useEffect(() => {
        if (!open) return;

        setLoading(true);
        Promise.all([getClients(), getProjects(), getInvoices()])
            .then(([c, p, i]) => {
                setClients(c);
                setProjects(p);
                setInvoices(i);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [open]);

    const handleSelect = useCallback((href: string) => {
        setOpen(false);
        navigate(href);
    }, [navigate]);

    return (
        <>
            {/* Trigger Button */}
            <Button
                variant="outline"
                onClick={() => setOpen(true)}
                className={cn(
                    "w-full justify-start text-muted-foreground bg-muted/50 border-border/50 hover:bg-muted transition-all",
                    collapsed ? "px-2 justify-center" : "px-3"
                )}
            >
                <Search className="h-4 w-4 shrink-0" />
                {!collapsed && (
                    <>
                        <span className="ml-2 flex-1 text-left text-sm">Buscar...</span>
                        <kbd className="ml-auto text-xs text-muted-foreground/60 bg-background px-1.5 py-0.5 rounded border border-border/50">
                            ⌘K
                        </kbd>
                    </>
                )}
            </Button>

            {/* Command Dialog */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Buscar clientes, proyectos, facturas..." />
                <CommandList>
                    <CommandEmpty>
                        {loading ? 'Cargando...' : 'No se encontraron resultados.'}
                    </CommandEmpty>

                    {/* Quick Navigation */}
                    <CommandGroup heading="Navegación">
                        {NAV_ITEMS.map((item) => (
                            <CommandItem
                                key={item.href}
                                value={`${item.label} ${item.keywords.join(' ')}`}
                                onSelect={() => handleSelect(item.href)}
                            >
                                <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                <span>{item.label}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    <CommandSeparator />

                    {/* Clients */}
                    {clients.length > 0 && (
                        <CommandGroup heading="Clientes">
                            {clients.slice(0, 5).map((client) => (
                                <CommandItem
                                    key={client.id}
                                    value={`cliente ${client.name} ${client.email || ''}`}
                                    onSelect={() => handleSelect(`/admin/clients/${client.id}`)}
                                >
                                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{client.name}</span>
                                    {client.email && (
                                        <span className="ml-2 text-xs text-muted-foreground">{client.email}</span>
                                    )}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {/* Projects */}
                    {projects.length > 0 && (
                        <CommandGroup heading="Proyectos">
                            {projects.slice(0, 5).map((project) => (
                                <CommandItem
                                    key={project.id}
                                    value={`proyecto ${project.name} ${project.description || ''}`}
                                    onSelect={() => handleSelect(`/admin/projects/${project.id}`)}
                                >
                                    <FolderKanban className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{project.name}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {/* Invoices */}
                    {invoices.length > 0 && (
                        <CommandGroup heading="Facturas">
                            {invoices.slice(0, 5).map((invoice) => (
                                <CommandItem
                                    key={invoice.id}
                                    value={`factura ${invoice.number} ${invoice.status}`}
                                    onSelect={() => handleSelect(`/admin/invoices/${invoice.id}`)}
                                >
                                    <Receipt className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span>{invoice.number}</span>
                                    <span className="ml-2 text-xs text-muted-foreground capitalize">{invoice.status}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
