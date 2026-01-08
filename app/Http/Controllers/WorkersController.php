<?php

namespace App\Http\Controllers;

use App\Models\Worker;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WorkersController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Worker::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($role = $request->get('role')) {
            $query->where('role', $role);
        }

        $isActive = $request->get('is_active');
        if (!is_null($isActive)) {
            $query->where('is_active', filter_var($isActive, FILTER_VALIDATE_BOOLEAN));
        }

        $workers = $query->orderBy('name')->paginate(25)->withQueryString();

        return Inertia::render('Workers/Index', [
            'workers' => $workers,
            'filters' => $request->only(['search', 'role', 'is_active']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Workers/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:manager,cashier,warehouse,other',
            'hire_date' => 'nullable|date',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        Worker::create($validated);

        return redirect()->route('workers.index')
            ->with('success', __('Employé créé avec succès.'));
    }

    public function edit(Worker $worker): Response
    {
        return Inertia::render('Workers/Edit', [
            'worker' => $worker,
        ]);
    }

    public function update(Request $request, Worker $worker)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'role' => 'required|in:manager,cashier,warehouse,other',
            'hire_date' => 'nullable|date',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $worker->update($validated);

        return redirect()->route('workers.index')
            ->with('success', __('Employé mis à jour avec succès.'));
    }

    public function destroy(Worker $worker)
    {
        $worker->delete();

        return redirect()->route('workers.index')
            ->with('success', __('Employé supprimé avec succès.'));
    }
}
