<?php

namespace App\Livewire;

use Livewire\Component;

class HomePage extends Component
{


    #[Title('GSM Motor - Pusat Sparepart Motor Terlengkap')]
    public function render()
    {
        $banners = \App\Models\Banner::where('is_active', true)->orderBy('order')->get();
        $latestProducts = \App\Models\Product::with('category')->latest()->take(10)->get();

        return view('livewire.home-page', [
            'banners' => $banners,
            'latestProducts' => $latestProducts
        ]);
    }
}
