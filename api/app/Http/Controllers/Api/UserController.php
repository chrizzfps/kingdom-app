<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return User::orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['admin', 'agent', 'dev', 'social_media', 'client'])],
            'avatar' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $validated['is_active'] = $validated['is_active'] ?? true;

        $user = User::create($validated);

        // Remove password from response
        $user->makeHidden('password');

        return response()->json($user, 201);
    }

    public function show(User $user)
    {
        $user->makeHidden('password');
        return $user->load(['projects']);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string|min:8',
            'role' => ['sometimes', 'required', Rule::in(['admin', 'agent', 'dev', 'social_media', 'client'])],
            'avatar' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        $user->makeHidden('password');

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(null, 204);
    }

    public function assignToProject(Request $request, User $user)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
        ]);

        $user->projects()->syncWithoutDetaching([$validated['project_id']]);

        return response()->json(['message' => 'Usuario asignado al proyecto']);
    }

    public function removeFromProject(Request $request, User $user)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
        ]);

        $user->projects()->detach($validated['project_id']);

        return response()->json(['message' => 'Usuario removido del proyecto']);
    }
}

