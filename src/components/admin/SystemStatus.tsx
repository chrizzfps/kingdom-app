import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    CheckCircle, XCircle, Loader2, Database, Shield,
    RefreshCw, AlertTriangle, FileText
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, limit, query, addDoc, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface StatusLog {
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'error';
}

interface CollectionStatus {
    name: string;
    status: 'pending' | 'ok' | 'error' | 'empty';
    count?: number;
    message?: string;
}

export function SystemStatus() {
    const [checking, setChecking] = useState(false);
    const [logs, setLogs] = useState<StatusLog[]>([]);
    const [collections, setCollections] = useState<CollectionStatus[]>([
        { name: 'proposals', status: 'pending' },
        { name: 'clients', status: 'pending' },
        { name: 'projects', status: 'pending' },
        { name: 'invoices', status: 'pending' },
        { name: 'users', status: 'pending' },
        { name: 'settings', status: 'pending' }
    ]);
    const [userRole, setUserRole] = useState<string | null>(null);

    const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        setLogs(prev => [{ timestamp: new Date(), message, type }, ...prev]);
    };

    useEffect(() => {
        // Check user role on mount
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Check if we can read the user role (assumes 'users' collection exists)
                    // This is a rough check, in a real app we'd fetch the actual doc
                    setUserRole('authenticated');
                    addLog(`Usuario autenticado: ${user.email}`, 'success');
                } catch (error) {
                    addLog('Error verificando rol de usuario', 'error');
                }
            } else {
                setUserRole(null);
                addLog('Usuario no autenticado', 'error');
            }
        });
        return () => unsubscribe();
    }, []);

    const checkCollection = async (colName: string) => {
        try {
            const q = query(collection(db, colName), limit(1));
            const snapshot = await getDocs(q);
            const fromCache = snapshot.metadata.fromCache;

            let status: CollectionStatus['status'] = 'ok';
            if (snapshot.empty) status = 'empty';

            addLog(`Colección '${colName}' verificada. ${snapshot.size} documentos encontrados. (Origen: ${fromCache ? 'Caché' : 'Servidor'})`, 'success');

            return {
                name: colName,
                status,
                count: snapshot.size,
                message: fromCache ? 'Datos en caché' : 'Conectado a Firebase'
            };
        } catch (error: any) {
            console.error(error);
            addLog(`Error en colección '${colName}': ${error.message}`, 'error');
            return {
                name: colName,
                status: 'error' as const,
                message: error.code || error.message
            };
        }
    };

    const runDiagnostics = async () => {
        setChecking(true);
        addLog('Iniciando diagnóstico del sistema...', 'info');

        const newStatuses: CollectionStatus[] = [];

        for (const col of collections) {
            addLog(`Verificando colección: ${col.name}...`, 'info');
            const result = await checkCollection(col.name);
            newStatuses.push(result);
        }

        setCollections(newStatuses);
        setChecking(false);
        addLog('Diagnóstico completado.', 'info');
    };

    const initializeCollection = async (colName: string) => {
        addLog(`Intentando inicializar colección '${colName}'...`, 'info');
        try {
            let initialData: any = {
                _temp_init: true,
                createdAt: new Date()
            };

            // Ensure data satisfies schema validation in firestore.rules
            switch (colName) {
                case 'proposals':
                    initialData = { ...initialData, title: 'Init Proposal', status: 'draft', type: 'proposal' };
                    break;
                case 'clients':
                    initialData = { ...initialData, name: 'Init Client', email: 'init@client.com' };
                    break;
                case 'projects':
                    initialData = { ...initialData, title: 'Init Project', clientId: 'init_id' };
                    break;
                case 'invoices':
                    initialData = { ...initialData, clientId: 'init_id', number: 'INV-000', total: 0 };
                    break;
                case 'tasks':
                    initialData = { ...initialData, title: 'Init Task', projectId: 'init_id', status: 'todo' };
                    break;
            }

            if (colName === 'settings') {
                await setDoc(doc(db, 'settings', 'agency'), {
                    name: 'Kingdom Agency',
                    email: 'contact@kingdom.com',
                    initializedAt: new Date()
                }, { merge: true });
                addLog(`Colección 'settings' inicializada con documento base.`, 'success');
            } else {
                // Create a persistent placeholder document so the collection remains visible
                await addDoc(collection(db, colName), {
                    ...initialData,
                    _isPlaceholder: true, // Mark as placeholder
                    description: 'Documento generado automáticamente para inicializar la colección'
                });

                // Do NOT delete the document, otherwise the collection disappears in Firestore
                // await deleteDoc(ref); 

                addLog(`Colección '${colName}' creada exitosamente. (Se ha mantenido un documento de ejemplo para persistencia).`, 'success');
            }
            // Re-check
            const result = await checkCollection(colName);
            setCollections(prev => prev.map(c => c.name === colName ? result : c));
        } catch (error: any) {
            addLog(`Error al inicializar '${colName}': ${error.message}`, 'error');
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Estado de la Base de Datos
                        </CardTitle>
                        <CardDescription>
                            Verificación de conexión y permisos de colecciones en Firestore
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <Badge variant={userRole ? "default" : "destructive"}>
                                    {userRole ? "Conectado" : "Desconectado"}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {userRole ? "Permisos activos" : "Requiere autenticación"}
                                </span>
                            </div>
                            <Button
                                onClick={runDiagnostics}
                                disabled={checking || !userRole}
                                size="sm"
                            >
                                {checking ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                                Verificar Todo
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {collections.map((col) => (
                                <div key={col.name} className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
                                    <div className="flex items-center gap-3">
                                        {col.status === 'pending' && <Loader2 className="h-4 w-4 text-muted-foreground" />}
                                        {col.status === 'ok' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                        {col.status === 'empty' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                                        {col.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                                        <div>
                                            <p className="font-medium capitalize">{col.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {col.message || (col.status === 'ok' ? 'Operativo' : 'Estado desconocido')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {col.status === 'empty' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => initializeCollection(col.name)}
                                            >
                                                Inicializar
                                            </Button>
                                        )}
                                        {col.status === 'error' && (
                                            <Badge variant="destructive">Error</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Reglas de Seguridad
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <Shield className="h-4 w-4" />
                            <AlertTitle>Modo Estricto Activo</AlertTitle>
                            <AlertDescription>
                                Las reglas de seguridad están configuradas para rechazar cualquier operación no autenticada o inválida.
                            </AlertDescription>
                        </Alert>
                        <div className="mt-4 text-sm text-muted-foreground">
                            <ul className="list-disc list-inside space-y-1">
                                <li>Validación de esquema en escritura</li>
                                <li>Permisos granulares por colección</li>
                                <li>Protección contra borrado accidental (Solo Admin)</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Registro de Operaciones (Logs)
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-[300px]">
                    <ScrollArea className="h-[400px] w-full rounded-md border p-4 bg-muted/20 font-mono text-xs">
                        {logs.length === 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                No hay registros de actividad reciente
                            </div>
                        )}
                        {logs.map((log, i) => (
                            <div key={i} className="mb-2 last:mb-0">
                                <span className="text-muted-foreground mr-2">
                                    [{log.timestamp.toLocaleTimeString()}]
                                </span>
                                <span className={
                                    log.type === 'error' ? 'text-red-500 font-bold' :
                                        log.type === 'success' ? 'text-green-500' :
                                            'text-foreground'
                                }>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
