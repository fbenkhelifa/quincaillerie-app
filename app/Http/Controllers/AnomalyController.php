<?php

namespace App\Http\Controllers;

use App\Models\AnomalyFinding;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnomalyController extends Controller
{
    /**
     * List all anomaly findings with filters
     */
    public function index(Request $request): Response
    {
        $query = AnomalyFinding::with(['reviewer'])
            ->latest();

        // Apply filters
        if ($request->filled('type')) {
            $query->ofType($request->input('type'));
        }

        if ($request->filled('severity')) {
            $severity = $request->input('severity');
            $query->where('severity', $severity);
        }

        if ($request->filled('status')) {
            $status = $request->input('status');
            if ($status === 'unresolved') {
                $query->unresolved();
            } else {
                $query->where('status', $status);
            }
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('explanation', 'like', "%{$search}%");
            });
        }

        $findings = $query->paginate($request->integer('per_page', 25));

        // Get stats for dashboard cards
        $stats = [
            'total' => AnomalyFinding::count(),
            'new' => AnomalyFinding::new()->count(),
            'critical' => AnomalyFinding::critical()->count(),
            'high' => AnomalyFinding::highSeverity()->count(),
            'investigating' => AnomalyFinding::where('status', 'investigating')->count(),
            'total_impact' => AnomalyFinding::unresolved()->sum('impact_value'),
        ];

        // Get type breakdown
        $byType = AnomalyFinding::unresolved()
            ->selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type');

        return Inertia::render('Findings/Index', [
            'findings' => $findings,
            'stats' => $stats,
            'byType' => $byType,
            'types' => AnomalyFinding::TYPES,
            'filters' => $request->only(['type', 'severity', 'status', 'search']),
        ]);
    }

    /**
     * Show a specific finding
     */
    public function show(AnomalyFinding $finding): Response
    {
        $finding->load(['reviewer', 'entity']);

        // Get related findings (same entity or type)
        $related = AnomalyFinding::where('id', '!=', $finding->id)
            ->where(function ($q) use ($finding) {
                $q->where(function ($q2) use ($finding) {
                    $q2->where('entity_type', $finding->entity_type)
                       ->where('entity_id', $finding->entity_id);
                })->orWhere('type', $finding->type);
            })
            ->recent()
            ->limit(5)
            ->get();

        return Inertia::render('Findings/Show', [
            'finding' => $finding,
            'related' => $related,
        ]);
    }

    /**
     * Update finding status
     */
    public function updateStatus(Request $request, AnomalyFinding $finding)
    {
        $request->validate([
            'status' => 'required|in:investigating,resolved,dismissed',
            'resolution_notes' => 'nullable|string|max:1000',
        ]);

        $status = $request->input('status');

        match ($status) {
            'investigating' => $finding->markAsInvestigating(),
            'resolved' => $finding->resolve($request->input('resolution_notes')),
            'dismissed' => $finding->dismiss($request->input('resolution_notes')),
            default => null,
        };

        return back()->with('success', 'Statut mis à jour avec succès');
    }

    /**
     * Bulk update findings
     */
    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:anomaly_findings,id',
            'action' => 'required|in:dismiss,resolve,investigate',
            'notes' => 'nullable|string|max:1000',
        ]);

        $findings = AnomalyFinding::whereIn('id', $request->input('ids'))->get();

        foreach ($findings as $finding) {
            match ($request->input('action')) {
                'investigate' => $finding->markAsInvestigating(),
                'resolve' => $finding->resolve($request->input('notes')),
                'dismiss' => $finding->dismiss($request->input('notes')),
                default => null,
            };
        }

        return back()->with('success', count($findings) . ' anomalies mises à jour');
    }

    /**
     * Get finding statistics for dashboard widget
     */
    public function stats()
    {
        $stats = [
            'unresolved_count' => AnomalyFinding::unresolved()->count(),
            'critical_count' => AnomalyFinding::critical()->unresolved()->count(),
            'new_today' => AnomalyFinding::whereDate('detected_at', today())->count(),
            'resolved_this_week' => AnomalyFinding::where('status', 'resolved')
                ->where('resolved_at', '>=', now()->startOfWeek())
                ->count(),
            'by_severity' => [
                'critical' => AnomalyFinding::unresolved()->where('severity', 'critical')->count(),
                'high' => AnomalyFinding::unresolved()->where('severity', 'high')->count(),
                'medium' => AnomalyFinding::unresolved()->where('severity', 'medium')->count(),
                'low' => AnomalyFinding::unresolved()->where('severity', 'low')->count(),
            ],
        ];

        return response()->json($stats);
    }
}
