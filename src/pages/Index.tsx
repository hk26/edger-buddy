import { useVepariData } from '@/hooks/useVepariData';
import { VepariCard } from '@/components/VepariCard';
import { AddVepariDialog } from '@/components/AddVepariDialog';
import { TotalSummaryCard } from '@/components/TotalSummaryCard';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Users, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { addVepari, getVepariSummaries, getTotalRemaining, getTotalRemainingStoneCharges } = useVepariData();

  const summaries = getVepariSummaries();
  const totalRemaining = getTotalRemaining();
  const totalRemainingStoneCharges = getTotalRemainingStoneCharges();

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
                  Gold Tracker
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your vepari payments
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Card */}
        <div className="mb-8 animate-fade-in">
          <TotalSummaryCard
            totalRemaining={totalRemaining}
            totalRemainingStoneCharges={totalRemainingStoneCharges}
            vepariCount={summaries.length}
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
              Add your first vepari to start tracking gold payments
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
