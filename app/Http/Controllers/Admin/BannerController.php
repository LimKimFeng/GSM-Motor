<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Banner;
use Intervention\Image\Laravel\Facades\Image;
use Illuminate\Support\Facades\Storage;

class BannerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $banners = Banner::orderBy('order')->orderByDesc('created_at')->get();
        return view('admin.banners.index', compact('banners'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('admin.banners.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'required|image|max:2048', // 2MB Max
            'active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = 'banner_' . time() . '_' . uniqid() . '.webp';
            $path = 'banners/' . $filename;

            // Resize to max width 1920 (HD) and encode as WebP
            $img = Image::read($image);
            
            if ($img->width() > 1920) {
                $img->scaleDown(width: 1920);
            }

            // Save to storage
            $fullPath = storage_path('app/public/' . $path);
            $directory = dirname($fullPath);
            
            if (!file_exists($directory)) {
                mkdir($directory, 0755, true);
            }

            $img->toWebp(quality: 85)->save($fullPath);
            
            // Create banner
            Banner::create([
                'title' => $validated['title'],
                'image_path' => $path,
                'is_active' => $request->has('active'),
                'order' => Banner::count() + 1,
            ]);
        }

        return redirect()->route('admin.banners.index')->with('success', 'Banner berhasil ditambahkan.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $banner = Banner::findOrFail($id);
        
        // Delete file
        if ($banner->image_path && Storage::disk('public')->exists($banner->image_path)) {
            Storage::disk('public')->delete($banner->image_path);
        }

        $banner->delete();

        return redirect()->route('admin.banners.index')->with('success', 'Banner dihapus.');
    }
}
