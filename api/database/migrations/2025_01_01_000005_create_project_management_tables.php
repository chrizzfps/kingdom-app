<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Project Tasks (Planning & Kanban)
        Schema::create('project_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->constrained()->onDelete('cascade'); // shortcuts
            $table->string('name');
            $table->enum('status', ['pending', 'in_progress', 'review', 'done', 'blocked'])->default('pending');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            
            // Assuming simplified user assignment for now (can link to users table if auth is fully ready)
            $table->foreignId('responsible_id')->nullable()->constrained('users')->nullOnDelete(); 
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            
            $table->date('order_date')->nullable();
            $table->date('deadline')->nullable();
            
            $table->string('delivery_link')->nullable();
            $table->string('social_post_link')->nullable();
            $table->text('notes')->nullable();
            
            $table->enum('type', ['generic', 'social_media', 'design', 'dev'])->default('generic');
            
            $table->timestamps();
        });

        // 2. Workflows (The container)
        Schema::create('workflows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('name')->default('Main Workflow');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 3. Workflow Nodes (The steps/visual elements)
        Schema::create('workflow_nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained()->onDelete('cascade');
            $table->string('type')->default('default'); // default, input, output, custom
            $table->string('label');
            $table->float('position_x')->default(0);
            $table->float('position_y')->default(0);
            $table->json('data')->nullable(); // Stores meta like color, specific details
            $table->timestamps();
        });
        
        // 4. Workflow Edges (Connections between nodes) - Optional but good for saving state
        Schema::create('workflow_edges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained()->onDelete('cascade');
            $table->string('source_node_id'); // ID from frontend or DB ID
            $table->string('target_node_id');
            $table->string('edge_type')->default('default');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_edges');
        Schema::dropIfExists('workflow_nodes');
        Schema::dropIfExists('workflows');
        Schema::dropIfExists('project_tasks');
    }
};
