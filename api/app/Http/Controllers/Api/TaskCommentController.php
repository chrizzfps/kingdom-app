<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TaskComment;
use Illuminate\Http\Request;

class TaskCommentController extends Controller
{
    public function index(Request $request)
    {
        $query = TaskComment::query();

        if ($request->has('task_id')) {
            $query->where('task_id', $request->task_id);
        }

        return $query->with('user')->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'task_id' => 'required|exists:project_tasks,id',
            'content' => 'required|string',
        ]);

        $validated['user_id'] = $request->user()->id;

        $comment = TaskComment::create($validated);

        return response()->json($comment->load('user'), 201);
    }

    public function update(Request $request, TaskComment $taskComment)
    {
        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $taskComment->update($validated);

        return response()->json($taskComment->load('user'));
    }

    public function destroy(TaskComment $taskComment)
    {
        $taskComment->delete();
        return response()->json(null, 204);
    }
}

