import { Metal } from '@/types';
import { Scale, Gem } from 'lucide-react';
import { getMetalColorClasses } from './MetalSelector';

interface MetalSummaryData {
  metal: Metal;
  remaining: number;
  stoneCharges: number;
  vepariCount: number;
}

interface TotalSummaryCardProps {
  metalSummaries: MetalSummaryData[];
  totalVepariCount: number;
}

export const TotalSummaryCard = ({ metalSummaries, totalVepariCount }: TotalSummaryCardProps) => {
  if (metalSummaries.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl gold-gradient p-[1px]">
        <div className="relative rounded-2xl bg-card p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="relative text-center">
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add purchases to see summary
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metalSummaries.map(({ metal, remaining, stoneCharges, vepariCount }) => {
        const colors = getMetalColorClasses(metal.color);
        
        return (
          <div 
            key={metal.id}
            className={`relative overflow-hidden rounded-2xl border p-[1px] ${colors.border}`}
            style={{
              background: `linear-gradient(135deg, hsl(var(--${metal.color === 'amber' ? 'primary' : 'muted'})) 0%, transparent 100%)`,
            }}
          >
            <div className="relative rounded-2xl bg-card p-6">
              <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} to-transparent`} />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
                        {metal.symbol}
                      </span>
                      <p className="text-sm uppercase tracking-wider text-muted-foreground">
                        {metal.name} Remaining
                      </p>
                    </div>
                    <p className={`number-display mt-2 text-3xl font-bold ${colors.text}`}>
                      {remaining.toFixed(4)}
                      <span className="ml-2 text-lg text-muted-foreground">grams</span>
                    </p>
                  </div>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-full ${colors.bg}`}>
                    <Scale className={`h-7 w-7 ${colors.text}`} />
                  </div>
                </div>
                
                {stoneCharges > 0 && (
                  <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                        <Gem className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">
                          Stone Charges
                        </p>
                        <p className="number-display mt-0.5 text-lg font-bold text-amber-500">
                          ₹{stoneCharges.toLocaleString('en-IN')}
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
      })}
    </div>
  );
};
