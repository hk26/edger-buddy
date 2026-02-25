import { memo, useMemo } from 'react';
import { VepariSummary, Metal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, User, Gem, Banknote, Flame, IndianRupee } from 'lucide-react';
import { getMetalColorClasses, MetalBadge } from './MetalSelector';

interface VepariCardProps {
  vepari: VepariSummary;
  metals: Metal[];
  onClick: () => void;
}

// Memoized metal summary row
const MetalSummaryRow = memo(({ 
  summary, 
  metal 
}: { 
  summary: VepariSummary['metalSummaries'][0]; 
  metal: Metal;
}) => {
  const colors = getMetalColorClasses(metal.color);
  const hasCash = (summary.totalCashPurchased || 0) > 0;
  const hasBullion = (summary.totalFineGoldGiven || 0) > 0;
  
  return (
    <div className="space-y-2">
      {/* Regular metal summary */}
      {(summary.totalPurchased > 0 || summary.totalPaid > 0) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MetalBadge metal={metal} size="sm" />
            <span className="text-sm text-muted-foreground">{metal.name}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              {summary.remainingWeight > 0 ? 'Pending' : summary.remainingWeight < 0 ? 'Advance' : 'Settled'}
            </p>
            <p className={`number-display text-sm font-semibold ${
              summary.remainingWeight > 0 ? colors.text : 
              summary.remainingWeight < 0 ? 'text-emerald-500' : 'text-muted-foreground'
            }`}>
              {summary.remainingWeight > 0 
                ? `${summary.remainingWeight.toFixed(4)}g`
                : summary.remainingWeight < 0 
                  ? `${Math.abs(summary.remainingWeight).toFixed(4)}g credit`
                  : '0g'
              }
            </p>
          </div>
        </div>
      )}
      
      {/* Cash purchases summary */}
      {hasCash && (
        <div className="flex items-center justify-between rounded-md bg-blue-500/5 px-2 py-1.5">
          <div className="flex items-center gap-2">
            <Banknote className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs text-blue-500">{metal.name} Cash</span>
          </div>
          <p className="number-display text-sm font-semibold text-blue-500">
            ₹{(summary.remainingCash || 0).toLocaleString('en-IN')}
          </p>
        </div>
      )}
      
      {/* Bullion summary */}
      {hasBullion && (
        <div className="flex items-center justify-between rounded-md bg-purple-500/5 px-2 py-1.5">
          <div className="flex items-center gap-2">
            <Flame className="h-3.5 w-3.5 text-purple-500" />
            <span className="text-xs text-purple-500">{metal.name} Bullion</span>
          </div>
          <p className={`number-display text-sm font-semibold ${
            (summary.bullionBalanceGrams || 0) > 0 ? 'text-orange-500' : 'text-emerald-500'
          }`}>
            {(summary.bullionBalanceGrams || 0) > 0 ? '+' : ''}{(summary.bullionBalanceGrams || 0).toFixed(4)}g
          </p>
        </div>
      )}
    </div>
  );
});
MetalSummaryRow.displayName = 'MetalSummaryRow';

export const VepariCard = memo(({ vepari, metals, onClick }: VepariCardProps) => {
  const metalMap = useMemo(() => new Map(metals.map(m => [m.id, m])), [metals]);

  const hasTransactions = useMemo(() => {
    return vepari.metalSummaries.some(ms => 
      ms.totalPurchased > 0 || ms.totalPaid > 0 ||
      (ms.totalCashPurchased || 0) > 0 || 
      (ms.totalFineGoldGiven || 0) > 0
    );
  }, [vepari.metalSummaries]);

  // Total cash to pay = cash due + stone charges
  const totalCashToPay = useMemo(() => {
    const cashDue = vepari.metalSummaries.reduce((sum, ms) => sum + (ms.remainingCash || 0), 0);
    const stoneDue = vepari.totalRemainingStoneCharges || 0;
    return { cashDue, stoneDue, total: cashDue + stoneDue };
  }, [vepari.metalSummaries, vepari.totalRemainingStoneCharges]);

  return (
    <Card
      onClick={onClick}
      className="card-hover cursor-pointer border-border/50 bg-card hover:border-primary/30"
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                {vepari.name}
              </h3>
              {vepari.phone && (
                <p className="text-sm text-muted-foreground">{vepari.phone}</p>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Metal Summaries */}
        {hasTransactions ? (
          <div className="mt-4 space-y-2 border-t border-border/50 pt-3">
            {vepari.metalSummaries.map((summary) => {
              const metal = metalMap.get(summary.metalId);
              if (!metal) return null;
              const hasAnyActivity = 
                summary.totalPurchased > 0 || summary.totalPaid > 0 ||
                (summary.totalCashPurchased || 0) > 0 || 
                (summary.totalFineGoldGiven || 0) > 0;
              if (!hasAnyActivity) return null;
              return (
                <MetalSummaryRow key={summary.metalId} summary={summary} metal={metal} />
              );
            })}
          </div>
        ) : (
          <div className="mt-4 border-t border-border/50 pt-3 text-center">
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        )}

        {/* Total Cash to Pay (cash purchases + stone charges combined) */}
        {totalCashToPay.total > 0 && (
          <div className="mt-3 border-t border-border/50 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-amber-500" />
                <p className="text-xs font-medium text-muted-foreground">Total Cash to Pay</p>
              </div>
              <p className="number-display text-base font-bold text-amber-500">
                ₹{totalCashToPay.total.toLocaleString('en-IN')}
              </p>
            </div>
            {/* Breakdown only if both exist */}
            {totalCashToPay.cashDue > 0 && totalCashToPay.stoneDue > 0 && (
              <div className="mt-1.5 flex items-center justify-end gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Banknote className="h-3 w-3 text-blue-500" />
                  ₹{totalCashToPay.cashDue.toLocaleString('en-IN')}
                </span>
                <span className="flex items-center gap-1">
                  <Gem className="h-3 w-3 text-amber-500" />
                  ₹{totalCashToPay.stoneDue.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Overdue Warning */}
        {vepari.totalOverdueCount > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-orange-500/10 px-3 py-2">
            <span className="text-xs font-medium text-orange-500">
              {vepari.totalOverdueCount} overdue payment{vepari.totalOverdueCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

VepariCard.displayName = 'VepariCard';
