# APP AUDIT REPORT — quincaillerie-app

## SECTION 1 — Repo & Environment Summary

- **Project name (from README/composer.json)**
  - `README.md`: “Quincaillerie App - Application de gestion de quincaillerie”
  - `composer.json`: `"name": "laravel/quincaillerie-app"`, `"description": "Hardware Store (Quincaillerie) Management System"`
- **Stack summary (Laravel version, PHP requirement, frontend stack, build tool)**
  - Laravel: `^12.0` (`composer.json`), runtime `Laravel Framework 12.43.1` (Section 10).
  - PHP: `^8.2` (`composer.json`), runtime `PHP 8.2.12` (Section 10).
  - Frontend: Inertia + React (`inertiajs/inertia-laravel`, `@inertiajs/react`).
  - UI: Material UI (`@mui/*`) + Tailwind (`tailwind.config.js`, `tailwindcss`).
  - Build: Vite (`vite.config.js`, `vite`, `laravel-vite-plugin`, `@vitejs/plugin-react`).
  - PDF: DomPDF (`barryvdh/laravel-dompdf`, used in `app/Http/Controllers/BillsController.php`).
- **Database engine and config expectations**
  - `.env.example`: MySQL (`DB_CONNECTION=mysql`, `DB_DATABASE=quincaillerie`, `DB_USERNAME=root`).
  - **Repo anomaly**: `config/` directory is missing (no `config/database.php`, `config/queue.php`, etc.; confirmed by `Test-Path config` → `MISSING config dir`).
- **Queue driver + scheduler setup**
  - `.env.example`: `QUEUE_CONNECTION=database`; migrations include `jobs`/`job_batches`/`failed_jobs` (`database/migrations/0001_01_01_000002_create_jobs_table.php`).
  - No scheduler/task definitions found (no `schedule(...)` usage in `app/`, `routes/`, `bootstrap/`).
- **How to run locally (exact commands from README + any corrections)**
  - `README.md`: `composer install`, `npm install`, copy `.env.example` → `.env`, `php artisan key:generate`, `php artisan migrate`, optional `php artisan db:seed`, `php artisan storage:link`, `npm run dev` / `npm run build`, then visit `http://quincaillerie-app.test` (Laragon) or run `php artisan serve`.
  - Corrections based on running commands:
    - `php artisan test` fails because `phpunit.xml` references `tests/Unit` but the repo only has `tests/Feature/*` (Section 10).
    - `npm run build` succeeds but logs a JSX warning in `resources/js/Pages/Bills/Create.jsx` (Section 10).
- **Detected OS assumptions (Laragon/Windows paths etc.)**
  - `README.md` uses `c:\\laragon\\www` and Laragon hostname; `.env.example` has Laragon-centric DB defaults and `APP_URL=http://quincaillerie-app.test`.

## SECTION 2 — Feature Inventory (What exists today)

All business routes are in `routes/web.php` and are under `Route::middleware('auth')`. There is no `routes/api.php` in this repo.

### Auth & RBAC (roles/permissions)

- **Main route(s)**: `GET login`, `POST login`, `GET register`, `POST register`, `POST logout` (`routes/web.php`).
- **Controller(s)**: `app/Http/Controllers/Auth/AuthenticatedSessionController.php`, `app/Http/Controllers/Auth/RegisteredUserController.php`.
- **React page component(s)**: `resources/js/Pages/Auth/Login.jsx`, `resources/js/Pages/Auth/Register.jsx`.
- **Key models involved**: `app/Models/User.php` (`role` enum: `admin|cashier|viewer`).
- **RBAC reality check**
  - Policies exist: `app/Policies/ProductPolicy.php`, `app/Policies/BillPolicy.php`.
  - No evidence of enforcement in controllers (no `authorize()` / `authorizeResource()` calls; `rg` only found `LoginRequest::authorize()` in `app/Http/Requests/Auth/LoginRequest.php`).
  - No `app/Providers/AuthServiceProvider.php` exists in repo, so policy registration is not visible here.

### Dashboard

- **Main route(s)**: `GET /` (`dashboard`) (`routes/web.php`).
- **Controller(s)**: `app/Http/Controllers/DashboardController.php@index`.
- **React page component(s)**: `resources/js/Pages/Dashboard.jsx`.
- **Key models involved**: `app/Models/Product.php`, `app/Models/Bill.php`, `app/Models/InventoryMovement.php`.

