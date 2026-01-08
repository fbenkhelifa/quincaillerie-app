<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    // Notification types
    public const TYPE_LOW_STOCK = 'low_stock';
    public const TYPE_ANOMALY_DETECTED = 'anomaly_detected';
    public const TYPE_JOB_FAILED = 'job_failed';
    public const TYPE_SYSTEM_ALERT = 'system_alert';
    public const TYPE_REORDER_SUGGESTION = 'reorder_suggestion';
    public const TYPE_STOCK_CRITICAL = 'stock_critical';

    // Severity levels
    public const SEVERITY_INFO = 'info';
    public const SEVERITY_WARNING = 'warning';
    public const SEVERITY_ERROR = 'error';
    public const SEVERITY_SUCCESS = 'success';

    protected $fillable = [
        'user_id',
        'type',
        'severity',
        'title',
        'message',
        'metadata',
        'action_url',
        'action_label',
        'read_at',
        'email_sent',
        'email_sent_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'read_at' => 'datetime',
        'email_sent' => 'boolean',
        'email_sent_at' => 'datetime',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('user_id', $userId)->orWhereNull('user_id');
        });
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeOfSeverity($query, string $severity)
    {
        return $query->where('severity', $severity);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeGlobal($query)
    {
        return $query->whereNull('user_id');
    }

    // Accessors
    public function getIsReadAttribute(): bool
    {
        return $this->read_at !== null;
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            self::TYPE_LOW_STOCK => __('Stock bas'),
            self::TYPE_ANOMALY_DETECTED => __('Anomalie détectée'),
            self::TYPE_JOB_FAILED => __('Échec de tâche'),
            self::TYPE_SYSTEM_ALERT => __('Alerte système'),
            self::TYPE_REORDER_SUGGESTION => __('Suggestion de réapprovisionnement'),
            self::TYPE_STOCK_CRITICAL => __('Stock critique'),
            default => $this->type,
        };
    }

    public function getSeverityColorAttribute(): string
    {
        return match ($this->severity) {
            self::SEVERITY_ERROR => 'error',
            self::SEVERITY_WARNING => 'warning',
            self::SEVERITY_SUCCESS => 'success',
            self::SEVERITY_INFO => 'info',
            default => 'default',
        };
    }

    public function getTypeIconAttribute(): string
    {
        return match ($this->type) {
            self::TYPE_LOW_STOCK => 'inventory_2',
            self::TYPE_ANOMALY_DETECTED => 'warning_amber',
            self::TYPE_JOB_FAILED => 'error_outline',
            self::TYPE_SYSTEM_ALERT => 'notifications',
            self::TYPE_REORDER_SUGGESTION => 'shopping_cart',
            self::TYPE_STOCK_CRITICAL => 'priority_high',
            default => 'info',
        };
    }

    // Methods
    public function markAsRead(): self
    {
        $this->update(['read_at' => now()]);
        return $this;
    }

    public function markAsUnread(): self
    {
        $this->update(['read_at' => null]);
        return $this;
    }

    public function markEmailSent(): self
    {
        $this->update([
            'email_sent' => true,
            'email_sent_at' => now(),
        ]);
        return $this;
    }

    // Static helpers
    public static function getTypes(): array
    {
        return [
            self::TYPE_LOW_STOCK,
            self::TYPE_ANOMALY_DETECTED,
            self::TYPE_JOB_FAILED,
            self::TYPE_SYSTEM_ALERT,
            self::TYPE_REORDER_SUGGESTION,
            self::TYPE_STOCK_CRITICAL,
        ];
    }

    public static function getSeverities(): array
    {
        return [
            self::SEVERITY_INFO,
            self::SEVERITY_WARNING,
            self::SEVERITY_ERROR,
            self::SEVERITY_SUCCESS,
        ];
    }

    public static function getUnreadCountForUser(?int $userId = null): int
    {
        $query = self::unread();
        
        if ($userId) {
            $query->forUser($userId);
        } else {
            $query->global();
        }
        
        return $query->count();
    }
}
