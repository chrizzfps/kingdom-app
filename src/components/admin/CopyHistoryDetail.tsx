import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Sparkles, Instagram, Twitter, Music2, Youtube } from 'lucide-react';
import type { SocialPost } from '@/api/social';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CopyHistoryDetailProps {
    post: SocialPost | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CopyHistoryDetail({ post, open, onOpenChange }: CopyHistoryDetailProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    if (!post) return null;

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const allSuggestions = post.allSuggestions || [post.selectedIdea];
    const selectedIndex = allSuggestions.indexOf(post.selectedIdea);

    const platforms = [
        { id: 'instagram', name: 'Instagram', icon: Instagram, copy: post.outputs.instagram },
        { id: 'x', name: 'X / Twitter', icon: Twitter, copy: post.outputs.x },
        { id: 'tiktok', name: 'TikTok', icon: Music2, copy: post.outputs.tiktok },
        { id: 'youtube_long', name: 'YouTube (Largo)', icon: Youtube, copy: post.outputs.youtube_long },
        { id: 'youtube_short', name: 'YouTube (Corto)', icon: Youtube, copy: post.outputs.youtube_short },
    ];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-brand-blue" />
                        Detalles del Copy
                    </SheetTitle>
                    <SheetDescription>
                        {post.createdAt && format(
                            post.createdAt.seconds ? new Date(post.createdAt.seconds * 1000) : new Date(post.createdAt),
                            "d 'de' MMMM 'de' yyyy 'a las' HH:mm",
                            { locale: es }
                        )}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {/* Original Brief */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Brief Original</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {post.brief || 'No disponible'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* All AI Suggestions */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Enfoques Generados ({allSuggestions.length})</h3>
                        <div className="space-y-3">
                            {allSuggestions.map((suggestion, index) => {
                                const isSelected = index === selectedIndex;
                                return (
                                    <Card
                                        key={index}
                                        className={cn(
                                            "transition-all",
                                            isSelected && "border-brand-blue bg-brand-blue/5"
                                        )}
                                    >
                                        <CardContent className="pt-4">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <Badge
                                                    variant={isSelected ? "default" : "outline"}
                                                    className={isSelected ? "bg-[#000000] text-[#ffffff] dark:bg-[#ffffff] dark:text-[#000000]" : ""}
                                                >
                                                    {isSelected ? '✓ Seleccionado' : `Opción ${index + 1}`}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(suggestion, `suggestion-${index}`)}
                                                >
                                                    {copiedId === `suggestion-${index}` ? (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">{suggestion}</p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>

                    {/* Platform Copies */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Copys por Plataforma</h3>
                        <Tabs defaultValue="instagram" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                {platforms.map((platform) => (
                                    <TabsTrigger key={platform.id} value={platform.id} className="gap-2">
                                        <platform.icon className="h-4 w-4" />
                                        <span className="hidden sm:inline">{platform.name}</span>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {platforms.map((platform) => (
                                <TabsContent key={platform.id} value={platform.id} className="space-y-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <platform.icon className="h-5 w-5" />
                                                {platform.name}
                                            </CardTitle>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => copyToClipboard(platform.copy, platform.id)}
                                            >
                                                {copiedId === platform.id ? (
                                                    <>
                                                        <Check className="h-4 w-4 mr-2 text-green-500" />
                                                        Copiado
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Copiar
                                                    </>
                                                )}
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            <Textarea
                                                value={platform.copy}
                                                readOnly
                                                className="min-h-[200px] font-mono text-sm resize-none"
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