### Products / Inventory

- **Main route(s)**: resource `products` + `products/search` + `products/{product}/adjust-stock` (`routes/web.php`).
- **Controller(s)**: `app/Http/Controllers/ProductsController.php`, plus query helper `app/Domains/Products/Queries/ProductIndexQuery.php`.
- **React page component(s)**: `resources/js/Pages/Products/Index.jsx`, `resources/js/Pages/Products/Create.jsx`, `resources/js/Pages/Products/Edit.jsx`.
- **Key models involved**: `app/Models/Product.php`, `app/Models/Category.php`, `app/Models/Supplier.php`, `app/Models/InventoryMovement.php`.
- **Known missing UI**
  - `ProductsController@show` renders `Inertia::render('Products/Show', ...)` but `resources/js/Pages/Products/Show.jsx` is not present in repo.

### Invoices / Sales (Bills)

- **Main route(s)**: resource `bills` + `bills/{bill}/pdf/{lang?}` + `bills/{bill}/cancel` (`routes/web.php`).
- **Controller(s)**: `app/Http/Controllers/BillsController.php`.
- **React page component(s)**: `resources/js/Pages/Bills/Index.jsx`, `resources/js/Pages/Bills/Create.jsx`, `resources/js/Pages/Bills/Edit.jsx`, `resources/js/Pages/Bills/Show.jsx`.
- **Key models involved**: `app/Models/Bill.php`, `app/Models/BillItem.php`, `app/Models/Product.php`, `app/Models/Worker.php`, `app/Models/Setting.php`, `app/Models/InventoryMovement.php`.
- **PDF output**
  - `BillsController@downloadPdf` uses DomPDF and blade view `resources/views/bills/invoice.blade.php`.

### Purchases (if any)

- No dedicated purchase document/module found (no purchase routes/controllers/pages).
  - Stock movements support a `purchase` type (`database/migrations/2024_01_01_000011_create_inventory_movements_table.php`, `app/Models/InventoryMovement.php`), but purchases are not modeled as first-class documents.

### Stock movements / adjustments

- **Main route(s)**: `POST products/{product}/adjust-stock` (`routes/web.php`).
- **Controller(s)**: `ProductsController@adjustStock` (`app/Http/Controllers/ProductsController.php`).
- **React page component(s)**: adjustment dialog inside `resources/js/Pages/Products/Index.jsx`; dashboard shows recent movements (`resources/js/Pages/Dashboard.jsx`).
- **Key models involved**: `app/Models/Product.php::adjustStock(...)`, `app/Models/InventoryMovement.php`.

### Suppliers / categories

- **Categories**
  - Routes: resource `categories` without create/edit/show (`routes/web.php`).
  - Controller: `app/Http/Controllers/CategoriesController.php`.
  - React: `resources/js/Pages/Categories/Index.jsx`.
  - Models: `app/Models/Category.php` (+ `Product` relationship).
- **Suppliers**
  - Routes: resource `suppliers` without create/edit/show (`routes/web.php`).
  - Controller: `app/Http/Controllers/SuppliersController.php`.
  - React: `resources/js/Pages/Suppliers/Index.jsx`.
  - Models: `app/Models/Supplier.php` (+ pivot `product_supplier`).

### Settings / monitoring

- **Main route(s)**: `GET settings`, `PUT settings`, `POST settings/locale`, `POST settings/theme` (`routes/web.php`).
- **Controller(s)**: `app/Http/Controllers/SettingsController.php`.
- **React page component(s)**: `resources/js/Pages/Settings/Index.jsx`.
- **Key models involved**: `app/Models/Setting.php`, `app/Models/User.php` (preferred locale/theme).
- **Schema/UI mismatch (important)**
  - Settings table columns are limited to store basics (`database/migrations/2024_01_01_000003_create_settings_table.php`).
  - The settings UI expects many additional fields (e.g. `email`, `rc_number`, `invoice_footer`) in `resources/js/Pages/Settings/Index.jsx` that the controller does not validate and the DB cannot persist.

### Any “AI/analytics” features already present

- None found (no analytics tables, jobs, or commands beyond `inspire`).

