<?php

namespace App\Http\Controllers;

use App\Models\JobRun;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Inertia\Inertia;

class OpsStatusController extends Controller
{
    /**
     * Display the ops status dashboard.
     */
    public function index(Request $request)
    {
        // Get last run for each job type
        $jobTypes = JobRun::getJobNames();
        $lastRuns = [];

        foreach ($jobTypes as $jobName) {
            $lastRun = JobRun::getLastRun($jobName);
            $lastSuccess = JobRun::getLastSuccessfulRun($jobName);

            $lastRuns[$jobName] = [
                'job_name' => $jobName,
                'job_label' => $lastRun?->job_label ?? $this->getJobLabel($jobName),
                'group' => $lastRun?->job_group ?? $this->getJobGroup($jobName),
                'group_label' => $lastRun?->group_label ?? $this->getGroupLabel($this->getJobGroup($jobName)),
                'last_run' => $lastRun ? [
                    'id' => $lastRun->id,
                    'status' => $lastRun->status,
                    'status_label' => $lastRun->status_label,
                    'status_color' => $lastRun->status_color,
                    'started_at' => $lastRun->started_at?->format('Y-m-d H:i:s'),
                    'started_at_human' => $lastRun->started_at?->diffForHumans(),
                    'completed_at' => $lastRun->completed_at?->format('Y-m-d H:i:s'),
                    'duration' => $lastRun->duration_formatted,
                    'items_processed' => $lastRun->items_processed,
                    'error_message' => $lastRun->error_message,
                    'metadata' => $lastRun->metadata,
                ] : null,
                'last_success' => $lastSuccess ? [
                    'started_at' => $lastSuccess->started_at?->format('Y-m-d H:i:s'),
                    'started_at_human' => $lastSuccess->started_at?->diffForHumans(),
                ] : null,
            ];
        }

        // Queue health
        $queueHealth = $this->getQueueHealth();

        // Recent job runs (last 7 days)
        $recentRuns = JobRun::recent(7)
            ->orderByDesc('started_at')
            ->limit(50)
            ->get()
            ->map(fn ($run) => [
                'id' => $run->id,
                'job_name' => $run->job_name,
                'job_label' => $run->job_label,
                'group' => $run->job_group,
                'group_label' => $run->group_label,
                'status' => $run->status,
                'status_label' => $run->status_label,
                'status_color' => $run->status_color,
                'started_at' => $run->started_at?->format('Y-m-d H:i:s'),
                'started_at_human' => $run->started_at?->diffForHumans(),
                'duration' => $run->duration_formatted,
                'items_processed' => $run->items_processed,
                'error_message' => $run->error_message,
            ]);

        // Stats summary
        $stats = [
            'total_runs_today' => JobRun::whereDate('started_at', today())->count(),
            'successful_runs_today' => JobRun::whereDate('started_at', today())->completed()->count(),
            'failed_runs_today' => JobRun::whereDate('started_at', today())->failed()->count(),
            'total_runs_week' => JobRun::recent(7)->count(),
            'failed_runs_week' => JobRun::recent(7)->failed()->count(),
            'unread_notifications' => Notification::unread()->count(),
            'notifications_today' => Notification::whereDate('created_at', today())->count(),
        ];

        // Schedule info
        $scheduleInfo = $this->getScheduleInfo();

        return Inertia::render('Ops/Status', [
            'lastRuns' => $lastRuns,
            'queueHealth' => $queueHealth,
            'recentRuns' => $recentRuns,
            'stats' => $stats,
            'scheduleInfo' => $scheduleInfo,
        ]);
    }

    /**
     * Manually trigger a job.
     */
    public function triggerJob(Request $request, string $jobName)
    {
        $validJobs = [
            'reorder_suggestions' => 'inventory:recompute-reorder',
            'analytics_aggregates' => 'analytics:compute-daily',
            'anomaly_detection' => 'anomalies:detect',
            'low_stock_check' => 'notifications:check-low-stock',
        ];

        if (!isset($validJobs[$jobName])) {
            return back()->with('error', __('Tâche inconnue.'));
        }

        // Dispatch the command
        \Artisan::queue($validJobs[$jobName]);

        return back()->with('success', __('Tâche ":job" lancée.', ['job' => $this->getJobLabel($jobName)]));
    }

