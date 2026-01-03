<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->after('id');
            $table->string('phone')->nullable()->after('email'); // User requested phone
            $table->string('province')->nullable()->after('remember_token');
            $table->string('city')->nullable()->after('province');
            $table->string('district')->nullable()->after('city');
            $table->string('postal_code')->nullable()->after('district');
            $table->text('address_detail')->nullable()->after('postal_code');
            $table->string('otp_code', 6)->nullable()->after('address_detail');
            $table->timestamp('otp_expires_at')->nullable()->after('otp_code');
            
            // Modify password to be nullable
            $table->string('password')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'google_id', 
                'phone', 
                'province', 
                'city', 
                'district', 
                'postal_code', 
                'address_detail', 
                'otp_code', 
                'otp_expires_at'
            ]);
            
            // Revert password to not null (caution: this might fail if there are null passwords)
            $table->string('password')->nullable(false)->change();
        });
    }
};
