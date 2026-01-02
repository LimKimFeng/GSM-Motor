<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return view('admin.dashboard', [
             'totalProducts' => \App\Models\Product::count(),
             'totalCategories' => \App\Models\Category::count(),
             'lowStockProducts' => \App\Models\Product::where('stock', '<', 10)->take(5)->get(),
        ]);
    }
}
