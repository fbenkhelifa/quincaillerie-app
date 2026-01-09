# 🚀 Premium UI Quick-Start (5 Minutes)

This guide gets you using the new premium components in under 5 minutes.

---

## 1️⃣ **Import Components**

```jsx
// In your page component
import { ProDataTable, PageHeader } from '@/Components/ui';
import { BaseDetailDrawer, DetailSection, DetailRow } from '@/Components/Drawers';
import { formatCurrency, getTrendInfo } from '@/utils/premiumUI';
```

---

## 2️⃣ **Define Table Columns**

```jsx
const columns = [
  {
    id: 'name',
    label: 'Product Name',
    field: 'name',
    sortable: true,
    visible: true,
    alwaysVisible: true,
  },
  {
    id: 'price',
    label: 'Price',
    field: 'selling_price',
    sortable: true,
    visible: true,
    render: (value) => formatCurrency(value),
  },
  {
    id: 'stock',
    label: 'Stock',
    field: 'quantity',
    sortable: true,
    visible: true,
  },
];
```

---

## 3️⃣ **Render ProDataTable**

```jsx
<ProDataTable
  columns={columns}
  rows={items}
  page={page}
  pageSize={pageSize}
  totalRows={total}
  onPageChange={(newPage) => {
    setPage(newPage);
    // Fetch data: router.get(route('items.index'), { page: newPage + 1 });
  }}
  onPageSizeChange={(newSize) => {
    setPageSize(newSize);
    // Fetch data with new size
  }}
  onSort={(field, order) => {
    // Fetch sorted data: router.get(route('items.index'), { sort: field, direction: order });
  }}
  tableKey="items"
  enableColumnVisibility
  enableExport
/>
```

---

## 4️⃣ **Add Detail Drawer**

```jsx
// State
const [selectedItem, setSelectedItem] = useState(null);
const [drawerOpen, setDrawerOpen] = useState(false);

// Handler
const handleOpenDrawer = (item) => {
  setSelectedItem(item);
  setDrawerOpen(true);
};

// In your column render:
{
  id: 'name',
  render: (value, row) => (
    <Typography
      onClick={() => handleOpenDrawer(row)}
      sx={{ cursor: 'pointer', color: 'primary.main' }}
    >
      {value}
    </Typography>
  ),
}

// Drawer JSX:
<BaseDetailDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  title={selectedItem?.name}
  onEdit={() => router.visit(route('items.edit', selectedItem.id))}
  onDelete={() => handleDelete(selectedItem)}
>
  {selectedItem && (
    <>
      <DetailSection title="Basic Info">
        <DetailRow label="Name" value={selectedItem.name} />
        <DetailRow label="Price" value={formatCurrency(selectedItem.price)} highlight />
      </DetailSection>
      
      <DetailSection title="Stock">
        <DetailRow label="Quantity" value={selectedItem.quantity} />
      </DetailSection>
    </>
  )}
</BaseDetailDrawer>
```

---

## 5️⃣ **Add Page Header**

```jsx
<PageHeader
  title="Products"
  subtitle="Manage your product inventory"
  breadcrumbs={[
    { label: 'Products', href: route('products.index') },
  ]}
  actions={
    <Button
      component={Link}
      href={route('products.create')}
      variant="contained"
      startIcon={<AddIcon />}
    >
      New Product
    </Button>
  }
/>
```

---

## 🎯 Common Tasks

### Format Currency
```jsx
import { formatCurrency } from '@/utils/premiumUI';

const display = formatCurrency(1234.50, 'USD'); // "$1,234.50"
```

### Get Trend Color
```jsx
import { getTrendInfo } from '@/utils/premiumUI';

const trend = getTrendInfo(5.2);
// Returns: { color: 'success.main', icon: '↑', text: '+5.20%' }
```

### Display Status Badge
```jsx
import { StatusBadge } from '@/Components/Drawers';

<StatusBadge status="low_stock" />  // Warning color
<StatusBadge status="in_stock" />   // Success color
<StatusBadge status="out_of_stock" /> // Error color
```

### Add Metric Cards
```jsx
import { MetricDisplay } from '@/Components/Drawers';

<Grid container spacing={2}>
  <Grid item xs={6}>
    <MetricDisplay
      label="Total Revenue"
      value="$12,450"
      highlighted
    />
  </Grid>
  <Grid item xs={6}>
    <MetricDisplay
      label="Items Sold"
      value="234"
    />
  </Grid>
</Grid>
```

---

## 🎨 Using the Theme

