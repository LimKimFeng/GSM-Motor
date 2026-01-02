<?php

namespace App\Observers;

use App\Models\Product;

class ProductObserver
{
    /**
     * Handle the Product "saving" event.
     */
    public function saving(Product $product): void
    {
        if ($product->isDirty('image_path') && $product->image_path) {
            $this->processImage($product->image_path);
        }
    }

    protected function processImage($path)
    {
        // This is a placeholder for the actual intervention logic
        // In a real scenario, we would read the file from storage, resize, watermark, and save back.
        // Assuming strictly local storage for now.
        $fullPath = storage_path('app/public/' . $path);
        
        // Check if file exists to avoid errors during seeding or testing
        if (!file_exists($fullPath)) {
            return;
        }

        // Logic to be implemented with Intervention Image Manager
        // $manager = new ImageManager(new Driver());
        // $image = $manager->read($fullPath);
        // $image->resize(800, 800);
        // $image->place(public_path('logo.png'), 'center', 0, 0, 50);
        // $image->toWebp()->save($fullPath);
    } 

    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        //
    }

    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        //
    }

    /**
     * Handle the Product "deleted" event.
     */
    public function deleted(Product $product): void
    {
        //
    }

    /**
     * Handle the Product "restored" event.
     */
    public function restored(Product $product): void
    {
        //
    }

    /**
     * Handle the Product "force deleted" event.
     */
    public function forceDeleted(Product $product): void
    {
        //
    }
}