    /**
     * Get queue health information.
     */
    protected function getQueueHealth(): array
    {
        $driver = config('queue.default');
        $health = [
            'driver' => $driver,
            'driver_label' => ucfirst($driver),
            'pending_jobs' => 0,
            'failed_jobs' => 0,
            'status' => 'healthy',
            'status_label' => __('Sain'),
        ];

        try {
            // Get pending jobs count (database driver)
            if ($driver === 'database') {
                $health['pending_jobs'] = DB::table('jobs')->count();
                $health['failed_jobs'] = DB::table('failed_jobs')->count();
            }

            // Determine health status
            if ($health['failed_jobs'] > 10) {
                $health['status'] = 'critical';
                $health['status_label'] = __('Critique');
            } elseif ($health['failed_jobs'] > 0 || $health['pending_jobs'] > 100) {
                $health['status'] = 'warning';
                $health['status_label'] = __('Attention');
            }
        } catch (\Exception $e) {
            $health['status'] = 'unknown';
            $health['status_label'] = __('Inconnu');
            $health['error'] = $e->getMessage();
        }

        return $health;
    }

    /**
     * Get schedule information for display.
     */
    protected function getScheduleInfo(): array
    {
        return [
            [
                'name' => 'inventory:recompute-reorder',
                'label' => __('Suggestions de réapprovisionnement'),
                'schedule' => __('Tous les jours à 02:00'),
                'frequency' => 'daily',
            ],
            [
                'name' => 'analytics:compute-daily',
                'label' => __('Agrégats analytiques'),
                'schedule' => __('Tous les jours à 02:30'),
                'frequency' => 'daily',
            ],
            [
                'name' => 'anomalies:detect',
                'label' => __('Détection d\'anomalies'),
                'schedule' => __('Tous les jours à 03:00'),
                'frequency' => 'daily',
            ],
            [
                'name' => 'notifications:check-low-stock',
                'label' => __('Vérification stock bas'),
                'schedule' => __('Toutes les 6 heures'),
                'frequency' => 'every_6_hours',
            ],
        ];
    }

    protected function getJobLabel(string $jobName): string
    {
        return match ($jobName) {
            JobRun::JOB_REORDER_SUGGESTIONS => __('Suggestions de réapprovisionnement'),
            JobRun::JOB_ANALYTICS_AGGREGATES => __('Agrégats analytiques'),
            JobRun::JOB_ANOMALY_DETECTION => __('Détection d\'anomalies'),
            JobRun::JOB_LOW_STOCK_CHECK => __('Vérification stock bas'),
            JobRun::JOB_DAILY_SNAPSHOT => __('Snapshot journalier'),
            default => $jobName,
        };
    }

    protected function getJobGroup(string $jobName): string
    {
        return match ($jobName) {
            JobRun::JOB_REORDER_SUGGESTIONS => JobRun::GROUP_REORDER,
            JobRun::JOB_ANALYTICS_AGGREGATES, JobRun::JOB_DAILY_SNAPSHOT => JobRun::GROUP_ANALYTICS,
            JobRun::JOB_ANOMALY_DETECTION => JobRun::GROUP_ANOMALY,
            JobRun::JOB_LOW_STOCK_CHECK => JobRun::GROUP_NOTIFICATION,
            default => 'default',
        };
    }

    protected function getGroupLabel(string $group): string
    {
        return match ($group) {
            JobRun::GROUP_REORDER => __('Réapprovisionnement'),
            JobRun::GROUP_ANALYTICS => __('Analytique'),
            JobRun::GROUP_ANOMALY => __('Anomalies'),
            JobRun::GROUP_NOTIFICATION => __('Notifications'),
            default => $group,
        };
    }
}