### Access Theme in Components
```jsx
import { useTheme } from '@mui/material';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ color: theme.palette.primary.main }}>
      Primary Color
    </Box>
  );
};
```

### Common Colors
```javascript
theme.palette.primary.main    // #4F46E5 (indigo)
theme.palette.success.main    // #10B981 (green)
theme.palette.warning.main    // #F59E0B (amber)
theme.palette.error.main      // #EF4444 (red)
theme.palette.info.main       // #3B82F6 (blue)
```

### Responsive Breakpoints
```jsx
<Box sx={{
  display: { xs: 'block', sm: 'none' },  // Mobile only
  padding: { xs: 1, sm: 2, md: 3 },      // Responsive padding
}}>
  Content
</Box>
```

---

## 🧪 Quick Test Checklist

After implementing a page:

- [ ] Table renders with data
- [ ] Pagination works (next/prev buttons)
- [ ] Click a row → drawer opens
- [ ] Drawer shows details
- [ ] Edit button → navigates to edit page
- [ ] Delete button → shows confirmation
- [ ] Click column header → sorts
- [ ] Column visibility menu works
- [ ] "Compact" preset shrinks rows
- [ ] "Comfortable" preset enlarges rows
- [ ] Export button downloads CSV
- [ ] Light mode looks good
- [ ] Dark mode looks good
- [ ] Mobile view (375px) is readable

---

## 📋 File Locations

```
resources/js/
├── Components/
│   ├── ui/
│   │   └── ProDataTable.jsx  ← Table component
│   └── Drawers.jsx           ← Drawer components
├── Pages/
│   ├── Products/
│   │   └── Index.premium.jsx  ← Reference implementation
│   ├── Bills/
│   │   └── Index.premium.jsx  ← Reference implementation
│   └── Suppliers/
│       └── Index.premium.jsx  ← Reference implementation
├── utils/
│   └── premiumUI.js           ← Helper functions
├── hooks/
│   └── useKeyboardShortcuts.js ← Keyboard shortcuts
└── theme/
    ├── theme.js               ← MUI theme
    └── tokens.js              ← Design tokens
```

---

## 🎬 One-Page Recipe

```jsx
import { useState, useMemo } from 'react';
import { Head, router } from '@inertiajs/react';
import { ProDataTable, PageHeader } from '@/Components/ui';
import { BaseDetailDrawer, DetailSection, DetailRow } from '@/Components/Drawers';
import { Button, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { formatCurrency } from '@/utils/premiumUI';

export default function ItemsIndex({ items, total }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [selectedItem, setSelectedItem] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const columns = useMemo(() => [
    {
      id: 'name',
      label: 'Name',
      field: 'name',
      sortable: true,
      visible: true,
      alwaysVisible: true,
      render: (v, r) => (
        <Box onClick={() => { setSelectedItem(r); setDrawerOpen(true); }} sx={{ cursor: 'pointer' }}>
          {v}
        </Box>
      ),
    },
    {
      id: 'price',
      label: 'Price',
      field: 'price',
      sortable: true,
      visible: true,
      render: (v) => formatCurrency(v),
    },
  ], []);

  return (
    <>
      <Head title="Items" />
      <PageHeader title="Items" subtitle="Manage items" />
      <Box sx={{ mt: 3 }}>
        <ProDataTable
          columns={columns}
          rows={items}
          page={page}
          pageSize={pageSize}
          totalRows={total}
          onPageChange={setPage}
          tableKey="items"
          enableColumnVisibility
        />
      </Box>
      <BaseDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedItem?.name}
      >
        {selectedItem && (
          <DetailSection title="Details">
            <DetailRow label="Price" value={formatCurrency(selectedItem.price)} />
          </DetailSection>
        )}
      </BaseDetailDrawer>
    </>
  );
}
```

---

## ⚡ Performance Tips

1. **Memoize columns** - Use `useMemo` for column definitions
2. **Lazy load drawer content** - Fetch details only when drawer opens
3. **Use pagination** - Don't load all rows at once
4. **Optimize renders** - Use `shouldComponentUpdate` for large lists
5. **Debounce search** - Avoid too many requests

---

## 🆘 Stuck?

1. Check `docs/UI_WOW_CHECKLIST.md` for full reference
2. Check `docs/IMPLEMENTATION_GUIDE.md` for detailed docs
3. Look at `Index.premium.jsx` reference files
4. Check theme colors in `resources/js/theme/tokens.js`
5. Test with browser DevTools open (F12)

---

**You're ready! Pick a page and start building. 🚀**

