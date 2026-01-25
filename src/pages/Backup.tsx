import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Database, FileJson, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const STORAGE_KEYS = {
  veparis: 'gold-tracker-veparis',
  purchases: 'gold-tracker-purchases',
  payments: 'gold-tracker-payments',
  metals: 'gold-tracker-metals',
  // Customer ledger keys
  customers: 'gold-tracker-customers',
  customerPurchases: 'gold-tracker-customer-purchases',
  customerPayments: 'gold-tracker-customer-payments',
  deliveryRecords: 'gold-tracker-delivery-records',
};

const DEFAULT_METALS = [
  { id: 'gold', name: 'Gold', symbol: 'Au', color: 'amber', displayOrder: 1, createdAt: new Date().toISOString(), isDefault: true },
  { id: 'silver', name: 'Silver', symbol: 'Ag', color: 'slate', displayOrder: 2, createdAt: new Date().toISOString(), isDefault: true },
];

const Backup = () => {
  const navigate = useNavigate();
  const [importKey, setImportKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = {
        // Vepari (supplier) data
        veparis: JSON.parse(localStorage.getItem(STORAGE_KEYS.veparis) || '[]'),
        purchases: JSON.parse(localStorage.getItem(STORAGE_KEYS.purchases) || '[]'),
        payments: JSON.parse(localStorage.getItem(STORAGE_KEYS.payments) || '[]'),
        metals: JSON.parse(localStorage.getItem(STORAGE_KEYS.metals) || JSON.stringify(DEFAULT_METALS)),
        // Customer ledger data
        customers: JSON.parse(localStorage.getItem(STORAGE_KEYS.customers) || '[]'),
        customerPurchases: JSON.parse(localStorage.getItem(STORAGE_KEYS.customerPurchases) || '[]'),
        customerPayments: JSON.parse(localStorage.getItem(STORAGE_KEYS.customerPayments) || '[]'),
        deliveryRecords: JSON.parse(localStorage.getItem(STORAGE_KEYS.deliveryRecords) || '[]'),
        // Metadata
        exportedAt: new Date().toISOString(),
        version: '3.0', // Updated version for customer ledger support
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `metal-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Backup exported successfully!');
    } catch (error) {
      toast.error('Failed to export backup');
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);

        // Validate the data structure (only vepari data is required for backward compatibility)
        if (!data.veparis || !data.purchases || !data.payments) {
          toast.error('Invalid backup file format');
          return;
        }

        // Confirm before overwriting
        if (window.confirm('This will replace all existing data. Are you sure you want to continue?')) {
          // === Vepari (Supplier) Data ===
          localStorage.setItem(STORAGE_KEYS.veparis, JSON.stringify(data.veparis));
          
          // Migrate purchases if they don't have metalId or purchaseType
          const migratedPurchases = data.purchases.map((p: any) => ({
            ...p,
            metalId: p.metalId || 'gold',
            purchaseType: p.purchaseType || 'regular',
            // Preserve bullionLabourCharges if present
            bullionLabourCharges: p.bullionLabourCharges,
          }));
          localStorage.setItem(STORAGE_KEYS.purchases, JSON.stringify(migratedPurchases));
          
          // Migrate payments if they don't have metalId or paymentType
          const migratedPayments = data.payments.map((p: any) => ({
            ...p,
            metalId: p.metalId || 'gold',
            paymentType: p.paymentType || 'metal',
          }));
          localStorage.setItem(STORAGE_KEYS.payments, JSON.stringify(migratedPayments));
          
          // Import metals or use defaults
          localStorage.setItem(STORAGE_KEYS.metals, JSON.stringify(data.metals || DEFAULT_METALS));

          // === Customer Ledger Data (optional - for backward compatibility) ===
          if (data.customers) {
            localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(data.customers));
          }
          if (data.customerPurchases) {
            localStorage.setItem(STORAGE_KEYS.customerPurchases, JSON.stringify(data.customerPurchases));
          }
          if (data.customerPayments) {
            localStorage.setItem(STORAGE_KEYS.customerPayments, JSON.stringify(data.customerPayments));
          }
          if (data.deliveryRecords) {
            localStorage.setItem(STORAGE_KEYS.deliveryRecords, JSON.stringify(data.deliveryRecords));
          }

          toast.success('Backup imported successfully! Redirecting...');
          
          // Use React Router navigation instead of window.location for Electron compatibility
          setTimeout(() => {
            navigate('/');
          }, 1500);
        }
      } catch (error) {
        toast.error('Failed to parse backup file');
      }
    };
    reader.readAsText(file);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getDataStats = () => {
    const veparis = JSON.parse(localStorage.getItem(STORAGE_KEYS.veparis) || '[]');
    const purchases = JSON.parse(localStorage.getItem(STORAGE_KEYS.purchases) || '[]');
    const payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.payments) || '[]');
    const metals = JSON.parse(localStorage.getItem(STORAGE_KEYS.metals) || JSON.stringify(DEFAULT_METALS));
    const customers = JSON.parse(localStorage.getItem(STORAGE_KEYS.customers) || '[]');
    const customerPurchases = JSON.parse(localStorage.getItem(STORAGE_KEYS.customerPurchases) || '[]');
    const customerPayments = JSON.parse(localStorage.getItem(STORAGE_KEYS.customerPayments) || '[]');
    const deliveryRecords = JSON.parse(localStorage.getItem(STORAGE_KEYS.deliveryRecords) || '[]');

    return {
      veparis: veparis.length,
      purchases: purchases.length,
      payments: payments.length,
      metals: metals.length,
      customers: customers.length,
      customerPurchases: customerPurchases.length,
      customerPayments: customerPayments.length,
      deliveryRecords: deliveryRecords.length,
    };
  };

  const stats = getDataStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gold-gradient">
                <Database className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Backup & Restore
                </h1>
                <p className="text-sm text-muted-foreground">
                  Export or import your data
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Current Data Stats */}
        <Card className="mb-8 border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <FileJson className="h-5 w-5 text-primary" />
              Current Data
            </CardTitle>
            <CardDescription>Your stored data overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Supplier (Vepari) Data */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Supplier Ledger</p>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="rounded-lg bg-background/50 p-3">
                    <p className="text-xl font-bold gold-text">{stats.veparis}</p>
                    <p className="text-xs text-muted-foreground">Veparis</p>
                  </div>
                  <div className="rounded-lg bg-background/50 p-3">
                    <p className="text-xl font-bold gold-text">{stats.purchases}</p>
                    <p className="text-xs text-muted-foreground">Purchases</p>
                  </div>
                  <div className="rounded-lg bg-background/50 p-3">
                    <p className="text-xl font-bold gold-text">{stats.payments}</p>
                    <p className="text-xs text-muted-foreground">Payments</p>
                  </div>
                  <div className="rounded-lg bg-background/50 p-3">
                    <p className="text-xl font-bold gold-text">{stats.metals}</p>
                    <p className="text-xs text-muted-foreground">Metals</p>
                  </div>
                </div>
              </div>
              
              {/* Customer Data */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Customer Ledger</p>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div className="rounded-lg bg-background/50 p-3">
                    <p className="text-xl font-bold gold-text">{stats.customers}</p>
                    <p className="text-xs text-muted-foreground">Customers</p>
                  </div>
                  <div className="rounded-lg bg-background/50 p-3">
                    <p className="text-xl font-bold gold-text">{stats.customerPurchases}</p>
                    <p className="text-xs text-muted-foreground">Sales</p>
                  </div>
                  <div className="rounded-lg bg-background/50 p-3">
                    <p className="text-xl font-bold gold-text">{stats.customerPayments}</p>
                    <p className="text-xs text-muted-foreground">Receipts</p>
                  </div>
                  <div className="rounded-lg bg-background/50 p-3">
                    <p className="text-xl font-bold gold-text">{stats.deliveryRecords}</p>
                    <p className="text-xs text-muted-foreground">Deliveries</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card className="mb-6 border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in card-hover" style={{ animationDelay: '100ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Download className="h-5 w-5 text-primary" />
              Export Data
            </CardTitle>
            <CardDescription>
              Download a backup file containing all your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-lg bg-background/50 p-4">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">What's included:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>All vepari (supplier) records & transactions</li>
                    <li>All customer records & sales</li>
                    <li>All payment & delivery records</li>
                    <li>Custom metals configuration</li>
                  </ul>
                </div>
              </div>
              <Button onClick={handleExport} className="w-full gold-gradient text-primary-foreground hover:opacity-90">
                <Download className="mr-2 h-4 w-4" />
                Export Backup
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm animate-fade-in card-hover" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Upload className="h-5 w-5 text-primary" />
              Import Data
            </CardTitle>
            <CardDescription>
              Restore your data from a backup file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-lg bg-destructive/10 p-4">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-destructive mb-1">Warning:</p>
                  <p>Importing a backup will replace all existing data. Make sure to export your current data first if needed.</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="backup-import"
              />
              <Button
                variant="outline"
                className="w-full border-primary/50 hover:bg-primary/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Select Backup File
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Backup;
