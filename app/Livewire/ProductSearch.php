<?php

namespace App\Livewire;

use Livewire\Component;

class ProductSearch extends Component
{


    #[Url]
    public $query = '';

    public function render()
    {
        $results = [];

        if (strlen($this->query) >= 2) {
            $results = \App\Models\Product::search($this->query)
                ->with('category')
                ->take(10)
                ->get();
        }

        return view('livewire.product-search', [
            'results' => $results
        ]);
    }
}
