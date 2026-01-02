<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use App\Models\ProductImage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with('category')
             ->orderByRaw("CASE WHEN stock < 10 THEN 0 ELSE 1 END, stock ASC")
             ->latest()
             ->paginate(20);

        return view('admin.products.index', compact('products'));
    }

    public function create()
    {
        $categories = Category::all();
        return view('admin.products.create', compact('categories'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric',
            'price_3_items' => 'nullable|numeric',
            'price_5_items' => 'nullable|numeric',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable',
            'images.*' => 'nullable|image|max:10240', // 10MB max per image
        ]);

        $validated['slug'] = Str::slug($request->name . '-' . rand(1000,9999));

        // Create product first without images
        $product = Product::create($validated);

        if ($request->hasFile('images')) {
            $images = $request->file('images');
            
            foreach ($images as $index => $image) {
                // Determine file path
                $filename = time() . '_' . uniqid() . '_' . $index . '.webp';
                $path = 'products/' . $filename;
                
                // Process Image (WebP + Resize)
                $this->processAndSaveImage($image, $path);

                // Save to ProductImage gallery
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path
                ]);

                // Set Primary Image (first one)
                if ($index === 0) {
                    $product->image_path = $path;
                    $product->save();
                }
            }
        }

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil ditambahkan.');
    }

    public function edit(string $id)
    {
        $product = Product::with('images')->findOrFail($id);
        $categories = Category::all();
        return view('admin.products.edit', compact('product', 'categories'));
    }

    public function update(Request $request, string $id)
    {
        $product = Product::findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric',
            'price_3_items' => 'nullable|numeric',
            'price_5_items' => 'nullable|numeric',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable',
            'images.*' => 'nullable|image|max:10240',
        ]);

        $product->update($validated);

        if ($request->hasFile('images')) {
            $images = $request->file('images');

            foreach ($images as $index => $image) {
                $filename = time() . '_' . uniqid() . '_' . $index . '.webp';
                $path = 'products/' . $filename;

                $this->processAndSaveImage($image, $path);

                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path
                ]);
                
                // Update primary image if it doesn't exist
                if (!$product->image_path) {
                    $product->image_path = $path;
                    $product->save();
                }
            }
        }

        return redirect()->route('admin.products.index')->with('success', 'Produk berhasil diperbarui.');
    }

    public function destroy(string $id)
    {
        if (!\Illuminate\Support\Facades\Auth::user()->isAdmin()) {
            abort(403, 'Anda tidak memiliki hak akses untuk menghapus produk.');
        }

        $product = Product::findOrFail($id);
        
        // Generally we should delete images from storage too, but for MVP soft delete or DB delete is fine.
        // ProductImage cascade delete will handle DB records, but files remain. 
        // Implementing file cleanup loop:
        foreach($product->images as $img) {
             if (file_exists(storage_path('app/public/' . $img->image_path))) {
                unlink(storage_path('app/public/' . $img->image_path));
            }
        }
        
        $product->delete();
        
        return redirect()->route('admin.products.index')->with('success', 'Produk dihapus.');
    }

    private function processAndSaveImage($image, $path)
    {
        $fullPath = storage_path('app/public/' . $path);
        $directory = dirname($fullPath);
        
        if (!file_exists($directory)) {
            mkdir($directory, 0755, true);
        }

        $img = Image::read($image);
        if ($img->width() > 800 || $img->height() > 800) {
            $img->scaleDown(width: 800, height: 800);
        }
        $img->toWebp(quality: 80)->save($fullPath);
    }
}
