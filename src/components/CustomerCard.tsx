import { CustomerSummary, Metal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, User, Package, Gem } from 'lucide-react';
import { getMetalColorClasses, MetalBadge } from './MetalSelector';

interface CustomerCardProps {
  customer: CustomerSummary;
  metals: Metal[];
  onClick: () => void;
}

export const CustomerCard = ({ customer, metals, onClick }: CustomerCardProps) => {
  const getMetalById = (id: string) => metals.find((m) => m.id === id);

  return (
    <Card
      onClick={onClick}
      className="card-hover cursor-pointer border-border/50 bg-card hover:border-emerald-500/30"
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
              <User className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                {customer.name}
              </h3>
              {customer.phone && (
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Metal Summaries */}
        {customer.metalSummaries.length > 0 ? (
          <div className="mt-5 space-y-3 border-t border-border/50 pt-4">
            {customer.metalSummaries.map((summary) => {
              const metal = getMetalById(summary.metalId);
              if (!metal) return null;

              const colors = getMetalColorClasses(metal.color);

              return (
                <div key={summary.metalId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MetalBadge metal={metal} size="sm" />
                      <span className="text-sm text-muted-foreground">{metal.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="number-display text-sm font-semibold text-foreground">
                        {summary.totalGrams.toFixed(4)}g
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Delivered: {summary.deliveredGrams.toFixed(4)}g
                      </span>
                    </div>
                    {summary.pendingGrams > 0 && (
                      <span className={`font-medium ${colors.text}`}>
                        Pending: {summary.pendingGrams.toFixed(4)}g
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 border-t border-border/50 pt-4 text-center">
            <p className="text-sm text-muted-foreground">No purchases yet</p>
          </div>
        )}

        {/* Payment Summary */}
        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="number-display text-sm font-medium text-foreground">
              ₹{customer.totalPurchaseValue.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="number-display text-sm font-medium text-emerald-500">
              ₹{customer.totalPaid.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className={`number-display text-sm font-semibold ${customer.totalPending > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              ₹{customer.totalPending.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Pending Delivery Warning */}
        {customer.totalGramsPending > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-blue-500/10 px-3 py-2">
            <Package className="h-4 w-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-500">
              {customer.totalGramsPending.toFixed(4)}g pending delivery
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
