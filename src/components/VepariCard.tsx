import { VepariSummary, Metal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, User, Gem } from 'lucide-react';
import { getMetalColorClasses, MetalBadge } from './MetalSelector';

interface VepariCardProps {
  vepari: VepariSummary;
  metals: Metal[];
  onClick: () => void;
}

export const VepariCard = ({ vepari, metals, onClick }: VepariCardProps) => {
  const getMetalById = (id: string) => metals.find((m) => m.id === id);

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
        {vepari.metalSummaries.length > 0 ? (
          <div className="mt-5 space-y-3 border-t border-border/50 pt-4">
            {vepari.metalSummaries.map((summary) => {
              const metal = getMetalById(summary.metalId);
              if (!metal) return null;
              
              const colors = getMetalColorClasses(metal.color);
              
              return (
                <div key={summary.metalId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MetalBadge metal={metal} size="sm" />
                    <span className="text-sm text-muted-foreground">{metal.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Purchased</p>
                      <p className="number-display text-sm font-medium text-foreground">
                        {summary.totalPurchased.toFixed(2)}g
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Paid</p>
                      <p className="number-display text-sm font-medium text-success">
                        {summary.totalPaid.toFixed(2)}g
                      </p>
                    </div>
                    <div className="text-right min-w-[70px]">
                      <p className="text-xs text-muted-foreground">Remaining</p>
                      <p className={`number-display text-sm font-semibold ${colors.text}`}>
                        {summary.remainingWeight.toFixed(2)}g
                      </p>
                    </div>
                  </div>
                </div>
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
};
