import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Metal } from '@/types';
import { Settings, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getMetalColorClasses } from './MetalSelector';

interface MetalManagementProps {
  metals: Metal[];
  onAdd: (name: string, symbol: string, color: string) => void;
  onDelete: (id: string) => boolean;
  canDelete: (id: string) => boolean;
}

const AVAILABLE_COLORS = [
  { id: 'amber', name: 'Gold' },
  { id: 'slate', name: 'Silver' },
  { id: 'zinc', name: 'Platinum' },
  { id: 'rose', name: 'Rose' },
  { id: 'emerald', name: 'Green' },
  { id: 'blue', name: 'Blue' },
  { id: 'purple', name: 'Purple' },
];

export const MetalManagement = ({ metals, onAdd, onDelete, canDelete }: MetalManagementProps) => {
  const [open, setOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [color, setColor] = useState('zinc');

  const handleAdd = () => {
    if (!name.trim()) {
      toast.error('Metal name is required');
      return;
    }
    if (!symbol.trim()) {
      toast.error('Symbol is required');
      return;
    }
    if (symbol.length > 3) {
      toast.error('Symbol should be 1-3 characters');
      return;
    }
    
    onAdd(name.trim(), symbol.trim().toUpperCase(), color);
    toast.success(`${name} added successfully`);
    setName('');
    setSymbol('');
    setColor('zinc');
    setShowAddForm(false);
  };

  const handleDelete = (id: string, metalName: string) => {
    if (!canDelete(id)) {
      toast.error(`Cannot delete ${metalName}. It has transactions or is a default metal.`);
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${metalName}?`)) {
      const success = onDelete(id);
      if (success) {
        toast.success(`${metalName} deleted`);
      } else {
        toast.error(`Failed to delete ${metalName}`);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full border-primary/30 hover:bg-primary/10" title="Manage Metals">
          <Settings className="h-4 w-4 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Settings className="h-5 w-5 text-primary" />
            Manage Metals
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          {/* Existing Metals */}
          <div className="space-y-2">
            {metals.map((metal) => {
              const colors = getMetalColorClasses(metal.color);
              const deletable = canDelete(metal.id);
              
              return (
                <div 
                  key={metal.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${colors.border} ${colors.bg}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${colors.text} bg-background/50`}>
                      {metal.symbol}
                    </span>
                    <div>
                      <p className={`font-medium ${colors.text}`}>{metal.name}</p>
                      {metal.isDefault && (
                        <p className="text-xs text-muted-foreground">Default</p>
                      )}
                    </div>
                  </div>
                  {!metal.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`h-8 w-8 ${deletable ? 'text-muted-foreground hover:text-destructive' : 'text-muted-foreground/30 cursor-not-allowed'}`}
                      onClick={() => deletable && handleDelete(metal.id, metal.name)}
                      disabled={!deletable}
                      title={deletable ? 'Delete metal' : 'Cannot delete (has transactions)'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New Metal Form */}
          {showAddForm ? (
            <div className="space-y-4 rounded-lg border border-border/50 bg-secondary/50 p-4">
              <div className="space-y-2">
                <Label htmlFor="metalName">Metal Name *</Label>
                <Input
                  id="metalName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Platinum"
                  className="border-border/50 bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metalSymbol">Symbol (1-3 chars) *</Label>
                <Input
                  id="metalSymbol"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.slice(0, 3))}
                  placeholder="e.g., Pt"
                  className="border-border/50 bg-background uppercase"
                  maxLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((c) => {
                    const colorClasses = getMetalColorClasses(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColor(c.id)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                          color === c.id 
                            ? `${colorClasses.border} ${colorClasses.bg} ring-2 ring-offset-2 ring-offset-background ring-primary` 
                            : 'border-border/50 hover:border-primary/50'
                        }`}
                        title={c.name}
                      >
                        <span className={`h-4 w-4 rounded-full ${colorClasses.bg.replace('/10', '')}`} />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd}>
                  Add Metal
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full gap-2 border-dashed border-primary/30"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add Custom Metal
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
