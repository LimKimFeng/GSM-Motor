<div class="space-y-8">
    <!-- Hero Banner Configuration (Manual Slider or Simple Grid for now) -->
    <section class="container mx-auto px-4 mt-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
             <!-- Main Slider (Left) -->
            <div x-data="{ activeSlide: 0, slides: {{ $banners->count() }}, timer: null }" 
                 x-init="timer = setInterval(() => { activeSlide = activeSlide === slides - 1 ? 0 : activeSlide + 1 }, 5000)"
                 class="md:col-span-2 bg-gray-200 rounded-lg overflow-hidden h-64 md:h-80 relative group">
                
                @if($banners->count() > 0)
                    @foreach($banners as $index => $banner)
                        <div x-show="activeSlide === {{ $index }}"
                             x-transition:enter="transition transform duration-500 ease-in-out"
                             x-transition:enter-start="opacity-0 scale-100"
                             x-transition:enter-end="opacity-100 scale-100"
                             x-transition:leave="transition transform duration-500 ease-in-out"
                             x-transition:leave-start="opacity-100 scale-100"
                             x-transition:leave-end="opacity-0 scale-100"
                             class="absolute inset-0 w-full h-full">
                            <img src="{{ asset('storage/'.$banner->image_path) }}" alt="{{ $banner->title }}" class="w-full h-full object-cover">
                        </div>
                    @endforeach

                    <!-- Navigation Dots -->
                    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        @foreach($banners as $index => $banner)
                            <button @click="activeSlide = {{ $index }}" 
                                    :class="activeSlide === {{ $index }} ? 'bg-primary w-6' : 'bg-white/50 w-2 hover:bg-white'"
                                    class="h-2 rounded-full transition-all duration-300"></button>
                        @endforeach
                    </div>
                @else
                    <div class="flex items-center justify-center h-full bg-primary text-white text-xl font-bold">
                        Promo Spesial GSM Motor
                    </div>
                @endif
            </div>
            
            <!-- Side Banners (Right) -->
            <div class="hidden md:flex flex-col gap-4 h-80">
                <div class="h-1/2 bg-gray-100 rounded-lg overflow-hidden relative">
                     <div class="absolute inset-0 flex items-center justify-center bg-gray-800 text-white font-bold text-center p-4">
                        Kualitas Orisinal <br> Harga Bersahabat
                     </div>
                </div>
                 <div class="h-1/2 bg-gray-100 rounded-lg overflow-hidden relative">
                    <div class="absolute inset-0 flex items-center justify-center bg-gray-700 text-white font-bold text-center p-4">
                        Transaksi Cepat <br> via WhatsApp
                     </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Categories / Trust Signals -->
    <section class="container mx-auto px-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
                <div class="text-primary">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                    <h4 class="font-bold text-sm">Produk Terlengkap</h4>
                    <p class="text-xs text-gray-500">1300+ SKU Tersedia</p>
                </div>
            </div>
             <div class="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
                <div class="text-primary">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                    <h4 class="font-bold text-sm">Respon Cepat</h4>
                    <p class="text-xs text-gray-500">Admin Standby</p>
                </div>
            </div>
             <div class="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
                <div class="text-primary">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                </div>
                <div>
                    <h4 class="font-bold text-sm">Harga Terbaik</h4>
                    <p class="text-xs text-gray-500">Eceran & Bengkel</p>
                </div>
            </div>
             <div class="flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border">
                <div class="text-primary">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                </div>
                <div>
                    <h4 class="font-bold text-sm">Stok Ready</h4>
                    <p class="text-xs text-gray-500">Langsung Kirim</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Latest Products -->
    <section class="container mx-auto px-4 pb-12">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl md:text-2xl font-bold text-charcoal border-l-4 border-primary pl-3">Produk Terbaru</h2>
            <a href="#" class="text-primary text-sm hover:underline font-medium">Lihat Semua ></a>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            @forelse($latestProducts as $product)
                <div class="bg-white rounded-lg shadow hover:shadow-lg transition duration-300 border border-transparent hover:border-primary/30 group">
                    <a href="/produk/{{ $product->slug }}" class="block">
                        <div class="aspect-square bg-gray-200 w-full relative overflow-hidden rounded-t-lg">
                            <img src="{{ $product->image_path ? asset('storage/'.$product->image_path) : 'https://via.placeholder.com/300?text=GSM+Motor' }}" alt="{{ $product->name }}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                            <!-- Overlay Logo Watermark Mockup -->
                            <div class="absolute bottom-2 right-2 opacity-50">
                                <span class="text-[10px] font-bold text-white bg-black/50 px-1 rounded">GSM MOTOR</span>
                            </div>
                            <!-- Tiered Badge -->
                            @if($product->price_3_items)
                                <div class="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm z-10">
                                    Grosir
                                </div>
                            @endif
                        </div>
                        <div class="p-3">
                            <h3 class="text-sm text-gray-800 line-clamp-2 min-h-[40px] mb-2 group-hover:text-primary transition-colors">{{ $product->name }}</h3>
                            <div class="flex items-center justify-between">
                                <span class="text-base font-bold text-primary">Rp{{ number_format($product->price, 0, ',', '.') }}</span>
                            </div>
                             <!-- Tiered Price Teaser -->
                             @if($product->price_3_items)
                                <div class="mt-1 text-xs text-red-600 font-medium">
                                    Beli 3: Rp{{ number_format($product->price_3_items, 0, ',', '.') }}
                                </div>
                            @endif
                            <div class="mt-1 text-xs text-gray-500">
                                {{ $product->category->name }}
                            </div>
                        </div>
                    </a>
                </div>
            @empty
                <div class="col-span-full text-center py-12 text-gray-500">
                    Belum ada produk yang ditampilkan.
                </div>
            @endforelse
        </div>
    </section>
</div>
