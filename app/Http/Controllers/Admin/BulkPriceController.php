<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BulkPriceController extends Controller
{
    public function index()
    {
        return view('admin.bulk-price');
    }

    public function update(Request $request, \App\Actions\Product\BulkPriceUpdateAction $action)
    {
        $request->validate([
            'percentage' => 'required|numeric|min:-100|max:100',
        ]);

        $percentage = $request->input('percentage');
        
        $count = $action->execute($percentage);

        return redirect()->route('admin.bulk-price.index')
            ->with('success', "Harga dari {$count} produk berhasil diperbarui sebesar {$percentage}%.");
    }
}
