<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectTask extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'client_id',
        'name',
        'status',
        'priority',
        'responsible_id',
        'assigned_to',
        'stage_id',
        'order_date',
        'deadline',
        'delivery_link',
        'social_post_link',
        'notes',
        'type'
    ];

    protected $casts = [
        'order_date' => 'date',
        'deadline' => 'date',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function responsible()
    {
        return $this->belongsTo(User::class, 'responsible_id');
    }

    public function assigned()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function stage()
    {
        return $this->belongsTo(TaskStage::class);
    }

    public function resources()
    {
        return $this->belongsToMany(Deliverable::class, 'project_task_resources', 'task_id', 'deliverable_id');
    }

    public function comments()
    {
        return $this->hasMany(TaskComment::class, 'task_id');
    }

    public function activities()
    {
        return $this->hasMany(TaskActivity::class, 'task_id');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'project_task_tags', 'task_id', 'tag_id');
    }
}
