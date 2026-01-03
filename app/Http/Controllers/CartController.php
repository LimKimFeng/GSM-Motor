<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function index()
    {
        $cartItems = Auth::user()->cartItems()->with('product.images')->get(); // Assuming product has images
        $total = $cartItems->sum(fn($item) => $item->quantity * $item->product->price);

        return view('cart.index', compact('cartItems', 'total'));
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $existing = CartItem::where('user_id', Auth::id())
                            ->where('product_id', $request->product_id)
                            ->first();

        if ($existing) {
            $existing->increment('quantity', $request->quantity);
        } else {
            CartItem::create([
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan ke keranjang.');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $item = CartItem::where('user_id', Auth::id())->where('id', $id)->firstOrFail();
        $item->update(['quantity' => $request->quantity]);

        return redirect()->back()->with('success', 'Jumlah produk diperbarui.');
    }

    public function remove($id)
    {
        CartItem::where('user_id', Auth::id())->where('id', $id)->delete();
        return redirect()->back()->with('success', 'Produk dihapus dari keranjang.');
    }
}
