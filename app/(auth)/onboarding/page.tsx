'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, ArrowRight, ArrowLeft, Check, Moon, Sun, Sunrise } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
    const { user, completeOnboarding } = useAuthStore();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [firstName, setFirstName] = useState('');
    const [horaires, setHoraires] = useState({
        lever: '07:00',
        coucher: '23:00',
        momentProductif: 'morning' as 'morning' | 'afternoon' | 'evening',
    });
    const [objectifs, setObjectifs] = useState({
        tempsProductifParJour: 120, // 2h
        maxDistractionsParJour: 30,
        nbTachesMinParJour: 3,
    });

    const totalSteps = 4;

    const handleNext = () => {
        if (step === 1 && !firstName) {
            toast.error('Veuillez entrer votre prénom');
            return;
        }
        if (step < totalSteps) setStep(step + 1);
        else handleComplete();
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            await completeOnboarding({
                firstName,
                horaires,
                objectifs,
            });
            toast.success('Configuration terminée !');
            router.push('/');
        } catch (error) {
            console.error(error);
            toast.error('Une erreur est survenue lors de l\'enregistrement');
        } finally {
            setIsLoading(false);
        }
    };

    const steps = [
        { id: 1, title: 'Bienvenue' },
        { id: 2, title: 'Rythme' },
        { id: 3, title: 'Objectifs' },
        { id: 4, title: 'Prêt !' },
    ];

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
            <Card className="w-full max-w-lg border-white/10 bg-card/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / totalSteps) * 100}%` }}
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CardHeader className="pt-8 text-center">
                            <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                {step === 1 && "Commençons par faire connaissance"}
                                {step === 2 && "Ton rythme de vie"}
                                {step === 3 && "Tes objectifs quotidiens"}
                                {step === 4 && "On y est presque !"}
                            </CardTitle>
                            <CardDescription className="text-lg">
                                {step === 1 && "Comment devrions-nous t'appeler ?"}
                                {step === 2 && "Gère tes horaires pour mieux planifier ta journée."}
                                {step === 3 && "Définissons ensemble ce qu'est une bonne journée."}
                                {step === 4 && "Confirme tes groupes par défaut et lance-toi."}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="py-6 space-y-6">
                            {/* Step 1: Name */}
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-base">Prénom</Label>
                                        <Input
                                            id="firstName"
                                            placeholder="Ton prénom"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="text-lg py-6 bg-background/50 border-white/10 focus:border-primary/50"
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-sm text-muted-foreground text-center italic">
                                        "C'est la première étape vers ton nouveau système d'exploitation personnel."
                                    </p>
                                </div>
                            )}

                            {/* Step 2: Rythme */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Sunrise className="h-4 w-4 text-orange-400" />
                                                Heure de lever
                                            </Label>
                                            <Input
                                                type="time"
                                                value={horaires.lever}
                                                onChange={(e) => setHoraires({ ...horaires, lever: e.target.value })}
                                                className="bg-background/50 border-white/10"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="flex items-center gap-2">
                                                <Moon className="h-4 w-4 text-blue-400" />
                                                Heure de coucher
                                            </Label>
                                            <Input
                                                type="time"
                                                value={horaires.coucher}
                                                onChange={(e) => setHoraires({ ...horaires, coucher: e.target.value })}
                                                className="bg-background/50 border-white/10"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Quand es-tu le plus productif ?</Label>
                                        <RadioGroup
                                            value={horaires.momentProductif}
                                            onValueChange={(v: any) => setHoraires({ ...horaires, momentProductif: v })}
                                            className="grid grid-cols-3 gap-2"
                                        >
                                            <Label
                                                htmlFor="morning"
                                                className={cn(
                                                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                                                    horaires.momentProductif === 'morning' && "border-primary bg-primary/5"
                                                )}
                                            >
                                                <RadioGroupItem value="morning" id="morning" className="sr-only" />
                                                <Sunrise className="mb-3 h-6 w-6" />
                                                Matin
                                            </Label>
                                            <Label
                                                htmlFor="afternoon"
                                                className={cn(
                                                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                                                    horaires.momentProductif === 'afternoon' && "border-primary bg-primary/5"
                                                )}
                                            >
                                                <RadioGroupItem value="afternoon" id="afternoon" className="sr-only" />
                                                <Sun className="mb-3 h-6 w-6" />
                                                Après-midi
                                            </Label>
                                            <Label
                                                htmlFor="evening"
                                                className={cn(
                                                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                                                    horaires.momentProductif === 'evening' && "border-primary bg-primary/5"
                                                )}
                                            >
                                                <RadioGroupItem value="evening" id="evening" className="sr-only" />
                                                <Moon className="mb-3 h-6 w-6" />
                                                Soir
                                            </Label>
                                        </RadioGroup>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Objectifs */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label>Temps productif visé (minutes par jour)</Label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="30"
                                                max="600"
                                                step="30"
                                                value={objectifs.tempsProductifParJour}
                                                onChange={(e) => setObjectifs({ ...objectifs, tempsProductifParJour: parseInt(e.target.value) })}
                                                className="flex-1 accent-primary"
                                            />
                                            <span className="font-bold text-lg min-w-[60px]">{Math.floor(objectifs.tempsProductifParJour / 60)}h{objectifs.tempsProductifParJour % 60 ? objectifs.tempsProductifParJour % 60 : ''}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Max distractions autorisées (minutes par jour)</Label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="0"
                                                max="120"
                                                step="5"
                                                value={objectifs.maxDistractionsParJour}
                                                onChange={(e) => setObjectifs({ ...objectifs, maxDistractionsParJour: parseInt(e.target.value) })}
                                                className="flex-1 accent-red-500"
                                            />
                                            <span className="font-bold text-lg min-w-[60px]">{objectifs.maxDistractionsParJour}m</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label>Nombre de tâches min. terminées par jour</Label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="1"
                                                max="10"
                                                value={objectifs.nbTachesMinParJour}
                                                onChange={(e) => setObjectifs({ ...objectifs, nbTachesMinParJour: parseInt(e.target.value) })}
                                                className="flex-1 accent-emerald-500"
                                            />
                                            <span className="font-bold text-lg min-w-[60px] text-center">{objectifs.nbTachesMinParJour}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Ready */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Check className="h-5 w-5 text-primary" />
                                            Tes groupes par défaut
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-sm border border-indigo-500/30">Scolaire</span>
                                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm border border-emerald-500/30">Sport</span>
                                            <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm border border-orange-500/30">Perso</span>
                                            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm border border-purple-500/30">Projets</span>
                                        </div>
                                        <p className="mt-3 text-sm text-muted-foreground">
                                            Tu pourras en ajouter d'autres dans les paramètres.
                                        </p>
                                    </div>

                                    <div className="text-center space-y-2">
                                        <p className="font-medium">Tout est prêt, {firstName} !</p>
                                        <p className="text-sm text-muted-foreground font-mono">
                                            Initialisation du système...
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </motion.div>
                </AnimatePresence>

                <CardFooter className="pb-8 pt-2 flex justify-between">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={step === 1 || isLoading}
                        className="text-muted-foreground"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Précédent
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={isLoading}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white min-w-[120px]"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : step === totalSteps ? (
                            "C'est parti !"
                        ) : (
                            <>
                                Suivant
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
