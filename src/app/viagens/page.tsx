'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Trip } from '@/lib/types';
import { getTrips, addTrip, deleteTrip, updateTrip, addReturnTrip } from '@/lib/firebase/firestore-trips';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AddTripForm } from '@/components/trip-form';
import TripCard from '@/components/trip-card';

export default function ViagensPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const [isTripFormOpen, setIsTripFormOpen] = useState(false);
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);

    const openTripForm = useCallback((trip: Trip | null = null) => {
        setEditingTrip(trip);
        setIsTripFormOpen(true);
    }, []);

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

    const handleAddOrUpdateTrip = async (tripData: any) => {
       try {
            if (tripData.id) {
                // Update logic
                await updateTrip(tripData);
                toast({ title: "Sucesso!", description: "Viagem atualizada." });
            } else {
                // Add logic
                const { dataVolta, temVolta, ...idaData } = tripData;
                
                // Add the main trip (ida)
                await addTrip(idaData);
                
                // If there's a return date, add the return trip
                if (temVolta && dataVolta) {
                    await addReturnTrip(idaData.destino, dataVolta);
                }

                toast({ title: "Sucesso!", description: "Viagem adicionada." });
            }
            await fetchTrips();
        } catch (error) {
            console.error("Error saving trip:", error);
            toast({ title: "Erro", description: "Não foi possível salvar a viagem.", variant: "destructive" });
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

    const handleToggleArchive = async (tripId: string) => {
        const trip = trips.find(t => t.id === tripId);
        if (!trip) return;

        const newStatus = trip.statusPagamento === 'Arquivado' ? 'Pendente' : 'Arquivado';
        try {
            await updateTrip({ ...trip, statusPagamento: newStatus });
            await fetchTrips();
            toast({ title: "Sucesso!", description: `Viagem ${newStatus === 'Arquivado' ? 'arquivada' : 'desarquivada'}.` });
        } catch (e) {
            toast({ title: "Erro", description: "Não foi possível alterar o status de arquivamento.", variant: "destructive" });
        }
    };

    const { upcomingTrips, completedTrips, totalRevenue, totalPending } = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0); 
        const sortedTrips = [...trips].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
        
        const upcoming = sortedTrips.filter(t => new Date(t.data) >= now && t.statusPagamento !== 'Arquivado');
        const completed = sortedTrips.filter(t => new Date(t.data) < now || t.statusPagamento === 'Arquivado');
        
        const revenue = trips.filter(t => t.statusPagamento === 'Pago').reduce((acc, trip) => acc + trip.valor, 0);
        const pending = trips.filter(t => t.statusPagamento === 'Pendente').reduce((acc, trip) => acc + trip.valor, 0);

        return { upcomingTrips: upcoming, completedTrips: completed.reverse(), totalRevenue: revenue, totalPending: pending };
    }, [trips]);

    return (
        <main className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                 <h2 className="text-3xl font-bold tracking-tight">Controle de Viagens</h2>
                <Button onClick={() => openTripForm()}><Plus className="mr-2 h-4 w-4" /> Adicionar Viagem</Button>
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
                        <CardTitle>Total Pendente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-3/4" /> : <p className="text-3xl font-bold text-red-500">{formatCurrency(totalPending)}</p>}
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
                                onEdit={() => openTripForm(trip)}
                                onDelete={() => handleDeleteTrip(trip.id)} 
                                onTogglePayment={() => handleTogglePayment(trip.id)}
                                onToggleArchive={() => handleToggleArchive(trip.id)}
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
                                onEdit={() => openTripForm(trip)}
                                onDelete={() => handleDeleteTrip(trip.id)} 
                                onTogglePayment={() => handleTogglePayment(trip.id)}
                                onToggleArchive={() => handleToggleArchive(trip.id)}
                            />
                        )}
                    </div>
                </div>
            </div>
             <AddTripForm
                key={editingTrip ? editingTrip.id : 'new'}
                isOpen={isTripFormOpen}
                setIsOpen={setIsTripFormOpen}
                trip={editingTrip}
                onSave={handleAddOrUpdateTrip}
            />
        </main>
    );
}
