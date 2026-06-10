import { WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { cn } from "@/lib/utils";

export function NetworkAlert() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-5",
      "bg-destructive text-destructive-foreground"
    )}>
      <WifiOff className="h-4 w-4" />
      <span>Sin conexión a internet. Los cambios no se guardarán.</span>
    </div>
  );
}
