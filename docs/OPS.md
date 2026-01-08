# Operational Automation (OPS)

## Overview

This module provides real operational automation for the Quincaillerie App:

1. **Scheduled Tasks**: Nightly computations for analytics, reorder suggestions, and anomaly detection
2. **Notification System**: In-app notifications for low stock alerts, anomalies, and system events
3. **Queue Management**: Job tracking with history and health monitoring
4. **Ops Dashboard**: Real-time status of all scheduled tasks and queue health

---

## Features

### 1. Scheduled Tasks

| Task | Command | Schedule | Description |
|------|---------|----------|-------------|
| Reorder Suggestions | `inventory:recompute-reorder` | Daily at 02:00 | Computes product reorder suggestions based on demand forecast |
| Analytics Aggregates | `analytics:compute-daily` | Daily at 02:30 | Computes daily sales and inventory snapshots |
| Anomaly Detection | `anomalies:detect` | Daily at 03:00 | Detects anomalies in transactions and inventory |
| Low Stock Check | `notifications:check-low-stock` | Every 6 hours | Checks for low stock products and sends notifications |
| Prune Job Runs | (closure) | Weekly on Sunday at 04:00 | Cleans up old job run records (>30 days) |
| Auto-read Old Notifications | (closure) | Weekly on Sunday at 04:30 | Marks old notifications as read (>90 days) |

### 2. Notification Types

| Type | Severity | Description |
|------|----------|-------------|
| `low_stock` | Warning | Product stock is below reorder level |
| `stock_critical` | Error | Product is out of stock or critically low |
| `anomaly_detected` | Warning | New anomalies detected during analysis |
| `job_failed` | Error | A scheduled job failed to complete |
| `system_alert` | Info/Success | System-level notifications |
| `reorder_suggestion` | Info | New reorder suggestions available |

### 3. Job Run Tracking

All scheduled jobs are tracked with:
- Start/end timestamps
- Duration in seconds
- Items processed count
- Status (pending, running, completed, failed)
- Error messages (for failed jobs)
- Metadata (job-specific stats)

---

## Development Commands (Laragon)

### Required Terminals

When developing locally with Laragon, you need **3 terminals** running simultaneously:

#### Terminal 1: Laravel Server
```powershell
cd C:\laragon\www\quincaillerie-app
php artisan serve
```

#### Terminal 2: Vite Dev Server
```powershell
cd C:\laragon\www\quincaillerie-app
npm run dev
```

#### Terminal 3: Queue Worker
```powershell
cd C:\laragon\www\quincaillerie-app
php artisan queue:work --tries=3
```

This processes queued jobs (all scheduled tasks dispatch jobs to the queue).

#### Terminal 4 (Optional): Scheduler
```powershell
cd C:\laragon\www\quincaillerie-app
php artisan schedule:work
```

This runs the scheduler every minute, executing tasks at their scheduled times.
**Note**: In development, you may prefer to manually trigger jobs from the Ops Status page instead.

---

## Manual Job Execution

### From UI
Navigate to `/ops/status` and click the "Play" button next to any job to trigger it immediately.

### From CLI

```powershell
# Reorder suggestions
php artisan inventory:recompute-reorder

# Daily analytics
php artisan analytics:compute-daily

# Anomaly detection
php artisan anomalies:detect

# Low stock check
php artisan notifications:check-low-stock
```

### With specific date
```powershell
# Compute analytics for a specific date
php artisan analytics:compute-daily --date=2026-01-01

# Run anomaly detection for a specific date
php artisan anomalies:detect --date=2026-01-01
```

---

## Production Setup

### Cron Entry

Add this to your server's crontab:

