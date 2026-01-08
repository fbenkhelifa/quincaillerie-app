<?php

namespace App\Policies;

use App\Models\Bill;
use App\Models\User;

class BillPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Bill $bill): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->canCreateBills();
    }

    public function cancel(User $user, Bill $bill): bool
    {
        return $user->isAdmin();
    }

    public function downloadPdf(User $user, Bill $bill): bool
    {
        return true;
    }
}
