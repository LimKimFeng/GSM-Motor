<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Auth::user()->orders()->with('items.product')->latest()->get();
        return view('order.index', compact('orders'));
    }

    public function show($id)
    {
        $order = Order::with('items.product.images')->where('user_id', Auth::id())->findOrFail($id);
        return view('order.show', compact('order'));
    }
}
