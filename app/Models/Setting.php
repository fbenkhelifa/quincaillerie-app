<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_name',
        'owner_name',
        'phone',
        'address',
        'logo',
        'default_locale',
        'default_theme',
        'currency',
        'tax_id',
    ];

    public static function instance(): self
    {
        return self::firstOrCreate([], [
            'store_name' => 'Quincaillerie',
            'default_locale' => 'fr',
            'default_theme' => 'light',
            'currency' => 'DZD',
        ]);
    }
}
