import { useState } from 'react';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useVepariData } from '@/hooks/useVepariData';
import { CustomerCard } from '@/components/CustomerCard';
import { AddCustomerDialog } from '@/components/AddCustomerDialog';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Search, X, BarChart3, Scale, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getMetalColorClasses } from '@/components/MetalSelector';

const Customers = () => {
  const navigate = useNavigate();
  const { getMetals } = useVepariData();
  const { addCustomer, getCustomerSummaries, getTotalPendingAmount, getTotalPendingDelivery } = useCustomerData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetalFilter, setSelectedMetalFilter] = useState<string>('all');

  const metals = getMetals();
  const summaries = getCustomerSummaries(metals);
  const totalPendingAmount = getTotalPendingAmount(metals);
  const totalPendingDelivery = getTotalPendingDelivery(metals);

  const filteredSummaries = summaries.filter((customer) => {
    const matchesSearch = searchQuery === '' || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMetal = selectedMetalFilter === 'all' || 
      customer.metalSummaries.some((ms) => ms.metalId === selectedMetalFilter);
    return matchesSearch && matchesMetal;
  });

  const hasActiveFilters = searchQuery !== '' || selectedMetalFilter !== 'all';

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedMetalFilter('all');
  };

  const totalGrossProfit = summaries.reduce((sum, s) => sum + s.totalGrossProfit, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Customer Ledger
                </h1>
                <p className="text-sm text-muted-foreground">
                  Manage your customer sales
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="outline" size="icon" className="rounded-full border-primary/30 hover:bg-primary/10" title="Vepari Ledger">
                  <Scale className="h-4 w-4 text-primary" />
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="outline" size="icon" className="rounded-full border-emerald-500/30 hover:bg-emerald-500/10" title="Reports">
                  <BarChart3 className="h-4 w-4 text-emerald-500" />
                </Button>
              </Link>
              <Link to="/backup">
                <Button variant="outline" size="icon" className="rounded-full border-primary/30 hover:bg-primary/10" title="Backup">
                  <Database className="h-4 w-4 text-primary" />
                </Button>
              </Link>
              <AddCustomerDialog onAdd={addCustomer} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="border-emerald-500/30 bg-card">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Receivable</p>
              <p className="number-display text-2xl font-bold text-emerald-500">
                ₹{totalPendingAmount.toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/30 bg-card">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Pending Delivery</p>
              <p className="number-display text-2xl font-bold text-blue-500">
                {totalPendingDelivery.toFixed(4)}g
              </p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/30 bg-card">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Gross Profit</p>
              <p className={`number-display text-2xl font-bold ${totalGrossProfit >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                ₹{totalGrossProfit.toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by customer name..."
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
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedMetalFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetalFilter('all')}
                className={selectedMetalFilter === 'all' ? 'bg-emerald-600' : 'border-border/50'}
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
                    className={`gap-1.5 ${isSelected ? `${colors.bg} ${colors.text}` : 'border-border/50'}`}
                  >
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${colors.bg} ${colors.text}`}>
                      {metal.symbol}
                    </span>
                    {metal.name}
                  </Button>
                );
              })}
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredSummaries.length} of {summaries.length} customer{summaries.length !== 1 ? 's' : ''}
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-3 w-3" />
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* Customer List */}
        <div className="mb-6 flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-500" />
          <h2 className="font-display text-xl font-semibold text-foreground">Your Customers</h2>
        </div>

        {summaries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <Users className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="font-display text-lg font-semibold">No customers yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Add your first customer to start tracking sales</p>
          </div>
        ) : filteredSummaries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/50 bg-card/50 p-12 text-center">
            <Search className="mx-auto mb-4 h-8 w-8 text-muted-foreground" />
            <h3 className="font-display text-lg font-semibold">No results found</h3>
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4">
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSummaries.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                metals={metals}
                onClick={() => navigate(`/customer/${customer.id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Customers;
