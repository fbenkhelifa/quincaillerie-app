<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Create an in-app notification.
     */
    public function create(array $data): Notification
    {
        return Notification::create([
            'user_id' => $data['user_id'] ?? null,
            'type' => $data['type'],
            'severity' => $data['severity'] ?? Notification::SEVERITY_INFO,
            'title' => $data['title'],
            'message' => $data['message'],
            'metadata' => $data['metadata'] ?? null,
            'action_url' => $data['action_url'] ?? null,
            'action_label' => $data['action_label'] ?? null,
        ]);
    }

    /**
     * Create a low stock notification.
     */
    public function notifyLowStock(Product $product, string $severity = 'warning'): Notification
    {
        $stockPercentage = $product->min_stock > 0 
            ? round(($product->quantity / $product->min_stock) * 100)
            : 0;

        return $this->create([
            'type' => Notification::TYPE_LOW_STOCK,
            'severity' => $severity,
            'title' => __('Stock bas: :name', ['name' => $product->name]),
            'message' => __('Le produit ":name" a un stock de :qty unités (seuil: :threshold). Pensez à réapprovisionner.', [
                'name' => $product->name,
                'qty' => $product->quantity,
                'threshold' => $product->min_stock,
            ]),
            'metadata' => [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'current_stock' => $product->quantity,
                'min_stock' => $product->min_stock,
                'stock_percentage' => $stockPercentage,
            ],
            'action_url' => "/products/{$product->id}/edit",
            'action_label' => __('Voir produit'),
        ]);
    }

    /**
     * Create a critical stock notification.
     */
    public function notifyCriticalStock(Product $product): Notification
    {
        return $this->create([
            'type' => Notification::TYPE_STOCK_CRITICAL,
            'severity' => Notification::SEVERITY_ERROR,
            'title' => __('Stock critique: :name', ['name' => $product->name]),
            'message' => __('URGENT: Le produit ":name" est en rupture de stock (:qty unités restantes).', [
                'name' => $product->name,
                'qty' => $product->quantity,
            ]),
            'metadata' => [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'current_stock' => $product->quantity,
                'min_stock' => $product->min_stock,
            ],
            'action_url' => "/replenishment",
            'action_label' => __('Voir réapprovisionnement'),
        ]);
    }

    /**
     * Create an anomaly detection notification.
     */
    public function notifyAnomalyDetected(array $anomalyData): Notification
    {
        return $this->create([
            'type' => Notification::TYPE_ANOMALY_DETECTED,
            'severity' => $anomalyData['severity'] ?? Notification::SEVERITY_WARNING,
            'title' => $anomalyData['title'],
            'message' => $anomalyData['explanation'] ?? $anomalyData['message'] ?? '',
            'metadata' => $anomalyData['metadata'] ?? null,
            'action_url' => '/findings',
            'action_label' => __('Voir anomalies'),
        ]);
    }

    /**
     * Create a job failure notification.
     */
    public function notifyJobFailed(string $jobName, string $errorMessage): Notification
    {
        return $this->create([
            'type' => Notification::TYPE_JOB_FAILED,
            'severity' => Notification::SEVERITY_ERROR,
            'title' => __('Échec de tâche: :job', ['job' => $jobName]),
            'message' => $errorMessage,
            'metadata' => [
                'job_name' => $jobName,
                'failed_at' => now()->toDateTimeString(),
            ],
            'action_url' => '/ops/status',
            'action_label' => __('Voir statut ops'),
        ]);
    }

    /**
     * Create a system alert notification.
     */
    public function notifySystemAlert(string $title, string $message, string $severity = 'info'): Notification
    {
        return $this->create([
            'type' => Notification::TYPE_SYSTEM_ALERT,
            'severity' => $severity,
            'title' => $title,
            'message' => $message,
            'action_url' => '/ops/status',
            'action_label' => __('Voir statut'),
        ]);
    }

    /**
     * Send email notification if configured.
     */
    public function sendEmailIfConfigured(Notification $notification, ?User $user = null): bool
    {
        // Check if email notifications are enabled
        $emailEnabled = config('app.notifications.email_enabled', false);
        
        if (!$emailEnabled) {
            return false;
        }

        // Get recipient email
        $email = $user?->email ?? config('app.notifications.admin_email');
        
        if (!$email) {
            return false;
        }

        try {
            Mail::raw($notification->message, function ($mail) use ($notification, $email) {
                $mail->to($email)
                    ->subject("[{$notification->severity_color}] {$notification->title}");
            });

            $notification->markEmailSent();
            
            return true;
        } catch (\Exception $e) {
            Log::error('Failed to send notification email', [
                'notification_id' => $notification->id,
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }

    /**
     * Mark multiple notifications as read.
     */
    public function markAllAsRead(?int $userId = null): int
    {
        $query = Notification::unread();
        
        if ($userId) {
            $query->forUser($userId);
        }
        
        return $query->update(['read_at' => now()]);
    }

    /**
     * Get notification statistics.
     */
    public function getStats(?int $userId = null): array
    {
        $baseQuery = Notification::query();
        
        if ($userId) {
            $baseQuery->forUser($userId);
        }

        $unreadQuery = clone $baseQuery;
        $todayQuery = clone $baseQuery;
        $byTypeQuery = clone $baseQuery;
        $bySeverityQuery = clone $baseQuery;

        return [
            'total' => $baseQuery->count(),
            'unread' => $unreadQuery->unread()->count(),
            'today' => $todayQuery->whereDate('created_at', today())->count(),
            'by_type' => $byTypeQuery->selectRaw('type, count(*) as count')
                ->groupBy('type')
                ->pluck('count', 'type')
                ->toArray(),
            'by_severity' => $bySeverityQuery->selectRaw('severity, count(*) as count')
                ->groupBy('severity')
                ->pluck('count', 'severity')
                ->toArray(),
        ];
    }
}
