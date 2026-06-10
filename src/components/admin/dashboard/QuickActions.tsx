import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Plus,
    FileText,
    Users,
    DollarSign,
    FolderKanban,
    CheckSquare,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface QuickAction {
    id: string;
    label: string;
    icon: React.ElementType;
    path: string;
    color: string;
}

const actions: QuickAction[] = [
    { id: 'proposal', label: 'Nueva Propuesta', icon: FileText, path: '/admin/proposals', color: 'text-blue-500' },
    { id: 'client', label: 'Nuevo Cliente', icon: Users, path: '/admin/clients', color: 'text-green-500' },
    { id: 'invoice', label: 'Nueva Factura', icon: DollarSign, path: '/admin/finance', color: 'text-yellow-500' },
    { id: 'project', label: 'Nuevo Proyecto', icon: FolderKanban, path: '/admin/projects', color: 'text-purple-500' },
    { id: 'task', label: 'Nueva Tarea', icon: CheckSquare, path: '/admin/tasks', color: 'text-pink-500' },
];

export function QuickActions() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleAction = (path: string) => {
        navigate(path);
        setIsOpen(false);
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Quick Actions Menu */}
            <div className={cn(
                "fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 transition-all duration-300",
                isOpen ? "scale-100 opacity-100" : "scale-95 opacity-100"
            )}>
                {/* Action Buttons */}
                <div className={cn(
                    "flex flex-col gap-2 transition-all duration-300 origin-bottom-right",
                    isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-0 opacity-0 translate-y-4 pointer-events-none"
                )}>
                    {actions.map((action, index) => (
                        <Button
                            key={action.id}
                            onClick={() => handleAction(action.path)}
                            variant="secondary"
                            size="sm"
                            className={cn(
                                "shadow-lg hover:shadow-xl transition-all duration-200 gap-2 pr-4",
                                "bg-card hover:bg-muted border border-border",
                                "animate-in slide-in-from-right fade-in"
                            )}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <action.icon className={cn("h-4 w-4", action.color)} />
                            <span className="font-medium">{action.label}</span>
                        </Button>
                    ))}
                </div>

                {/* Main FAB Button */}
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    size="icon"
                    className={cn(
                        "h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
                        "btn-contrast-forced",
                        isOpen && "rotate-45"
                    )}
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                </Button>
            </div>
        </>
    );
}
