import { memo, useMemo } from 'react';
import { VepariSummary, Metal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, User, Gem, Banknote, Flame } from 'lucide-react';
import { getMetalColorClasses, MetalBadge } from './MetalSelector';

interface VepariCardProps {
  vepari: VepariSummary;
  metals: Metal[];
  onClick: () => void;
}

// Memoized metal summary row for better performance
const MetalSummaryRow = memo(({ 
  summary, 
  metal 
}: { 
  summary: VepariSummary['metalSummaries'][0]; 
  metal: Metal;
}) => {
  const colors = getMetalColorClasses(metal.color);
  
  // Check if there are any cash or bullion transactions
  const hasCash = (summary.totalCashPurchased || 0) > 0;
  const hasBullion = (summary.totalFineGoldGiven || 0) > 0;
  
  return (
    <div className="space-y-2">
      {/* Regular metal summary */}
      {summary.totalPurchased > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MetalBadge metal={metal} size="sm" />
            <span className="text-sm text-muted-foreground">{metal.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Purchased</p>
              <p className="number-display text-sm font-medium text-foreground">
                {summary.totalPurchased.toFixed(4)}g
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="number-display text-sm font-medium text-success">
                {summary.totalPaid.toFixed(4)}g
              </p>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className={`number-display text-sm font-semibold ${colors.text}`}>
                {summary.remainingWeight.toFixed(4)}g
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Cash purchases summary */}
      {hasCash && (
        <div className="flex items-center justify-between rounded-md bg-blue-500/5 px-2 py-1.5">
          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-blue-500">{metal.name} Cash</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Bill</p>
              <p className="number-display text-sm font-medium text-foreground">
                ₹{(summary.totalCashPurchased || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="number-display text-sm font-medium text-success">
                ₹{(summary.totalCashPaid || 0).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="text-xs text-muted-foreground">Due</p>
              <p className="number-display text-sm font-semibold text-blue-500">
                ₹{(summary.remainingCash || 0).toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Bullion summary */}
      {hasBullion && (
        <div className="flex items-center justify-between rounded-md bg-purple-500/5 px-2 py-1.5">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-purple-500">{metal.name} Bullion</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Fine Given</p>
              <p className="number-display text-sm font-medium text-foreground">
                {(summary.totalFineGoldGiven || 0).toFixed(4)}g
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Fresh</p>
              <p className="number-display text-sm font-medium text-success">
                {(summary.totalFreshMetalReceived || 0).toFixed(4)}g
              </p>
            </div>
            <div className="text-right min-w-[80px]">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className={`number-display text-sm font-semibold ${
                (summary.bullionBalanceGrams || 0) > 0 ? 'text-orange-500' : 'text-success'
              }`}>
                {(summary.bullionBalanceGrams || 0) > 0 ? '+' : ''}{(summary.bullionBalanceGrams || 0).toFixed(4)}g
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
MetalSummaryRow.displayName = 'MetalSummaryRow';

export const VepariCard = memo(({ vepari, metals, onClick }: VepariCardProps) => {
  // Create a Map for O(1) metal lookup
  const metalMap = useMemo(() => {
    return new Map(metals.map(m => [m.id, m]));
  }, [metals]);

  // Check if vepari has any transactions
  const hasTransactions = useMemo(() => {
    return vepari.metalSummaries.some(ms => 
      ms.totalPurchased > 0 || 
      (ms.totalCashPurchased || 0) > 0 || 
      (ms.totalFineGoldGiven || 0) > 0
    );
  }, [vepari.metalSummaries]);

  // Calculate total cash remaining across all metals
  const totalCashRemaining = useMemo(() => {
    return vepari.metalSummaries.reduce((sum, ms) => sum + (ms.remainingCash || 0), 0);
  }, [vepari.metalSummaries]);

  // Calculate total bullion balance
  const totalBullionBalance = useMemo(() => {
    return vepari.metalSummaries.reduce((sum, ms) => sum + (ms.bullionBalanceGrams || 0), 0);
  }, [vepari.metalSummaries]);

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
          <div className="mt-5 space-y-3 border-t border-border/50 pt-4">
            {vepari.metalSummaries.map((summary) => {
              const metal = metalMap.get(summary.metalId);
              if (!metal) return null;
              
              // Skip if no transactions for this metal
              const hasAnyActivity = 
                summary.totalPurchased > 0 || 
                (summary.totalCashPurchased || 0) > 0 || 
                (summary.totalFineGoldGiven || 0) > 0;
              
              if (!hasAnyActivity) return null;
              
              return (
                <MetalSummaryRow 
                  key={summary.metalId} 
                  summary={summary} 
                  metal={metal} 
                />
              );
            })}
          </div>
        ) : (
          <div className="mt-5 border-t border-border/50 pt-4 text-center">
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        )}

        {/* Stone Charges */}
        {vepari.totalRemainingStoneCharges > 0 && (
          <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
            <div className="flex items-center gap-2">
              <Gem className="h-4 w-4 text-amber-500" />
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Stone Charges
              </p>
            </div>
            <p className="number-display text-lg font-semibold text-amber-500">
              ₹{vepari.totalRemainingStoneCharges.toLocaleString('en-IN')}
            </p>
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
