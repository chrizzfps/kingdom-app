<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Proposal extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'uuid',
        'content',
        'status',
        'viewed_at',
        'accepted_at',
        'accepted_ip',
    ];

    protected $casts = [
        'content' => 'array',
        'viewed_at' => 'datetime',
        'accepted_at' => 'datetime',
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
}
