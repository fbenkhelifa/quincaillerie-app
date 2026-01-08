<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'preferred_locale',
        'preferred_theme',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function bills()
    {
        return $this->hasMany(Bill::class);
    }

    public function inventoryMovements()
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isCashier(): bool
    {
        return $this->role === 'cashier';
    }

    public function isViewer(): bool
    {
        return $this->role === 'viewer';
    }

    public function canManageProducts(): bool
    {
        return in_array($this->role, ['admin', 'cashier']);
    }

    public function canCreateBills(): bool
    {
        return in_array($this->role, ['admin', 'cashier']);
    }

    public function canManageSettings(): bool
    {
        return $this->role === 'admin';
    }
}
