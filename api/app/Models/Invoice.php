<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'uuid',
        'amount',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'discount',
        'notes',
        'status',
        'due_date',
    ];

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    protected $casts = [
        'due_date' => 'date',
        'amount' => 'decimal:2',
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
