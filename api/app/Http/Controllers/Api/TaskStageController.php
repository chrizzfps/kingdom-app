<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaskStage;
use Illuminate\Http\Request;

class TaskStageController extends Controller
{
    public function index()
    {
        return TaskStage::orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:task_stages,name',
            'color' => 'nullable|string|max:7',
        ]);

        $stage = TaskStage::create($validated);

        return response()->json($stage, 201);
    }

    public function show(TaskStage $taskStage)
    {
        return $taskStage;
    }

    public function update(Request $request, TaskStage $taskStage)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:task_stages,name,' . $taskStage->id,
            'color' => 'nullable|string|max:7',
        ]);

        $taskStage->update($validated);

        return response()->json($taskStage);
    }

    public function destroy(TaskStage $taskStage)
    {
        $taskStage->delete();
        return response()->json(null, 204);
    }
}