```bash
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

### Supervisor Configuration

For the queue worker, use Supervisor to keep it running:

```ini
[program:quincaillerie-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path-to-project/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/path-to-project/storage/logs/worker.log
stopwaitsecs=3600
```

---

## Database Tables

### `notifications`

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| user_id | bigint (nullable) | Target user (null = global) |
| type | varchar(50) | Notification type |
| severity | varchar(20) | info, warning, error, success |
| title | varchar | Notification title |
| message | text | Notification content |
| metadata | json | Additional data |
| action_url | varchar | Link to relevant page |
| action_label | varchar | Button text |
| read_at | timestamp | When marked as read |
| email_sent | boolean | Email notification sent |
| email_sent_at | timestamp | When email was sent |
| created_at | timestamp | Created timestamp |
| updated_at | timestamp | Updated timestamp |

### `job_runs`

| Column | Type | Description |
|--------|------|-------------|
| id | bigint | Primary key |
| job_name | varchar | Job identifier |
| job_group | varchar(50) | Job category |
| status | varchar(20) | pending, running, completed, failed |
| started_at | timestamp | Job start time |
| completed_at | timestamp | Job end time |
| duration_seconds | int | Execution duration |
| items_processed | int | Number of items processed |
| error_message | text | Error details if failed |
| metadata | json | Job-specific stats |
| created_at | timestamp | Record created |
| updated_at | timestamp | Record updated |

---

## API Endpoints

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List all notifications (paginated) |
| POST | `/notifications/{id}/read` | Mark as read |
| POST | `/notifications/{id}/unread` | Mark as unread |
| POST | `/notifications/mark-all-read` | Mark all as read |
| DELETE | `/notifications/{id}` | Delete notification |
| GET | `/notifications/api/unread-count` | Get unread count (for navbar) |
| GET | `/notifications/api/recent` | Get recent unread (for dropdown) |

### Ops Status

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ops/status` | Ops dashboard page |
| POST | `/ops/trigger/{jobName}` | Manually trigger a job |

---

## Email Notifications (Optional)

Email notifications can be enabled by setting these in `.env`:

```env
APP_NOTIFICATIONS_EMAIL_ENABLED=true
APP_NOTIFICATIONS_ADMIN_EMAIL=admin@example.com
```

Then add to `config/app.php`:

```php
'notifications' => [
    'email_enabled' => env('APP_NOTIFICATIONS_EMAIL_ENABLED', false),
    'admin_email' => env('APP_NOTIFICATIONS_ADMIN_EMAIL'),
],
```

---

## Seeding Demo Data

To populate sample notifications and job runs:

```powershell
php artisan db:seed --class=OpsNotificationSeeder
```

This creates:
- ~8 sample notifications (mix of read/unread, various types)
- ~40-50 job runs covering the past 7 days

---

## Architecture

```
app/
├── Console/Commands/
│   ├── CheckLowStockCommand.php
│   ├── ComputeDailyAnalyticsCommand.php
│   ├── DetectAnomaliesCommand.php
│   └── RecomputeReorderCommand.php
├── Http/Controllers/
│   ├── NotificationController.php
│   └── OpsStatusController.php
├── Jobs/
│   ├── CheckLowStockJob.php
│   ├── ComputeDailyAnalyticsJob.php
│   ├── ComputeReorderSuggestionsJob.php
│   └── DetectAnomaliesJob.php
├── Models/
│   ├── Notification.php
│   └── JobRun.php
├── Services/
│   └── NotificationService.php

database/
├── migrations/
│   ├── 2024_01_05_000001_create_notifications_table.php
│   └── 2024_01_05_000002_create_job_runs_table.php
├── seeders/
│   └── OpsNotificationSeeder.php

resources/js/Pages/
├── Notifications/
│   └── Index.jsx
├── Ops/
│   └── Status.jsx

routes/
└── console.php  # Schedule definitions
```

---

## Testing

### Test Scheduler
```powershell
php artisan schedule:list
```

Shows all scheduled tasks with their frequencies.

### Test Queue
```powershell
# Process one job then exit
php artisan queue:work --once

# Process all pending jobs then exit
php artisan queue:work --stop-when-empty
```

### Clear Failed Jobs
```powershell
# View failed jobs
php artisan queue:failed

# Retry all failed jobs
php artisan queue:retry all

# Clear all failed jobs
php artisan queue:flush
```

---

## Troubleshooting

### Jobs not executing
1. Ensure queue worker is running: `php artisan queue:work`
2. Check queue driver in `.env`: `QUEUE_CONNECTION=database`
3. Verify jobs table exists: `php artisan queue:table && php artisan migrate`

### Scheduler not working
1. Ensure `schedule:work` is running (development)
2. Verify cron is configured (production)
3. Check Laravel logs: `storage/logs/laravel.log`

### Notifications not appearing
1. Check `notifications` table has data
2. Verify user permissions in `NotificationController`
3. Run seeder: `php artisan db:seed --class=OpsNotificationSeeder`
