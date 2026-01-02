<x-layouts.admin>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Modifikasi Harga Massal') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900">
                    
                    @if(session('success'))
                        <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <strong class="font-bold">Berhasil!</strong>
                            <span class="block sm:inline">{{ session('success') }}</span>
                        </div>
                    @endif

                    <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <div class="flex">
                            <div class="flex-shrink-0">
                                <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                                </svg>
                            </div>
                            <div class="ml-3">
                                <p class="text-sm text-yellow-700">
                                    <strong>PERINGATAN:</strong> Tindakan ini akan mengubah harga <strong>SELURUH</strong> produk yang aktif. 
                                    Pastikan angka yang Anda masukkan sudah benar sebelum melakukan update.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form action="{{ route('admin.bulk-price.update') }}" method="POST" class="max-w-md mx-auto" onsubmit="return confirm('Apakah Anda yakin ingin mengubah harga seluruh produk? Tindakan ini tidak dapat dibatalkan.');">
                        @csrf
                        
                        <div class="mb-6">
                            <label for="percentage" class="block mb-2 text-sm font-medium text-gray-900">Persentase Perubahan (%)</label>
                            <div class="relative">
                                <input type="number" id="percentage" name="percentage" step="0.01" min="-100" max="100" 
                                    class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                                    placeholder="Contoh: 5 atau -3" required>
                                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    %
                                </div>
                            </div>
                            <p class="mt-2 text-sm text-gray-500">
                                Masukkan angka positif untuk menaikkan harga (cth: 5 untuk +5%) <br>
                                Masukkan angka negatif untuk menurunkan harga (cth: -3 untuk -3%).
                            </p>
                            @error('percentage')
                                <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center">
                            Update Harga Sekarang
                        </button>
                    </form>

                </div>
            </div>
        </div>
    </div>
</x-layouts.admin>
