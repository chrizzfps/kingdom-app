<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index()
    {
        return Client::withCount('projects')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'branding_color' => 'nullable|string|max:7',
        ]);

        $client = Client::create($validated);

        return response()->json($client, 201);
    }

    public function show(Client $client)
    {
        return $client->load('projects');
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'company_name' => 'sometimes|required|string|max:255',
            'tax_id' => 'nullable|string|max:50',
            'branding_color' => 'nullable|string|max:7',
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
