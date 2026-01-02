<?php

namespace App\Livewire;

use App\Models\Product;
use Livewire\Component;
use Livewire\Attributes\Title;

class ProductDetail extends Component
{
    public $product;
    public $relatedProducts = [];

    public function mount($slug)
    {
        $this->product = Product::with('category')->where('slug', $slug)->firstOrFail();
        
        $this->relatedProducts = Product::where('category_id', $this->product->category_id)
            ->where('id', '!=', $this->product->id)
            ->take(4)
            ->get();
    }

    #[Title('Detail Produk')]
    public function render()
    {
        return view('livewire.product-detail')->title($this->product->name . ' - GSM Motor');
    }

    // Helper to generate WhatsApp Link
    public function getWhatsappLinkProperty()
    {
        $phone = '6281386363979'; 
        $message = "Halo Admin GSM Motor, saya mau beli produk *{$this->product->name}* seharga Rp " . number_format($this->product->price, 0, ',', '.');
        return "https://wa.me/{$phone}?text=" . urlencode($message);
    }
    
    public function getWhatsappAskLinkProperty()
    {
        $phone = '6281386363979'; 
        $message = "Halo Admin GSM Motor, saya mau tanya tentang produk *{$this->product->name}*.";
        return "https://wa.me/{$phone}?text=" . urlencode($message);
    }
}
