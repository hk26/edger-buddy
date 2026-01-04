import { useVepariData } from '@/hooks/useVepariData';
import { VepariCard } from '@/components/VepariCard';
import { AddVepariDialog } from '@/components/AddVepariDialog';
import { TotalSummaryCard } from '@/components/TotalSummaryCard';
import { MetalManagement } from '@/components/MetalManagement';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Users, Database, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { 
    addVepari, 
    getVepariSummaries, 
    getMetalTotalSummaries,
    getOverdueCount,
    getUpcomingDueItems,
    getMetals,
    addMetal,
    deleteMetal,
    canDeleteMetal,
  } = useVepariData();

  const summaries = getVepariSummaries();
  const metalSummaries = getMetalTotalSummaries();
  const overdueCount = getOverdueCount();
  const upcomingCount = getUpcomingDueItems(3).length;
  const metals = getMetals();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient">
                <Scale className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Metal Tracker
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your vepari payments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/overdue">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={`relative rounded-full border-primary/30 hover:bg-primary/10 ${overdueCount > 0 ? 'border-orange-500/50' : ''}`} 
                  title="Overdue & Upcoming"
                >
                  <AlertTriangle className={`h-4 w-4 ${overdueCount > 0 ? 'text-orange-500' : 'text-primary'}`} />
                  {overdueCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                      {overdueCount > 9 ? '9+' : overdueCount}
                    </span>
                  )}
                </Button>
              </Link>
              <MetalManagement 
                metals={metals}
                onAdd={addMetal}
                onDelete={deleteMetal}
                canDelete={canDeleteMetal}
              />
              <Link to="/backup">
                <Button variant="outline" size="icon" className="rounded-full border-primary/30 hover:bg-primary/10" title="Backup & Restore">
                  <Database className="h-4 w-4 text-primary" />
                </Button>
              </Link>
              <AddVepariDialog onAdd={addVepari} />
            </div>
          </div>
        </div>
      </header>

      {/* Warning Banners */}
      {(overdueCount > 0 || upcomingCount > 0) && (
        <div className="container mx-auto px-4 pt-6">
          <div className="space-y-2">
            {overdueCount > 0 && (
              <Link to="/overdue">
                <div className="flex cursor-pointer items-center gap-3 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 transition-colors hover:bg-orange-500/20">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div className="flex-1">
                    <p className="font-medium text-orange-500">
                      {overdueCount} overdue payment{overdueCount > 1 ? 's' : ''}!
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click to view and manage overdue items
                    </p>
                  </div>
                </div>
              </Link>
            )}
            {upcomingCount > 0 && (
              <Link to="/overdue">
                <div className="flex cursor-pointer items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 transition-colors hover:bg-amber-500/20">
                  <Clock className="h-5 w-5 text-amber-500" />
                  <div className="flex-1">
                    <p className="font-medium text-amber-500">
                      {upcomingCount} payment{upcomingCount > 1 ? 's' : ''} due in next 3 days
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Plan ahead to avoid penalties
                    </p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="mb-8 animate-fade-in">
          <TotalSummaryCard
            metalSummaries={metalSummaries}
            totalVepariCount={summaries.length}
          />
        </div>

        {/* Vepari List */}
        <div className="mb-6 flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-display text-xl font-semibold text-foreground">
            Your Veparis
          </h2>
        </div>

        {summaries.length === 0 ? (
          <div className="animate-fade-in rounded-2xl border border-dashed border-border/50 bg-card/50 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              No veparis yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add your first vepari to start tracking metal payments
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {summaries.map((vepari, index) => (
              <div
                key={vepari.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <VepariCard
                  vepari={vepari}
                  metals={metals}
                  onClick={() => navigate(`/vepari/${vepari.id}`)}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
