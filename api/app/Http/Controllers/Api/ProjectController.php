<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index()
    {
        return Project::with('client')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'status' => 'required|in:pending,active,completed,archived',
            'deadline' => 'nullable|date',
        ]);

        $project = Project::create($validated);

        return response()->json($project, 201);
    }

    public function show(Project $project)
    {
        return $project->load(['client', 'proposals', 'invoices', 'deliverables', 'tasks', 'workflows']);
    }

    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'client_id' => 'sometimes|required|exists:clients,id',
            'status' => 'sometimes|required|in:pending,active,completed,archived',
            'deadline' => 'nullable|date',
        ]);

        $project->update($validated);

        return response()->json($project);
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return response()->json(null, 204);
    }
}
