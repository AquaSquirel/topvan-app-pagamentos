'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Trip } from '@/lib/types';
import { getTrips, addTrip, deleteTrip, updateTrip } from '@/lib/firebase/firestore-trips';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const TripCard = ({ trip, onDelete, onTogglePayment }: { trip: Trip; onDelete: (id: string) => void; onTogglePayment: () => void; }) => {
    const isCompleted = new Date(trip.data).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
    const isPaid = trip.statusPagamento === 'Pago';

    return (
        <div className="bg-card rounded-lg border overflow-hidden flex items-stretch">
            <div className="w-2 flex-shrink-0 flex flex-col">
                <div className={cn("h-1/2", isCompleted ? "bg-green-600" : "bg-sky-600")}></div>
                <div className={cn("h-1/2", isPaid ? "bg-green-600" : "bg-red-600")}></div>
            </div>
            <div className="flex-1 p-4 flex flex-col justify-between gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-lg">{trip.destino}</p>
                        {trip.contratante && <p className="text-sm text-muted-foreground">{trip.contratante}</p>}
                        <p className="text-sm text-muted-foreground mt-1">{formatDate(trip.data)}</p>
                        <p className="font-semibold text-base block mt-2">{formatCurrency(trip.valor)}</p>
                    </div>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-5 w-5 text-destructive" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Viagem?</AlertDialogTitle>
                            <AlertDialogDescription>
                            Você tem certeza que deseja excluir a viagem para {trip.destino}? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(trip.id)}>Sim, excluir</AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                 <Button 
                    onClick={onTogglePayment} 
                    variant={isPaid ? 'destructive' : 'default'} 
                    className={cn(
                        "w-full justify-center text-left px-4 py-2 font-bold h-auto text-sm",
                        isPaid ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    )}
                >
                    {isPaid ? <X className="mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                    <span>{isPaid ? 'Marcar Pendente' : 'Marcar Paga'}</span>
                </Button>
            </div>
        </div>
    );
};

const AddTripForm = ({ onAddTrip }: { onAddTrip: (trip: Omit<Trip, 'id' | 'statusPagamento'>) => void }) => {
    const [destino, setDestino] = useState('');
    const [contratante, setContratante] = useState('');
    const [valor, setValor] = useState('');
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = () => {
        const valorLimpo = valor.replace(',', '.');
        const parsedValor = parseFloat(valorLimpo);

        if (destino && !isNaN(parsedValor) && parsedValor > 0 && date) {
            onAddTrip({
                destino,
                contratante,
                valor: parsedValor,
                data: date.toISOString(),
            });
            setDestino('');
            setContratante('');
            setValor('');
            setDate(new Date());
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Adicionar Viagem</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Nova Viagem</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Input placeholder="Destino" value={destino} onChange={(e) => setDestino(e.target.value)} />
                    <Input placeholder="Nome do Contratante (Opcional)" value={contratante} onChange={(e) => setContratante(e.target.value)} />
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">R$</span>
                        <Input 
                            type="text" 
                            inputMode="decimal" 
                            placeholder="Valor" 
                            value={valor} 
                            onChange={(e) => setValor(e.target.value)} 
                            className="pl-9" 
                        />
                    </div>
                     <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Selecione a data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                          />
                        </PopoverContent>
                    </Popover>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit}>Adicionar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ViagensPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchTrips = useCallback(async () => {
        try {
            setLoading(true);
            const tripsData = await getTrips();
            setTrips(tripsData);
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível carregar as viagens.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchTrips();
    }, [fetchTrips]);

    const handleAddTrip = async (tripData: Omit<Trip, 'id' | 'statusPagamento'>) => {
        try {
            const newTrip = { ...tripData, statusPagamento: 'Pendente' as const };
            await addTrip(newTrip);
            await fetchTrips();
            toast({ title: "Sucesso!", description: "Viagem adicionada." });
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível adicionar a viagem.", variant: "destructive" });
        }
    };

    const handleDeleteTrip = async (id: string) => {
        try {
            await deleteTrip(id);
            await fetchTrips();
            toast({ title: "Sucesso!", description: "Viagem excluída." });
        } catch (error) {
            toast({ title: "Erro", description: "Não foi possível excluir a viagem.", variant: "destructive" });
        }
    };

    const handleTogglePayment = async (tripId: string) => {
        const trip = trips.find(t => t.id === tripId);
        if (!trip) return;

        const newStatus = trip.statusPagamento === 'Pago' ? 'Pendente' : 'Pago';
        try {
            await updateTrip({ ...trip, statusPagamento: newStatus });
            await fetchTrips();
        } catch (e) {
            toast({ title: "Erro", description: "Não foi possível alterar o status de pagamento.", variant: "destructive" });
        }
    };

    const { upcomingTrips, completedTrips, totalRevenue } = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); 
        const sortedTrips = [...trips].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
        
        const upcoming = sortedTrips.filter(t => new Date(t.data) >= now);
        
        const completed = sortedTrips.filter(t => new Date(t.data) < now);
        
        const revenue = trips.filter(t => t.statusPagamento === 'Pago').reduce((acc, trip) => acc + trip.valor, 0);

        return { upcomingTrips: upcoming, completedTrips: completed.reverse(), totalRevenue: revenue };
    }, [trips]);

    return (
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                 <h2 className="text-3xl font-bold tracking-tight">Controle de Viagens</h2>
                <AddTripForm onAddTrip={handleAddTrip} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                 <Card>
                    <CardHeader>
                        <CardTitle>Receita com Viagens (Pagas)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-3/4" /> : <p className="text-3xl font-bold text-green-500">{formatCurrency(totalRevenue)}</p>}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Total de Viagens Agendadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-1/4" /> : <p className="text-3xl font-bold">{trips.length}</p>}
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-2xl font-semibold mb-4">Próximas Viagens ({upcomingTrips.length})</h3>
                    <div className="space-y-4">
                        {loading && <> <Skeleton className="h-24 w-full" /> <Skeleton className="h-24 w-full" /> </>}
                        {!loading && upcomingTrips.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhuma viagem futura agendada.</p>}
                        {upcomingTrips.map(trip => 
                            <TripCard 
                                key={trip.id} 
                                trip={trip} 
                                onDelete={handleDeleteTrip} 
                                onTogglePayment={() => handleTogglePayment(trip.id)}
                            />
                        )}
                    </div>
                </div>
                 <div>
                    <h3 className="text-2xl font-semibold mb-4">Viagens Realizadas ({completedTrips.length})</h3>
                    <div className="space-y-4">
                         {loading && <> <Skeleton className="h-24 w-full" /> <Skeleton className="h-24 w-full" /> </>}
                        {!loading && completedTrips.length === 0 && <p className="text-muted-foreground text-center py-4">Nenhuma viagem realizada ainda.</p>}
                        {completedTrips.map(trip => 
                            <TripCard 
                                key={trip.id} 
                                trip={trip} 
                                onDelete={handleDeleteTrip} 
                                onTogglePayment={() => handleTogglePayment(trip.id)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
