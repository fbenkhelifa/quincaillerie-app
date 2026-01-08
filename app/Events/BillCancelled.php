<?php

namespace App\Events;

use App\Models\Bill;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BillCancelled
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Bill $bill,
        public ?string $reason = null
    ) {}
}
