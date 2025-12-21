import { VepariSummary } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, User, Scale } from 'lucide-react';

interface VepariCardProps {
  vepari: VepariSummary;
  onClick: () => void;
}

export const VepariCard = ({ vepari, onClick }: VepariCardProps) => {
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

        <div className="mt-5 grid grid-cols-3 gap-4 border-t border-border/50 pt-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Purchased
            </p>
            <p className="number-display mt-1 text-lg font-semibold text-foreground">
              {vepari.totalPurchased.toFixed(2)}
              <span className="ml-1 text-sm text-muted-foreground">g</span>
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Paid
            </p>
            <p className="number-display mt-1 text-lg font-semibold text-success">
              {vepari.totalPaid.toFixed(2)}
              <span className="ml-1 text-sm text-muted-foreground">g</span>
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Remaining
            </p>
            <p className="number-display mt-1 text-lg font-semibold text-primary">
              {vepari.remainingWeight.toFixed(2)}
              <span className="ml-1 text-sm text-muted-foreground">g</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
