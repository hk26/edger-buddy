import { useState, useEffect } from 'react';
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
import { Pencil } from 'lucide-react';
import { Vepari } from '@/types';

interface EditVepariDialogProps {
  vepari: Vepari;
  onUpdate: (id: string, updates: Partial<Omit<Vepari, 'id' | 'createdAt'>>) => void;
}

export const EditVepariDialog = ({ vepari, onUpdate }: EditVepariDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(vepari.name);
  const [phone, setPhone] = useState(vepari.phone || '');
  const [defaultCreditDays, setDefaultCreditDays] = useState(
    vepari.defaultCreditDays?.toString() || ''
  );
  const [defaultPenaltyPercent, setDefaultPenaltyPercent] = useState(
    vepari.defaultPenaltyPercentPerDay?.toString() || '0.1'
  );

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(vepari.name);
      setPhone(vepari.phone || '');
      setDefaultCreditDays(vepari.defaultCreditDays?.toString() || '');
      setDefaultPenaltyPercent(vepari.defaultPenaltyPercentPerDay?.toString() || '0.1');
    }
  }, [open, vepari]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onUpdate(vepari.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        defaultCreditDays: defaultCreditDays ? parseInt(defaultCreditDays) : undefined,
        defaultPenaltyPercentPerDay: defaultCreditDays && defaultPenaltyPercent 
          ? parseFloat(defaultPenaltyPercent) 
          : undefined,
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Pencil className="h-5 w-5 text-primary" />
            Edit Vepari
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter vepari name"
              className="border-border/50 bg-secondary"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone (Optional)</Label>
            <Input
              id="edit-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="border-border/50 bg-secondary"
            />
          </div>
          
          {/* Credit Settings */}
          <div className="border-t border-border/30 pt-4">
            <p className="mb-3 text-sm text-muted-foreground">
              Credit Settings (Optional) - Set defaults for purchases from this vepari
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-creditDays">Default Credit Days</Label>
                <Input
                  id="edit-creditDays"
                  type="number"
                  min="1"
                  value={defaultCreditDays}
                  onChange={(e) => setDefaultCreditDays(e.target.value)}
                  placeholder="e.g., 10"
                  className="border-border/50 bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-penaltyPercent">Daily Penalty %</Label>
                <Input
                  id="edit-penaltyPercent"
                  type="number"
                  step="0.01"
                  min="0"
                  value={defaultPenaltyPercent}
                  onChange={(e) => setDefaultPenaltyPercent(e.target.value)}
                  placeholder="0.1"
                  className="border-border/50 bg-secondary"
                  disabled={!defaultCreditDays}
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Leave credit days empty if this vepari doesn't offer credit terms
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
