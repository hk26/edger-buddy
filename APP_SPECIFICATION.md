# Gold Payment Tracker - Complete Application Specification

## Overview

**Application Name:** Gold Payment Tracker (Vepari Tracker)  
**Purpose:** A desktop/mobile application for gold wholesalers/retailers to track gold purchases from suppliers (veparis) and manage outstanding payments.  
**Platform:** Windows Desktop Application (PWA/Electron) or Web Application  
**Data Storage:** Local storage (offline-first)

---

## Business Context

In the gold jewelry business, retailers often purchase gold items (earrings, necklaces, bangles, etc.) from wholesalers/suppliers called "veparis" on credit. Payments are made later at the prevailing gold rate on the payment date. This app helps track:

1. **Who** you purchased from (veparis)
2. **How much gold** (in grams) you purchased
3. **How much gold** (in grams) you have paid back
4. **How much gold** (in grams) remains to be paid

---

## Core Features

### 1. Dashboard (Home Page)
- Display **total remaining gold to pay** across all veparis
- Show count of active veparis
- List all veparis with their individual summaries:
  - Total purchased (grams)
  - Total paid (grams)
  - Remaining balance (grams)
- Add new vepari functionality
- Click on vepari card to view detailed transactions

### 2. Vepari Detail Page
- Show vepari name and phone number
- Display summary cards:
  - Total Purchased (grams)
  - Total Paid (grams)
  - Remaining Balance (grams)
- Add purchase functionality
- Add payment functionality
- Transaction history (chronological, newest first)
- Delete individual transactions
- Delete vepari (with all their transactions)

### 3. Offline Support (PWA)
- App works completely offline
- All data stored locally in browser localStorage
- Installable on Windows as desktop app

---

## Data Models

### Vepari (Supplier/Wholesaler)
```typescript
interface Vepari {
  id: string;              // UUID - unique identifier
  name: string;            // Vepari's name (required)
  phone?: string;          // Phone number (optional)
  createdAt: string;       // ISO date string when created
}
```

### Purchase (Gold bought from vepari)
```typescript
interface Purchase {
  id: string;              // UUID - unique identifier
  vepariId: string;        // Reference to vepari
  date: string;            // Purchase date (YYYY-MM-DD)
  itemDescription?: string; // e.g., "Earrings", "Necklace" (optional)
  weightGrams: number;     // Weight in grams (required)
  ratePerGram?: number;    // Rate at purchase time (optional, for reference)
  notes?: string;          // Additional notes (optional)
}
```

### Payment (Gold paid back to vepari)
```typescript
interface Payment {
  id: string;              // UUID - unique identifier
  vepariId: string;        // Reference to vepari
  date: string;            // Payment date (YYYY-MM-DD)
  weightGrams: number;     // Weight paid in grams (required)
  ratePerGram: number;     // Gold rate on payment date (required)
  amount: number;          // Calculated: weightGrams × ratePerGram
  notes?: string;          // Additional notes (optional)
}
```

### VepariSummary (Computed for display)
```typescript
interface VepariSummary extends Vepari {
  totalPurchased: number;  // Sum of all purchase weights
  totalPaid: number;       // Sum of all payment weights
  remainingWeight: number; // totalPurchased - totalPaid
}
```

---

## Local Storage Structure

Data is persisted in browser localStorage using these keys:

```
gold-tracker-veparis   → JSON array of Vepari objects
gold-tracker-purchases → JSON array of Purchase objects
gold-tracker-payments  → JSON array of Payment objects
```

---

## Page Specifications

### Page 1: Dashboard (Route: `/`)

#### Header
- App logo/icon (Scale icon with gold gradient)
- App title: "Gold Tracker"
- Subtitle: "Manage your vepari payments"
- "Add Vepari" button (opens dialog)

