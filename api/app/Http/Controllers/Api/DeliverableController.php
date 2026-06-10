<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deliverable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DeliverableController extends Controller
{
    // Admin Methods
    public function index()
    {
        return Deliverable::with('project.client')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'title' => 'required|string|max:255',
            'type' => 'required|string', // Removed strict enum for 'other' flexibility or add 'link'
            'expires_at' => 'nullable|date',
            'is_public' => 'boolean',
            'file' => 'nullable|file|max:102400', // Made nullable
            'file_path' => 'nullable|string', // Allow direct link
            'uuid' => 'nullable|string'
        ]);

        // Handle File Upload
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('deliverables', 'public');
            $validated['file_path'] = $path;
        } 
        // If not file, we expect 'file_path' to be the link provided in the request body
        // The frontend sends 'file_path' as the link URL.

        $deliverable = Deliverable::create($validated);

        return response()->json($deliverable, 201);
    }

    public function show(Deliverable $deliverable)
    {
        return $deliverable->load('project.client');
    }

    public function destroy(Deliverable $deliverable)
    {
        // Delete file from storage
        Storage::disk('public')->delete($deliverable->file_path);
        
        $deliverable->delete();
        return response()->json(null, 204);
    }

    // Public Methods (The Vault)
    public function publicShow($uuid)
    {
        $deliverable = Deliverable::where('uuid', $uuid)->with('project.client')->firstOrFail();

        if ($deliverable->isExpired()) {
            return response()->json(['error' => 'Link expired'], 410); // 410 Gone
        }

        if (!$deliverable->is_public) {
            return response()->json(['error' => 'Access denied'], 403);
        }

        return response()->json($deliverable);
    }

    public function publicDownload($uuid)
    {
        $deliverable = Deliverable::where('uuid', $uuid)->firstOrFail();

        if ($deliverable->isExpired() || !$deliverable->is_public) {
            abort(403);
        }

        $deliverable->increment('downloads_count');

        return Storage::disk('public')->download($deliverable->file_path, $deliverable->title);
    }
}
