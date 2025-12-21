import { Scale } from 'lucide-react';

interface TotalSummaryCardProps {
  totalRemaining: number;
  vepariCount: number;
}

export const TotalSummaryCard = ({ totalRemaining, vepariCount }: TotalSummaryCardProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl gold-gradient p-[1px]">
      <div className="relative rounded-2xl bg-card p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wider text-muted-foreground">
                Total Remaining to Pay
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
