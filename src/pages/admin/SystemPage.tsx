import { SystemStatus } from '@/components/admin/SystemStatus';

export default function SystemPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Estado del Sistema</h1>
                <p className="text-muted-foreground mt-2">
                    Diagnóstico de conexión a Firebase, validación de reglas de seguridad y gestión de colecciones.
                </p>
            </div>
            
            <SystemStatus />
        </div>
    );
}
