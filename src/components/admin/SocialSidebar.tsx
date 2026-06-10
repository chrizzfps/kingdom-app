import { Link } from 'react-router-dom';
import { getSocialUrl } from '@/api/social';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    PanelLeftClose,
    PanelLeft,
    Sparkles,
    LayoutDashboard,
    Instagram,
    Facebook,
    Linkedin,
    Youtube,
    Globe,
    Music2
} from 'lucide-react';

interface SocialSidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    currentProject: any;
    currentView: 'projects' | 'dashboard' | 'wizard';
    onAction: (action: 'new-post' | 'back-to-dashboard') => void;
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
    socialHandles?: {
        instagram?: string;
        tiktok?: string;
        youtube?: string;
        linkedin?: string;
        facebook?: string;
        website?: string;
    };
}

export function SocialSidebar({ isCollapsed, onToggle, currentProject, currentView, onAction, isMobileOpen, onMobileClose, socialHandles }: SocialSidebarProps) {
    const NavItem = ({
        icon: Icon,
        label,
        onClick,
        variant = 'ghost'
    }: {
        icon: any;
        label: string;
        onClick?: () => void;
        variant?: 'ghost' | 'default';
    }) => (
        variant === 'default' ? (
            <button
                className={cn(
                    "w-full justify-start gap-3 font-medium transition-all inline-flex items-center rounded-xl hover:opacity-90 [.dark_&]:!bg-white [.dark_&]:!text-black",
                    isCollapsed ? "h-10 w-10 p-0 justify-center" : "h-10 px-3"
                )}
                style={{ backgroundColor: 'black', color: 'white' }}
                onClick={onClick}
                title={isCollapsed ? label : undefined}
            >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{label}</span>}
            </button>
        ) : (
            <Button
                variant={variant}
                size={isCollapsed ? 'icon' : 'default'}
                className={cn(
                    "w-full justify-start gap-3 font-medium transition-all",
                    isCollapsed ? "h-10 w-10 p-0 justify-center" : "h-10 px-3",
                )}
                onClick={onClick}
                title={isCollapsed ? label : undefined}
            >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{label}</span>}
            </Button>
        )
    );



    const hasSocials = socialHandles && Object.values(socialHandles).some(v => !!v);

    return (
        <>
            {/* Mobile backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r border-border bg-background backdrop-blur-md transition-all duration-300 flex flex-col",
                // Desktop
                "hidden lg:flex",
                isCollapsed ? "lg:w-16" : "lg:w-56",
                // Mobile
                isMobileOpen ? "flex w-64" : "hidden"
            )}>
                {/* Header - Project info + collapse button */}
                <div className="h-16 flex items-center justify-between border-b border-border/50 px-3">
                    {currentProject && !isCollapsed ? (
                        <div className="flex-1 mr-2">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Proyecto Activo</p>
                            <p className="text-sm font-bold truncate max-w-[180px]">{currentProject.name}</p>
                        </div>
                    ) : (
                        <div className="flex-1" />
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={onToggle}
                        title={isCollapsed ? "Expandir" : "Colapsar"}
                    >
                        {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                    </Button>
                </div>

                {/* Navigation */}
                <div className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-hide">
                    <NavItem
                        icon={Sparkles}
                        label="Nuevo Post"
                        onClick={() => onAction('new-post')}
                        variant="default"
                    />

                    {/* Show "Back to Dashboard" when in wizard */}
                    {currentView === 'wizard' && (
                        <NavItem
                            icon={LayoutDashboard}
                            label="Volver al Proyecto"
                            onClick={() => onAction('back-to-dashboard')}
                        />
                    )}

                    {hasSocials && (
                        <>
                            {!isCollapsed && (
                                <div className="pt-4 pb-2 px-3">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Enlaces</p>
                                </div>
                            )}
                            {isCollapsed && <div className="h-px w-8 mx-auto bg-border/50 my-2" />}

                            {socialHandles.website && (
                                <a href={getSocialUrl('website', socialHandles.website)} target="_blank" rel="noopener noreferrer" className="block">
                                    <NavItem icon={Globe} label="Website" />
                                </a>
                            )}
                            {socialHandles.instagram && (
                                <a href={getSocialUrl('instagram', socialHandles.instagram)} target="_blank" rel="noopener noreferrer" className="block">
                                    <NavItem icon={Instagram} label="Instagram" />
                                </a>
                            )}
                            {socialHandles.tiktok && (
                                <a href={getSocialUrl('tiktok', socialHandles.tiktok)} target="_blank" rel="noopener noreferrer" className="block">
                                    <NavItem icon={Music2} label="TikTok" />
                                </a>
                            )}
                            {socialHandles.youtube && (
                                <a href={getSocialUrl('youtube', socialHandles.youtube)} target="_blank" rel="noopener noreferrer" className="block">
                                    <NavItem icon={Youtube} label="YouTube" />
                                </a>
                            )}
                            {socialHandles.linkedin && (
                                <a href={getSocialUrl('linkedin', socialHandles.linkedin)} target="_blank" rel="noopener noreferrer" className="block">
                                    <NavItem icon={Linkedin} label="LinkedIn" />
                                </a>
                            )}
                            {socialHandles.facebook && (
                                <a href={getSocialUrl('facebook', socialHandles.facebook)} target="_blank" rel="noopener noreferrer" className="block">
                                    <NavItem icon={Facebook} label="Facebook" />
                                </a>
                            )}
                        </>
                    )}
                </div>

                {/* Footer - Back to Kingdom */}
                <div className={cn("p-3 border-t border-border/50", isCollapsed && "px-3")}>
                    <Link to="/admin">
                        {isCollapsed ? (
                            <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl" title="Volver a Kingdom OS">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button variant="outline" className="w-full h-10 justify-start gap-3 rounded-xl font-medium">
                                <ArrowLeft className="h-4 w-4" />
                                Volver a Kingdom OS
                            </Button>
                        )}
                    </Link>
                </div>
            </aside>
        </>
    );
}
