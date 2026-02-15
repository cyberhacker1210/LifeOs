'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(1, 'Mot de passe requis'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { user, loading, resetPassword } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isResetLoading, setIsResetLoading] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    useEffect(() => {
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            toast.success('Connexion réussie !');
            router.push('/');
        } catch (error: any) {
            console.error(error);
            let errorMessage = 'Une erreur est survenue';
            if (error.code === 'auth/invalid-credential') {
                errorMessage = 'Email ou mot de passe incorrect';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'Aucun compte trouvé avec cet email';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Mot de passe incorrect';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Trop de tentatives échouées. Veuillez réessayer plus tard.';
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetEmail) {
            toast.error('Veuillez entrer votre email');
            return;
        }
        setIsResetLoading(true);
        try {
            await resetPassword(resetEmail);
            toast.success('Email de réinitialisation envoyé !');
            setIsDialogOpen(false);
            setResetEmail('');
        } catch (error: any) {
            console.error(error);
            toast.error('Erreur lors de l\'envoi de l\'email');
        } finally {
            setIsResetLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            toast.success('Connexion avec Google réussie !');
            router.push('/');
        } catch (error: any) {
            console.error(error);
            toast.error('Erreur lors de la connexion Google');
        } finally {
            setIsLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Connexion</CardTitle>
                <CardDescription className="text-center">
                    Entrez vos identifiants pour accéder à LifeOS
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" onClick={signInWithGoogle} disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                        )}
                        Google
                    </Button>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Ou continuer avec</span>
                    </div>
                </div>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@exemple.com" {...form.register('email')} disabled={isLoading} />
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2 mt-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="link" className="px-0 font-normal h-auto text-xs">
                                        Mot de passe oublié ?
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleResetPassword}>
                                        <DialogHeader>
                                            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
                                            <DialogDescription>
                                                Entrez votre adresse email pour recevoir un lien de réinitialisation.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                            <Label htmlFor="reset-email">Email</Label>
                                            <Input
                                                id="reset-email"
                                                type="email"
                                                placeholder="m@exemple.com"
                                                value={resetEmail}
                                                onChange={(e) => setResetEmail(e.target.value)}
                                                disabled={isResetLoading}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" disabled={isResetLoading}>
                                                {isResetLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Envoyer le lien
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Input id="password" type="password" {...form.register('password')} disabled={isLoading} />
                        {form.formState.errors.password && (
                            <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                        )}
                    </div>
                    <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Se connecter
                    </Button>
                </form>
            </CardContent>
            <CardFooter>
                <div className="text-sm text-muted-foreground text-center w-full">
                    Pas encore de compte ?{" "}
                    <Link href="/register" className="underline underline-offset-4 hover:text-primary">
                        S'inscrire
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
