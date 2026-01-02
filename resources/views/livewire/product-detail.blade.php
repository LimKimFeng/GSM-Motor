<div class="py-12 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Breadcrumb -->
        <nav class="flex mb-6" aria-label="Breadcrumb">
            <ol class="inline-flex items-center space-x-1 md:space-x-3">
                <li class="inline-flex items-center">
                    <a href="/" class="text-gray-600 hover:text-primary">Home</a>
                </li>
                <li>
                    <span class="mx-2 text-gray-400">/</span>
                </li>
                <li class="inline-flex items-center">
                    <span class="text-gray-600">{{ $product->category->name }}</span>
                </li>
                <li>
                    <span class="mx-2 text-gray-400">/</span>
                </li>
                <li aria-current="page">
                    <span class="font-medium text-gray-800 truncate">{{ $product->name }}</span>
                </li>
            </ol>
        </nav>

        <!-- Main Product Card -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
                
                <!-- Image Section (Carousel) -->
                @php
                    $images = $product->images->map(fn($img) => asset('storage/' . $img->image_path));
                    if ($images->isEmpty() && $product->image_path) {
                        $images->push(asset('storage/' . $product->image_path));
                    }
                    if ($images->isEmpty()) {
                         // Placeholder
                    }
                    $imagesJson = $images->isEmpty() ? '[]' : json_encode($images);
                @endphp

                <div class="space-y-4" x-data="{ 
                        activeImage: '{{ $images->first() ?? '' }}', 
                        images: {{ $imagesJson }},
                        activeIndex: 0 
                     }">
                    
                    <!-- Main Image Frame -->
                    <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-100 relative group">
                        <template x-if="images.length > 0">
                            <img :src="activeImage" :alt="'{{ $product->name }}'" class="w-full h-full object-cover transition duration-500"
                                 x-transition:enter="transition opacity-0 duration-300"
                                 x-transition:enter-end="opacity-100">
                        </template>
                        <template x-if="images.length === 0">
                            <div class="w-full h-full flex items-center justify-center text-gray-400">
                                <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            </div>
                        </template>

                        <!-- Navigation Arrows (Only if multiple images) -->
                        <template x-if="images.length > 1">
                            <div>
                                <button @click="activeIndex = (activeIndex === 0) ? images.length - 1 : activeIndex - 1; activeImage = images[activeIndex]" 
                                        class="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition opacity-0 group-hover:opacity-100">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                                </button>
                                <button @click="activeIndex = (activeIndex === images.length - 1) ? 0 : activeIndex + 1; activeImage = images[activeIndex]" 
                                        class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md transition opacity-0 group-hover:opacity-100">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </div>
                        </template>
                    </div>

                    <!-- Thumbnails Strip -->
                    <template x-if="images.length > 1">
                        <div class="flex space-x-2 overflow-x-auto pb-2">
                            <template x-for="(img, index) in images">
                                <button @click="activeImage = img; activeIndex = index" 
                                        class="w-20 h-20 rounded-md overflow-hidden border-2 flex-shrink-0 transition"
                                        :class="activeImage === img ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200 opacity-70 hover:opacity-100'">
                                    <img :src="img" class="w-full h-full object-cover">
                                </button>
                            </template>
                        </div>
                    </template>
                </div>

                <!-- Product Info -->
                <div class="flex flex-col">
                    <h1 class="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">{{ $product->name }}</h1>
                    
                     <div class="flex items-center space-x-4 mb-6">
                        <div class="flex items-center text-yellow-400">
                            <!-- Fake 5 Stars for aesthetics -->
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                             <span class="text-gray-500 text-sm ml-2">(Terlaris)</span>
                        </div>
                        <div class="h-4 w-px bg-gray-300"></div>
                         <span class="text-sm text-gray-500">Stok: {{ $product->stock > 0 ? $product->stock . ' Unit' : 'Habis' }}</span>
                    </div>


                    <div class="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                        <div class="flex items-baseline mb-1">
                            <span class="text-3xl font-bold text-primary">Rp{{ number_format($product->price, 0, ',', '.') }}</span>
                            <span class="ml-2 text-sm text-gray-500">/ pcs</span>
                        </div>
                        
                        <!-- Tiered Pricing Display -->
                        @if($product->price_3_items || $product->price_5_items)
                            <div class="mt-4 pt-3 border-t border-gray-200">
                                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Harga Grosir (Lebih Hemat!)</h4>
                                <div class="space-y-1">
                                    @if($product->price_3_items)
                                        <div class="flex justify-between items-center text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
                                            <span>Beli Min. 3</span>
                                            <span class="font-bold">Rp{{ number_format($product->price_3_items, 0, ',', '.') }}</span>
                                        </div>
                                    @endif
                                    @if($product->price_5_items)
                                        <div class="flex justify-between items-center text-red-800 font-medium bg-red-100 px-3 py-1.5 rounded-md border border-red-200">
                                            <span>Beli Min. 5</span>
                                            <span class="font-bold">Rp{{ number_format($product->price_5_items, 0, ',', '.') }}</span>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        @endif
                    </div>

                    <div class="prose prose-sm text-gray-600 mb-8">
                        <h3 class="font-bold text-gray-900 mb-2">Deskripsi Produk</h3>
                        <p>{{ $product->description ?? 'Tidak ada deskripsi.' }}</p>
                         <p class="mt-2 text-sm text-gray-500">Kategori: <span class="font-medium text-gray-700">{{ $product->category->name }}</span></p>
                    </div>

                    <!-- Actions -->
                    <div class="mt-auto flex flex-col sm:flex-row gap-3">
                         <a href="{{ $this->whatsappAskLink }}" target="_blank" class="flex-1 flex justify-center items-center px-6 py-3 border border-primary text-primary font-bold rounded-lg hover:bg-orange-50 transition">
                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                            Tanya Admin
                        </a>
                        
                        <a href="{{ $this->whatsappLink }}" target="_blank" class="flex-1 flex justify-center items-center px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200">
                             <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            Beli Sekarang
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <!-- Related Products -->
        @if($relatedProducts->count() > 0)
            <h2 class="text-xl font-bold text-gray-900 mb-6">Produk Sejenis</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                @foreach($relatedProducts as $related)
                     <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                        <a href="{{ route('product.detail', $related->slug) }}" class="block">
                            <div class="aspect-square bg-gray-100 relative">
                                @if($related->image_path)
                                    <img src="{{ asset('storage/' . $related->image_path) }}" class="w-full h-full object-cover">
                                @else
                                     <div class="w-full h-full flex items-center justify-center text-gray-400">
                                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    </div>
                                @endif
                                 @if($related->stock < 10)
                                    <span class="absolute bottom-0 left-0 w-full bg-red-500 text-white text-xs font-bold text-center py-1 bg-opacity-90">Stok Menipis</span>
                                @endif
                                <!-- Tiered Badge -->
                                @if($related->price_3_items)
                                    <div class="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                        Grosir
                                    </div>
                                @endif
                            </div>
                            <div class="p-4">
                                <h3 class="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">{{ $related->name }}</h3>
                                <div class="mt-2 flex items-center justify-between">
                                    <span class="text-primary font-bold">Rp{{ number_format($related->price, 0, ',', '.') }}</span>
                                </div>
                                @if($related->price_3_items)
                                    <div class="mt-1 text-xs text-red-600 font-medium">
                                        Beli 3: Rp{{ number_format($related->price_3_items, 0, ',', '.') }}
                                    </div>
                                @endif
                            </div>
                        </a>
                    </div>
                @endforeach
            </div>
        @endif

    </div>
</div>
