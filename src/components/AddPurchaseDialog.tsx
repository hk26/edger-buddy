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
import { ShoppingBag, Calendar, Banknote, Flame, Package } from 'lucide-react';
import { Purchase, Vepari, Metal, PurchaseType } from '@/types';
import { format, addDays, parseISO } from 'date-fns';
import { MetalSelector } from './MetalSelector';

interface AddPurchaseDialogProps {
  vepariId: string;
  vepari?: Vepari;
  metals: Metal[];
  defaultMetalId?: string;
  onAdd: (purchase: Omit<Purchase, 'id'>) => void;
}

const purchaseTypes: { value: PurchaseType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'regular', label: 'Regular', icon: <Package className="h-4 w-4" />, description: 'Metal-based' },
  { value: 'cash', label: 'Cash', icon: <Banknote className="h-4 w-4" />, description: 'Fixed Amount' },
  { value: 'bullion', label: 'Bullion', icon: <Flame className="h-4 w-4" />, description: 'Old Gold → Bars' },
];

export const AddPurchaseDialog = ({ vepariId, vepari, metals, defaultMetalId, onAdd }: AddPurchaseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('regular');
  const [metalId, setMetalId] = useState(defaultMetalId || metals[0]?.id || 'gold');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [itemDescription, setItemDescription] = useState('');
  const [notes, setNotes] = useState('');
  
  // Regular purchase fields
  const [weightGrams, setWeightGrams] = useState('');
  const [ratePerGram, setRatePerGram] = useState('');
  const [stoneCharges, setStoneCharges] = useState('');
  const [trackCredit, setTrackCredit] = useState(false);
  const [creditDays, setCreditDays] = useState('');
  const [penaltyPercent, setPenaltyPercent] = useState('0.1');
  
  // Cash purchase fields
  const [totalAmount, setTotalAmount] = useState('');
  const [labourCharges, setLabourCharges] = useState('');
  
  // Bullion purchase fields
  const [oldGoldWeight, setOldGoldWeight] = useState('');
  const [oldGoldTouch, setOldGoldTouch] = useState('');
  const [freshMetalReceived, setFreshMetalReceived] = useState('');
  const [convertBalanceToMoney, setConvertBalanceToMoney] = useState(false);
  const [balanceRate, setBalanceRate] = useState('');
  const [bullionLabourCharges, setBullionLabourCharges] = useState('');

  // Update metalId when defaultMetalId changes
  useEffect(() => {
    if (defaultMetalId) {
      setMetalId(defaultMetalId);
    }
  }, [defaultMetalId]);

  // Pre-fill credit settings from vepari defaults when dialog opens
  useEffect(() => {
    if (open && vepari?.defaultCreditDays) {
      setTrackCredit(true);
      setCreditDays(vepari.defaultCreditDays.toString());
      setPenaltyPercent((vepari.defaultPenaltyPercentPerDay || 0.1).toString());
    }
  }, [open, vepari]);

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
    
    const basePurchase = {
      vepariId,
      metalId,
      date,
      purchaseType,
      itemDescription: itemDescription.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    if (purchaseType === 'regular') {
      if (!weightGrams) return;
      onAdd({
        ...basePurchase,
        weightGrams: parseFloat(weightGrams),
        ratePerGram: ratePerGram ? parseFloat(ratePerGram) : undefined,
        stoneCharges: stoneCharges ? parseFloat(stoneCharges) : undefined,
        creditDays: trackCredit && creditDays ? parseInt(creditDays) : undefined,
        penaltyPercentPerDay: trackCredit && creditDays ? parseFloat(penaltyPercent) : undefined,
      });
    } else if (purchaseType === 'cash') {
      if (!totalAmount) return;
      onAdd({
        ...basePurchase,
        totalAmount: parseFloat(totalAmount),
        weightGrams: weightGrams ? parseFloat(weightGrams) : undefined,
        ratePerGram: ratePerGram ? parseFloat(ratePerGram) : undefined,
        labourCharges: labourCharges ? parseFloat(labourCharges) : undefined,
        stoneCharges: stoneCharges ? parseFloat(stoneCharges) : undefined,
      });
    } else if (purchaseType === 'bullion') {
      if (!oldGoldWeight || !oldGoldTouch || !freshMetalReceived) return;
      onAdd({
        ...basePurchase,
        oldGoldWeight: parseFloat(oldGoldWeight),
        oldGoldTouch: parseFloat(oldGoldTouch),
        fineGoldCalculated,
        freshMetalReceived: parseFloat(freshMetalReceived),
        balanceGrams,
        balanceConvertedToMoney: convertBalanceToMoney,
        balanceRate: convertBalanceToMoney && balanceRate ? parseFloat(balanceRate) : undefined,
        balanceCashAmount: convertBalanceToMoney ? balanceCashAmount : undefined,
        bullionLabourCharges: bullionLabourCharges ? parseFloat(bullionLabourCharges) : undefined,
      });
    }

    resetForm();
    setOpen(false);
  };

  const resetForm = () => {
    setPurchaseType('regular');
    setDate(new Date().toISOString().split('T')[0]);
    setItemDescription('');
    setNotes('');
    setWeightGrams('');
    setRatePerGram('');
    setStoneCharges('');
    setTrackCredit(false);
    setCreditDays('');
    setPenaltyPercent('0.1');
    setTotalAmount('');
    setLabourCharges('');
    setOldGoldWeight('');
    setOldGoldTouch('');
    setFreshMetalReceived('');
    setConvertBalanceToMoney(false);
    setBalanceRate('');
    setBullionLabourCharges('');
  };

  const calculatedDueDate = trackCredit && creditDays && date
    ? format(addDays(parseISO(date), parseInt(creditDays)), 'dd MMM yyyy')
    : null;

  const selectedMetal = metals.find((m) => m.id === metalId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10">
          <ShoppingBag className="h-4 w-4" />
          Add Purchase
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/50 bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Add New Purchase
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
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-border/50 bg-secondary"
              required
            />
          </div>

          {/* Description field */}
          <div className="space-y-2">
            <Label htmlFor="item">Description (Optional)</Label>
            <Input
              id="item"
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
                  <Label htmlFor="weight">Weight (grams) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(e.target.value)}
                    placeholder="100.00"
                    className="border-border/50 bg-secondary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rate">Rate per Gram (Optional)</Label>
                  <Input
                    id="rate"
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
                <Label htmlFor="stoneCharges">Stone Charges ₹ (Optional)</Label>
                <Input
                  id="stoneCharges"
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
                    id="trackCredit" 
                    checked={trackCredit}
                    onCheckedChange={(checked) => setTrackCredit(checked === true)}
                  />
                  <Label htmlFor="trackCredit" className="cursor-pointer text-sm font-medium">
                    Track credit for this purchase
                  </Label>
                </div>
                
                {trackCredit && (
                  <div className="mt-4 space-y-4 rounded-lg bg-secondary/50 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="creditDays">Credit Days *</Label>
                        <Input
                          id="creditDays"
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
                        <Label htmlFor="penaltyPercent">Daily Penalty %</Label>
                        <Input
                          id="penaltyPercent"
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
                  <Label htmlFor="cashWeight">Weight (Optional)</Label>
                  <Input
                    id="cashWeight"
                    type="number"
                    step="0.01"
                    value={weightGrams}
                    onChange={(e) => setWeightGrams(e.target.value)}
                    placeholder="100.00"
                    className="border-border/50 bg-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cashRate">Rate/g (Optional)</Label>
                  <Input
                    id="cashRate"
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
                  <Label htmlFor="labourCharges">Labour Charges ₹ (Optional)</Label>
                  <Input
                    id="labourCharges"
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
                  <Label htmlFor="cashStoneCharges">Stone Charges ₹ (Optional)</Label>
                  <Input
                    id="cashStoneCharges"
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
                <Label htmlFor="totalAmount">Total Amount ₹ *</Label>
                <Input
                  id="totalAmount"
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
                    <Label htmlFor="oldGoldWeight">Weight Given (g) *</Label>
                    <Input
                      id="oldGoldWeight"
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
                    <Label htmlFor="oldGoldTouch">Touch/Purity (%) *</Label>
                    <Input
                      id="oldGoldTouch"
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
                  <Label htmlFor="freshMetalReceived">Fresh Bars Received (g) *</Label>
                  <Input
                    id="freshMetalReceived"
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
                    <Label htmlFor="bullionLabourCharges">Labour/Packaging Charges ₹ (Optional)</Label>
                    <Input
                      id="bullionLabourCharges"
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
                      id="convertBalance" 
                      checked={convertBalanceToMoney}
                      onCheckedChange={(checked) => setConvertBalanceToMoney(checked === true)}
                    />
                    <Label htmlFor="convertBalance" className="cursor-pointer text-sm font-medium">
                      Convert balance to cash
                    </Label>
                  </div>
                  
                  {convertBalanceToMoney && (
                    <div className="mt-4 space-y-4 rounded-lg bg-secondary/50 p-4">
                      <div className="space-y-2">
                        <Label htmlFor="balanceRate">Rate per Gram ₹ *</Label>
                        <Input
                          id="balanceRate"
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
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
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
            <Button type="submit">Add Purchase</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
