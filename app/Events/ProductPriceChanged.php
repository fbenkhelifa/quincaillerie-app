<?php

namespace App\Events;

use App\Models\Product;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductPriceChanged
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Product $product,
        public float $oldPrice,
        public float $newPrice,
        public ?string $reason = null
    ) {}

    public function getPercentageChange(): float
    {
        if ($this->oldPrice == 0) {
            return 100;
        }
        return round((($this->newPrice - $this->oldPrice) / $this->oldPrice) * 100, 2);
    }
}
