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
import { Plus, UserPlus } from 'lucide-react';

interface AddVepariDialogProps {
  onAdd: (name: string, phone?: string, defaultCreditDays?: number, defaultPenaltyPercentPerDay?: number) => void;
}

export const AddVepariDialog = ({ onAdd }: AddVepariDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultCreditDays, setDefaultCreditDays] = useState('');
  const [defaultPenaltyPercent, setDefaultPenaltyPercent] = useState('0.1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(
        name.trim(), 
        phone.trim() || undefined,
        defaultCreditDays ? parseInt(defaultCreditDays) : undefined,
        defaultCreditDays && defaultPenaltyPercent ? parseFloat(defaultPenaltyPercent) : undefined
      );
      resetForm();
      setOpen(false);
    }
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setDefaultCreditDays('');
    setDefaultPenaltyPercent('0.1');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Vepari
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/50 bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <UserPlus className="h-5 w-5 text-primary" />
            Add New Vepari
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter vepari name"
              className="border-border/50 bg-secondary"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input
              id="phone"
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
                <Label htmlFor="creditDays">Default Credit Days</Label>
                <Input
                  id="creditDays"
                  type="number"
                  min="1"
                  value={defaultCreditDays}
                  onChange={(e) => setDefaultCreditDays(e.target.value)}
                  placeholder="e.g., 10"
                  className="border-border/50 bg-secondary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="penaltyPercent">Daily Penalty %</Label>
                <Input
                  id="penaltyPercent"
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
            <Button type="submit">Add Vepari</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
