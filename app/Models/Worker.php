<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Worker extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'role',
        'hire_date',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'hire_date' => 'date',
    ];

    public function bills()
    {
        return $this->hasMany(Bill::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getRoleLabel(): string
    {
        return match($this->role) {
            'manager' => 'Gérant',
            'cashier' => 'Caissier',
            'warehouse' => 'Magasinier',
            default => 'Autre',
        };
    }
}
