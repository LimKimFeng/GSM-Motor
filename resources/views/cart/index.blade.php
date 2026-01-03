<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Keranjang Belanja') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    
                    @if(session('success'))
                        <div class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                            <span class="block sm:inline">{{ session('success') }}</span>
                        </div>
                    @endif

                    @if($cartItems->isEmpty())
                        <div class="text-center py-10">
                            <p class="text-gray-500 text-lg">Keranjang belanja Anda kosong.</p>
                            <a href="/" class="mt-4 inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
                                Mulai Belanja
                            </a>
                        </div>
                    @else
                        <!-- Cart Items -->
                        <div class="space-y-4">
                            @foreach($cartItems as $item)
                                <div class="flex flex-col sm:flex-row items-center border-b pb-4 gap-4">
                                    <div class="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                                        {{-- Image Logic --}}
                                        @if($item->product->images && $item->product->images->count() > 0)
                                            <img src="{{ Storage::url($item->product->images->first()->image_path) }}" alt="{{ $item->product->name }}" class="w-full h-full object-cover">
                                        @else
                                            <div class="flex items-center justify-center h-full text-gray-400">No Img</div>
                                        @endif
                                    </div>

                                    <div class="flex-1 w-full text-center sm:text-left">
                                        <h3 class="text-lg font-semibold">{{ $item->product->name }}</h3>
                                        <p class="text-orange-600 font-bold">Rp {{ number_format($item->product->price, 0, ',', '.') }}</p>
                                    </div>

                                    <div class="flex items-center gap-2">
                                        <form action="{{ route('cart.update', $item->id) }}" method="POST" class="flex items-center">
                                            @csrf
                                            @method('PATCH')
                                            
                                            {{-- Decrease --}}
                                            <button type="submit" name="quantity" value="{{ $item->quantity - 1 }}" 
                                                class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                                {{ $item->quantity <= 1 ? 'disabled opacity-50' : '' }}>
                                                -
                                            </button>

                                            <input type="text" value="{{ $item->quantity }}" readonly class="w-12 text-center border-0 focus:ring-0 font-semibold text-gray-700">

                                            {{-- Increase --}}
                                            <button type="submit" name="quantity" value="{{ $item->quantity + 1 }}" 
                                                class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">
                                                +
                                            </button>
                                        </form>

                                        <form action="{{ route('cart.remove', $item->id) }}" method="POST" class="ml-4">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="text-red-500 hover:text-red-700">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            @endforeach
                        </div>

                        <!-- Footer -->
                        <div class="mt-8 bg-gray-50 p-6 rounded-lg flex flex-col sm:flex-row justify-between items-center shadow-inner">
                            <div class="text-lg font-semibold text-gray-700 mb-4 sm:mb-0">
                                Total Pembayaran: <span class="text-2xl text-orange-600 font-bold ml-2">Rp {{ number_format($total, 0, ',', '.') }}</span>
                            </div>
                            
                            <a href="{{ route('checkout.index') }}" class="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition transform hover:scale-105">
                                Checkout Sekarang
                            </a>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
