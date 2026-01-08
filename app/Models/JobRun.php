<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobRun extends Model
{
    use HasFactory;

    // Job names
    public const JOB_REORDER_SUGGESTIONS = 'reorder_suggestions';
    public const JOB_ANALYTICS_AGGREGATES = 'analytics_aggregates';
    public const JOB_ANOMALY_DETECTION = 'anomaly_detection';
    public const JOB_LOW_STOCK_CHECK = 'low_stock_check';
    public const JOB_DAILY_SNAPSHOT = 'daily_snapshot';

    // Job groups
    public const GROUP_REORDER = 'reorder';
    public const GROUP_ANALYTICS = 'analytics';
    public const GROUP_ANOMALY = 'anomaly';
    public const GROUP_NOTIFICATION = 'notification';

    // Status
    public const STATUS_PENDING = 'pending';
    public const STATUS_RUNNING = 'running';
    public const STATUS_COMPLETED = 'completed';
    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'job_name',
        'job_group',
        'status',
        'started_at',
        'completed_at',
        'duration_seconds',
        'items_processed',
        'error_message',
        'metadata',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'metadata' => 'array',
    ];

    // Scopes
    public function scopeOfJob($query, string $jobName)
    {
        return $query->where('job_name', $jobName);
    }

    public function scopeOfGroup($query, string $group)
    {
        return $query->where('job_group', $group);
    }

    public function scopeWithStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', self::STATUS_COMPLETED);
    }

    public function scopeFailed($query)
    {
        return $query->where('status', self::STATUS_FAILED);
    }

    public function scopeRecent($query, int $days = 7)
    {
        return $query->where('started_at', '>=', now()->subDays($days));
    }

    // Accessors
    public function getIsRunningAttribute(): bool
    {
        return $this->status === self::STATUS_RUNNING;
    }

    public function getIsCompletedAttribute(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function getIsFailedAttribute(): bool
    {
        return $this->status === self::STATUS_FAILED;
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING => __('En attente'),
            self::STATUS_RUNNING => __('En cours'),
            self::STATUS_COMPLETED => __('Terminé'),
            self::STATUS_FAILED => __('Échoué'),
            default => $this->status,
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'default',
            self::STATUS_RUNNING => 'info',
            self::STATUS_COMPLETED => 'success',
            self::STATUS_FAILED => 'error',
            default => 'default',
        };
    }

    public function getJobLabelAttribute(): string
    {
        return match ($this->job_name) {
            self::JOB_REORDER_SUGGESTIONS => __('Suggestions de réapprovisionnement'),
            self::JOB_ANALYTICS_AGGREGATES => __('Agrégats analytiques'),
            self::JOB_ANOMALY_DETECTION => __('Détection d\'anomalies'),
            self::JOB_LOW_STOCK_CHECK => __('Vérification stock bas'),
            self::JOB_DAILY_SNAPSHOT => __('Snapshot journalier'),
            default => $this->job_name,
        };
    }

    public function getGroupLabelAttribute(): string
    {
        return match ($this->job_group) {
            self::GROUP_REORDER => __('Réapprovisionnement'),
            self::GROUP_ANALYTICS => __('Analytique'),
            self::GROUP_ANOMALY => __('Anomalies'),
            self::GROUP_NOTIFICATION => __('Notifications'),
            default => $this->job_group,
        };
    }

    public function getDurationFormattedAttribute(): string
    {
        if (!$this->duration_seconds) {
            return '-';
        }

        if ($this->duration_seconds < 60) {
            return $this->duration_seconds . 's';
        }

        $minutes = floor($this->duration_seconds / 60);
        $seconds = $this->duration_seconds % 60;
        
        return "{$minutes}m {$seconds}s";
    }

    // Static helpers
    public static function startRun(string $jobName, string $group = 'default'): self
    {
        return self::create([
            'job_name' => $jobName,
            'job_group' => $group,
            'status' => self::STATUS_RUNNING,
            'started_at' => now(),
        ]);
    }

    public function complete(int $itemsProcessed = 0, array $metadata = []): self
    {
        $this->update([
            'status' => self::STATUS_COMPLETED,
            'completed_at' => now(),
            'duration_seconds' => $this->started_at ? now()->diffInSeconds($this->started_at) : null,
            'items_processed' => $itemsProcessed,
            'metadata' => array_merge($this->metadata ?? [], $metadata),
        ]);
        
        return $this;
    }

    public function fail(string $errorMessage, array $metadata = []): self
    {
        $this->update([
            'status' => self::STATUS_FAILED,
            'completed_at' => now(),
            'duration_seconds' => $this->started_at ? now()->diffInSeconds($this->started_at) : null,
            'error_message' => $errorMessage,
            'metadata' => array_merge($this->metadata ?? [], $metadata),
        ]);
        
        return $this;
    }

    public static function getLastRun(string $jobName): ?self
    {
        return self::ofJob($jobName)
            ->orderByDesc('started_at')
            ->first();
    }

    public static function getLastSuccessfulRun(string $jobName): ?self
    {
        return self::ofJob($jobName)
            ->completed()
            ->orderByDesc('started_at')
            ->first();
    }

    public static function getJobNames(): array
    {
        return [
            self::JOB_REORDER_SUGGESTIONS,
            self::JOB_ANALYTICS_AGGREGATES,
            self::JOB_ANOMALY_DETECTION,
            self::JOB_LOW_STOCK_CHECK,
            self::JOB_DAILY_SNAPSHOT,
        ];
    }

    public static function getGroups(): array
    {
        return [
            self::GROUP_REORDER,
            self::GROUP_ANALYTICS,
            self::GROUP_ANOMALY,
            self::GROUP_NOTIFICATION,
        ];
    }

    public static function getStatuses(): array
    {
        return [
            self::STATUS_PENDING,
            self::STATUS_RUNNING,
            self::STATUS_COMPLETED,
            self::STATUS_FAILED,
        ];
    }
}
