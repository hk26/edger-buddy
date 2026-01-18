import { useCustomerData } from '@/hooks/useCustomerData';
import { useVepariData } from '@/hooks/useVepariData';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Scale, Users, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import { getMetalColorClasses, MetalBadge } from '@/components/MetalSelector';
import { ProfitReport } from '@/types';

const Reports = () => {
  const { getMetals, getVepariSummaries } = useVepariData();
  const { getCustomerSummaries, customerPurchases } = useCustomerData();

  const metals = getMetals();
  const vepariSummaries = getVepariSummaries();
  const customerSummaries = getCustomerSummaries(metals);

  // Calculate P&L by metal
  const profitReports: ProfitReport[] = metals.map((metal) => {
    // Vepari purchases (your cost)
    const vepariPurchases = vepariSummaries.flatMap((v) => 
      v.metalSummaries.filter((ms) => ms.metalId === metal.id)
    );
    const totalPurchasedGrams = vepariPurchases.reduce((sum, ms) => sum + ms.totalPurchased, 0);

    // Customer sales (your revenue)
    const metalSales = customerPurchases.filter((p) => p.metalId === metal.id);
    const totalSoldGrams = metalSales.reduce((sum, p) => sum + p.weightGrams, 0);
    const totalRevenue = metalSales.reduce(
      (sum, p) => sum + (p.weightGrams * p.saleRatePerGram) + (p.makingCharges || 0) + (p.stoneCharges || 0),
      0
    );
    const totalCost = metalSales.reduce((sum, p) => sum + (p.weightGrams * p.purchaseRatePerGram), 0);
    const totalMakingCharges = metalSales.reduce((sum, p) => sum + (p.makingCharges || 0), 0);

    const avgBuyRate = totalSoldGrams > 0 ? totalCost / totalSoldGrams : 0;
    const avgSellRate = totalSoldGrams > 0 ? (totalRevenue - totalMakingCharges) / totalSoldGrams : 0;
    const grossProfit = totalRevenue - totalCost;
    const profitMarginPercent = totalCost > 0 ? (grossProfit / totalCost) * 100 : 0;

    return {
      metalId: metal.id,
      metalName: metal.name,
      metalSymbol: metal.symbol,
      metalColor: metal.color,
      totalPurchasedGrams,
      avgBuyRate,
      totalSoldGrams,
      avgSellRate,
      totalCost,
      totalRevenue,
      totalMakingCharges,
      grossProfit,
      profitMarginPercent,
    };
  }).filter((r) => r.totalSoldGrams > 0 || r.totalPurchasedGrams > 0);

  // Totals
  const totalRevenue = profitReports.reduce((sum, r) => sum + r.totalRevenue, 0);
  const totalCost = profitReports.reduce((sum, r) => sum + r.totalCost, 0);
  const totalGrossProfit = profitReports.reduce((sum, r) => sum + r.grossProfit, 0);
  const overallMargin = totalCost > 0 ? (totalGrossProfit / totalCost) * 100 : 0;

  // Pending amounts
  const totalReceivable = customerSummaries.reduce((sum, c) => sum + c.totalPending, 0);
  const totalPayable = vepariSummaries.reduce((sum, v) => {
    return sum + v.metalSummaries.reduce((ms, s) => ms + s.remainingWeight * 6000, 0); // Rough estimate
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">Reports & Analytics</h1>
                <p className="text-sm text-muted-foreground">Profit & Loss Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <Scale className="h-4 w-4" />
                  Vepari
                </Button>
              </Link>
              <Link to="/customers">
                <Button variant="outline" size="sm" className="gap-2">
                  <Users className="h-4 w-4" />
                  Customers
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card className="border-emerald-500/30 bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Revenue</p>
              </div>
              <p className="number-display mt-2 text-2xl font-bold text-emerald-500">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>
          <Card className="border-orange-500/30 bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-500" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Cost</p>
              </div>
              <p className="number-display mt-2 text-2xl font-bold text-orange-500">
                ₹{totalCost.toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>
          <Card className={`border-purple-500/30 bg-card`}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Gross Profit</p>
              </div>
              <p className={`number-display mt-2 text-2xl font-bold ${totalGrossProfit >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                ₹{totalGrossProfit.toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/30 bg-card">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Profit Margin</p>
              <p className={`number-display mt-2 text-2xl font-bold ${overallMargin >= 0 ? 'text-blue-500' : 'text-destructive'}`}>
                {overallMargin.toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Receivable vs Payable */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Card className="border-emerald-500/30 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Receivable (from Customers)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="number-display text-3xl font-bold text-emerald-500">
                ₹{totalReceivable.toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{customerSummaries.length} customers</p>
            </CardContent>
          </Card>
          <Card className="border-primary/30 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Metal (to Veparis)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="number-display text-3xl font-bold text-primary">
                {vepariSummaries.reduce((sum, v) => sum + v.totalRemainingWeight, 0).toFixed(4)}g
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{vepariSummaries.length} veparis</p>
            </CardContent>
          </Card>
        </div>

        {/* Metal-wise P&L Table */}
        <Card className="border-border/50 bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Metal-wise Profit & Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profitReports.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No sales data yet. Start selling to see P&L reports.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="p-3">Metal</th>
                      <th className="p-3 text-right">Sold (g)</th>
                      <th className="p-3 text-right">Avg Buy Rate</th>
                      <th className="p-3 text-right">Avg Sell Rate</th>
                      <th className="p-3 text-right">Revenue</th>
                      <th className="p-3 text-right">Cost</th>
                      <th className="p-3 text-right">Profit</th>
                      <th className="p-3 text-right">Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitReports.map((report) => {
                      const metal = metals.find((m) => m.id === report.metalId);
                      if (!metal) return null;
                      const colors = getMetalColorClasses(metal.color);

                      return (
                        <tr key={report.metalId} className="border-b border-border/30">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <MetalBadge metal={metal} size="sm" />
                              <span className="font-medium">{metal.name}</span>
                            </div>
                          </td>
                          <td className="p-3 text-right number-display">{report.totalSoldGrams.toFixed(4)}</td>
                          <td className="p-3 text-right number-display">₹{report.avgBuyRate.toFixed(2)}</td>
                          <td className="p-3 text-right number-display">₹{report.avgSellRate.toFixed(2)}</td>
                          <td className="p-3 text-right number-display text-emerald-500">₹{report.totalRevenue.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right number-display text-orange-500">₹{report.totalCost.toLocaleString('en-IN')}</td>
                          <td className={`p-3 text-right number-display font-semibold ${report.grossProfit >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                            ₹{report.grossProfit.toLocaleString('en-IN')}
                          </td>
                          <td className={`p-3 text-right number-display ${report.profitMarginPercent >= 0 ? 'text-blue-500' : 'text-destructive'}`}>
                            {report.profitMarginPercent.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Reports;
