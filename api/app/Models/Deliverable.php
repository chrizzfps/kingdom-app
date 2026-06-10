<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Deliverable extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'uuid',
        'title',
        'file_path',
        'type',
        'expires_at',
        'is_public',
        'downloads_count',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_public' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function tasks()
    {
        return $this->belongsToMany(ProjectTask::class, 'project_task_resources', 'deliverable_id', 'task_id');
    }
    
    public function isExpired()
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}
