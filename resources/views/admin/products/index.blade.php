<x-layouts.admin>
    <x-slot name="header">
        <div class="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
            <div>
                <h2 class="font-bold text-2xl text-gray-800 leading-tight">
                    {{ __('Manajemen Produk') }}
                </h2>
                <p class="text-sm text-gray-500 mt-1">Kelola stok dan harga produk Anda disini.</p>
            </div>
            <a href="{{ route('admin.products.create') }}" class="mt-4 sm:mt-0 bg-primary hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition transform hover:-translate-y-0.5 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Tambah Produk
            </a>
        </div>
    </x-slot>

    <div class="py-2">
        <div class="max-w-7xl mx-auto">
            <div class="bg-white overflow-hidden shadow-lg sm:rounded-xl border border-gray-100">
                <div class="p-6 text-gray-900">
                    
                    @if(session('success'))
                        <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-r shadow-sm mb-6 flex items-start" role="alert">
                            <svg class="h-5 w-5 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                            <p>{{ session('success') }}</p>
                        </div>
                    @endif

                    <div class="overflow-x-auto rounded-lg border border-gray-200">
                        <table class="min-w-full text-left text-sm whitespace-nowrap">
                            <thead class="uppercase tracking-wider border-b border-gray-200 bg-gray-50 text-gray-500 font-semibold">
                                <tr>
                                    <th scope="col" class="px-6 py-4">Nama Produk</th>
                                    <th scope="col" class="px-6 py-4">Kategori</th>
                                    <th scope="col" class="px-6 py-4">Harga</th>
                                    <th scope="col" class="px-6 py-4">Stok</th>
                                    <th scope="col" class="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                @foreach($products as $product)
                                    <tr class="hover:bg-gray-50 transition duration-150 {{ $product->stock < 10 ? 'bg-red-50' : '' }}">
                                        <td class="px-6 py-4">
                                            <div class="flex items-center">
                                                @if($product->image_path)
                                                    <img class="h-12 w-12 rounded-lg object-cover mr-4 shadow-sm border border-gray-200" src="{{ asset('storage/' . $product->image_path) }}" alt="" />
                                                @else
                                                    <div class="h-12 w-12 rounded-lg bg-gray-100 mr-4 flex items-center justify-center text-gray-400 border border-gray-200">
                                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    </div>
                                                @endif
                                                <div class="flex flex-col">
                                                    <span class="font-bold text-gray-800 text-base">{{ $product->name }}</span>
                                                    @if($product->stock < 10)
                                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1 max-w-max">
                                                            <svg class="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                                                            Stok Menipis!
                                                        </span>
                                                    @endif
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                                                {{ $product->category->name }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 font-medium text-gray-900">Rp{{ number_format($product->price, 0, ',', '.') }}</td>
                                        <td class="px-6 py-4">
                                            <span class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full {{ $product->stock < 10 ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-green-100 text-green-800 border border-green-200' }}">
                                                {{ $product->stock }} Unit
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                                            <a href="{{ route('admin.products.edit', $product->id) }}" class="text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-md shadow-sm mr-2 transition">Edit / Refill</a>
                                            @if(Auth::user()->isAdmin())
                                                <form action="{{ route('admin.products.destroy', $product->id) }}" method="POST" class="inline-block" onsubmit="return confirm('Yakin hapus? Tindakan ini tidak dapat dibatalkan.')">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit" class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition border border-transparent hover:border-red-200">Hapus</button>
                                                </form>
                                            @endif
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                     <div class="mt-6 px-2">
                        {{ $products->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-layouts.admin>
