'use client';

import type { Institution } from '@/lib/types';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Landmark, Plus, Trash2 } from 'lucide-react';

interface InstitutionManagerProps {
  institutions: Institution[];
  onAddInstitution: (name: string) => void;
  onDeleteInstitution: (id: string) => void;
}

const InstitutionManager: React.FC<InstitutionManagerProps> = ({
  institutions,
  onAddInstitution,
  onDeleteInstitution,
}) => {
  const [newInstitution, setNewInstitution] = useState('');

  const handleAdd = () => {
    if (newInstitution.trim()) {
      onAddInstitution(newInstitution.trim());
      setNewInstitution('');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline"><Landmark className="mr-2 h-4 w-4"/>Gerenciar Instituições</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Instituições</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              value={newInstitution}
              onChange={(e) => setNewInstitution(e.target.value)}
              placeholder="Nome da nova instituição"
            />
            <Button onClick={handleAdd}><Plus className="h-4 w-4 mr-2"/>Adicionar</Button>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
            {institutions.length > 0 ? institutions.map(inst => (
              <div key={inst.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <span>{inst.name}</span>
                <Button variant="ghost" size="icon" onClick={() => onDeleteInstitution(inst.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            )) : (
                <p className="text-center text-sm text-muted-foreground pt-4">Nenhuma instituição cadastrada.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstitutionManager;
