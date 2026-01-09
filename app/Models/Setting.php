<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_name',
        'store_name_ar',
        'owner_name',
        'owner_name_ar',
        'phone',
        'email',
        'address',
        'address_ar',
        'logo',
        'default_locale',
        'default_theme',
        'currency',
        'tax_id',
        'rc_number',
        'ai_number',
        'nis_number',
        'invoice_footer',
        'invoice_footer_ar',
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
