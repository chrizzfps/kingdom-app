<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workflow;
use App\Models\WorkflowNode;
use Illuminate\Http\Request;

class WorkflowController extends Controller
{
    public function index(Request $request)
    {
        $query = Workflow::query()->with('nodes');

        if ($request->has('project_id')) {
            $query->where('project_id', $request->project_id);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $workflow = Workflow::create($validated);
        return response()->json($workflow, 201);
    }

    public function update(Request $request, Workflow $workflow)
    {
        $workflow->update($request->only(['name', 'description']));
        return response()->json($workflow);
    }

    // Node Management
    public function storeNode(Request $request, Workflow $workflow)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'label' => 'required|string',
            'position_x' => 'required|numeric',
            'position_y' => 'required|numeric',
            'data' => 'nullable|array',
        ]);

        $node = $workflow->nodes()->create($validated);
        return response()->json($node, 201);
    }
    
    public function updateNode(Request $request, WorkflowNode $node)
    {
         $node->update($request->all());
         return response()->json($node);
    }

    public function destroyNode(WorkflowNode $node)
    {
        $node->delete();
        return response()->json(null, 204);
    }
}
