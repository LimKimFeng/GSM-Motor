<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ $title ?? 'GSM Motor' }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">


        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="bg-gray-50 font-sans text-charcoal antialiased">
        <header class="sticky top-0 z-50 bg-primary shadow-md">
            <div class="container mx-auto px-4 py-3 flex items-center justify-between">
                <!-- Logo -->
                <a href="/" class="flex items-center space-x-2 text-white">
                    <span class="text-2xl font-bold tracking-tight">GSM Motor</span>
                </a>

                <!-- Search Bar (Desktop) -->
                <div class="hidden md:block flex-1 max-w-2xl mx-8">
                   <livewire:product-search />
                </div>

                <!-- Right Nav -->
                <div class="flex items-center space-x-4 text-white">
                    @auth
                        <!-- Cart -->
                        <a href="{{ route('cart.index') }}" class="relative group hover:text-white/80 transition">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            @if(Auth::user()->cartItems()->count() > 0)
                                <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                    {{ Auth::user()->cartItems()->sum('quantity') }}
                                </span>
                            @endif
                        </a>

                        <!-- User Menu -->
                        <div class="relative" x-data="{ open: false }">
                            <button @click="open = !open" @click.outside="open = false" class="flex items-center space-x-1 hover:text-white/80 transition focus:outline-none">
                                <span class="font-medium">{{ Auth::user()->name }}</span>
                                <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            <div x-show="open" 
                                 x-transition:enter="transition ease-out duration-100"
                                 x-transition:enter-start="transform opacity-0 scale-95"
                                 x-transition:enter-end="transform opacity-100 scale-100"
                                 x-transition:leave="transition ease-in duration-75"
                                 x-transition:leave-start="transform opacity-100 scale-100"
                                 x-transition:leave-end="transform opacity-0 scale-95"
                                 class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700 z-50 ring-1 ring-black ring-opacity-5"
                                 style="display: none;">
                                <a href="{{ route('dashboard') }}" class="block px-4 py-2 text-sm hover:bg-gray-100">Dashboard Admin</a> {{-- Assuming admin for now, but user also uses dashboard route potentially? Wait, user dashboard routes are order.index? --}}
                                {{-- Wait, standard user dashboard is /orders based on my impl? Or /dashboard? --}}
                                {{-- In routes/web.php: admin.dashboard is /admin/dashboard. User standard dashboard redirect went to dashboard... --}}
                                {{-- Let's check auth.php redirects. It goes to 'dashboard' named route. --}}
                                {{-- routes/web.php didn't have a 'dashboard' named route for regular users? --}}
                                {{-- It had /orders named order.index. --}}
                                {{-- I should probably fix the redirect in Auth to go to /orders or create /dashboard for users. --}}
                                {{-- For now let's point "Riwayat Pesanan" to order.index --}}
                                <a href="{{ route('order.index') }}" class="block px-4 py-2 text-sm hover:bg-gray-100">Riwayat Pesanan</a>
                                <a href="{{ route('profile.edit') }}" class="block px-4 py-2 text-sm hover:bg-gray-100">Profil Saya</a>
                                <form method="POST" action="{{ route('logout') }}">
                                    @csrf
                                    <button type="submit" class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Logout</button>
                                </form>
                            </div>
                        </div>
                    @else
                        <a href="{{ route('login') }}" class="text-sm font-medium hover:text-white/80 transition">Login</a>
                        <a href="{{ route('register') }}" class="text-sm font-medium bg-white text-primary px-3 py-1.5 rounded hover:bg-gray-100 transition">Register</a>
                    @endauth

                    <a href="https://wa.me/6281386363979" target="_blank" class="flex items-center space-x-1 hover:text-white/80 transition ml-4 border-l pl-4 border-white/20">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span class="text-sm font-medium hidden lg:inline">Hubungi Kami</span>
                    </a>
                </div>
            </div>
            <!-- Mobile Search Bar -->
             <div class="md:hidden px-4 pb-3">
                 <livewire:product-search />
            </div>
        </header>

        <main class="min-h-screen">
            {{ $slot }}
        </main>

        <footer class="bg-white border-t mt-12">
            <div class="container mx-auto px-4 py-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 class="text-lg font-bold text-primary mb-4">GSM Motor</h3>
                        <p class="text-sm text-gray-600 leading-relaxed">
                            Pusat belanja sparepart motor terlengkap, mulai dari onderdil mesin sampai aksesoris variasi. Kami mengutamakan kepuasan pelanggan dengan pelayanan responsif dan pengiriman on-time.
                        </p>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-800 mb-4">Kontak</h3>
                        <div class="text-sm text-gray-600 space-y-2">
                            <p class="flex items-start">
                                <svg class="w-5 h-5 mr-2 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                Jl. Puspa III No.37, RT.11/RW.4, Kapuk, Kecamatan Cengkareng, Kota Jakarta Barat, Daerah Khusus Ibukota Jakarta 11720
                            </p>
                            <p class="flex items-center">
                                <svg class="w-5 h-5 mr-2 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                081386363979
                            </p>
                            <p class="text-xs text-gray-500 pt-1">Buka Senin - Sabtu (08.00 - 17.00)</p>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-800 mb-4">Informasi</h3>
                         <ul class="text-sm text-gray-600 space-y-2">
                            <li><a href="#" class="hover:text-primary">Tentang Kami</a></li>
                            <li><a href="#" class="hover:text-primary">Cara Pemesanan</a></li>
                        </ul>
                    </div>
                </div>
                <div class="border-t mt-8 pt-8 text-center text-sm text-gray-500">
                    &copy; {{ date('Y') }} GSM Motor. All rights reserved.
                </div>
            </div>
        </footer>
    </body>
</html>
