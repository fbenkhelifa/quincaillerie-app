<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    /**
     * Display the audit log with filters
     */
    public function index(Request $request): Response
    {
        $query = AuditLog::with(['user'])
            ->latest();

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->where('created_at', '>=', $request->date('start_date'));
        }
        if ($request->filled('end_date')) {
            $query->where('created_at', '<=', $request->date('end_date')->endOfDay());
        }

        // Filter by action
        if ($request->filled('action')) {
            $query->action($request->input('action'));
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->byUser($request->input('user_id'));
        }

        // Filter by entity type
        if ($request->filled('entity_type')) {
            $query->forType($request->input('entity_type'));
        }

        // Search in event description or reason
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('event', 'like', "%{$search}%")
                  ->orWhere('reason', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%");
            });
        }

        $logs = $query->paginate($request->integer('per_page', 50));

        // Get available filters
        $users = User::select('id', 'name')
            ->whereIn('id', AuditLog::distinct()->pluck('user_id'))
            ->get();

        $entityTypes = AuditLog::distinct()
            ->pluck('auditable_type')
            ->map(fn($type) => [
                'value' => $type,
                'label' => class_basename($type),
            ]);

        // Activity stats
        $stats = [
            'total_today' => AuditLog::whereDate('created_at', today())->count(),
            'total_week' => AuditLog::where('created_at', '>=', now()->startOfWeek())->count(),
            'by_action' => AuditLog::selectRaw('action, COUNT(*) as count')
                ->where('created_at', '>=', now()->startOfWeek())
                ->groupBy('action')
                ->pluck('count', 'action'),
            'top_users' => AuditLog::selectRaw('user_name, COUNT(*) as count')
                ->where('created_at', '>=', now()->startOfWeek())
                ->whereNotNull('user_name')
                ->groupBy('user_name')
                ->orderByDesc('count')
                ->limit(5)
                ->pluck('count', 'user_name'),
        ];

        return Inertia::render('AuditLog/Index', [
            'logs' => $logs,
            'users' => $users,
            'entityTypes' => $entityTypes,
            'actions' => AuditLog::ACTIONS,
            'stats' => $stats,
            'filters' => $request->only([
                'start_date', 'end_date', 'action', 'user_id', 'entity_type', 'search'
            ]),
        ]);
    }

    /**
     * Show a specific audit log entry with full details
     */
    public function show(AuditLog $auditLog): Response
    {
        $auditLog->load(['user']);

        // Get related logs for the same entity
        $relatedLogs = AuditLog::where('id', '!=', $auditLog->id)
            ->where('auditable_type', $auditLog->auditable_type)
            ->where('auditable_id', $auditLog->auditable_id)
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('AuditLog/Show', [
            'log' => $auditLog,
            'relatedLogs' => $relatedLogs,
        ]);
    }

    /**
     * Get timeline of changes for a specific entity
     */
    public function entityTimeline(Request $request)
    {
        $request->validate([
            'entity_type' => 'required|string',
            'entity_id' => 'required|integer',
        ]);

        $logs = AuditLog::where('auditable_type', $request->input('entity_type'))
            ->where('auditable_id', $request->input('entity_id'))
            ->with(['user'])
            ->latest()
            ->limit(50)
            ->get();

        return response()->json($logs);
    }

    /**
     * Export audit logs
     */
    public function export(Request $request)
    {
        $query = AuditLog::with(['user']);

        if ($request->filled('start_date')) {
            $query->where('created_at', '>=', $request->date('start_date'));
        }
        if ($request->filled('end_date')) {
            $query->where('created_at', '<=', $request->date('end_date')->endOfDay());
        }

        $logs = $query->latest()->limit(10000)->get();

        // Transform for export
        $data = $logs->map(fn($log) => [
            'date' => $log->created_at->format('Y-m-d H:i:s'),
            'user' => $log->user_name,
            'action' => $log->action,
            'event' => $log->event,
            'entity' => class_basename($log->auditable_type) . ' #' . $log->auditable_id,
            'reason' => $log->reason,
            'ip_address' => $log->ip_address,
        ]);

        return response()->json($data);
    }
}
