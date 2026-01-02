<?php

namespace App\Actions\Product;

use Illuminate\Support\Facades\DB;
use App\Models\Product;
use Carbon\Carbon;

class BulkPriceUpdateAction
{
    /**
     * Update product prices by a percentage.
     *
     * @param float $percentage
     * @return int Number of products updated
     */
    public function execute(float $percentage): int
    {
        return DB::transaction(function () use ($percentage) {
            // Using raw SQL for performance and to handle the rounding logic directly in the database is more efficient,
            // but for readability and since we might want to trigger model events (if any), iterating or a bulk update is valid.
            // Given 1300+ items, a direct SQL update is best.
            
            // Formula: New Price = CEIL((Price * (1 + Percentage / 100)) / 100) * 100
            
            $affected = DB::update("
                UPDATE products 
                SET price = CEIL((price * (1 + ? / 100)) / 100) * 100,
                    last_price_update = ?
            ", [$percentage, Carbon::now()]);

            return $affected;
        });
    }
}
