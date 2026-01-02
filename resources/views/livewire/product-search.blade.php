<div class="relative w-full">
    <div class="relative">
        <input 
            wire:model.live.debounce.300ms="query"
            type="text" 
            placeholder="Cari sparepart motor Anda di sini..." 
            class="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-charcoal bg-white"
        >
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
        </div>
        <!-- Loading Indicator -->
        <div wire:loading class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg class="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    </div>

    @if(strlen($query) >= 2)
        <div class="absolute w-full mt-2 bg-white rounded-lg shadow-lg z-50 overflow-hidden border">
            @if(count($results) > 0)
                <ul>
                    @foreach($results as $product)
                        <li class="border-b last:border-0 hover:bg-gray-50 transition p-3">
                            <a href="/product/{{ $product->slug }}" class="flex items-start space-x-3 w-full block">
                                <img src="{{ $product->image_path ? asset('storage/'.$product->image_path) : 'https://via.placeholder.com/50' }}" alt="{{ $product->name }}" class="w-12 h-12 object-cover rounded">
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-gray-900 truncate">{{ $product->name }}</p>
                                    <p class="text-xs text-primary font-bold">Rp{{ number_format($product->price, 0, ',', '.') }}</p>
                                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        {{ $product->category->name }}
                                    </span>
                                </div>
                            </a>
                        </li>
                    @endforeach
                </ul>
            @else
                <div class="p-4 text-center text-sm text-gray-500">
                    Produk tidak ditemukan. Coba kata kunci lain atau <a href="https://wa.me/6281234567890" target="_blank" class="text-primary hover:underline">Tanya Admin</a>
                </div>
            @endif
        </div>
    @endif
</div>
