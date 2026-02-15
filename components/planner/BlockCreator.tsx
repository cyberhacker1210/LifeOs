'use client';

import { useState } from 'react';
import { usePlannerStore } from '@/stores/usePlannerStore';
import { useAuthStore } from '@/stores/useAuthStore';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { TimeBlockType } from '@/types/planner';
import { Plus, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface BlockCreatorProps {
    date: Date;
    children?: React.ReactNode;
}

export function BlockCreator({ date, children }: BlockCreatorProps) {
    const { addBlock } = usePlannerStore();
    const { user } = useAuthStore();
    const [open, setOpen] = useState(false);

    const [label, setLabel] = useState('');
    const [type, setType] = useState<TimeBlockType>('work');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [color, setColor] = useState('#3b82f6');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const dateStr = format(date, 'yyyy-MM-dd');

        // Calculate duration
        const [sH, sM] = startTime.split(':').map(Number);
        const [eH, eM] = endTime.split(':').map(Number);
        const durationMinutes = (eH * 60 + eM) - (sH * 60 + sM);

        await addBlock(dateStr, {
            type,
            label,
            startTime,
            endTime,
            durationMinutes,
            color
        });

        setOpen(false);
        setLabel('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button size="icon" className="rounded-full h-12 w-12 shadow-2xl">
                        <Plus className="h-6 w-6" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">📅 Nouveau bloc de temps</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="label">Titre</Label>
                        <Input
                            id="label"
                            placeholder="Ex: Cours de Maths"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={(v: TimeBlockType) => setType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="school">🏫 Lycée / École</SelectItem>
                                <SelectItem value="work">📚 Travail / Révisions</SelectItem>
                                <SelectItem value="routine">✨ Routine</SelectItem>
                                <SelectItem value="event">📅 Événement</SelectItem>
                                <SelectItem value="break">☕ Pause</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start">Début</Label>
                            <Input
                                id="start"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end">Fin</Label>
                            <Input
                                id="end"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="color">Couleur</Label>
                        <div className="flex gap-2">
                            {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-white scale-110' : 'border-transparent opacity-70'}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => setColor(c)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
                        <Button type="submit" className="font-bold">Ajouter au planning</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
