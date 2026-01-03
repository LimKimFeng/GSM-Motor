<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $cartItems = $user->cartItems()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Keranjang belanja kosong.');
        }

        $totalPrice = $cartItems->sum(fn($item) => $item->quantity * $item->product->price);

        // Check if address is complete
        if (empty($user->address_detail) || empty($user->phone)) {
            return redirect()->route('profile.edit')->with('status', 'Silakan lengkapi alamat dan nomor telepon sebelum checkout.');
        }

        return view('checkout.index', compact('user', 'cartItems', 'totalPrice'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'courier' => 'required|in:jne,jnt',
        ]);

        $user = Auth::user();
        $cartItems = $user->cartItems()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart.index');
        }

        $totalPrice = $cartItems->sum(fn($item) => $item->quantity * $item->product->price);
        
        // Mock Shipping Cost
        // JNE = 20000, JnT = 25000 (Example)
        $shippingCost = $request->courier === 'jne' ? 20000 : 25000;
        
        DB::beginTransaction();
        try {
            $order = Order::create([
                'order_number' => 'GSM-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
                'user_id' => $user->id,
                'total_price' => $totalPrice + $shippingCost,
                'shipping_cost' => $shippingCost,
                'courier' => strtoupper($request->courier),
                'status' => 'pending',
                'shipping_address' => "{$user->address_detail}, {$user->district}, {$user->city}, {$user->province}, {$user->postal_code} (Telp: {$user->phone})",
            ]);

            foreach ($cartItems as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price_at_purchase' => $item->product->price,
                ]);
            }

            // Clear Cart
            $user->cartItems()->delete();

            DB::commit();

            return redirect()->route('order.show', $order->id)->with('success', 'Pesanan berhasil dibuat!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Terjadi kesalahan saat memproses pesanan: ' . $e->getMessage());
        }
    }
}
