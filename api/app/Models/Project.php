<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'status',
        'deadline',
    ];

    protected $casts = [
        'deadline' => 'date',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function tasks()
    {
        return $this->hasMany(ProjectTask::class);
    }

    public function workflows()
    {
        return $this->hasMany(Workflow::class);
    }

    public function deliverables()
    {
        return $this->hasMany(Deliverable::class);
    }

    public function proposals()
    {
        return $this->hasMany(Proposal::class);
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }



    public function socialPosts()
    {
        return $this->hasMany(SocialPost::class);
    }
    
    public function team()
    {
        return $this->belongsToMany(User::class, 'project_users')->withPivot('role');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'project_users');
    }
}
