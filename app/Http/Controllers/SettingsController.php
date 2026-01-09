<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        $settings = Setting::instance();

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'store_name_ar' => 'nullable|string|max:255',
            'owner_name' => 'nullable|string|max:255',
            'owner_name_ar' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'address_ar' => 'nullable|string',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
            'default_locale' => 'nullable|in:fr,ar',
            'default_theme' => 'nullable|in:light,dark',
            'currency' => 'nullable|string|max:10',
            'tax_id' => 'nullable|string|max:50',
            'rc_number' => 'nullable|string|max:50',
            'ai_number' => 'nullable|string|max:50',
            'nis_number' => 'nullable|string|max:50',
            'invoice_footer' => 'nullable|string|max:500',
            'invoice_footer_ar' => 'nullable|string|max:500',
        ]);

        $settings = Setting::instance();

        if ($request->hasFile('logo')) {
            // Delete old logo
            if ($settings->logo && Storage::disk('public')->exists($settings->logo)) {
                Storage::disk('public')->delete($settings->logo);
            }
            $validated['logo'] = $request->file('logo')->store('settings', 'public');
        }

        $settings->update($validated);

        return back()->with('success', __('Paramètres mis à jour avec succès.'));
    }

    public function updateLocale(Request $request)
    {
        $validated = $request->validate([
            'locale' => 'required|in:fr,ar',
        ]);

        $user = auth()->user();
        if ($user) {
            $user->update(['preferred_locale' => $validated['locale']]);
        }
        
        session(['locale' => $validated['locale']]);

        return back();
    }

    public function updateTheme(Request $request)
    {
        $validated = $request->validate([
            'theme' => 'required|in:light,dark',
        ]);

        $user = auth()->user();
        if ($user) {
            $user->update(['preferred_theme' => $validated['theme']]);
        }
        
        session(['theme' => $validated['theme']]);

        return back();
    }
}
