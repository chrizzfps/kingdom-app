<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Task Stages (Etapas de tareas)
        Schema::create('task_stages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('color')->nullable()->default('#3b82f6'); // Hex color
            $table->timestamps();
        });

        // 2. Add stage_id to project_tasks
        Schema::table('project_tasks', function (Blueprint $table) {
            $table->foreignId('stage_id')->nullable()->after('assigned_to')->constrained('task_stages')->nullOnDelete();
        });

        // 3. Project Task Resources (Pivot: tareas <-> recursos)
        Schema::create('project_task_resources', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('project_tasks')->onDelete('cascade');
            $table->foreignId('deliverable_id')->constrained('deliverables')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['task_id', 'deliverable_id']); // Evitar duplicados
        });

        // 4. Task Comments
        Schema::create('task_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('project_tasks')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('content');
            $table->timestamps();
        });

        // 5. Task Activities (Historial de cambios)
        Schema::create('task_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('project_tasks')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // 'status_changed', 'assigned', 'deadline_updated', etc.
            $table->string('field')->nullable(); // Campo que cambió
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->json('metadata')->nullable(); // Datos adicionales
            $table->timestamps();
        });

        // 6. Tags
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('color')->nullable()->default('#6366f1'); // Hex color
            $table->timestamps();
        });

        // 7. Project Task Tags (Pivot: tareas <-> tags)
        Schema::create('project_task_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('project_tasks')->onDelete('cascade');
            $table->foreignId('tag_id')->constrained('tags')->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['task_id', 'tag_id']); // Evitar duplicados
        });

        // 8. Project Users (Pivot: proyectos <-> usuarios) - si no existe
        if (!Schema::hasTable('project_users')) {
            Schema::create('project_users', function (Blueprint $table) {
                $table->id();
                $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
                $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
                $table->timestamps();
                
                $table->unique(['project_id', 'user_id']); // Evitar duplicados
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('project_task_tags');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('task_activities');
        Schema::dropIfExists('task_comments');
        Schema::dropIfExists('project_task_resources');
        
        Schema::table('project_tasks', function (Blueprint $table) {
            $table->dropForeign(['stage_id']);
            $table->dropColumn('stage_id');
        });
        
        Schema::dropIfExists('task_stages');
        Schema::dropIfExists('project_users');
    }
};

