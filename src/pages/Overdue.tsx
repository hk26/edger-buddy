import { useVepariData } from '@/hooks/useVepariData';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  Scale,
  Calendar,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const Overdue = () => {
  const navigate = useNavigate();
  const {
    getOverdueItems,
    getUpcomingDueItems,
    getTotalOverdueGrams,
    getTotalOverduePenalty,
    getOverdueCount,
  } = useVepariData();

  const overdueItems = getOverdueItems();
  const upcomingItems = getUpcomingDueItems(3);
  const totalOverdueGrams = getTotalOverdueGrams();
  const totalPenalty = getTotalOverduePenalty();
  const overdueCount = getOverdueCount();

  // Group overdue items by vepari
  const groupedOverdue = overdueItems.reduce((acc, item) => {
    const vepariName = item.vepari.name;
    if (!acc[vepariName]) {
      acc[vepariName] = [];
    }
    acc[vepariName].push(item);
    return acc;
  }, {} as Record<string, typeof overdueItems>);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Overdue & Upcoming Dues
                </h1>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), 'dd MMM yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="border-orange-500/30 bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                  <Scale className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Total Overdue Gold
                  </p>
                  <p className="number-display text-2xl font-bold text-orange-500">
                    {totalOverdueGrams.toFixed(2)}
                    <span className="ml-1 text-sm text-muted-foreground">g</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/30 bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                  <TrendingUp className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Estimated Penalty
                  </p>
                  <p className="number-display text-2xl font-bold text-amber-500">
                    ₹{totalPenalty.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Overdue Purchases
                  </p>
                  <p className="number-display text-2xl font-bold text-foreground">
                    {overdueCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Due Section */}
        {upcomingItems.length > 0 && (
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Due in Next 3 Days
              </h2>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-500">
                {upcomingItems.length}
              </span>
            </div>
            <div className="space-y-3">
              {upcomingItems.map((item, index) => (
                <Card
                  key={`${item.purchase.id}-upcoming`}
                  className="animate-fade-in border-amber-500/30 bg-card"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                          <Clock className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {item.vepari.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.purchase.itemDescription || 'Purchase'} •{' '}
                            {format(parseISO(item.purchase.date), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="number-display text-lg font-semibold text-foreground">
                          {item.remainingGrams.toFixed(2)}g
                        </p>
                        <p className="text-sm font-medium text-amber-500">
                          {item.daysUntilDue === 0
                            ? 'Due today!'
                            : item.daysUntilDue === 1
                            ? 'Due tomorrow'
                            : `Due in ${item.daysUntilDue} days`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Overdue List */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h2 className="font-display text-xl font-semibold text-foreground">
              Overdue Payments
            </h2>
            {overdueCount > 0 && (
              <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-medium text-orange-500">
                {overdueCount}
              </span>
            )}
          </div>

          {overdueItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <AlertTriangle className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                No overdue payments!
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                All your payments are on track. Great job!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedOverdue).map(([vepariName, items]) => (
                <div key={vepariName}>
                  <h3 className="mb-3 font-display text-lg font-semibold text-foreground">
                    {vepariName}
                  </h3>
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <Card
                        key={item.purchase.id}
                        className="animate-fade-in border-orange-500/30 bg-card"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {item.purchase.itemDescription || 'Purchase'}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>
                                    Purchased: {format(parseISO(item.purchase.date), 'dd MMM yyyy')}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Due: {format(parseISO(item.purchase.dueDate!), 'dd MMM yyyy')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="number-display text-lg font-semibold text-foreground">
                                {item.remainingGrams.toFixed(2)}g
                              </p>
                              <p className="text-sm font-medium text-orange-500">
                                {item.daysOverdue} days overdue
                              </p>
                            </div>
                          </div>
                          
                          {/* Penalty Info */}
                          <div className="mt-3 flex items-center justify-between rounded-lg bg-orange-500/5 p-3">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Penalty: </span>
                              <span className="font-medium text-orange-500">
                                {item.daysOverdue} days × {item.purchase.penaltyPercentPerDay}% = {item.estimatedPenaltyPercent.toFixed(2)}%
                              </span>
                            </div>
                            {item.estimatedPenaltyAmount > 0 && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">Est. Amount: </span>
                                <span className="font-medium text-orange-500">
                                  ₹{item.estimatedPenaltyAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Overdue;
