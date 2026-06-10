<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proposal;
use Illuminate\Http\Request;

class ProposalController extends Controller
{
    // Admin Methods
    public function index()
    {
        return Proposal::with('project.client')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'content' => 'nullable|array',
            'status' => 'required|in:draft,sent,viewed,accepted,rejected',
        ]);

        $proposal = Proposal::create($validated);

        return response()->json($proposal, 201);
    }

    public function show(Proposal $proposal)
    {
        return $proposal->load('project.client');
    }

    public function update(Request $request, Proposal $proposal)
    {
        $validated = $request->validate([
            'content' => 'nullable|array',
            'status' => 'sometimes|required|in:draft,sent,viewed,accepted,rejected',
        ]);

        $proposal->update($validated);

        return response()->json($proposal);
    }

    public function destroy(Proposal $proposal)
    {
        $proposal->delete();
        return response()->json(null, 204);
    }

    // Public Methods (No Auth Required)
    public function publicShow($uuid)
    {
        $proposal = Proposal::where('uuid', $uuid)->with('project.client')->firstOrFail();
        
        // Track view
        if ($proposal->status === 'sent') {
            $proposal->update([
                'status' => 'viewed',
                'viewed_at' => now(),
            ]);
        }

        return response()->json($proposal);
    }

    public function publicAccept(Request $request, $uuid)
    {
        $proposal = Proposal::where('uuid', $uuid)->firstOrFail();

        if ($proposal->status === 'accepted') {
            return response()->json(['message' => 'Propuesta ya aceptada'], 400);
        }

        $proposal->update([
            'status' => 'accepted',
            'accepted_at' => now(),
            'accepted_ip' => $request->ip(),
        ]);

        return response()->json(['message' => 'Propuesta aceptada exitosamente']);
    }
}
