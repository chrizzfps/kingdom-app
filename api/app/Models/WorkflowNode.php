<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkflowNode extends Model
{
    use HasFactory;

    protected $fillable = [
        'workflow_id',
        'type',
        'label',
        'position_x',
        'position_y',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function workflow()
    {
        return $this->belongsTo(Workflow::class);
    }
}
