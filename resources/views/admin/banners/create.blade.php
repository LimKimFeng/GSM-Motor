<x-layouts.admin>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Tambah Banner Baru') }}
        </h2>
    </x-slot>

    <div class="py-6">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-lg sm:rounded-xl border border-gray-100">
                <div class="p-8 text-gray-900">
                    
                    <form action="{{ route('admin.banners.store') }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <!-- Left: Form Fields -->
                            <div class="space-y-6">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Judul Banner (Opsional)</label>
                                    <input type="text" name="title" value="{{ old('title') }}" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary transition" placeholder="Contoh: Promo Akhir Tahun">
                                </div>

                                <div class="flex items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <input type="checkbox" name="active" value="1" id="active" class="rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring-primary h-5 w-5" checked>
                                    <label for="active" class="ml-3 block text-sm font-bold text-gray-700">
                                        Status Aktif
                                    </label>
                                    <span class="ml-auto text-xs text-gray-500">Tampilkan di Landing Page?</span>
                                </div>
                            </div>

                            <!-- Right: Image Upload -->
                            <div x-data="{ imagePreview: null }">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Foto Banner (Wajib)</label>
                                
                                 <!-- Preview Container (16:9 Aspect Ratio for Banners) -->
                                <div class="mb-4 w-full relative pt-[56.25%] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden" 
                                     :class="{ 'border-primary': imagePreview }">
                                    
                                    <!-- Placeholder when no image -->
                                    <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-400" x-show="!imagePreview">
                                        <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                        <span class="text-sm">Preview 16:9</span>
                                    </div>

                                    <!-- Image Preview -->
                                    <img :src="imagePreview" class="absolute inset-0 w-full h-full object-cover" x-show="imagePreview" style="display: none;">
                                </div>

                                <input type="file" name="image" required class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-primary hover:file:bg-orange-100 transition"
                                       @change="
                                            const file = $event.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (e) => {
                                                    imagePreview = e.target.result;
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                       ">
                                <p class="text-xs text-gray-400 mt-2">Disarankan 1920x1080px (Landscape). Max 2MB.</p>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="flex justify-end items-center space-x-4 pt-4 border-t border-gray-100">
                            <a href="{{ route('admin.banners.index') }}" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition shadow-sm">
                                Batal
                            </a>
                            <button type="submit" class="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-red-600 font-medium shadow-md transition transform hover:-translate-y-0.5">
                                Simpan Banner
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-layouts.admin>
