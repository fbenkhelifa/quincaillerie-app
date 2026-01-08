<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $settings = Setting::instance();
        $user = $request->user();
        
        $locale = $user?->preferred_locale ?? session('locale', $settings->default_locale ?? 'fr');
        $theme = $user?->preferred_theme ?? session('theme', $settings->default_theme ?? 'light');

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'preferred_locale' => $user->preferred_locale,
                    'preferred_theme' => $user->preferred_theme,
                ] : null,
            ],
            'settings' => [
                'store_name' => $settings->store_name,
                'owner_name' => $settings->owner_name,
                'phone' => $settings->phone,
                'address' => $settings->address,
                'logo' => $settings->logo,
                'currency' => $settings->currency ?? 'DZD',
            ],
            'locale' => $locale,
            'theme' => $theme,
            'translations' => $this->getTranslations($locale),
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
            ],
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }

    protected function getTranslations(string $locale): array
    {
        $path = lang_path("{$locale}.json");
        
        if (file_exists($path)) {
            return json_decode(file_get_contents($path), true) ?? [];
        }

        return [];
    }
}
