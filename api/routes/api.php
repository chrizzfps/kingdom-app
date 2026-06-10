<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\ProposalController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\DeliverableController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ProjectTaskController;
use App\Http\Controllers\Api\WorkflowController;
use App\Http\Controllers\Api\TaskStageController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TaskCommentController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\InvoiceController as PdfInvoiceController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public Routes (No Auth Required)
Route::post('/login', [AuthController::class, 'login']);

// Public Document Routes (The "Liquid Glass" View)
Route::get('/p/proposals/{uuid}', [ProposalController::class, 'publicShow']);
Route::post('/p/proposals/{uuid}/accept', [ProposalController::class, 'publicAccept']);

Route::get('/p/invoices/{uuid}', [InvoiceController::class, 'publicShow']);
Route::get('/p/invoices/{uuid}/download', [InvoiceController::class, 'downloadPdf']);

Route::get('/p/vault/{uuid}', [DeliverableController::class, 'publicShow']);
Route::get('/p/vault/{uuid}/download', [DeliverableController::class, 'publicDownload']);

// NEW: Stateless PDF Generation from React/Firestore data
Route::options('/invoices/generate-pdf', function() {
    return response()->json([], 200)
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');
});
Route::post('/invoices/generate-pdf', [App\Http\Controllers\InvoiceController::class, 'generateUnsaved']);

// TEMPORARY: Public Access for Testing (Move back to protected later)
Route::apiResource('clients', ClientController::class);
Route::apiResource('projects', ProjectController::class);
Route::apiResource('proposals', ProposalController::class);
Route::apiResource('invoices', InvoiceController::class);
Route::apiResource('deliverables', DeliverableController::class);
Route::apiResource('services', ServiceController::class);
Route::apiResource('project-tasks', ProjectTaskController::class);
Route::apiResource('workflows', WorkflowController::class);
// Workflow Node special routes
Route::post('workflows/{workflow}/nodes', [WorkflowController::class, 'storeNode']);
Route::put('workflow-nodes/{node}', [WorkflowController::class, 'updateNode']);
Route::delete('workflow-nodes/{node}', [WorkflowController::class, 'destroyNode']);

// New enhanced features
Route::apiResource('task-stages', TaskStageController::class);
Route::apiResource('users', UserController::class);
Route::post('users/{user}/assign-project', [UserController::class, 'assignToProject']);
Route::post('users/{user}/remove-project', [UserController::class, 'removeFromProject']);
Route::apiResource('task-comments', TaskCommentController::class);
Route::apiResource('tags', TagController::class);

// Protected Routes (Sanctum) - Only User Info for now
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
