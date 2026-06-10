import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface TabItem {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface MotionTabSwitcherProps {
    tabs: TabItem[];
    activeTab: string;
    onTabChange: (id: string) => void;
    className?: string;
}

export function MotionTabSwitcher({ tabs, activeTab, onTabChange, className }: MotionTabSwitcherProps) {
    return (
        <div className={cn("flex bg-muted/50 p-1 rounded-xl relative", className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id as any)}
                        className={cn(
                            "relative flex items-center justify-center h-8 px-4 rounded-lg text-xs font-bold transition-all gap-2 flex-1",
                            isActive ? "!text-[#ffffff] dark:!text-[#000000]" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activePill"
                                className="absolute inset-0 !bg-[#000000] dark:!bg-[#ffffff] rounded-lg shadow-sm"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <Icon className="w-3.5 h-3.5 relative z-10" />
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
