<?php

namespace App\Jobs;

use App\Models\AnomalyFinding;
use App\Models\Bill;
use App\Models\BillItem;
use App\Models\InventoryMovement;
use App\Models\JobRun;
use App\Models\Product;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DetectAnomaliesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Carbon $analysisDate;
    protected array $thresholds;
    protected ?JobRun $jobRun = null;
    protected int $anomaliesDetected = 0;

    public function __construct(?Carbon $analysisDate = null, array $thresholds = [])
    {
        $this->analysisDate = $analysisDate ?? now();
        $this->thresholds = array_merge([
            'cancellation_count' => 3, // More than 3 cancellations per day per user
            'cancellation_value' => 5000, // Cancellation value exceeds 5000 DA
            'adjustment_threshold' => 50, // Stock adjustment > 50 units
            'adjustment_value' => 10000, // Stock adjustment value > 10000 DA
            'discount_percentage' => 30, // Discount > 30%
            'dead_stock_days' => 60, // No sales in 60 days
        ], $thresholds);
    }

    public function handle(): void
    {
        $this->jobRun = JobRun::startRun(JobRun::JOB_ANOMALY_DETECTION, JobRun::GROUP_ANOMALY);

        Log::info('Starting anomaly detection job', ['date' => $this->analysisDate->format('Y-m-d')]);

        try {
            $this->detectRepeatedCancellations();
            $this->detectNegativeStock();
            $this->detectLargeAdjustments();
            $this->detectHighDiscounts();
            $this->detectDeadStock();
            $this->detectUnusualVoids();

            $this->jobRun->complete($this->anomaliesDetected, [
                'date' => $this->analysisDate->format('Y-m-d'),
                'anomalies_detected' => $this->anomaliesDetected,
            ]);

            Log::info('Anomaly detection job completed', ['anomalies_detected' => $this->anomaliesDetected]);
        } catch (\Exception $e) {
            $this->jobRun?->fail($e->getMessage());
            Log::error('Anomaly detection job failed', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        $this->jobRun?->fail($exception->getMessage());

        Log::error('DetectAnomaliesJob: Job failed after retries', [
            'error' => $exception->getMessage(),
        ]);
    }

    /**
     * Detect users with repeated bill cancellations.
     */
    protected function detectRepeatedCancellations(): void
    {
        $startOfDay = $this->analysisDate->copy()->startOfDay();
        $endOfDay = $this->analysisDate->copy()->endOfDay();

        // Group cancellations by user
        $cancellations = Bill::where('status', 'cancelled')
            ->whereBetween('updated_at', [$startOfDay, $endOfDay])
            ->select('user_id', DB::raw('COUNT(*) as cancel_count'), DB::raw('SUM(total) as cancel_value'))
            ->groupBy('user_id')
            ->having('cancel_count', '>', $this->thresholds['cancellation_count'])
            ->get();

        foreach ($cancellations as $record) {
            $user = User::find($record->user_id);

            // Check if already reported today
            $existing = AnomalyFinding::where('type', AnomalyFinding::TYPE_REPEATED_CANCELLATION)
                ->where('entity_type', User::class)
                ->where('entity_id', $record->user_id)
                ->whereDate('detected_at', $this->analysisDate)
                ->exists();

            if (!$existing) {
                AnomalyFinding::create([
                    'type' => AnomalyFinding::TYPE_REPEATED_CANCELLATION,
                    'severity' => $record->cancel_count > 5 ? 'high' : 'medium',
                    'entity_type' => User::class,
                    'entity_id' => $record->user_id,
                    'title' => "Annulations répétées par {$user?->name}",
                    'explanation' => "L'utilisateur {$user?->name} a annulé {$record->cancel_count} factures pour un total de " . number_format($record->cancel_value, 2) . " DA le " . $this->analysisDate->format('d/m/Y') . ".",
                    'metadata' => [
                        'user_name' => $user?->name,
                        'cancel_count' => $record->cancel_count,
                        'cancel_value' => $record->cancel_value,
                        'date' => $this->analysisDate->format('Y-m-d'),
                    ],
                    'impact_value' => $record->cancel_value,
                    'detected_at' => now(),
                ]);
                $this->anomaliesDetected++;
            }
        }

        // Also detect single high-value cancellations
        $highValueCancels = Bill::where('status', 'cancelled')
            ->whereBetween('updated_at', [$startOfDay, $endOfDay])
            ->where('total', '>', $this->thresholds['cancellation_value'])
            ->with('user:id,name')
            ->get();

        foreach ($highValueCancels as $bill) {
            $existing = AnomalyFinding::where('type', AnomalyFinding::TYPE_UNUSUAL_VOID)
                ->where('entity_type', Bill::class)
                ->where('entity_id', $bill->id)
                ->exists();

            if (!$existing) {
                AnomalyFinding::create([
                    'type' => AnomalyFinding::TYPE_UNUSUAL_VOID,
                    'severity' => 'high',
                    'entity_type' => Bill::class,
                    'entity_id' => $bill->id,
                    'title' => "Annulation de facture à haute valeur #{$bill->number}",
                    'explanation' => "La facture #{$bill->number} d'un montant de " . number_format($bill->total, 2) . " DA a été annulée par {$bill->user?->name}.",
                    'metadata' => [
                        'bill_number' => $bill->number,
                        'user_name' => $bill->user?->name,
                        'total' => $bill->total,
                    ],
                    'impact_value' => $bill->total,
                    'detected_at' => now(),
                ]);
                $this->anomaliesDetected++;
            }
        }
    }

    /**
     * Detect products with negative stock.
     */
    protected function detectNegativeStock(): void
    {
        $negativeStock = Product::where('quantity', '<', 0)
            ->select('id', 'name', 'sku', 'quantity', 'purchase_price')
            ->get();

        foreach ($negativeStock as $product) {
            $existing = AnomalyFinding::where('type', AnomalyFinding::TYPE_NEGATIVE_STOCK)
                ->where('entity_type', Product::class)
                ->where('entity_id', $product->id)
                ->where('status', 'new')
                ->exists();

            if (!$existing) {
                AnomalyFinding::create([
                    'type' => AnomalyFinding::TYPE_NEGATIVE_STOCK,
                    'severity' => 'critical',
                    'entity_type' => Product::class,
                    'entity_id' => $product->id,
                    'title' => "Stock négatif: {$product->name}",
                    'explanation' => "Le produit {$product->name} (SKU: {$product->sku}) a un stock négatif de {$product->quantity} unités. Cela indique une erreur de données ou une survente.",
                    'metadata' => [
                        'product_name' => $product->name,
                        'sku' => $product->sku,
                        'quantity' => $product->quantity,
                    ],
                    'impact_value' => abs($product->quantity * $product->purchase_price),
                    'detected_at' => now(),
                ]);
                $this->anomaliesDetected++;
            }
        }
    }

    /**
     * Detect unusually large manual stock adjustments.
     */
    protected function detectLargeAdjustments(): void
    {
        $startOfDay = $this->analysisDate->copy()->startOfDay();
        $endOfDay = $this->analysisDate->copy()->endOfDay();

        $largeAdjustments = InventoryMovement::where('type', 'adjustment')
            ->whereBetween('created_at', [$startOfDay, $endOfDay])
            ->whereRaw('ABS(quantity) > ?', [$this->thresholds['adjustment_threshold']])
            ->with(['product:id,name,sku,purchase_price', 'user:id,name'])
            ->get();

        foreach ($largeAdjustments as $movement) {
            $value = abs($movement->quantity * ($movement->product?->purchase_price ?? 0));

            // Skip if below value threshold
            if ($value < $this->thresholds['adjustment_value']) {
                continue;
            }

            $existing = AnomalyFinding::where('type', AnomalyFinding::TYPE_LARGE_ADJUSTMENT)
                ->where('entity_type', InventoryMovement::class)
                ->where('entity_id', $movement->id)
                ->exists();

            if (!$existing) {
                $direction = $movement->quantity > 0 ? 'ajouté' : 'retiré';

                AnomalyFinding::create([
                    'type' => AnomalyFinding::TYPE_LARGE_ADJUSTMENT,
                    'severity' => $value > 50000 ? 'high' : 'medium',
                    'entity_type' => InventoryMovement::class,
                    'entity_id' => $movement->id,
                    'title' => "Ajustement important: {$movement->product?->name}",
                    'explanation' => "{$movement->user?->name} a {$direction} " . abs($movement->quantity) . " unités de {$movement->product?->name} (valeur: " . number_format($value, 2) . " DA). Raison: {$movement->reason}",
                    'metadata' => [
                        'product_name' => $movement->product?->name,
                        'product_sku' => $movement->product?->sku,
                        'quantity' => $movement->quantity,
                        'user_name' => $movement->user?->name,
                        'reason' => $movement->reason,
                        'before' => $movement->quantity_before,
                        'after' => $movement->quantity_after,
                    ],
                    'impact_value' => $value,
                    'detected_at' => now(),
                ]);
                $this->anomaliesDetected++;
            }
        }
    }

    /**
     * Detect bills with unusually high discounts.
     */
    protected function detectHighDiscounts(): void
    {
        $startOfDay = $this->analysisDate->copy()->startOfDay();
        $endOfDay = $this->analysisDate->copy()->endOfDay();

        $highDiscountBills = Bill::whereBetween('created_at', [$startOfDay, $endOfDay])
            ->whereIn('status', ['completed', 'paid'])
            ->where('discount', '>', 0)
            ->whereRaw('(discount / (subtotal + discount)) * 100 > ?', [$this->thresholds['discount_percentage']])
            ->with('user:id,name')
            ->get();

        foreach ($highDiscountBills as $bill) {
            $discountPct = ($bill->subtotal + $bill->discount) > 0
                ? ($bill->discount / ($bill->subtotal + $bill->discount)) * 100
                : 0;

            $existing = AnomalyFinding::where('type', AnomalyFinding::TYPE_HIGH_DISCOUNT)
                ->where('entity_type', Bill::class)
                ->where('entity_id', $bill->id)
                ->exists();

            if (!$existing) {
                AnomalyFinding::create([
                    'type' => AnomalyFinding::TYPE_HIGH_DISCOUNT,
                    'severity' => $discountPct > 50 ? 'high' : 'medium',
                    'entity_type' => Bill::class,
                    'entity_id' => $bill->id,
                    'title' => "Remise excessive sur facture #{$bill->number}",
                    'explanation' => "La facture #{$bill->number} a une remise de " . number_format($discountPct, 1) . "% (" . number_format($bill->discount, 2) . " DA) appliquée par {$bill->user?->name}.",
                    'metadata' => [
                        'bill_number' => $bill->number,
                        'user_name' => $bill->user?->name,
                        'discount' => $bill->discount,
                        'discount_percentage' => round($discountPct, 1),
                        'subtotal' => $bill->subtotal,
                        'total' => $bill->total,
                    ],
                    'impact_value' => $bill->discount,
                    'detected_at' => now(),
                ]);
                $this->anomaliesDetected++;
            }
        }
    }

    /**
     * Detect dead stock items.
     */
    protected function detectDeadStock(): void
    {
        // Only run this weekly (on Sundays)
        if ($this->analysisDate->dayOfWeek !== Carbon::SUNDAY) {
            return;
        }

        $cutoffDate = now()->subDays($this->thresholds['dead_stock_days']);

        // Products with recent sales
        $productsSold = BillItem::whereHas('bill', function ($q) use ($cutoffDate) {
            $q->where('created_at', '>=', $cutoffDate)
                ->whereIn('status', ['completed', 'paid']);
        })
            ->distinct()
            ->pluck('product_id');

        // Products with stock but no recent sales
        $deadStock = Product::where('quantity', '>', 10) // Only significant stock
            ->whereNotIn('id', $productsSold)
            ->whereRaw('quantity * purchase_price > 5000') // Value > 5000 DA
            ->select('id', 'name', 'sku', 'quantity', 'purchase_price')
            ->get();

        foreach ($deadStock as $product) {
            $value = $product->quantity * $product->purchase_price;

            $existing = AnomalyFinding::where('type', AnomalyFinding::TYPE_DEAD_STOCK)
                ->where('entity_type', Product::class)
                ->where('entity_id', $product->id)
                ->where('status', 'new')
                ->where('detected_at', '>=', now()->subDays(7))
                ->exists();

            if (!$existing) {
                AnomalyFinding::create([
                    'type' => AnomalyFinding::TYPE_DEAD_STOCK,
                    'severity' => $value > 50000 ? 'high' : 'medium',
                    'entity_type' => Product::class,
                    'entity_id' => $product->id,
                    'title' => "Stock mort: {$product->name}",
                    'explanation' => "Le produit {$product->name} ({$product->quantity} unités, valeur: " . number_format($value, 2) . " DA) n'a eu aucune vente depuis {$this->thresholds['dead_stock_days']} jours.",
                    'metadata' => [
                        'product_name' => $product->name,
                        'sku' => $product->sku,
                        'quantity' => $product->quantity,
                        'days_threshold' => $this->thresholds['dead_stock_days'],
                    ],
                    'impact_value' => $value,
                    'detected_at' => now(),
                ]);
                $this->anomaliesDetected++;
            }
        }
    }

    /**
     * Detect unusual void patterns.
     */
    protected function detectUnusualVoids(): void
    {
        $startOfDay = $this->analysisDate->copy()->startOfDay();
        $endOfDay = $this->analysisDate->copy()->endOfDay();

        // Detect bills created and cancelled within minutes
        $quickVoids = Bill::where('status', 'cancelled')
            ->whereBetween('updated_at', [$startOfDay, $endOfDay])
            ->whereRaw('TIMESTAMPDIFF(MINUTE, created_at, updated_at) < 5')
            ->where('total', '>', 1000)
            ->with('user:id,name')
            ->get();

        foreach ($quickVoids as $bill) {
            $existing = AnomalyFinding::where('type', AnomalyFinding::TYPE_UNUSUAL_VOID)
                ->where('entity_type', Bill::class)
                ->where('entity_id', $bill->id)
                ->exists();

            if (!$existing) {
                AnomalyFinding::create([
                    'type' => AnomalyFinding::TYPE_UNUSUAL_VOID,
                    'severity' => 'medium',
                    'entity_type' => Bill::class,
                    'entity_id' => $bill->id,
                    'title' => "Annulation rapide: #{$bill->number}",
                    'explanation' => "La facture #{$bill->number} (" . number_format($bill->total, 2) . " DA) a été créée puis annulée en moins de 5 minutes par {$bill->user?->name}.",
                    'metadata' => [
                        'bill_number' => $bill->number,
                        'user_name' => $bill->user?->name,
                        'total' => $bill->total,
                        'created_at' => $bill->created_at->format('Y-m-d H:i:s'),
                        'cancelled_at' => $bill->updated_at->format('Y-m-d H:i:s'),
                    ],
                    'impact_value' => $bill->total,
                    'detected_at' => now(),
                ]);
                $this->anomaliesDetected++;
            }
        }
    }
}
