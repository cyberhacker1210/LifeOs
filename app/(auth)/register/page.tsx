'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { user, loading } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    const onSubmit = async (data: RegisterFormValues) => {
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            await updateProfile(userCredential.user, {
                displayName: data.name,
            });
            toast.success('Compte créé avec succès !');
            // Onboarding logic could go here
            router.push('/');
        } catch (error: any) {
            console.error(error);
            let errorMessage = 'Une erreur est survenue';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Cet email est déjà utilisé';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Le mot de passe est trop faible';
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            toast.success('Connexion avec Google réussie !');
            router.push('/dashboard');
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
        <Card>
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">Inscription</CardTitle>
                <CardDescription className="text-center">
                    Créez votre compte pour commencer avec LifeOS
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
                        S'inscrire avec Google
                    </Button>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Ou s'inscrire avec un email</span>
                    </div>
                </div>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nom</Label>
                        <Input id="name" placeholder="John Doe" {...form.register('name')} disabled={isLoading} />
                        {form.formState.errors.name && (
                            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2 mt-4">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@exemple.com" {...form.register('email')} disabled={isLoading} />
                        {form.formState.errors.email && (
                            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2 mt-4">
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input id="password" type="password" {...form.register('password')} disabled={isLoading} />
                        {form.formState.errors.password && (
                            <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2 mt-4">
                        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                        <Input id="confirmPassword" type="password" {...form.register('confirmPassword')} disabled={isLoading} />
                        {form.formState.errors.confirmPassword && (
                            <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>
                    <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Créer un compte
                    </Button>
                </form>
            </CardContent>
            <CardFooter>
                <div className="text-sm text-muted-foreground text-center w-full">
                    Déjà un compte ?{" "}
                    <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                        Se connecter
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