#### Total Summary Card
- Large card with gold accent border
- Displays: "Total Remaining to Pay"
- Shows total weight in grams (sum of all veparis' remaining balances)
- Shows count of veparis

#### Vepari List
- Section title: "Your Veparis" with Users icon
- Empty state when no veparis exist
- Grid of vepari cards (responsive: 1/2/3 columns)

#### Vepari Card Contents
- Vepari avatar circle with User icon
- Vepari name
- Phone number (if available)
- Three metrics row:
  - Purchased: X.XX g
  - Paid: X.XX g (green color)
  - Remaining: X.XX g (gold/primary color)
- Clickable (navigates to detail page)

### Page 2: Vepari Detail (Route: `/vepari/:id`)

#### Header
- Back button (returns to dashboard)
- Vepari name
- Phone number (if available)
- Delete vepari button (red, with confirmation dialog)

#### Summary Cards Row (3 cards)
1. **Total Purchased** - Shopping bag icon, neutral color
2. **Total Paid** - Wallet icon, green/success color
3. **Remaining** - Scale icon, gold/primary color with glow effect

#### Action Buttons
- "Add Purchase" button (outline style)
- "Add Payment" button (primary style)

#### Transaction History
- Section title: "Transaction History" with Calendar icon
- Empty state when no transactions
- List of transaction cards (newest first)

#### Transaction Card Contents
- Icon: Shopping bag (purchase) or Wallet (payment)
- Type indicator via icon and background color
- Item description (for purchases) or "Payment" label
- Date (formatted: "dd MMM yyyy")
- Weight with +/- prefix (+X.XX g for purchase, -X.XX g for payment)
- For payments: Show amount (₹X,XXX) and rate (₹X/g)
- Notes (if any)
- Delete button with confirmation

---

## Dialog Specifications

### Add Vepari Dialog
**Fields:**
- Name (required) - text input
- Phone (optional) - text input

**Buttons:**
- Cancel - closes dialog
- Add Vepari - submits form

### Add Purchase Dialog
**Fields:**
- Date (required) - date picker, defaults to today
- Weight in grams (required) - number input, step 0.01
- Item Description (optional) - text input, placeholder: "e.g., Earrings, Necklace, Bangles"
- Rate per Gram (optional) - number input, for reference only
- Notes (optional) - textarea

**Buttons:**
- Cancel - closes dialog
- Add Purchase - submits form

### Add Payment Dialog
**Fields:**
- Payment Date (required) - date picker, defaults to today
- Weight Paid in grams (required) - number input, step 0.01
- Rate per Gram (required) - number input, step 0.01
- Notes (optional) - textarea

**Calculated Display:**
- Total Amount: Shows live calculation (weight × rate) in ₹ format

**Buttons:**
- Cancel - closes dialog
- Record Payment - submits form

### Delete Confirmation Dialogs
Used for:
- Deleting a vepari (warns: deletes all transactions too)
- Deleting a transaction (purchase or payment)

---

## Design Specifications

### Color Palette (HSL Format - Dark Theme)
```css
/* Base colors */
--background: 220 20% 10%;        /* Dark navy background */
--foreground: 40 20% 95%;         /* Light cream text */
--card: 220 18% 13%;              /* Slightly lighter card background */
--card-foreground: 40 20% 95%;

/* Primary (Gold) */
--primary: 43 74% 49%;            /* Main gold color */
--primary-foreground: 220 20% 10%;

/* Secondary */
--secondary: 220 15% 18%;
--secondary-foreground: 40 10% 60%;

/* Muted */
--muted: 220 15% 20%;
--muted-foreground: 40 10% 60%;

/* Accent (also Gold) */
--accent: 43 74% 49%;
--accent-foreground: 220 20% 10%;

/* Status colors */
--destructive: 0 72% 51%;         /* Red for delete/error */
--destructive-foreground: 0 0% 100%;
--success: 142 71% 45%;           /* Green for paid/success */
--success-foreground: 0 0% 100%;

/* Borders & inputs */
--border: 220 15% 22%;
--input: 220 15% 18%;
--ring: 43 74% 49%;
--radius: 0.75rem;

/* Gold variations */
--gold: 43 74% 49%;
--gold-light: 43 80% 60%;
--gold-dark: 43 70% 35%;
```

### Typography
```css
/* Display font (headings) */
font-family: 'Playfair Display', serif;
weights: 400, 500, 600, 700

/* Body font */
font-family: 'Inter', sans-serif;
weights: 300, 400, 500, 600, 700
```

### Custom CSS Utilities
```css
/* Gold gradient for backgrounds/borders */
.gold-gradient {
  background: linear-gradient(135deg, 
    hsl(43 74% 49%) 0%, 
    hsl(43 80% 60%) 50%, 
    hsl(43 74% 49%) 100%);
}

/* Gold gradient text */
.gold-text {
  background: linear-gradient(135deg, 
    hsl(43 80% 60%) 0%, 
    hsl(43 74% 49%) 50%, 
    hsl(43 70% 35%) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Card glow effect */
.card-glow {
  box-shadow: 0 0 20px -5px hsl(43 74% 49% / 0.15);
}

/* Card hover animation */
.card-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 40px -10px hsl(43 74% 49% / 0.25);
}

/* Monospace number display */
.number-display {
  font-family: monospace;
  letter-spacing: -0.025em;
}
```

---

## Technology Stack

### Frontend Framework
- **React 18** with TypeScript
- **React Router DOM** for navigation
- **Vite** as build tool

### UI Components
- **shadcn/ui** component library (Radix UI based)
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Key Dependencies
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "@tanstack/react-query": "^5.83.0",
  "date-fns": "^3.6.0",
  "lucide-react": "^0.462.0",
  "tailwind-merge": "^2.6.0",
  "class-variance-authority": "^0.7.1",
  "sonner": "^1.7.4",
  "vite-plugin-pwa": "^1.2.0"
}
```

### PWA Configuration
```javascript
// vite.config.ts - VitePWA configuration
{
  registerType: "autoUpdate",
  manifest: {
    name: "Gold Payment Tracker",
    short_name: "Gold Tracker",
    description: "Track gold purchases and payments with veparis",
    theme_color: "#d4af37",
    background_color: "#0a0a0a",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    start_url: "/",
    icons: [
      { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  },
  workbox: {
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
    runtimeCaching: [/* Google Fonts caching */]
  }
}
```

---

## File Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── AddPaymentDialog.tsx
│   ├── AddPurchaseDialog.tsx
│   ├── AddVepariDialog.tsx
│   ├── TotalSummaryCard.tsx
│   └── VepariCard.tsx
├── hooks/
│   └── useVepariData.ts    # Main data management hook
├── pages/
│   ├── Index.tsx           # Dashboard page
│   ├── VepariDetail.tsx    # Vepari detail page
│   └── NotFound.tsx        # 404 page
├── types/
│   └── index.ts            # TypeScript interfaces
├── lib/
│   └── utils.ts            # Utility functions (cn helper)
├── App.tsx                 # Root component with routing
├── main.tsx                # Entry point
└── index.css               # Global styles & design tokens

public/
├── pwa-192x192.png         # PWA icon (small)
├── pwa-512x512.png         # PWA icon (large)
└── robots.txt
```

---

## Application Logic

### Data Hook: useVepariData()

**State:**
- `veparis: Vepari[]`
- `purchases: Purchase[]`
- `payments: Payment[]`

**Methods:**
- `addVepari(name, phone?)` → Creates new vepari
- `deleteVepari(id)` → Deletes vepari and all related transactions
- `addPurchase(purchase)` → Creates new purchase
- `deletePurchase(id)` → Deletes purchase
- `addPayment(payment)` → Creates new payment
- `deletePayment(id)` → Deletes payment
- `getVepariSummaries()` → Returns VepariSummary[] with calculated totals
- `getVepariById(id)` → Returns single vepari
- `getVepariPurchases(vepariId)` → Returns purchases for vepari (sorted newest first)
- `getVepariPayments(vepariId)` → Returns payments for vepari (sorted newest first)
- `getTotalRemaining()` → Returns sum of all remaining weights

### Calculations
```typescript
// Per vepari
totalPurchased = sum of all purchase.weightGrams for vepari
totalPaid = sum of all payment.weightGrams for vepari
remainingWeight = totalPurchased - totalPaid

// Global
totalRemaining = sum of all veparis' remainingWeight
```

---

## Creating Windows EXE

### Option 1: PWA Installation
1. Build the app: `npm run build`
2. Serve with HTTPS or localhost
3. Open in Chrome/Edge
4. Install from browser menu → "Install App"

### Option 2: Electron Wrapper
To create a standalone .exe file, wrap the app with Electron:

```javascript
// main.js (Electron main process)
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, 'icon.ico')
  });

  // Load the built React app
  win.loadFile('dist/index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

**Build commands:**
```bash
# Install Electron and builder
npm install electron electron-builder --save-dev

# Add to package.json scripts
"electron": "electron .",
"electron:build": "npm run build && electron-builder"

# Build Windows exe
npm run electron:build
```

### Option 3: Tauri (Smaller exe, Rust-based)
Tauri produces much smaller executables (~5MB vs ~150MB for Electron).

---

## User Workflows

### Workflow 1: Add a New Vepari
1. Click "Add Vepari" button on dashboard
2. Enter name (required) and phone (optional)
3. Click "Add Vepari"
4. Vepari appears in the list

### Workflow 2: Record a Purchase
1. Click on vepari card to open detail page
2. Click "Add Purchase" button
3. Enter date, weight, optionally item description and rate
4. Click "Add Purchase"
5. Transaction appears in history, summary updates

### Workflow 3: Record a Payment
1. Open vepari detail page
2. Click "Add Payment" button
3. Enter date, weight paid, and current gold rate
4. See calculated total amount
5. Click "Record Payment"
6. Remaining balance decreases

### Workflow 4: View Outstanding Balances
1. Dashboard shows total remaining across all veparis
2. Each vepari card shows individual remaining balance
3. All amounts in grams of gold

---

## Number Formatting

- **Weight:** Display with 2 decimal places (e.g., "100.00 g")
- **Currency:** Indian Rupee format with thousands separator (e.g., "₹1,50,000")
- **Rate:** Show as "₹7,500/g"
- **Dates:** Format as "dd MMM yyyy" (e.g., "21 Dec 2025")

---

## Icons Used (Lucide React)

- `Scale` - App logo, remaining balance
- `Users` - Vepari section header
- `User` - Vepari avatar
- `Plus` - Add buttons
- `UserPlus` - Add vepari dialog
- `ShoppingBag` - Purchases
- `Wallet` - Payments
- `Calendar` - Transaction history
- `ChevronRight` - Card navigation indicator
- `Trash2` - Delete buttons
- `ArrowLeft` - Back navigation

---

## Responsive Design

- **Mobile (< 768px):** Single column layout, stacked cards
- **Tablet (768px - 1024px):** 2 column vepari grid
- **Desktop (> 1024px):** 3 column vepari grid

All dialogs are responsive with proper padding and spacing on all screen sizes.

---

## Error Handling

- Form validation prevents empty required fields
- Delete operations require confirmation
- 404 page for invalid routes
- Vepari not found handling on detail page

---

## Future Enhancement Possibilities

1. **Edit functionality** for veparis, purchases, payments
2. **Search and filter** veparis
3. **Export data** to CSV/Excel
4. **Cloud sync** with user accounts
5. **Multiple currencies** support
6. **Reports and analytics** dashboard
7. **Backup/restore** functionality
8. **Print invoices/statements**

---

*Document Version: 1.0*  
*Last Updated: December 2025*
