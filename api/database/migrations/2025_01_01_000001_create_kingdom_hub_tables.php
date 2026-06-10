<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Users Table Modification (Adding roles and fields)
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'agent', 'dev', 'social_media', 'client'])->default('client');
            $table->string('avatar')->nullable();
            $table->boolean('is_active')->default(true);
        });

        // 2. Clients Table
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('tax_id')->nullable();
            $table->string('branding_color')->default('#000000'); // Hex code
            $table->timestamps();
        });

        // 3. Projects Table
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'active', 'completed', 'archived'])->default('pending');
            $table->date('deadline')->nullable();
            $table->timestamps();
        });

        // 4. Proposals Table
        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->uuid('uuid')->unique();
            $table->json('content')->nullable(); // Stores the builder JSON
            $table->enum('status', ['draft', 'sent', 'viewed', 'accepted', 'rejected'])->default('draft');
            $table->timestamp('viewed_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->string('accepted_ip')->nullable();
            $table->timestamps();
        });

        // 5. Invoices Table
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->uuid('uuid')->unique();
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['draft', 'sent', 'paid', 'overdue', 'cancelled'])->default('draft');
            $table->date('due_date');
            $table->timestamps();
        });

        // 6. Deliverables Table (The Vault)
        Schema::create('deliverables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->uuid('uuid')->unique();
            $table->string('title');
            $table->string('file_path');
            $table->enum('type', ['video', 'image', 'document', 'archive', 'other']);
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_public')->default(true);
            $table->integer('downloads_count')->default(0);
            $table->timestamps();
        });

        // 7. Social Posts Table
        Schema::create('social_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->string('platform'); // instagram, linkedin, etc.
            $table->dateTime('scheduled_at');
            $table->enum('status', ['draft', 'pending_approval', 'approved', 'published'])->default('draft');
            $table->text('caption')->nullable();
            $table->string('media_url')->nullable();
            $table->timestamps();
        });
        
        // 8. Project Users (Team assignments)
        Schema::create('project_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('role', ['manager', 'editor', 'viewer'])->default('viewer');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_users');
        Schema::dropIfExists('social_posts');
        Schema::dropIfExists('deliverables');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('proposals');
        Schema::dropIfExists('projects');
        Schema::dropIfExists('clients');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'avatar', 'is_active']);
        });
    }
};
