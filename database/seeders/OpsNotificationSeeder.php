<?php

namespace Database\Seeders;

use App\Models\JobRun;
use App\Models\Notification;
use App\Models\Product;
use Illuminate\Database\Seeder;

class OpsNotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->seedNotifications();
        $this->seedJobRuns();
    }

    protected function seedNotifications(): void
    {
        // Clear existing demo notifications
        Notification::truncate();

        // Get some products for realistic notifications
        $products = Product::take(10)->get();

        // Low stock notifications
        if ($products->count() > 0) {
            Notification::create([
                'type' => Notification::TYPE_LOW_STOCK,
                'severity' => Notification::SEVERITY_WARNING,
                'title' => 'Stock bas: ' . ($products->get(0)?->name ?? 'Tournevis cruciforme'),
                'message' => 'Le produit "' . ($products->get(0)?->name ?? 'Tournevis cruciforme') . '" a un stock de 5 unités (seuil: 10). Pensez à réapprovisionner.',
                'metadata' => [
                    'product_id' => $products->get(0)?->id ?? 1,
                    'product_name' => $products->get(0)?->name ?? 'Tournevis cruciforme',
                    'current_stock' => 5,
                    'reorder_level' => 10,
                    'stock_percentage' => 50,
                ],
                'action_url' => '/replenishment',
                'action_label' => 'Voir réapprovisionnement',
                'created_at' => now()->subHours(2),
            ]);
        }

        if ($products->count() > 1) {
            Notification::create([
                'type' => Notification::TYPE_STOCK_CRITICAL,
                'severity' => Notification::SEVERITY_ERROR,
                'title' => 'Stock critique: ' . ($products->get(1)?->name ?? 'Clé à molette'),
                'message' => 'URGENT: Le produit "' . ($products->get(1)?->name ?? 'Clé à molette') . '" est en rupture de stock (0 unités restantes).',
                'metadata' => [
                    'product_id' => $products->get(1)?->id ?? 2,
                    'product_name' => $products->get(1)?->name ?? 'Clé à molette',
                    'current_stock' => 0,
                    'reorder_level' => 15,
                ],
                'action_url' => '/replenishment',
                'action_label' => 'Commander maintenant',
                'created_at' => now()->subHours(1),
            ]);
        }

        // Anomaly detection notification
        Notification::create([
            'type' => Notification::TYPE_ANOMALY_DETECTED,
            'severity' => Notification::SEVERITY_WARNING,
            'title' => 'Anomalie détectée: Remise excessive',
            'message' => '3 nouvelles anomalies ont été détectées lors de l\'analyse nocturne. Une remise de 45% a été appliquée sur la facture #2024-0156.',
            'metadata' => [
                'anomaly_count' => 3,
                'anomaly_types' => ['high_discount', 'large_adjustment'],
            ],
            'action_url' => '/findings',
            'action_label' => 'Voir anomalies',
            'created_at' => now()->subHours(6),
        ]);

        // System alert - successful backup
        Notification::create([
            'type' => Notification::TYPE_SYSTEM_ALERT,
            'severity' => Notification::SEVERITY_SUCCESS,
            'title' => 'Tâches nocturnes terminées',
            'message' => 'Toutes les tâches planifiées de la nuit ont été exécutées avec succès : agrégats analytiques, détection d\'anomalies, suggestions de réapprovisionnement.',
            'metadata' => [
                'completed_jobs' => [
                    'analytics_aggregates',
                    'anomaly_detection',
                    'reorder_suggestions',
                ],
            ],
            'action_url' => '/ops/status',
            'action_label' => 'Voir statut',
            'read_at' => now()->subHours(4),
            'created_at' => now()->subHours(8),
        ]);

        // Reorder suggestion notification
        Notification::create([
            'type' => Notification::TYPE_REORDER_SUGGESTION,
            'severity' => Notification::SEVERITY_INFO,
            'title' => '12 suggestions de réapprovisionnement',
            'message' => 'L\'analyse des stocks a généré 12 nouvelles suggestions de réapprovisionnement. 3 produits nécessitent une commande urgente.',
            'metadata' => [
                'total_suggestions' => 12,
                'urgent_count' => 3,
                'high_count' => 5,
            ],
            'action_url' => '/replenishment',
            'action_label' => 'Voir suggestions',
            'created_at' => now()->subHours(7),
        ]);

        // More read notifications from the past
        Notification::create([
            'type' => Notification::TYPE_LOW_STOCK,
            'severity' => Notification::SEVERITY_WARNING,
            'title' => 'Stock bas: Vis à bois 4x40',
            'message' => 'Le produit "Vis à bois 4x40" a un stock de 100 unités (seuil: 200).',
            'metadata' => [
                'product_name' => 'Vis à bois 4x40',
                'current_stock' => 100,
                'reorder_level' => 200,
            ],
            'action_url' => '/replenishment',
            'read_at' => now()->subDays(1),
            'created_at' => now()->subDays(2),
        ]);

        Notification::create([
            'type' => Notification::TYPE_JOB_FAILED,
            'severity' => Notification::SEVERITY_ERROR,
            'title' => 'Échec de tâche: analytics_aggregates',
            'message' => 'La tâche de calcul des agrégats analytiques a échoué après 3 tentatives. Erreur: Connection timeout.',
            'metadata' => [
                'job_name' => 'analytics_aggregates',
                'failed_at' => now()->subDays(3)->toDateTimeString(),
            ],
            'action_url' => '/ops/status',
            'action_label' => 'Voir détails',
            'read_at' => now()->subDays(2),
            'created_at' => now()->subDays(3),
        ]);

        // Additional unread notifications for variety
        Notification::create([
            'type' => Notification::TYPE_ANOMALY_DETECTED,
            'severity' => Notification::SEVERITY_WARNING,
            'title' => 'Stock mort détecté',
            'message' => '5 produits n\'ont enregistré aucune vente depuis plus de 60 jours. Valeur totale: 125,000 DA.',
            'metadata' => [
                'dead_stock_count' => 5,
                'total_value' => 125000,
            ],
            'action_url' => '/analytics/inventory',
            'action_label' => 'Voir inventaire',
            'created_at' => now()->subHours(12),
        ]);

        $this->command->info('Created ' . Notification::count() . ' sample notifications');
    }

    protected function seedJobRuns(): void
    {
        // Clear existing job runs
        JobRun::truncate();

        // Create realistic job run history for the past 7 days
        $jobs = [
            [
                'job_name' => JobRun::JOB_REORDER_SUGGESTIONS,
                'job_group' => JobRun::GROUP_REORDER,
                'schedule' => '02:00',
                'typical_duration' => [30, 120], // 30-120 seconds
                'typical_items' => [50, 200],
            ],
            [
                'job_name' => JobRun::JOB_ANALYTICS_AGGREGATES,
                'job_group' => JobRun::GROUP_ANALYTICS,
                'schedule' => '02:30',
                'typical_duration' => [10, 45],
                'typical_items' => [2, 2],
            ],
            [
                'job_name' => JobRun::JOB_ANOMALY_DETECTION,
                'job_group' => JobRun::GROUP_ANOMALY,
                'schedule' => '03:00',
                'typical_duration' => [15, 90],
                'typical_items' => [0, 10],
            ],
            [
                'job_name' => JobRun::JOB_LOW_STOCK_CHECK,
                'job_group' => JobRun::GROUP_NOTIFICATION,
                'schedule' => '06:00', // Every 6 hours
                'typical_duration' => [5, 20],
                'typical_items' => [0, 15],
            ],
        ];

        // Generate runs for the past 7 days
        for ($day = 6; $day >= 0; $day--) {
            $date = now()->subDays($day);

            foreach ($jobs as $jobConfig) {
                // Skip some days randomly (weekends, etc.)
                if ($day > 0 && rand(1, 10) > 9) {
                    continue;
                }

                // Parse schedule time
                $timeParts = explode(':', $jobConfig['schedule']);
                $startedAt = $date->copy()->setTime((int)$timeParts[0], (int)$timeParts[1], rand(0, 59));

                // Determine if job succeeded or failed (95% success rate)
                $succeeded = rand(1, 100) <= 95;

                $duration = rand($jobConfig['typical_duration'][0], $jobConfig['typical_duration'][1]);
                $completedAt = $startedAt->copy()->addSeconds($duration);

                JobRun::create([
                    'job_name' => $jobConfig['job_name'],
                    'job_group' => $jobConfig['job_group'],
                    'status' => $succeeded ? JobRun::STATUS_COMPLETED : JobRun::STATUS_FAILED,
                    'started_at' => $startedAt,
                    'completed_at' => $completedAt,
                    'duration_seconds' => $duration,
                    'items_processed' => $succeeded
                        ? rand($jobConfig['typical_items'][0], $jobConfig['typical_items'][1])
                        : 0,
                    'error_message' => $succeeded ? null : $this->getRandomError(),
                    'metadata' => $succeeded ? [
                        'date' => $date->format('Y-m-d'),
                    ] : null,
                    'created_at' => $startedAt,
                    'updated_at' => $completedAt,
                ]);

                // For low stock check, add multiple runs per day (every 6 hours)
                if ($jobConfig['job_name'] === JobRun::JOB_LOW_STOCK_CHECK && $day < 3) {
                    foreach ([12, 18, 0] as $hour) {
                        $additionalStart = $date->copy()->setTime($hour, rand(0, 5), rand(0, 59));
                        $additionalDuration = rand($jobConfig['typical_duration'][0], $jobConfig['typical_duration'][1]);

                        JobRun::create([
                            'job_name' => $jobConfig['job_name'],
                            'job_group' => $jobConfig['job_group'],
                            'status' => JobRun::STATUS_COMPLETED,
                            'started_at' => $additionalStart,
                            'completed_at' => $additionalStart->copy()->addSeconds($additionalDuration),
                            'duration_seconds' => $additionalDuration,
                            'items_processed' => rand(0, 8),
                            'created_at' => $additionalStart,
                            'updated_at' => $additionalStart,
                        ]);
                    }
                }
            }
        }

        // Add one currently running job for realism
        JobRun::create([
            'job_name' => JobRun::JOB_LOW_STOCK_CHECK,
            'job_group' => JobRun::GROUP_NOTIFICATION,
            'status' => JobRun::STATUS_RUNNING,
            'started_at' => now()->subSeconds(rand(5, 15)),
            'created_at' => now(),
        ]);

        $this->command->info('Created ' . JobRun::count() . ' sample job runs');
    }

    protected function getRandomError(): string
    {
        $errors = [
            'Connection timeout after 30 seconds',
            'SQLSTATE[HY000] [2002] Connection refused',
            'Memory limit exceeded',
            'Maximum execution time of 300 seconds exceeded',
            'Unable to acquire lock for job processing',
        ];

        return $errors[array_rand($errors)];
    }
}
