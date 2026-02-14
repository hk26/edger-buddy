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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Calendar, Banknote, Flame, Package } from 'lucide-react';
import { Purchase, Metal, PurchaseType } from '@/types';
import { format, addDays, parseISO } from 'date-fns';
import { MetalSelector } from './MetalSelector';

interface EditPurchaseDialogProps {
  purchase: Purchase;
  metals: Metal[];
  onUpdate: (id: string, updates: Partial<Omit<Purchase, 'id' | 'vepariId'>>) => void;
}

const purchaseTypes: { value: PurchaseType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'regular', label: 'Regular', icon: <Package className="h-4 w-4" />, description: 'Metal-based' },
  { value: 'cash', label: 'Cash', icon: <Banknote className="h-4 w-4" />, description: 'Fixed Amount' },
  { value: 'bullion', label: 'Bullion', icon: <Flame className="h-4 w-4" />, description: 'Old Gold → Bars' },
];

export const EditPurchaseDialog = ({ purchase, metals, onUpdate }: EditPurchaseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>(purchase.purchaseType || 'regular');
  const [metalId, setMetalId] = useState(purchase.metalId);
  const [date, setDate] = useState(purchase.date);
  const [itemDescription, setItemDescription] = useState(purchase.itemDescription || '');
  const [notes, setNotes] = useState(purchase.notes || '');
  
  // Regular purchase fields
  const [weightGrams, setWeightGrams] = useState(purchase.weightGrams?.toString() || '');
  const [ratePerGram, setRatePerGram] = useState(purchase.ratePerGram?.toString() || '');
  const [stoneCharges, setStoneCharges] = useState(purchase.stoneCharges?.toString() || '');
  const [trackCredit, setTrackCredit] = useState(!!purchase.creditDays);
  const [creditDays, setCreditDays] = useState(purchase.creditDays?.toString() || '');
  const [penaltyPercent, setPenaltyPercent] = useState(purchase.penaltyPercentPerDay?.toString() || '0.1');
  
  // Cash purchase fields
  const [totalAmount, setTotalAmount] = useState(purchase.totalAmount?.toString() || '');
  const [labourCharges, setLabourCharges] = useState(purchase.labourCharges?.toString() || '');
  
  // Bullion purchase fields
  const [oldGoldWeight, setOldGoldWeight] = useState(purchase.oldGoldWeight?.toString() || '');
  const [oldGoldTouch, setOldGoldTouch] = useState(purchase.oldGoldTouch?.toString() || '');
  const [freshMetalReceived, setFreshMetalReceived] = useState(purchase.freshMetalReceived?.toString() || '');
  const [convertBalanceToMoney, setConvertBalanceToMoney] = useState(purchase.balanceConvertedToMoney || false);
  const [balanceRate, setBalanceRate] = useState(purchase.balanceRate?.toString() || '');
  const [bullionLabourCharges, setBullionLabourCharges] = useState(purchase.bullionLabourCharges?.toString() || '');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setPurchaseType(purchase.purchaseType || 'regular');
      setMetalId(purchase.metalId);
      setDate(purchase.date);
      setItemDescription(purchase.itemDescription || '');
      setNotes(purchase.notes || '');
      setWeightGrams(purchase.weightGrams?.toString() || '');
      setRatePerGram(purchase.ratePerGram?.toString() || '');
      setStoneCharges(purchase.stoneCharges?.toString() || '');
      setTrackCredit(!!purchase.creditDays);
      setCreditDays(purchase.creditDays?.toString() || '');
      setPenaltyPercent(purchase.penaltyPercentPerDay?.toString() || '0.1');
      setTotalAmount(purchase.totalAmount?.toString() || '');
      setLabourCharges(purchase.labourCharges?.toString() || '');
      setOldGoldWeight(purchase.oldGoldWeight?.toString() || '');
      setOldGoldTouch(purchase.oldGoldTouch?.toString() || '');
      setFreshMetalReceived(purchase.freshMetalReceived?.toString() || '');
      setConvertBalanceToMoney(purchase.balanceConvertedToMoney || false);
      setBalanceRate(purchase.balanceRate?.toString() || '');
      setBullionLabourCharges(purchase.bullionLabourCharges?.toString() || '');
    }
  }, [open, purchase]);

  // Bullion calculations
  const fineGoldCalculated = oldGoldWeight && oldGoldTouch 
    ? parseFloat(oldGoldWeight) * (parseFloat(oldGoldTouch) / 100)
    : 0;
  
  const balanceGrams = freshMetalReceived && fineGoldCalculated
    ? parseFloat(freshMetalReceived) - fineGoldCalculated
    : 0;
  
  const balanceCashAmount = convertBalanceToMoney && balanceRate && balanceGrams
    ? Math.abs(balanceGrams) * parseFloat(balanceRate) + (bullionLabourCharges ? parseFloat(bullionLabourCharges) : 0)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseUpdate = {
      metalId,
      date,
      purchaseType,
      itemDescription: itemDescription.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (purchaseType === 'regular') {
      if (!weightGrams) return;
      onUpdate(purchase.id, {
        ...baseUpdate,
        weightGrams: parseFloat(weightGrams),
        ratePerGram: ratePerGram ? parseFloat(ratePerGram) : undefined,
        stoneCharges: stoneCharges ? parseFloat(stoneCharges) : undefined,
        creditDays: trackCredit && creditDays ? parseInt(creditDays) : undefined,
        penaltyPercentPerDay: trackCredit && creditDays ? parseFloat(penaltyPercent) : undefined,
        // Clear other type fields
        totalAmount: undefined,
        labourCharges: undefined,
        oldGoldWeight: undefined,
        oldGoldTouch: undefined,
        fineGoldCalculated: undefined,
        freshMetalReceived: undefined,
        balanceGrams: undefined,
        balanceConvertedToMoney: undefined,
        balanceRate: undefined,
        balanceCashAmount: undefined,
      });
    } else if (purchaseType === 'cash') {
      if (!totalAmount) return;
      onUpdate(purchase.id, {
        ...baseUpdate,
        totalAmount: parseFloat(totalAmount),
        weightGrams: weightGrams ? parseFloat(weightGrams) : undefined,
        ratePerGram: ratePerGram ? parseFloat(ratePerGram) : undefined,
        labourCharges: labourCharges ? parseFloat(labourCharges) : undefined,
        stoneCharges: stoneCharges ? parseFloat(stoneCharges) : undefined,
        // Clear other type fields
        creditDays: undefined,
        penaltyPercentPerDay: undefined,
        dueDate: undefined,
        oldGoldWeight: undefined,
        oldGoldTouch: undefined,
        fineGoldCalculated: undefined,
        freshMetalReceived: undefined,
        balanceGrams: undefined,
        balanceConvertedToMoney: undefined,
        balanceRate: undefined,
        balanceCashAmount: undefined,
      });
    } else if (purchaseType === 'bullion') {
      if (!oldGoldWeight || !oldGoldTouch || !freshMetalReceived) return;
      onUpdate(purchase.id, {
        ...baseUpdate,
        oldGoldWeight: parseFloat(oldGoldWeight),
        oldGoldTouch: parseFloat(oldGoldTouch),
        fineGoldCalculated,
        freshMetalReceived: parseFloat(freshMetalReceived),
        balanceGrams,
        balanceConvertedToMoney: convertBalanceToMoney,
        balanceRate: convertBalanceToMoney && balanceRate ? parseFloat(balanceRate) : undefined,
        balanceCashAmount: convertBalanceToMoney ? balanceCashAmount : undefined,
        bullionLabourCharges: bullionLabourCharges ? parseFloat(bullionLabourCharges) : undefined,
        // Clear other type fields
        weightGrams: undefined,
        ratePerGram: undefined,
        stoneCharges: undefined,
        creditDays: undefined,
        penaltyPercentPerDay: undefined,
        dueDate: undefined,
        totalAmount: undefined,
        labourCharges: undefined,
      });
    }

    setOpen(false);
  };

  const calculatedDueDate = trackCredit && creditDays && date
    ? format(addDays(parseISO(date), parseInt(creditDays)), 'dd MMM yyyy')
    : null;

  const selectedMetal = metals.find((m) => m.id === metalId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/50 bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <Pencil className="h-5 w-5 text-primary" />
            Edit Purchase
            {selectedMetal && (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium bg-${selectedMetal.color}-500/10 text-${selectedMetal.color}-500`}>
                {selectedMetal.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Purchase Type Selector */}
          <div className="space-y-2">
            <Label>Purchase Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {purchaseTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setPurchaseType(type.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-3 transition-all ${
                    purchaseType === type.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/50 bg-secondary hover:border-primary/30'
                  }`}
                >
                  {type.icon}
                  <span className="text-sm font-medium">{type.label}</span>
                  <span className="text-[10px] text-muted-foreground">{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Metal Selector */}
          <MetalSelector
            metals={metals}
            value={metalId}
            onChange={setMetalId}
            label="Metal *"
          />

          {/* Date field */}
          <div className="space-y-2">
            <Label htmlFor="edit-date">Date *</Label>
            <Input
              id="edit-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-border/50 bg-secondary"
              required
            />
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <Label htmlFor="edit-item">Description (Optional)</Label>
            <Input
              id="edit-item"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder={purchaseType === 'bullion' ? 'e.g., Mixed old gold - 20K, 22K items' : 'e.g., Earrings, Necklace, Bangles'}
              className="border-border/50 bg-secondary"
            />
          </div>

          {/* Regular Purchase Form */}
          {purchaseType === 'regular' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-weight">Weight (grams) *</Label>
                  <Input
                    id="edit-weight"
                    type="number"
                    step="0.0001"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(e.target.value)}
                    placeholder="100.00"
                    className="border-border/50 bg-secondary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-rate">Rate per Gram (Optional)</Label>
                  <Input
                    id="edit-rate"
                    type="number"
                    step="0.01"
                    value={ratePerGram}
                    onChange={(e) => setRatePerGram(e.target.value)}
                    placeholder="7500.00"
                    className="border-border/50 bg-secondary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stoneCharges">Stone Charges ₹ (Optional)</Label>
                <Input
                  id="edit-stoneCharges"
                  type="number"
                  step="0.01"
                  min="0"
                  value={stoneCharges}
                  onChange={(e) => setStoneCharges(e.target.value)}
                  placeholder="Extra charges for stones"
                  className="border-border/50 bg-secondary"
                />
              </div>

              {/* Credit Tracking Section */}
              <div className="border-t border-border/30 pt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="edit-trackCredit" 
                    checked={trackCredit}
                    onCheckedChange={(checked) => setTrackCredit(checked === true)}
                  />
                  <Label htmlFor="edit-trackCredit" className="cursor-pointer text-sm font-medium">
                    Track credit for this purchase
                  </Label>
                </div>
                
                {trackCredit && (
                  <div className="mt-4 space-y-4 rounded-lg bg-secondary/50 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-creditDays">Credit Days *</Label>
                        <Input
                          id="edit-creditDays"
                          type="number"
                          min="1"
                          value={creditDays}
                          onChange={(e) => setCreditDays(e.target.value)}
                          placeholder="e.g., 10"
                          className="border-border/50 bg-background"
                          required={trackCredit}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-penaltyPercent">Daily Penalty %</Label>
                        <Input
                          id="edit-penaltyPercent"
                          type="number"
                          step="0.01"
                          min="0"
                          value={penaltyPercent}
                          onChange={(e) => setPenaltyPercent(e.target.value)}
                          placeholder="0.1"
                          className="border-border/50 bg-background"
                        />
                      </div>
                    </div>
                    {calculatedDueDate && (
                      <div className="flex items-center gap-2 rounded-md bg-primary/10 p-3 text-sm">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-muted-foreground">Due Date:</span>
                        <span className="font-medium text-primary">{calculatedDueDate}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Cash Purchase Form */}
          {purchaseType === 'cash' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cashWeight">Weight (Optional)</Label>
                  <Input
                    id="edit-cashWeight"
                    type="number"
                    step="0.01"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(e.target.value)}
                    placeholder="100.00"
                    className="border-border/50 bg-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cashRate">Rate/g (Optional)</Label>
                  <Input
                    id="edit-cashRate"
                    type="number"
                    step="0.01"
                    value={ratePerGram}
                    onChange={(e) => setRatePerGram(e.target.value)}
                    placeholder="7500.00"
                    className="border-border/50 bg-secondary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-labourCharges">Labour Charges ₹ (Optional)</Label>
                  <Input
                    id="edit-labourCharges"
                    type="number"
                    step="0.01"
                    min="0"
                    value={labourCharges}
                    onChange={(e) => setLabourCharges(e.target.value)}
                    placeholder="5000"
                    className="border-border/50 bg-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cashStoneCharges">Stone Charges ₹ (Optional)</Label>
                  <Input
                    id="edit-cashStoneCharges"
                    type="number"
                    step="0.01"
                    min="0"
                    value={stoneCharges}
                    onChange={(e) => setStoneCharges(e.target.value)}
                    placeholder="2000"
                    className="border-border/50 bg-secondary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-totalAmount">Total Amount ₹ *</Label>
                <Input
                  id="edit-totalAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="757000"
                  className="border-border/50 bg-secondary text-lg font-semibold"
                  required
                />
              </div>
              <div className="rounded-lg bg-blue-500/10 p-4">
                <p className="text-sm text-muted-foreground">Fixed-price purchase. Pay this amount later in cash.</p>
                {totalAmount && (
                  <p className="number-display mt-2 text-2xl font-bold text-blue-500">
                    ₹{parseFloat(totalAmount).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Bullion Purchase Form */}
          {purchaseType === 'bullion' && (
            <>
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-amber-500">
                  <Flame className="h-4 w-4" />
                  OLD GOLD GIVEN
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-oldGoldWeight">Weight Given (g) *</Label>
                    <Input
                      id="edit-oldGoldWeight"
                      type="number"
                      step="0.01"
                      value={oldGoldWeight}
                      onChange={(e) => setOldGoldWeight(e.target.value)}
                      placeholder="147.00"
                      className="border-border/50 bg-background"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-oldGoldTouch">Touch/Purity (%) *</Label>
                    <Input
                      id="edit-oldGoldTouch"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={oldGoldTouch}
                      onChange={(e) => setOldGoldTouch(e.target.value)}
                      placeholder="87"
                      className="border-border/50 bg-background"
                      required
                    />
                  </div>
                </div>
                {fineGoldCalculated > 0 && (
                  <div className="rounded-md bg-amber-500/10 p-3 text-sm">
                    <span className="text-muted-foreground">Fine Gold: </span>
                    <span className="font-bold text-amber-500">
                      {oldGoldWeight}g × {oldGoldTouch}% = {fineGoldCalculated.toFixed(4)}g
                    </span>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-4">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-emerald-500">
                  <Package className="h-4 w-4" />
                  FRESH METAL RECEIVED
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="edit-freshMetalReceived">Fresh Bars Received (g) *</Label>
                  <Input
                    id="edit-freshMetalReceived"
                    type="number"
                    step="0.01"
                    value={freshMetalReceived}
                    onChange={(e) => setFreshMetalReceived(e.target.value)}
                    placeholder="130.00"
                    className="border-border/50 bg-background"
                    required
                  />
                </div>
                {freshMetalReceived && fineGoldCalculated > 0 && (
                  <div className={`rounded-md p-3 text-sm ${balanceGrams > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                    <span className="text-muted-foreground">Balance: </span>
                    <span className={`font-bold ${balanceGrams > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {freshMetalReceived}g - {fineGoldCalculated.toFixed(4)}g = {balanceGrams.toFixed(4)}g
                      <span className="ml-2 font-normal">
                        ({balanceGrams > 0 ? 'you owe bullion' : balanceGrams < 0 ? 'credit with bullion' : 'settled'})
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Balance Settlement */}
              {balanceGrams !== 0 && (
                <div className="border-t border-border/30 pt-4 space-y-4">
                  {/* Labour/Packaging Charges */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-bullionLabourCharges">Labour/Packaging Charges ₹ (Optional)</Label>
                    <Input
                      id="edit-bullionLabourCharges"
                      type="number"
                      step="0.01"
                      min="0"
                      value={bullionLabourCharges}
                      onChange={(e) => setBullionLabourCharges(e.target.value)}
                      placeholder="500"
                      className="border-border/50 bg-secondary"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit-convertBalance" 
                      checked={convertBalanceToMoney}
                      onCheckedChange={(checked) => setConvertBalanceToMoney(checked === true)}
                    />
                    <Label htmlFor="edit-convertBalance" className="cursor-pointer text-sm font-medium">
                      Convert balance to cash
                    </Label>
                  </div>
                  
                  {convertBalanceToMoney && (
                    <div className="mt-4 space-y-4 rounded-lg bg-secondary/50 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-balanceRate">Rate per Gram ₹ *</Label>
                        <Input
                          id="edit-balanceRate"
                          type="number"
                          step="0.01"
                          value={balanceRate}
                          onChange={(e) => setBalanceRate(e.target.value)}
                          placeholder="15950"
                          className="border-border/50 bg-background"
                          required={convertBalanceToMoney}
                        />
                      </div>
                      {balanceCashAmount > 0 && (
                        <div className={`rounded-md p-3 ${balanceGrams > 0 ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                          <p className="text-sm text-muted-foreground">Settlement Amount:</p>
                          <p className={`number-display text-xl font-bold ${balanceGrams > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            ₹{balanceCashAmount.toLocaleString('en-IN')}
                          </p>
                          <p className="number-display text-xs text-muted-foreground mt-0.5">
                            {Math.abs(balanceGrams).toFixed(4)}g × ₹{parseFloat(balanceRate).toLocaleString('en-IN')} = ₹{(Math.abs(balanceGrams) * parseFloat(balanceRate)).toLocaleString('en-IN')}
                            {bullionLabourCharges && parseFloat(bullionLabourCharges) > 0 ? ` + ₹${parseFloat(bullionLabourCharges).toLocaleString('en-IN')} labour` : ''}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {balanceGrams > 0 ? 'You pay to bullion' : 'Bullion pays you'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes (Optional)</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={purchaseType === 'bullion' ? 'e.g., Lab ref: LAB-2024-001' : 'Any additional notes...'}
              className="border-border/50 bg-secondary"
              rows={2}
            />
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
