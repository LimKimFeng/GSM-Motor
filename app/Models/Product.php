<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'price_3_items',
        'price_5_items',
        'stock',
        'image_path',
        'last_price_update',
    ];

    protected $casts = [
        'last_price_update' => 'datetime',
        'price' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function scopeSearch($query, $term)
    {
        if (!$term) {
            return $query;
        }

        $terms = explode(' ', $term);
        
        return $query->where(function ($q) use ($terms) {
            foreach ($terms as $word) {
                if (!empty(trim($word))) {
                    $q->where('name', 'like', '%' . $word . '%');
                }
            }
        });
    }
}
