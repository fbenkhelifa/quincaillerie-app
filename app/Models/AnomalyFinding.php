<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AnomalyFinding extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'severity',
        'entity_type',
        'entity_id',
        'title',
        'explanation',
        'metadata',
        'impact_value',
        'status',
        'reviewed_by',
        'reviewed_at',
        'resolution_notes',
        'detected_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'impact_value' => 'decimal:2',
        'reviewed_at' => 'datetime',
        'detected_at' => 'datetime',
    ];

    protected $appends = ['severity_label', 'severity_color', 'type_label', 'type_icon'];

    // Anomaly types
    public const TYPE_REPEATED_CANCELLATION = 'repeated_cancellation';
    public const TYPE_NEGATIVE_STOCK = 'negative_stock';
    public const TYPE_LARGE_ADJUSTMENT = 'large_adjustment';
    public const TYPE_HIGH_DISCOUNT = 'high_discount';
    public const TYPE_UNUSUAL_VOID = 'unusual_void';
    public const TYPE_PRICE_OVERRIDE = 'price_override';
    public const TYPE_DEAD_STOCK = 'dead_stock';
    public const TYPE_STOCK_DISCREPANCY = 'stock_discrepancy';

    // Relationships
    public function entity(): MorphTo
    {
        return $this->morphTo();
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // Scopes
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    public function scopeUnresolved($query)
    {
        return $query->whereIn('status', ['new', 'investigating']);
    }

    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }

    public function scopeHighSeverity($query)
    {
        return $query->whereIn('severity', ['critical', 'high']);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('detected_at', '>=', now()->subDays($days));
    }

    // Accessors
    public function getSeverityLabelAttribute(): string
    {
        return match ($this->severity) {
            'critical' => __('Critique'),
            'high' => __('Haute'),
            'medium' => __('Moyenne'),
            'low' => __('Basse'),
            default => $this->severity,
        };
    }

    public function getSeverityColorAttribute(): string
    {
        return match ($this->severity) {
            'critical' => 'error',
            'high' => 'warning',
            'medium' => 'info',
            'low' => 'default',
            default => 'default',
        };
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            self::TYPE_REPEATED_CANCELLATION => __('Annulations répétées'),
            self::TYPE_NEGATIVE_STOCK => __('Stock négatif'),
            self::TYPE_LARGE_ADJUSTMENT => __('Ajustement important'),
            self::TYPE_HIGH_DISCOUNT => __('Remise excessive'),
            self::TYPE_UNUSUAL_VOID => __('Annulation suspecte'),
            self::TYPE_PRICE_OVERRIDE => __('Prix modifié'),
            self::TYPE_DEAD_STOCK => __('Stock mort'),
            self::TYPE_STOCK_DISCREPANCY => __('Écart de stock'),
            default => $this->type,
        };
    }

    public function getTypeIconAttribute(): string
    {
        return match ($this->type) {
            self::TYPE_REPEATED_CANCELLATION => 'cancel',
            self::TYPE_NEGATIVE_STOCK => 'remove_circle',
            self::TYPE_LARGE_ADJUSTMENT => 'swap_vert',
            self::TYPE_HIGH_DISCOUNT => 'percent',
            self::TYPE_UNUSUAL_VOID => 'warning',
            self::TYPE_PRICE_OVERRIDE => 'attach_money',
            self::TYPE_DEAD_STOCK => 'inventory',
            self::TYPE_STOCK_DISCREPANCY => 'compare_arrows',
            default => 'help',
        };
    }

    // Methods
    public function markAsInvestigating(User $user): void
    {
        $this->update([
            'status' => 'investigating',
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);
    }

    public function resolve(User $user, ?string $notes = null): void
    {
        $this->update([
            'status' => 'resolved',
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
            'resolution_notes' => $notes,
        ]);
    }

    public function dismiss(User $user, ?string $notes = null): void
    {
        $this->update([
            'status' => 'dismissed',
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
            'resolution_notes' => $notes,
        ]);
    }
}
