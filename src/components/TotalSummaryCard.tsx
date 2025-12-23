import { Scale, Gem } from 'lucide-react';

interface TotalSummaryCardProps {
  totalRemaining: number;
  totalRemainingStoneCharges: number;
  vepariCount: number;
}

export const TotalSummaryCard = ({ totalRemaining, totalRemainingStoneCharges, vepariCount }: TotalSummaryCardProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl gold-gradient p-[1px]">
      <div className="relative rounded-2xl bg-card p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wider text-muted-foreground">
                Total Gold Remaining
              </p>
              <p className="number-display mt-2 text-4xl font-bold gold-text">
                {totalRemaining.toFixed(2)}
                <span className="ml-2 text-xl text-muted-foreground">grams</span>
              </p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          {totalRemainingStoneCharges > 0 && (
            <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                  <Gem className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Stone Charges Remaining
                  </p>
                  <p className="number-display mt-1 text-2xl font-bold text-amber-500">
                    ₹{totalRemainingStoneCharges.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 border-t border-border/50 pt-4">
            <p className="text-sm text-muted-foreground">
              Across <span className="font-semibold text-foreground">{vepariCount}</span> vepari{vepariCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
