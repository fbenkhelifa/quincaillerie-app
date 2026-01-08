<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Display the notifications page.
     */
    public function index(Request $request)
    {
        $query = Notification::query()
            ->orderByDesc('created_at');

        // Filter by read status
        if ($request->filled('status')) {
            if ($request->status === 'unread') {
                $query->unread();
            } elseif ($request->status === 'read') {
                $query->read();
            }
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->ofType($request->type);
        }

        // Filter by severity
        if ($request->filled('severity')) {
            $query->ofSeverity($request->severity);
        }

        // Filter by date range
        if ($request->filled('from')) {
            $query->where('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->where('created_at', '<=', $request->to . ' 23:59:59');
        }

        // Search in title/message
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $notifications = $query->paginate(20)->withQueryString();

        // Get stats
        $stats = $this->notificationService->getStats();

        // Get filter options
        $types = Notification::getTypes();
        $severities = Notification::getSeverities();

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'stats' => $stats,
            'types' => $types,
            'severities' => $severities,
            'filters' => $request->only(['status', 'type', 'severity', 'from', 'to', 'search']),
        ]);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Notification $notification)
    {
        $notification->markAsRead();

        return back()->with('success', __('Notification marquée comme lue.'));
    }

    /**
     * Mark a notification as unread.
     */
    public function markAsUnread(Notification $notification)
    {
        $notification->markAsUnread();

        return back()->with('success', __('Notification marquée comme non lue.'));
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $count = $this->notificationService->markAllAsRead($request->user()?->id);

        return back()->with('success', __(':count notifications marquées comme lues.', ['count' => $count]));
    }

    /**
     * Delete a notification.
     */
    public function destroy(Notification $notification)
    {
        $notification->delete();

        return back()->with('success', __('Notification supprimée.'));
    }

    /**
     * Get unread count for navbar badge (API endpoint).
     */
    public function unreadCount(Request $request)
    {
        $count = Notification::unread()->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Get recent notifications for dropdown (API endpoint).
     */
    public function recent(Request $request)
    {
        $notifications = Notification::unread()
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'type' => $n->type,
                'type_label' => $n->type_label,
                'severity' => $n->severity,
                'severity_color' => $n->severity_color,
                'title' => $n->title,
                'message' => \Str::limit($n->message, 100),
                'action_url' => $n->action_url,
                'created_at' => $n->created_at->diffForHumans(),
            ]);

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => Notification::unread()->count(),
        ]);
    }
}
