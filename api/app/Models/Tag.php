<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'color',
    ];

    public function tasks()
    {
        return $this->belongsToMany(ProjectTask::class, 'project_task_tags', 'tag_id', 'task_id');
    }
}

