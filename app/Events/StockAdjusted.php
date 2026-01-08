<?php

namespace App\Events;

use App\Models\InventoryMovement;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockAdjusted
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public InventoryMovement $movement,
        public ?string $reason = null
    ) {}
}
