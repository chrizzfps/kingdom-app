<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskStage extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'color',
    ];

    public function tasks()
    {
        return $this->hasMany(ProjectTask::class, 'stage_id');
    }
}

