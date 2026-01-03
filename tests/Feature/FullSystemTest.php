<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\CartItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

use Illuminate\Foundation\Testing\DatabaseTransactions;

class FullSystemTest extends TestCase
{
    use DatabaseTransactions;

    public function test_user_can_add_to_cart_and_checkout()
    {
        // 1. Setup User & Product
        $user = User::factory()->create([
            'phone' => '081234567890',
            'province' => 'Jawa Timur',
            'city' => 'Malang',
            'district' => 'Lowokwaru',
            'postal_code' => '65141',
            'address_detail' => 'Jl. Test 123',
        ]);

        $category = \App\Models\Category::create(['name' => 'Test Category', 'slug' => 'test-category']);

        $product = Product::create([
            'name' => 'Test Product',
            'category_id' => $category->id, 
            'slug' => 'test-product',
            'description' => 'Desc',
            'price' => 50000,
            'price_3_items' => 100,
            'price_5_items' => 100, 
            'stock' => 10,
            'image_path' => 'img.jpg'
        ]);

        $this->actingAs($user);

        // 2. Add to Cart
        $response = $this->post(route('cart.add'), [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);
        
        $response->assertRedirect();
        $this->assertDatabaseHas('cart_items', [
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        // 3. View Cart
        $response = $this->get(route('cart.index'));
        $response->assertStatus(200);
        $response->assertSee('Test Product');

        // 4. Checkout
        // Mock DB Transaction if needed, but not strictly necessary with RefreshDatabase
        
        $response = $this->post(route('checkout.store'), [
            'courier' => 'jne',
        ]);

        $response->assertRedirect(); // Should redirect to order show

        // 5. Verify Order Created
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'shipping_cost' => 20000,
            'courier' => 'JNE',
            'status' => 'pending',
        ]);

        $order = \App\Models\Order::where('user_id', $user->id)->first();
        
        // 6. Verify Order Items
        $this->assertDatabaseHas('order_items', [
            'order_id' => $order->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'price_at_purchase' => 50000,
        ]);

        // 7. Verify Cart Empty
        $this->assertDatabaseMissing('cart_items', [
            'user_id' => $user->id,
        ]);
        
        // 8. View Order Detail
        $response = $this->get(route('order.show', $order->id));
        $response->assertStatus(200);
        $response->assertSee('#' . $order->order_number);
    }
}
