<x-layouts.admin>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Tambah Produk Baru') }}
        </h2>
    </x-slot>

    <div class="py-6">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white overflow-hidden shadow-lg sm:rounded-xl border border-gray-100">
                <div class="p-8 text-gray-900">
                    
                    <form action="{{ route('admin.products.store') }}" method="POST" enctype="multipart/form-data">
                        @csrf
                        
                        <!-- Section 1: Basic Info & Categories -->
                        <div class="mb-8 border-b border-gray-100 pb-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">Informasi Dasar</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="col-span-2">
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                                    <input type="text" name="name" value="{{ old('name') }}" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary transition duration-150 ease-in-out" required placeholder="Contoh: Kampas Rem Depan Vario 150">
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    <select name="category_id" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-10 bg-white">
                                        @foreach($categories as $category)
                                            <option value="{{ $category->id }}">{{ $category->name }}</option>
                                        @endforeach
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Stok Awal</label>
                                    <input type="number" name="stock" value="{{ old('stock', 0) }}" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary font-bold text-gray-800" required min="0">
                                </div>
                            </div>
                        </div>

                        <!-- Section 2: Pricing (Tiered) -->
                        <div class="mb-8 border-b border-gray-100 pb-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <svg class="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Harga & Grosir
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-1">Harga Satuan (Rp)</label>
                                    <input type="number" name="price" value="{{ old('price') }}" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary" required placeholder="Contoh: 50000">
                                </div>
                                <div class="relative">
                                    <label class="block text-sm font-medium text-gray-600 mb-1">Harga Beli Min. 3</label>
                                    <input type="number" name="price_3_items" value="{{ old('price_3_items') }}" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50" placeholder="Opsional">
                                    <div class="absolute -top-2 -right-2 bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold">Grosir 1</div>
                                </div>
                                <div class="relative">
                                    <label class="block text-sm font-medium text-gray-600 mb-1">Harga Beli Min. 5</label>
                                    <input type="number" name="price_5_items" value="{{ old('price_5_items') }}" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-gray-50" placeholder="Opsional">
                                    <div class="absolute -top-2 -right-2 bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold">Grosir 2</div>
                                </div>
                            </div>
                        </div>

                        <!-- Section 3: Media (Multi-Upload) -->
                         <div class="mb-8" x-data="{ 
                            previews: [],
                            fileList: new DataTransfer(),
                            
                            addImages(files) {
                                Array.from(files).forEach(file => {
                                    this.fileList.items.add(file);
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                        this.previews.push({
                                            id: Date.now() + Math.random(),
                                            src: e.target.result,
                                            name: file.name
                                        });
                                    };
                                    reader.readAsDataURL(file);
                                });
                                this.syncFiles();
                            },
                            
                            removeImage(index) {
                                this.previews.splice(index, 1);
                                const newDataTransfer = new DataTransfer();
                                Array.from(this.fileList.files).forEach((file, i) => {
                                    if (i !== index) newDataTransfer.items.add(file);
                                });
                                this.fileList = newDataTransfer;
                                this.syncFiles();
                            },
                            
                            syncFiles() {
                                $refs.fileInput.files = this.fileList.files;
                            }
                         }">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">Foto Produk (Multi-Upload)</h3>
                            
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <!-- Preview Loop -->
                                <template x-for="(img, index) in previews" :key="img.id">
                                    <div class="aspect-square rounded-lg border border-gray-200 overflow-hidden shadow-sm relative group">
                                        <img :src="img.src" class="w-full h-full object-cover">
                                        <button type="button" @click="removeImage(index)" 
                                                class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md hover:bg-red-600">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                </template>
                                
                                <!-- Upload Button / Placeholder -->
                                <div class="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition cursor-pointer relative"
                                     @click="$refs.fileInput.click()">
                                    <svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                                    <span class="text-xs font-medium">Tambah Foto</span>
                                </div>
                            </div>

                            <input x-ref="fileInput" type="file" name="images[]" multiple class="hidden"
                                   @change="addImages($event.target.files)">
                            <p class="text-xs text-gray-500">Bisa pilih lebih dari 1 foto sekaligus. Format: JPG/PNG/WEBP. Max 10MB.</p>
                        </div>

                        <!-- Section 4: Details -->
                        <div class="mb-8">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi Lengkap</label>
                            <textarea name="description" rows="4" class="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary" placeholder="Jelaskan spesifikasi dan keunggulan produk...">{{ old('description') }}</textarea>
                        </div>

                        <!-- Actions -->
                        <div class="flex justify-end items-center space-x-4 pt-4 border-t border-gray-100">
                            <a href="{{ route('admin.products.index') }}" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition shadow-sm">
                                Batal
                            </a>
                            <button type="submit" class="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-red-600 font-medium shadow-md transition transform hover:-translate-y-0.5">
                                Simpan Produk
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-layouts.admin>
