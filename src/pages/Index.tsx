import { useState, useMemo } from 'react';
import { useVepariData } from '@/hooks/useVepariData';
import { VepariCard } from '@/components/VepariCard';
import { AddVepariDialog } from '@/components/AddVepariDialog';
import { TotalSummaryCard } from '@/components/TotalSummaryCard';
import { MetalManagement } from '@/components/MetalManagement';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Users, Database, AlertTriangle, Clock, Search, X, BarChart3, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getMetalColorClasses } from '@/components/MetalSelector';

type SortOrder = 'desc' | 'asc';

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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetalFilter, setSelectedMetalFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const summaries = getVepariSummaries();
  const metalSummaries = getMetalTotalSummaries();
  const overdueCount = getOverdueCount();
  const upcomingCount = getUpcomingDueItems(3).length;
  const metals = getMetals();

  // Memoized filter and sort to prevent recalculation on every render
  const filteredSummaries = useMemo(() => {
    return summaries
      .filter((vepari) => {
        // Search filter - case insensitive partial match
        const matchesSearch = searchQuery === '' || 
          vepari.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Metal filter - check if vepari has transactions in selected metal
        const matchesMetal = selectedMetalFilter === 'all' || 
          vepari.metalSummaries.some((ms) => ms.metalId === selectedMetalFilter);
        
        return matchesSearch && matchesMetal;
      })
      // Sort by last payment date based on sortOrder
      .sort((a, b) => {
        if (!a.lastPaymentDate && !b.lastPaymentDate) return 0;
        if (!a.lastPaymentDate) return 1; // No payment = at end
        if (!b.lastPaymentDate) return -1;
        
        const dateA = new Date(a.lastPaymentDate).getTime();
        const dateB = new Date(b.lastPaymentDate).getTime();
        
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [summaries, searchQuery, selectedMetalFilter, sortOrder]);

  const hasActiveFilters = searchQuery !== '' || selectedMetalFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMetalFilter('all');
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

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
              <Link to="/customers">
                <Button variant="outline" size="icon" className="rounded-full border-emerald-500/30 hover:bg-emerald-500/10" title="Customer Ledger">
                  <Users className="h-4 w-4 text-emerald-500" />
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="outline" size="icon" className="rounded-full border-purple-500/30 hover:bg-purple-500/10" title="Reports">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
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

        {/* Search & Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by vepari name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-border/50 bg-card"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Sort Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="gap-1.5 border-border/50"
              title={`Sort by last payment: ${sortOrder === 'desc' ? 'newest first' : 'oldest first'}`}
            >
              {sortOrder === 'desc' ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
              Last Payment
            </Button>

            {/* Metal Filter Chips */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedMetalFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetalFilter('all')}
                className={selectedMetalFilter === 'all' ? '' : 'border-border/50'}
              >
                All
              </Button>
              {metals.map((metal) => {
                const colors = getMetalColorClasses(metal.color);
                const isSelected = selectedMetalFilter === metal.id;
                return (
                  <Button
                    key={metal.id}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetalFilter(metal.id)}
                    className={`gap-1.5 ${
                      isSelected 
                        ? `${colors.bg} ${colors.text} hover:opacity-90` 
                        : `border-border/50 hover:${colors.bg}`
                    }`}
                  >
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                      isSelected ? 'bg-background/20' : colors.bg
                    } ${colors.text}`}>
                      {metal.symbol}
                    </span>
                    {metal.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredSummaries.length} of {summaries.length} vepari{summaries.length !== 1 ? 's' : ''}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1 h-3 w-3" />
                Clear filters
              </Button>
            </div>
          )}
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
        ) : filteredSummaries.length === 0 ? (
          <div className="animate-fade-in rounded-2xl border border-dashed border-border/50 bg-card/50 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground">
              No results found
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mt-4"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSummaries.map((vepari, index) => (
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
