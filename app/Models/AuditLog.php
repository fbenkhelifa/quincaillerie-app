<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_name',
        'action',
        'event',
        'auditable_type',
        'auditable_id',
        'auditable_label',
        'old_values',
        'new_values',
        'metadata',
        'reason',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'metadata' => 'array',
    ];

    protected $appends = ['action_label', 'action_color', 'changes_summary'];

    // Action types
    public const ACTION_CREATED = 'created';
    public const ACTION_UPDATED = 'updated';
    public const ACTION_DELETED = 'deleted';
    public const ACTION_CANCELLED = 'cancelled';
    public const ACTION_ADJUSTED = 'adjusted';
    public const ACTION_RECEIVED = 'received';
    public const ACTION_SENT = 'sent';
    public const ACTION_LOGIN = 'login';
    public const ACTION_LOGOUT = 'logout';

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeForModel($query, string $modelClass)
    {
        return $query->where('auditable_type', $modelClass);
    }

    public function scopeForEntity($query, Model $entity)
    {
        return $query->where('auditable_type', get_class($entity))
            ->where('auditable_id', $entity->id);
    }

    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeOfAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    public function scopeRecent($query, int $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    public function scopeCriticalActions($query)
    {
        return $query->whereIn('action', [
            self::ACTION_CANCELLED,
            self::ACTION_ADJUSTED,
            self::ACTION_DELETED,
        ]);
    }

    // Accessors
    public function getActionLabelAttribute(): string
    {
        return match ($this->action) {
            self::ACTION_CREATED => __('Créé'),
            self::ACTION_UPDATED => __('Modifié'),
            self::ACTION_DELETED => __('Supprimé'),
            self::ACTION_CANCELLED => __('Annulé'),
            self::ACTION_ADJUSTED => __('Ajusté'),
            self::ACTION_RECEIVED => __('Reçu'),
            self::ACTION_SENT => __('Envoyé'),
            self::ACTION_LOGIN => __('Connexion'),
            self::ACTION_LOGOUT => __('Déconnexion'),
            default => $this->action,
        };
    }

    public function getActionColorAttribute(): string
    {
        return match ($this->action) {
            self::ACTION_CREATED => 'success',
            self::ACTION_UPDATED => 'info',
            self::ACTION_DELETED => 'error',
            self::ACTION_CANCELLED => 'error',
            self::ACTION_ADJUSTED => 'warning',
            self::ACTION_RECEIVED => 'success',
            self::ACTION_SENT => 'info',
            default => 'default',
        };
    }

    public function getChangesSummaryAttribute(): array
    {
        if (!$this->old_values && !$this->new_values) {
            return [];
        }

        $changes = [];
        $oldValues = $this->old_values ?? [];
        $newValues = $this->new_values ?? [];

        $allKeys = array_unique(array_merge(array_keys($oldValues), array_keys($newValues)));

        foreach ($allKeys as $key) {
            $old = $oldValues[$key] ?? null;
            $new = $newValues[$key] ?? null;

            if ($old !== $new) {
                $changes[] = [
                    'field' => $key,
                    'old' => $old,
                    'new' => $new,
                ];
            }
        }

        return $changes;
    }

    // Static methods
    public static function record(
        Model $entity,
        string $action,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?string $reason = null,
        ?array $metadata = null
    ): self {
        $user = auth()->user();
        $request = request();

        return self::create([
            'user_id' => $user?->id,
            'user_name' => $user?->name,
            'action' => $action,
            'auditable_type' => get_class($entity),
            'auditable_id' => $entity->id,
            'auditable_label' => self::generateLabel($entity),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'metadata' => $metadata,
            'reason' => $reason,
            'ip_address' => $request?->ip(),
            'user_agent' => $request?->userAgent(),
        ]);
    }

    protected static function generateLabel(Model $entity): string
    {
        // Try common label patterns
        if (method_exists($entity, 'getAuditLabel')) {
            return $entity->getAuditLabel();
        }

        if (isset($entity->number)) {
            return class_basename($entity) . ' #' . $entity->number;
        }

        if (isset($entity->name)) {
            return $entity->name;
        }

        if (isset($entity->title)) {
            return $entity->title;
        }

        return class_basename($entity) . ' #' . $entity->id;
    }
}
