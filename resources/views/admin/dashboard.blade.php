<x-layouts.admin>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Admin Dashboard') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Stats -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Statistik</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <span class="text-blue-600 font-bold text-2xl">{{ $totalProducts }}</span>
                            <p class="text-sm text-gray-600">Total Produk</p>
                        </div>
                         <div class="bg-green-50 p-4 rounded-lg">
                            <span class="text-green-600 font-bold text-2xl">{{ $totalCategories }}</span>
                            <p class="text-sm text-gray-600">Total Kategori</p>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                     <h3 class="text-lg font-medium text-gray-900 mb-4">Aksi Cepat</h3>
                     <div class="space-y-4">
                        <a href="{{ route('admin.bulk-price.index') }}" class="block w-full text-center px-4 py-2 bg-primary text-green-500 rounded hover:bg-red-600 transition">
                            Modifikasi Harga Massal
                        </a>
                        <button class="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
                            Upload Banner Baru
                        </button>
                     </div>
                </div>
            </div>

            <!-- Low Stock Alerts -->
            @if($lowStockProducts->count() > 0)
            <div class="mt-6 bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 border-l-4 border-red-500">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-red-600">Perhatian: Stok Menipis (<10)</h3>
                    <a href="{{ route('admin.products.index') }}" class="text-sm text-blue-600 hover:underline">Lihat Semua</a>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full text-left text-sm whitespace-nowrap">
                        <thead class="uppercase tracking-wider border-b-2 border-gray-200 bg-gray-50">
                            <tr>
                                <th scope="col" class="px-6 py-3">Nama Produk</th>
                                <th scope="col" class="px-6 py-3">Kategori</th>
                                <th scope="col" class="px-6 py-3">Sisa Stok</th>
                                <th scope="col" class="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @foreach($lowStockProducts as $product)
                                <tr class="border-b hover:bg-gray-50">
                                    <td class="px-6 py-4">{{ $product->name }}</td>
                                    <td class="px-6 py-4">{{ $product->category->name }}</td>
                                    <td class="px-6 py-4 font-bold text-red-600">{{ $product->stock }}</td>
                                    <td class="px-6 py-4 text-right">
                                        <a href="{{ route('admin.products.edit', $product->id) }}" class="text-blue-600 hover:text-blue-900">Refill Stok</a>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
            @endif
</x-layouts.admin>
