<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index()
    {
        return Client::withCount(['projects as projects_count', 'projects as active_projects_count' => function ($query) {
            $query->where('status', 'active');
        }])
        ->withSum('invoices as total_revenue', 'amount')
        ->latest()
        ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'tax_id' => 'nullable|string|max:50',
            'branding_color' => 'nullable|string|max:7',
            'industry' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'status' => 'in:active,inactive,lead',
        ]);

        $client = Client::create($validated);

        return response()->json($client, 201);
    }

    public function show(Client $client)
    {
        return $client->load(['projects']); // We can expand this later to load tasks
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'company_name' => 'sometimes|required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'website' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'tax_id' => 'nullable|string|max:50',
            'branding_color' => 'nullable|string|max:7',
            'industry' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'status' => 'in:active,inactive,lead',
        ]);

        $client->update($validated);

        return response()->json($client);
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return response()->json(null, 204);
    }
}