## SECTION 3 — Database Schema Map (Ground truth)

Derived from `database/migrations/*` + `app/Models/*`.

### Tables, key columns, relationships, indexes

- **`users`** — `database/migrations/0001_01_01_000000_create_users_table.php`
  - Columns: `email` unique, `role` enum (`admin|cashier|viewer`), `preferred_locale`, `preferred_theme`, timestamps.
  - Related tables in same migration: `password_reset_tokens`, `sessions` (indexed `user_id`, `last_activity`).
- **`cache`, `cache_locks`** — `database/migrations/0001_01_01_000001_create_cache_table.php`
  - Primary keys: `key`.
- **`jobs`, `job_batches`, `failed_jobs`** — `database/migrations/0001_01_01_000002_create_jobs_table.php`
  - Indexes: `jobs.queue`; `failed_jobs.uuid` unique.
- **`settings`** — `database/migrations/2024_01_01_000003_create_settings_table.php`
  - Columns: `store_name`, `owner_name`, `phone`, `address`, `logo`, `default_locale`, `default_theme`, `currency`, `tax_id`.
- **`categories`** — `database/migrations/2024_01_01_000004_create_categories_table.php`
  - FK: `parent_id` → `categories.id` (nullable, nullOnDelete).
  - Indexes: `name`, `is_active`; `slug` unique.
- **`suppliers`** — `database/migrations/2024_01_01_000005_create_suppliers_table.php`
  - Indexes: `name`, `is_active`.
- **`workers`** — `database/migrations/2024_01_01_000006_create_workers_table.php`
  - Indexes: `name`, `is_active`.
- **`products`** — `database/migrations/2024_01_01_000007_create_products_table.php`
  - FK: `category_id` → `categories.id` (nullable, nullOnDelete).
  - Indexes: `barcode`, `name`, `is_active`, `quantity`, composite `['quantity','min_stock']`; `sku` unique.
- **`product_supplier`** — `database/migrations/2024_01_01_000008_create_product_supplier_table.php`
  - FKs: `product_id` → `products.id` (cascade), `supplier_id` → `suppliers.id` (cascade).
  - Indexes: unique composite `['product_id','supplier_id']`.
- **`bills`** — `database/migrations/2024_01_01_000009_create_bills_table.php`
  - FKs: `user_id` → `users.id` (nullable, nullOnDelete), `worker_id` → `workers.id` (nullable, nullOnDelete).
  - Indexes: `bill_number` (unique + index), `created_at`, `status`.
- **`bill_items`** — `database/migrations/2024_01_01_000010_create_bill_items_table.php`
  - FKs: `bill_id` → `bills.id` (cascade), `product_id` → `products.id` (nullable, nullOnDelete).
  - Indexes: `bill_id` only (explicit).
- **`inventory_movements`** — `database/migrations/2024_01_01_000011_create_inventory_movements_table.php`
  - FKs: `product_id` → `products.id` (cascade), `user_id` → `users.id` (nullable), `bill_id` → `bills.id` (nullable).
  - Indexes: `product_id`, `type`, `created_at`.

### High-volume tables (estimated based on seeders or usage)

- Likely: `bills`, `bill_items`, `inventory_movements` (written on every sale and stock adjustment) — see `app/Http/Controllers/BillsController.php` and `app/Models/Product.php::adjustStock(...)`.
- Seeders populate mainly `categories`, `suppliers`, `workers`, `products` (`database/seeders/*`); there is no bill seeding.

### Missing indexes (strong suspects based on queries)

- `bill_items.product_id` (relationship key, not indexed in migration).
- `inventory_movements.bill_id`, `inventory_movements.user_id` (relationship keys, not indexed).
- `bills.user_id`, `bills.worker_id` (relationship keys, not indexed).
- `bills.payment_method` is filtered in `BillsController@index` but not indexed (`app/Http/Controllers/BillsController.php` + `database/migrations/2024_01_01_000009_create_bills_table.php`).

## SECTION 4 — Analytics/AI Pipeline (If present)

No analytics pipeline exists yet.

- `routes/console.php` only defines `inspire`.
- No custom jobs/services directories were found in `app/` for analytics/forecasting/anomaly detection.
- No analytics output tables exist in migrations.

## SECTION 5 — Performance Audit (Evidence-based)

### Evidence

