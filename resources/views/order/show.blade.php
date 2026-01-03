<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Detail Pesanan') }} #{{ $order->order_number }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    
                    @if(session('success'))
                        <div class="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                            {{ session('success') }}
                        </div>
                    @endif

                    <!-- Detail Info -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b pb-6">
                        <div>
                            <h3 class="font-bold text-gray-600 mb-2">Informasi Pengiriman</h3>
                            <p class="text-gray-800">{{ $order->shipping_address }}</p>
                            <p class="text-gray-500 mt-2">Kurir: {{ $order->courier }}</p>
                            @if($order->tracking_number)
                                <p class="text-blue-600 font-bold mt-1">Resi: {{ $order->tracking_number }}</p>
                            @endif
                        </div>
                        <div class="text-right">
                            <h3 class="font-bold text-gray-600 mb-2">Status</h3>
                             <span class="px-3 py-1 font-semibold leading-tight rounded-full inline-block
                                {{ $order->status === 'completed' ? 'text-green-700 bg-green-100' : 
                                   ($order->status === 'cancelled' ? 'text-red-700 bg-red-100' : 'text-yellow-700 bg-yellow-100') }}">
                                {{ ucfirst($order->status) }}
                            </span>
                            <p class="text-sm text-gray-500 mt-2">{{ $order->created_at->format('d M Y H:i') }}</p>
                        </div>
                    </div>

                    <!-- Items -->
                    <div class="mb-8">
                        <h3 class="font-bold text-lg mb-4">Produk</h3>
                        <div class="space-y-4">
                            @foreach($order->items as $item)
                                <div class="flex items-center justify-between border-b pb-2">
                                    <div class="flex items-center gap-4">
                                        <div class="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                                             @if($item->product->images && $item->product->images->count() > 0)
                                                <img src="{{ Storage::url($item->product->images->first()->image_path) }}" alt="{{ $item->product->name }}" class="w-full h-full object-cover">
                                            @else
                                                <div class="flex items-center justify-center h-full text-xs text-gray-400">No Img</div>
                                            @endif
                                        </div>
                                        <div>
                                            <p class="font-medium">{{ $item->product->name }}</p>
                                            <p class="text-sm text-gray-500">{{ $item->quantity }} x Rp {{ number_format($item->price_at_purchase, 0, ',', '.') }}</p>
                                        </div>
                                    </div>
                                    <p class="font-bold">Rp {{ number_format($item->price_at_purchase * $item->quantity, 0, ',', '.') }}</p>
                                </div>
                            @endforeach
                        </div>
                    </div>

                    <!-- Summary -->
                    <div class="flex flex-col items-end border-t pt-6 bg-gray-50 p-4 rounded-lg">
                        <div class="w-full md:w-1/2 space-y-2">
                            <div class="flex justify-between">
                                <span>Ongkos Kirim</span>
                                <span>Rp {{ number_format($order->shipping_cost, 0, ',', '.') }}</span>
                            </div>
                            <div class="flex justify-between text-xl font-bold text-orange-600 border-t pt-2">
                                <span>Total Tagihan</span>
                                <span>Rp {{ number_format($order->total_price, 0, ',', '.') }}</span>
                            </div>
                        </div>

                        @if($order->status == 'pending')
                            <div class="mt-6 w-full md:w-auto">
                                <a href="https://wa.me/6281234567890?text=Halo%20Admin%20GSM%20Motor%2C%20saya%20konfirmasi%20pembayaran%20untuk%20Order%20%23{{ $order->order_number }}%20sebesar%20Rp%20{{ number_format($order->total_price, 0, ',', '.') }}" 
                                   target="_blank"
                                   class="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow transition">
                                    <span class="flex items-center justify-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-current" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-4-10.5-6.8z"/></svg>
                                        Konfirmasi Pembayaran via WA
                                    </span>
                                </a>
                                <p class="text-xs text-gray-400 mt-2 text-center">*Klik untuk langsung mengirim riwayat order ke Admin</p>
                            </div>
                        @else
                            <div class="mt-6 text-center text-gray-500 font-semibold">
                                Order {{ ucfirst($order->status) }}
                            </div>
                        @endif

                    </div>

                </div>
            </div>
        </div>
    </div>
</x-app-layout>
