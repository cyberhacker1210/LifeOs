'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useTrackerStore } from '@/stores/useTrackerStore';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
    Download,
    Moon,
    Sun,
    Monitor,
    Clock as ClockIcon,
    Target,
    Save,
    Loader2,
    User,
    Lock,
    Trash2,
    Bell,
    Palette,
    Activity
} from 'lucide-react';

export default function SettingsPage() {
    const { user, profile, updateProfileInfo, updateSettings, deleteAccount, resetPassword } = useAuthStore();
    const { tasks } = useTaskStore();
    const { sessions } = useTrackerStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Profile State
    const [displayName, setDisplayName] = useState(profile?.firstName || user?.displayName || '');
    const [photoURL, setPhotoURL] = useState(user?.photoURL || '');

    useEffect(() => {
        setMounted(true);
    }, []);

    // Schedules State
    const [workStart, setWorkStart] = useState(profile?.horaires?.lever || '09:00');
    const [workEnd, setWorkEnd] = useState(profile?.horaires?.coucher || '18:00');
    const [momentProductif, setMomentProductif] = useState(profile?.horaires?.momentProductif || 'morning');
    const [dailyGoal, setDailyGoal] = useState(profile?.objectifs?.tempsProductifParJour ? (profile.objectifs.tempsProductifParJour / 60).toString() : '6');

    // Preferences State
    const [prefAnimations, setPrefAnimations] = useState(profile?.preferences?.animations ?? true);
    const [prefReminders, setPrefReminders] = useState(profile?.preferences?.taskReminders ?? true);
    const [prefAlerts, setPrefAlerts] = useState(profile?.preferences?.distractionAlerts ?? true);
    const [prefSounds, setPrefSounds] = useState(profile?.preferences?.interfaceSounds ?? true);

    const handleUpdateProfile = async () => {
        setIsLoading(true);
        try {
            await updateProfileInfo(displayName, photoURL);
            toast.success('Profil mis à jour !');
        } catch (error) {
            toast.error('Erreur lors de la mise à jour');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setIsLoading(true);
        try {
            await updateSettings({
                horaires: {
                    ...profile?.horaires,
                    lever: workStart,
                    coucher: workEnd,
                    momentProductif: momentProductif as any
                },
                objectifs: {
                    ...profile?.objectifs,
                    tempsProductifParJour: parseInt(dailyGoal) * 60,
                    maxDistractionsParJour: profile?.objectifs?.maxDistractionsParJour || 30,
                    nbTachesMinParJour: profile?.objectifs?.nbTachesMinParJour || 3
                },
                preferences: {
                    animations: prefAnimations,
                    taskReminders: prefReminders,
                    distractionAlerts: prefAlerts,
                    interfaceSounds: prefSounds
                }
            });
            toast.success('Préférences enregistrées !');
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportData = () => {
        const data = {
            profile: {
                uid: user?.uid,
                email: user?.email,
                displayName: user?.displayName,
            },
            tasks,
            sessions,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lifeos-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Données exportées avec succès');
    };

    const handleResetPassword = async () => {
        if (!user?.email) return;
        setIsLoading(true);
        try {
            await resetPassword(user.email);
            toast.success('Email de réinitialisation envoyé !');
        } catch (error) {
            toast.error('Erreur lors de l\'envoi de l\'email');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;
        setIsLoading(true);
        try {
            await deleteAccount();
            toast.success('Compte supprimé');
            router.push('/login');
        } catch (error: any) {
            if (error.code === 'auth/requires-recent-login') {
                toast.error('Veuillez vous reconnecter avant de supprimer votre compte.');
            } else {
                toast.error('Erreur lors de la suppression');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestNotification = () => {
        toast.info("Test de notification : Tout fonctionne ! 🔔", {
            description: "Ceci est un exemple de notification LifeOS.",
        });
    };

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-8 pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
                <p className="text-muted-foreground">
                    Gérez vos préférences et votre compte LifeOS.
                </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profil
                    </TabsTrigger>
                    <TabsTrigger value="app" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Apparence
                    </TabsTrigger>
                    <TabsTrigger value="schedule" className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Horaires & Objectifs
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="account" className="flex items-center gap-2 text-red-500">
                        <Lock className="h-4 w-4" />
                        Compte
                    </TabsTrigger>
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-4">
                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                        <CardHeader>
                            <CardTitle>Votre Profil</CardTitle>
                            <CardDescription>
                                Ces informations seront visibles sur votre tableau de bord.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20 border-2 border-primary/20">
                                    <AvatarImage src={photoURL} />
                                    <AvatarFallback className="text-2xl bg-primary/10">
                                        {displayName?.[0] || user?.email?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2 flex-1">
                                    <Label htmlFor="photo">URL de la photo de profil</Label>
                                    <Input
                                        id="photo"
                                        placeholder="https://..."
                                        value={photoURL}
                                        onChange={(e) => setPhotoURL(e.target.value)}
                                        className="bg-background/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Nom / Prénom</Label>
                                <Input
                                    id="name"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="bg-muted/50 opacity-70"
                                />
                                <p className="text-xs text-muted-foreground">
                                    L'email ne peut pas être modifié.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleUpdateProfile} disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enregistrer les modifications
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                        <CardHeader>
                            <CardTitle>Données & Confidentialité</CardTitle>
                            <CardDescription>
                                Exportez vos données pour une utilisation externe ou sauvegarde.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" onClick={handleExportData} className="gap-2">
                                <Download className="h-4 w-4" />
                                Exporter mes données (.json)
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* App Tab */}
                <TabsContent value="app" className="space-y-4">
                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                        <CardHeader>
                            <CardTitle>Thème</CardTitle>
                            <CardDescription>
                                Choisissez le style visuel de l'application.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                <p className="text-sm text-muted-foreground italic">
                                    LifeOS est optimisé pour une expérience sombre haute performance. Personnalisez vos animations ci-dessous.
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="space-y-1">
                                    <Label>Animations</Label>
                                    <p className="text-sm text-muted-foreground">Activer les effets visuels fluides.</p>
                                </div>
                                <Switch
                                    checked={prefAnimations}
                                    onCheckedChange={setPrefAnimations}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule" className="space-y-4">
                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                        <CardHeader>
                            <CardTitle>Horaires de travail</CardTitle>
                            <CardDescription>
                                Définissez vos plages horaires pour l'auto-planification.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <ClockIcon className="h-4 w-4" /> Début
                                    </Label>
                                    <Input
                                        type="time"
                                        value={workStart}
                                        onChange={(e) => setWorkStart(e.target.value)}
                                        className="bg-background/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <ClockIcon className="h-4 w-4" /> Fin
                                    </Label>
                                    <Input
                                        type="time"
                                        value={workEnd}
                                        onChange={(e) => setWorkEnd(e.target.value)}
                                        className="bg-background/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-white/5">
                                <Label className="flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4" /> Moment le plus productif
                                </Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button
                                        variant={momentProductif === 'morning' ? 'secondary' : 'outline'}
                                        onClick={() => setMomentProductif('morning')}
                                        className="text-xs"
                                    >
                                        Matin
                                    </Button>
                                    <Button
                                        variant={momentProductif === 'afternoon' ? 'secondary' : 'outline'}
                                        onClick={() => setMomentProductif('afternoon')}
                                        className="text-xs"
                                    >
                                        Après-midi
                                    </Button>
                                    <Button
                                        variant={momentProductif === 'evening' ? 'secondary' : 'outline'}
                                        onClick={() => setMomentProductif('evening')}
                                        className="text-xs"
                                    >
                                        Soir
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                        <CardHeader>
                            <CardTitle>Objectifs quotidiens</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Target className="h-4 w-4" /> Objectif de concentration (heures / jour)
                                </Label>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="number"
                                        value={dailyGoal}
                                        onChange={(e) => setDailyGoal(e.target.value)}
                                        className="bg-background/50 w-24"
                                    />
                                    <p className="text-sm text-muted-foreground">heures productives</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="gap-2" onClick={handleSaveSettings} disabled={isLoading}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Enregistrer
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-4">
                    <Card className="bg-card/50 backdrop-blur-sm border-white/10">
                        <CardHeader>
                            <CardTitle>Préférences de notification</CardTitle>
                            <CardDescription>
                                Choisissez comment vous voulez être tenu informé.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label>Rappels de tâches</Label>
                                    <p className="text-sm text-muted-foreground">Notifications avant les deadlines importantes.</p>
                                </div>
                                <Switch
                                    checked={prefReminders}
                                    onCheckedChange={setPrefReminders}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label>Alertes de distraction</Label>
                                    <p className="text-sm text-muted-foreground">Alerte si le timer de distraction dépasse le seuil.</p>
                                </div>
                                <Switch
                                    checked={prefAlerts}
                                    onCheckedChange={setPrefAlerts}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label>Sons de l'interface</Label>
                                    <p className="text-sm text-muted-foreground">Jouer des sons lors des interactions.</p>
                                </div>
                                <Switch
                                    checked={prefSounds}
                                    onCheckedChange={setPrefSounds}
                                />
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <Button variant="outline" onClick={handleTestNotification} className="w-full sm:w-auto">
                                    <Bell className="mr-2 h-4 w-4" />
                                    Tester les notifications
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Account Tab */}
                <TabsContent value="account" className="space-y-4">
                    <Card className="bg-card/50 backdrop-blur-sm border-white/10 border-red-500/20">
                        <CardHeader>
                            <CardTitle className="text-red-400">Sécurité & Compte</CardTitle>
                            <CardDescription>
                                Actions sensibles concernant votre compte.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium">Mot de passe</h4>
                                <Button variant="outline" onClick={handleResetPassword} disabled={isLoading}>
                                    Envoyer un email de réinitialisation
                                </Button>
                            </div>

                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <div className="rounded-lg bg-red-500/5 border border-red-500/10 p-4">
                                    <h4 className="text-sm font-bold text-red-400 mb-1">Zone de danger</h4>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        Une fois votre compte supprimé, toutes vos données (tâches, sessions, profil) seront définitivement effacées.
                                    </p>
                                    <Button variant="destructive" onClick={handleDeleteAccount} disabled={isLoading} className="w-full sm:w-auto">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Supprimer définitivement le compte
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div >
    );
}
