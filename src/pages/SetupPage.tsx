import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Building, Database, Palette, FileText } from 'lucide-react';
import { getAgencySettings, updateAgencySettings } from '@/api/crm';
import type { AgencySettings } from '@/types/crm';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { SystemStatus } from '@/components/admin/SystemStatus';

export default function ConfigPage() {
  // const { user } = useAuth(); // Unused
  useAuth();
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, setValue, watch } = useForm<AgencySettings>({
    defaultValues: {
      currency: 'EUR',
      defaultTaxRate: 21
    }
  });

  const logoUrl = watch('logoUrl');
  const isotypeUrl = watch('isotypeUrl');
  const headerBgUrl = watch('headerBgUrl');
  const footerBgUrl = watch('footerBgUrl');
  const primaryColor = watch('primaryColor');

  useEffect(() => {
    const load = async () => {
      try {
        const settings = await getAgencySettings();
        if (settings) {
          Object.entries(settings).forEach(([key, value]) => {
            setValue(key as keyof AgencySettings, value);
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setValue]);

  const onSubmit = async (data: AgencySettings) => {
    try {
      // Sanitize data to remove undefined values
      const sanitizedData = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === undefined ? null : v])
      );
      await updateAgencySettings(sanitizedData);
      toast.success('Configuración guardada');
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar');
    }
  };

  if (loading) return <KingdomLoader />;

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          {/* Minimalist: Removed Title and Description */}
        </div>
        <Button onClick={handleSubmit(onSubmit)} variant="contrast">
          <Save className="mr-2 h-4 w-4" /> Guardar Todo
        </Button>
      </div>

      <Tabs defaultValue="agency" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agency" className="gap-2"><Building className="h-4 w-4" /> Agencia</TabsTrigger>
          <TabsTrigger value="branding" className="gap-2"><Palette className="h-4 w-4" /> Branding</TabsTrigger>
          <TabsTrigger value="legal" className="gap-2"><FileText className="h-4 w-4" /> Legal</TabsTrigger>
          <TabsTrigger value="system" className="gap-2"><Database className="h-4 w-4" /> Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="agency">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Identidad Legal</CardTitle>
                <CardDescription>Estos datos aparecerán en tus facturas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre Comercial</Label>
                    <Input {...register('commercialName')} placeholder="Kingdom Agency" />
                  </div>
                  <div className="space-y-2">
                    <Label>Razón Social (Legal)</Label>
                    <Input {...register('name')} placeholder="Kingdom Media S.L." />
                  </div>
                  <div className="space-y-2">
                    <Label>Identificación Fiscal (CIF/NIF)</Label>
                    <Input {...register('taxId')} placeholder="B12345678" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email de Contacto</Label>
                    <Input {...register('email')} placeholder="admin@kingdom.com" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Dirección Fiscal</Label>
                    <Input {...register('address')} placeholder="Calle Principal 123, Madrid" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferencias Financieras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Moneda por defecto</Label>
                    <Input {...register('currency')} placeholder="EUR" />
                  </div>
                  <div className="space-y-2">
                    <Label>Impuesto por defecto (%)</Label>
                    <Input type="number" {...register('defaultTaxRate', { valueAsNumber: true })} />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Términos de Facturación (Pie de página)</Label>
                    <Input {...register('invoiceTerms')} placeholder="Gracias por confiar en nosotros..." />
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="branding">
          <Card>
            <CardHeader>
              <CardTitle>Identidad Visual</CardTitle>
              <CardDescription>Sube y gestiona los activos visuales que definen la marca de tu agencia en todos los documentos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left Column: Brand Identity */}
                <div className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">Identidad de Marca</h3>
                    <ImageUpload
                      label="Logotipo Principal"
                      value={logoUrl}
                      onChange={(url) => setValue('logoUrl', url)}
                      onRemove={() => setValue('logoUrl', '')}
                      className="aspect-[4/1.5]"
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <ImageUpload
                        label="Isotipo"
                        value={isotypeUrl}
                        onChange={(url) => setValue('isotypeUrl', url)}
                        onRemove={() => setValue('isotypeUrl', '')}
                        className="aspect-square"
                      />
                      <div className="space-y-4">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Colores Corporativos</Label>
                        <div className="space-y-4 pt-1">
                          <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-xl border border-border/50 transition-colors hover:bg-muted/30">
                            <div className="relative h-10 w-10 shrink-0">
                              <input type="color" {...register('primaryColor')} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                              <div className="w-full h-full rounded-full border shadow-sm pointer-events-none" style={{ backgroundColor: primaryColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black text-muted-foreground tracking-tighter mb-0.5">PRIMARIO</p>
                              <Input {...register('primaryColor')} className="h-6 text-[10px] font-mono border-none bg-transparent p-0 focus-visible:ring-0" />
                            </div>
                          </div>

                          <div className="flex items-center gap-4 p-3 bg-muted/20 rounded-xl border border-border/50 transition-colors hover:bg-muted/30">
                            <div className="relative h-10 w-10 shrink-0">
                              <input type="color" {...register('secondaryColor')} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                              <div className="w-full h-full rounded-full border shadow-sm pointer-events-none" style={{ backgroundColor: watch('secondaryColor') }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-black text-muted-foreground tracking-tighter mb-0.5">SECUNDARIO</p>
                              <Input {...register('secondaryColor')} className="h-6 text-[10px] font-mono border-none bg-transparent p-0 focus-visible:ring-0" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: PDF Backgrounds */}
                <div className="space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground border-b pb-2">Fondos de Facturación (PDF)</h3>
                    <ImageUpload
                      label="Cabecera (Header Background)"
                      value={headerBgUrl}
                      onChange={(url) => setValue('headerBgUrl', url)}
                      onRemove={() => setValue('headerBgUrl', '')}
                      className="aspect-[5/1.2]"
                    />

                    <ImageUpload
                      label="Pie de Página (Footer Background)"
                      value={footerBgUrl}
                      onChange={(url) => setValue('footerBgUrl', url)}
                      onRemove={() => setValue('footerBgUrl', '')}
                      className="aspect-[5/1.2]"
                    />

                    <div className="p-4 rounded-xl bg-brand-blue/5 border border-brand-blue/10">
                      <p className="text-[11px] text-brand-blue/80 leading-relaxed italic">
                        * Estos fondos se aplicarán automáticamente a todas tus facturas y presupuestos generados. Para mejores resultados, utiliza imágenes de alta resolución (mín. 2000px de ancho).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle>Documentos Legales</CardTitle>
              <CardDescription>Textos estándar para tus propuestas y contratos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Términos y Condiciones</Label>
                <Textarea
                  {...register('termsAndConditions')}
                  className="min-h-[150px]"
                  placeholder="Cláusulas estándar de contratación..."
                />
              </div>
              <div className="space-y-2">
                <Label>Política de Privacidad</Label>
                <Textarea
                  {...register('privacyPolicy')}
                  className="min-h-[100px]"
                  placeholder="Cómo tratas los datos de tus clientes..."
                />
              </div>
              <div className="space-y-2">
                <Label>Aviso Legal (Pie de página)</Label>
                <Textarea
                  {...register('legalNotice')}
                  placeholder="Datos registrales de la empresa..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <SystemStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
}
