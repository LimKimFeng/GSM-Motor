<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Checkout Pesanan') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    
                    <form action="{{ route('checkout.store') }}" method="POST">
                        @csrf

                        <!-- Alamat Pengiriman -->
                        <div class="mb-6 border-b pb-6">
                            <h3 class="text-lg font-bold mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Alamat Pengiriman
                            </h3>
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <p class="font-semibold">{{ $user->name }} ({{ $user->phone }})</p>
                                <p class="text-gray-600 mt-1">{{ $user->address_detail }}</p>
                                <p class="text-gray-600">{{ $user->district }}, {{ $user->city }}, {{ $user->province }}, {{ $user->postal_code }}</p>
                                <a href="{{ route('profile.edit') }}" class="text-sm text-blue-500 hover:underline mt-2 inline-block">Ubah Alamat</a>
                            </div>
                        </div>

                        <!-- Ringkasan Produk -->
                        <div class="mb-6 border-b pb-6">
                            <h3 class="text-lg font-bold mb-4">Ringkasan Pesanan</h3>
                            <ul class="space-y-3">
                                @foreach($cartItems as $item)
                                    <li class="flex justify-between items-center text-sm">
                                        <span>{{ $item->product->name }} <span class="text-gray-500">x{{ $item->quantity }}</span></span>
                                        <span class="font-semibold">Rp {{ number_format($item->product->price * $item->quantity, 0, ',', '.') }}</span>
                                    </li>
                                @endforeach
                            </ul>
                        </div>

                        <!-- Pilihan Kurir -->
                        <div class="mb-6 border-b pb-6">
                            <h3 class="text-lg font-bold mb-4">Pengiriman</h3>
                            <div class="w-full md:w-1/2">
                                <x-input-label for="courier" :value="__('Pilih Kurir')" />
                                <select id="courier" name="courier" class="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm" required onchange="updateTotal()">
                                    <option value="" disabled selected>-- Pilih Ekspedisi --</option>
                                    <option value="jne" data-cost="20000">JNE (Rp 20.000)</option>
                                    <option value="jnt" data-cost="25000">J&T (Rp 25.000)</option>
                                </select>
                            </div>
                        </div>

                        <!-- Total & Bayar -->
                        <div class="flex flex-col items-end">
                            <div class="w-full md:w-1/2 space-y-2 mb-6">
                                <div class="flex justify-between text-gray-600">
                                    <span>Subtotal Produk</span>
                                    <span>Rp {{ number_format($totalPrice, 0, ',', '.') }}</span>
                                </div>
                                <div class="flex justify-between text-gray-600">
                                    <span>Ongkos Kirim</span>
                                    <span id="shipping-cost">Rp 0</span>
                                </div>
                                <div class="flex justify-between text-xl font-bold text-orange-600 border-t pt-2">
                                    <span>Total Bayar</span>
                                    <span id="grand-total">Rp {{ number_format($totalPrice, 0, ',', '.') }}</span>
                                </div>
                            </div>

                            <button type="submit" class="w-full md:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-10 rounded-lg shadow-lg">
                                Buat Pesanan
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
    <script>
        function updateTotal() {
            const select = document.getElementById('courier');
            const selectedOption = select.options[select.selectedIndex];
            const cost = parseInt(selectedOption.getAttribute('data-cost')) || 0;
            const subtotal = {{ $totalPrice }};
            
            document.getElementById('shipping-cost').innerText = 'Rp ' + cost.toLocaleString('id-ID');
            document.getElementById('grand-total').innerText = 'Rp ' + (subtotal + cost).toLocaleString('id-ID');
        }
    </script>
    @endpush
</x-app-layout>