- **N+1 on bill store/update (P0)**
  - `BillsController@store` calls `Product::findOrFail(...)` inside a loop for each item (`app/Http/Controllers/BillsController.php`).
  - `BillsController@update` also looks up products per item in a loop (`app/Http/Controllers/BillsController.php`).
- **Dashboard does multiple aggregates per request (P2)**
  - `DashboardController@index` runs multiple `count()` and `sum()` queries (`app/Http/Controllers/DashboardController.php`).

### Prioritized fixes

- **P0**
  - Batch-load products for a bill (`whereIn`) and validate/compute in memory instead of per-item `findOrFail` loops (`app/Http/Controllers/BillsController.php`).
- **P1**
  - Add missing indexes listed in Section 3 for relationship/filter keys to keep list + report queries fast as data grows.
- **P2**
  - Cache dashboard aggregates (per day) or precompute daily totals if the dataset grows large.

## SECTION 6 — Security & Data Safety Audit

- **Auth coverage**
  - All business routes are in an `auth` middleware group (`routes/web.php`).
- **RBAC**
  - Roles exist (`users.role` in `database/migrations/0001_01_01_000000_create_users_table.php`, helpers in `app/Models/User.php`).
  - Policies exist (`app/Policies/ProductPolicy.php`, `app/Policies/BillPolicy.php`).
  - **Gap**: controllers do not enforce authorization (no `authorize()` calls detected), and routes have no role middleware.
- **Validation**
  - Most writes use `$request->validate(...)` in controllers (Products/Bills/Categories/Suppliers/Workers/Settings).
  - Login uses a FormRequest with throttling (`app/Http/Requests/Auth/LoginRequest.php`).
- **Sensitive data exposure risks**
  - Because RBAC isn’t enforced in code, any authenticated user may be able to hit write endpoints (e.g., deletes/cancels/stock adjustments) unless protected elsewhere.
  - Debug mode is enabled in `.env.example` (`APP_DEBUG=true`), which risks stack trace exposure if used in production.
- **Prioritized fixes**
  - **P0**: enforce policy checks (or role middleware) for create/update/delete/cancel/adjust-stock actions.
  - **P1**: consolidate authorization + validation into FormRequests for complex flows (Bills/Products).

## SECTION 7 — UI/UX Quality Audit (Modern SaaS)

- **Layout consistency**
  - Shared MUI layout with responsive drawer/topbar: `resources/js/Layouts/Layout.jsx`.
- **Table UX**
  - Bills list includes filters and pagination: `resources/js/Pages/Bills/Index.jsx`.
  - Products list uses reusable `Filters` + `ProductsTable`: `resources/js/Pages/Products/Index.jsx`, `resources/js/Components/Filters.jsx`, `resources/js/Components/ProductsTable.jsx`.
- **Loading/empty states**
  - Bills create has explicit loading for product search and empty-state table row: `resources/js/Pages/Bills/Create.jsx`.
  - Dashboard has empty states for recent bills/movements: `resources/js/Pages/Dashboard.jsx`.
- **Responsiveness**
  - Drawer switches based on breakpoint in `Layout.jsx`.
- **Accessibility basics**
  - MUI defaults help, but icon buttons generally lack explicit `aria-label`s (e.g., actions in `Bills/Index.jsx`).
- **Visual consistency**
  - MUI is the primary design system; Tailwind is configured but preflight disabled (`tailwind.config.js`), suggesting Tailwind is not the main token system.

Top “WOW” UX changes (fastest)

1. Barcode-first “POS mode” in `resources/js/Pages/Bills/Create.jsx` (focus management + keyboard shortcuts using existing `products.search`).
2. Role-aware nav/actions (hide/disable actions based on `auth.user.role` already shared via `app/Http/Middleware/HandleInertiaRequests.php`).
3. Dedicated “Low stock / Out of stock” page built from `Product::lowStock()` / `Product::outOfStock()` (`app/Models/Product.php`).

## SECTION 8 — Test & DevEx Audit

- **Test framework and current coverage**
  - PHPUnit configured in `phpunit.xml`; feature tests exist under `tests/Feature/*`.
  - `php artisan test` currently fails because `phpunit.xml` references a missing `tests/Unit` directory (Section 10).
