<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }} - Admin</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans antialiased bg-gray-50" x-data="{ sidebarOpen: false }">
        
        <div class="flex h-screen bg-gray-50">
            <!-- Sidebar -->
            <div :class="sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'" class="fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto transition duration-300 transform bg-white border-r border-gray-200 lg:translate-x-0 lg:static lg:inset-0">
                <div class="flex items-center justify-center mt-8 px-6">
                    <div class="flex items-center space-x-2">
                        <!-- Icon Placeholder -->
                        <div class="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold">G</div>
                        <span class="text-2xl font-bold text-gray-800">GSM <span class="text-primary">Admin</span></span>
                    </div>
                </div>

                <nav class="mt-10 px-4 space-y-2">
                    <a class="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 {{ request()->routeIs('admin.dashboard') ? 'bg-orange-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}" href="{{ route('admin.dashboard') }}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                        <span class="mx-3">Dashboard</span>
                    </a>

                    <a class="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 {{ request()->routeIs('admin.products.*') ? 'bg-orange-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}" href="{{ route('admin.products.index') }}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                        <span class="mx-3">Produk & Stok</span>
                    </a>

                    @if(Auth::user()->isAdmin())
                    <a class="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 {{ request()->routeIs('admin.bulk-price.index') ? 'bg-orange-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}" href="{{ route('admin.bulk-price.index') }}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span class="mx-3">Harga Massal</span>
                    </a>
                    @endif
                    
                     <a class="flex items-center px-4 py-3 rounded-lg transition-colors duration-200 {{ request()->routeIs('admin.banners.*') ? 'bg-orange-50 text-primary font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' }}" href="{{ route('admin.banners.index') }}">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span class="mx-3">Banner</span>
                    </a>
                </nav>
                
                 <div class="absolute bottom-0 w-full p-4 border-t border-gray-200 bg-white">
                     <div class="flex items-center mb-4 px-2">
                        <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                            {{ substr(Auth::user()->name, 0, 1) }}
                        </div>
                        <div class="ml-3">
                            <p class="text-sm font-medium text-gray-700">{{ Auth::user()->name }}</p>
                            <p class="text-xs text-gray-500 capitalize">{{ Auth::user()->role }}</p>
                        </div>
                     </div>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition">
                             Log Out
                        </button>
                    </form>
                </div>
            </div>

            <!-- Main Content -->
            <div class="flex-1 flex flex-col overflow-hidden relative">
                <!-- Topbar (Mobile Only mostly, or global search) -->
                <header class="flex justify-between items-center py-4 px-6 bg-white border-b border-gray-200 lg:hidden">
                    <div class="flex items-center">
                        <button @click="sidebarOpen = true" class="text-gray-500 focus:outline-none lg:hidden">
                            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <span class="ml-3 font-semibold text-gray-700">GSM Motor</span>
                    </div>
                </header>

                <!-- Main Body -->
                <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
                    <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        @if (isset($header))
                            {{ $header }}
                        @endif
                        {{ $slot }}
                    </div>
                </main>
            </div>
            
            <!-- Overlay -->
            <div x-show="sidebarOpen" @click="sidebarOpen = false" x-transition:enter="transition-opacity ease-linear duration-300" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" x-transition:leave="transition-opacity ease-linear duration-300" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0" class="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" style="display: none;"></div>
        </div>
    </body>
</html>
