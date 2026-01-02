<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin User (Full Access)
        User::create([
            'name' => 'Admin GSM',
            'email' => 'admin@gsm-motor.com',
            'password' => bcrypt('AdminGsmStrongPass2026!'), 
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Sub-admin Users (Limited Access)
        for ($i = 1; $i <= 3; $i++) {
            User::create([
                'name' => 'Sub Admin ' . $i,
                'email' => 'subadmin' . $i . '@gsm-motor.com',
                'password' => bcrypt('password'), // simple password for staff based on request
                'role' => 'subadmin',
                'email_verified_at' => now(),
            ]);
        }

        // Specific Categories
        $categories = [
            // Mesin
            'Piston & Ring', 'Blok Silinder', 'Klep & Noken As', 'Karburator & Injeksi', 'Filter Udara',
            
            // Kelistrikan
            'Aki / Baterai', 'Lampu & Bohlam', 'Kabel Body', 'CDI / ECU', 'Kiprok', 'Spul',

            // Pengereman
            'Kampas Rem Depan', 'Kampas Rem Belakang', 'Piringan Cakram', 'Master Rem', 'Minyak Rem',

            // Transmisi
            'Kampas Kopling', 'V-Belt & Roller', 'Rantai & Gear Set',

            // Kaki-kaki
            'Shockbreaker Depan', 'Shockbreaker Belakang', 'Bearing Roda', 'Ban Luar', 'Ban Dalam', 'Velg',

            // Body Part
            'Spion', 'Cover Body', 'Jok & Sarung Jok',

            // Oli & Cairan
            'Oli Mesin MPX', 'Oli Mesin Shell', 'Oli Gardan', 'Radiator Coolant'
        ];

        foreach ($categories as $cat) {
            \App\Models\Category::create(['name' => $cat, 'slug' => \Illuminate\Support\Str::slug($cat)]);
        }

        // Dummy Products (Total 50+)
        $catIds = \App\Models\Category::pluck('id');
        
        for ($i = 1; $i <= 60; $i++) {
            \App\Models\Product::create([
                'category_id' => $catIds->random(),
                'name' => 'Sparepart Contoh #' . $i . ' - ' . \Illuminate\Support\Str::random(5),
                'slug' => 'sparepart-contoh-' . $i . '-' . \Illuminate\Support\Str::random(5),
                'description' => 'Deskripsi lengkap untuk sparepart contoh nomor ' . $i . '. Kualitas orisinal dan terjamin.',
                'price' => rand(15000, 500000), // Random price
                'stock' => rand(0, 50), // Random stock 0-50
                'image_path' => null, // No image for dummy
            ]);
        }

        // Banners
        \App\Models\Banner::create(['title' => 'Banner 1', 'image_path' => 'banners/dummy1.jpg', 'order' => 1]);
        \App\Models\Banner::create(['title' => 'Banner 2', 'image_path' => 'banners/dummy2.jpg', 'order' => 2]);
    }
}