- **Lint/format setup**
  - Laravel Pint is installed (`laravel/pint` in `composer.json`) but no JS lint tooling/scripts exist in `package.json` (only `dev`, `build`, `preview`).
- **CI presence**
  - No CI config observed in the top-level directory listing (no `.github/workflows` seen).
- **Known failing tests or build steps**
  - `php artisan test` fails (missing `tests/Unit`).
  - `npm run build` succeeds but emits a warning about duplicate JSX attributes (Section 10).

## SECTION 9 — “WOW Upgrade Opportunities” (Tied to THIS repo)

Each proposal is grounded in current tables/pages/models.

1. **Low-stock replenishment assistant** (WOW: high / effort: medium / risk: low)
   - Uses existing: `products` (`quantity`, `min_stock`), `suppliers`, `product_supplier`.
   - New tables: optional `reorder_suggestions`.
   - Pages: new inventory alert page + dashboard link (`resources/js/Pages/Dashboard.jsx`).
2. **Audit trail & reports for stock movements** (WOW: high / effort: medium / risk: low)
   - Uses existing: `inventory_movements`, `products`, `users`, `bills`.
   - New tables: none.
   - Pages: new `InventoryMovements/Index` + print/export.
3. **Real RBAC enforcement + role-aware UI** (WOW: high / effort: medium / risk: medium)
   - Uses existing: `users.role`, `app/Policies/*`, auth props already shared (`app/Http/Middleware/HandleInertiaRequests.php`).
   - New tables: none.
   - Pages: layout nav + Products/Bills actions + Settings access.
4. **Barcode-first fast checkout** (WOW: high / effort: low-medium / risk: low)
   - Uses existing: `products.barcode`, `products.search` (`ProductsController@search`).
   - New tables: none.
   - Pages: `resources/js/Pages/Bills/Create.jsx`.
5. **Customer repeat-sales insights** (WOW: medium-high / effort: medium / risk: medium)
   - Uses existing: `bills.customer_phone`, `bills.customer_name`, `bills.total`.
   - New tables: optional `customers` (normalize).
   - Pages: Bills show + new customer profile page.
6. **Sales analytics dashboard** (WOW: medium-high / effort: medium / risk: medium)
   - Uses existing: `bills` (status/payment_method/created_at/total).
   - New tables: optional daily aggregates.
   - Pages: dashboard charts + analytics page.
7. **Supplier cost tracking & margin protection** (WOW: medium / effort: medium / risk: low)
   - Uses existing: `product_supplier.cost_price`, `products.purchase_price`, `products.selling_price`.
   - New tables: optional `supplier_price_history`.
   - Pages: product edit + supplier pages.
8. **Handoff hardening: fix missing config/tests + mismatched settings** (WOW: medium / effort: low / risk: low)
   - Uses existing: repo structure; fixes unblock upgrades.
   - Pages: none (mostly infra + schema/UI alignment).

## SECTION 10 — Command Outputs Appendix

### `php -v`

```text
PHP 8.2.12 (cli) (built: Oct 24 2023 21:15:15) (ZTS Visual C++ 2019 x64)
Copyright (c) The PHP Group
Zend Engine v4.2.12, Copyright (c) Zend Technologies
```

### `php artisan --version`

```text
Laravel Framework 12.43.1
```

### `php artisan route:list`

