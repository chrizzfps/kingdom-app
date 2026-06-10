<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProjectTask;
use Illuminate\Http\Request;

class ProjectTaskController extends Controller
{
    public function index(Request $request)
    {
        $query = ProjectTask::query();

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        return $query->with(['responsible', 'assigned'])->orderBy('order_date')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'client_id' => 'required|exists:clients,id',
            'name' => 'required|string|max:255',
            'status' => 'nullable|string',
            'priority' => 'nullable|string',
            'responsible_id' => 'nullable|exists:users,id',
            'assigned_to' => 'nullable|exists:users,id',
            'order_date' => 'nullable|date',
            'deadline' => 'nullable|date',
            'delivery_link' => 'nullable|string',
            'social_post_link' => 'nullable|string',
            'notes' => 'nullable|string',
            'type' => 'nullable|string',
        ]);

        $task = ProjectTask::create($validated);

        return response()->json($task, 201);
    }

    public function update(Request $request, ProjectTask $projectTask)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'status' => 'nullable|string',
            'priority' => 'nullable|string',
            'responsible_id' => 'nullable|exists:users,id',
            'assigned_to' => 'nullable|exists:users,id',
            'order_date' => 'nullable|date',
            'deadline' => 'nullable|date',
            'delivery_link' => 'nullable|string',
            'social_post_link' => 'nullable|string',
            'notes' => 'nullable|string',
            'type' => 'nullable|string',
        ]);

        $projectTask->update($validated);

        return response()->json($projectTask);
    }

    public function destroy(ProjectTask $projectTask)
    {
        $projectTask->delete();
        return response()->json(null, 204);
    }
}
