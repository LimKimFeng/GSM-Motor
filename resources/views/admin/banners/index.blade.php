<x-layouts.admin>
    <x-slot name="header">
        <div class="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
            <div>
                <h2 class="font-bold text-2xl text-gray-800 leading-tight">
                    {{ __('Manajemen Banner') }}
                </h2>
                <p class="text-sm text-gray-500 mt-1">Kelola banner promo yang tampil di halaman depan.</p>
            </div>
            <a href="{{ route('admin.banners.create') }}" class="mt-4 sm:mt-0 bg-primary hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition transform hover:-translate-y-0.5 flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Tambah Banner
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
                                    <th scope="col" class="px-6 py-4">Preview</th>
                                    <th scope="col" class="px-6 py-4">Judul (Opsional)</th>
                                    <th scope="col" class="px-6 py-4">Status</th>
                                    <th scope="col" class="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                @forelse($banners as $banner)
                                    <tr class="hover:bg-gray-50 transition duration-150">
                                        <td class="px-6 py-4">
                                            <div class="h-20 w-36 overflow-hidden rounded-lg shadow-sm border border-gray-200 bg-gray-100">
                                                <img src="{{ asset('storage/' . $banner->image_path) }}" class="object-cover w-full h-full">
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 font-medium text-gray-900">
                                            {{ $banner->title ?? '-' }}
                                        </td>
                                        <td class="px-6 py-4">
                                            @if($banner->is_active)
                                                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                                    Aktif
                                                </span>
                                            @else
                                                <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                                                    Tidak Aktif
                                                </span>
                                            @endif
                                        </td>
                                        <td class="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                                            <form action="{{ route('admin.banners.destroy', $banner->id) }}" method="POST" class="inline-block" onsubmit="return confirm('Yakin hapus banner ini?')">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition border border-transparent hover:border-red-200">Hapus</button>
                                            </form>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                                            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p class="mt-2 text-sm font-medium text-gray-900">Belum ada banner.</p>
                                            <p class="mt-1 text-sm text-gray-500">Mulai dengan menambahkan banner baru.</p>
                                            <div class="mt-6">
                                                <a href="{{ route('admin.banners.create') }}" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                                    <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                                                    </svg>
                                                    Tambah Banner
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-layouts.admin>