```text
GET|HEAD        / ............................................................ dashboard › DashboardController@index
GET|HEAD        bills .......................................................... bills.index › BillsController@index
POST            bills .......................................................... bills.store › BillsController@store
GET|HEAD        bills/create ................................................. bills.create › BillsController@create
GET|HEAD        bills/{bill} ..................................................... bills.show › BillsController@show
PUT|PATCH       bills/{bill} ................................................. bills.update › BillsController@update
DELETE          bills/{bill} ............................................... bills.destroy › BillsController@destroy
POST            bills/{bill}/cancel .......................................... bills.cancel › BillsController@cancel
GET|HEAD        bills/{bill}/edit ................................................ bills.edit › BillsController@edit
GET|HEAD        bills/{bill}/pdf/{lang?} ................................... bills.pdf › BillsController@downloadPdf
GET|HEAD        categories ........................................... categories.index › CategoriesController@index
POST            categories ........................................... categories.store › CategoriesController@store
PUT|PATCH       categories/{category} .............................. categories.update › CategoriesController@update
DELETE          categories/{category} ............................ categories.destroy › CategoriesController@destroy
GET|HEAD        login ........................................... login › Auth\\AuthenticatedSessionController@create
POST            login .................................................... Auth\\AuthenticatedSessionController@store
POST            logout ........................................ logout › Auth\\AuthenticatedSessionController@destroy
GET|HEAD        products ................................................. products.index › ProductsController@index
POST            products ................................................. products.store › ProductsController@store
GET|HEAD        products/create ........................................ products.create › ProductsController@create
GET|HEAD        products/search ........................................ products.search › ProductsController@search
GET|HEAD        products/{product} ......................................... products.show › ProductsController@show
PUT|PATCH       products/{product} ..................................... products.update › ProductsController@update
DELETE          products/{product} ................................... products.destroy › ProductsController@destroy
POST            products/{product}/adjust-stock ............. products.adjust-stock › ProductsController@adjustStock
GET|HEAD        products/{product}/edit .................................... products.edit › ProductsController@edit
GET|HEAD        register ........................................... register › Auth\\RegisteredUserController@create
POST            register ....................................................... Auth\\RegisteredUserController@store
GET|HEAD        sanctum/csrf-cookie .............. sanctum.csrf-cookie › Laravel\\Sanctum › CsrfCookieController@show
GET|HEAD        settings ................................................. settings.index › SettingsController@index
PUT             settings ............................................... settings.update › SettingsController@update
POST            settings/locale .................................. settings.locale › SettingsController@updateLocale
POST            settings/theme ..................................... settings.theme › SettingsController@updateTheme
GET|HEAD        storage/{path} ....................................................................... storage.local
GET|HEAD        suppliers .............................................. suppliers.index › SuppliersController@index
POST            suppliers .............................................. suppliers.store › SuppliersController@store
PUT|PATCH       suppliers/{supplier} ................................. suppliers.update › SuppliersController@update
DELETE          suppliers/{supplier} ............................... suppliers.destroy › SuppliersController@destroy
GET|HEAD        up .................................................................................................
GET|HEAD        workers .................................................... workers.index › WorkersController@index
POST            workers .................................................... workers.store › WorkersController@store
GET|HEAD        workers/create ........................................... workers.create › WorkersController@create
GET|HEAD        workers/{worker} ............................................. workers.show › WorkersController@show
PUT|PATCH       workers/{worker} ......................................... workers.update › WorkersController@update
DELETE          workers/{worker} ....................................... workers.destroy › WorkersController@destroy
GET|HEAD        workers/{worker}/edit ........................................ workers.edit › WorkersController@edit

Showing [46] routes
```

### `php artisan migrate:status`

```text
Migration name ...................................................................................... Batch / Status
0001_01_01_000000_create_users_table ....................................................................... [1] Ran
0001_01_01_000001_create_cache_table ....................................................................... [1] Ran
0001_01_01_000002_create_jobs_table ........................................................................ [1] Ran
2024_01_01_000003_create_settings_table .................................................................... [1] Ran
2024_01_01_000004_create_categories_table .................................................................. [1] Ran
2024_01_01_000005_create_suppliers_table ................................................................... [1] Ran
2024_01_01_000006_create_workers_table ..................................................................... [1] Ran
2024_01_01_000007_create_products_table .................................................................... [1] Ran
2024_01_01_000008_create_product_supplier_table ............................................................ [1] Ran
2024_01_01_000009_create_bills_table ....................................................................... [1] Ran
2024_01_01_000010_create_bill_items_table .................................................................. [1] Ran
2024_01_01_000011_create_inventory_movements_table ......................................................... [1] Ran
```

### `php artisan test`

```text
PHPUnit 11.5.46 by Sebastian Bergmann and contributors.

Test directory "C:\\laragon\\www\\quincaillerie-app\\tests/Unit" not found
```

### `npm test / npm run build`

- `npm test`: not available (no `test` script in `package.json`).
- `npm run build` (build succeeded, warning emitted):

```text
> build
> vite build

[plugin vite:esbuild] resources/js/Pages/Bills/Create.jsx: Duplicate "inputProps" attribute in JSX element
✓ built in 55.61s
```

### `npm run dev`

- Not run (long-running dev server).
