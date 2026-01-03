<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'GSM Motor') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

        <style>
            body { font-family: 'Poppins', sans-serif; }
            .fluid-clip {
                clip-path: polygon(0 0, 100% 0, 85% 100%, 0% 100%);
            }
            @media (max-width: 1024px) {
                .fluid-clip {
                    clip-path: none;
                }
            }
        </style>

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="bg-gray-100 min-h-screen flex items-center justify-center p-4 lg:p-8 relative overflow-hidden">
        
        <!-- Global Background Decoration (Ensures 'color' content is never just white) -->
        <div class="absolute -top-40 -left-40 w-[600px] h-[600px] bg-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div class="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-pink-400/20 rounded-full blur-3xl"></div>

        <!-- Floating Card Container -->
        <div class="bg-white w-full max-w-[1200px] min-h-[700px] rounded-3xl shadow-2xl flex overflow-hidden relative z-10">
            
            <!-- Left Side: Visuals (Visible as top banner on mobile, side panel on desktop) -->
            <div class="w-full lg:w-[55%] relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white p-12 flex flex-col justify-between order-first lg:order-first fluid-clip">
                
                <!-- Fluid Background Decor -->
                <div class="absolute top-[10%] right-[-10%] w-60 h-60 bg-white/10 rounded-full blur-2xl"></div>
                <div class="absolute bottom-[10%] left-[-5%] w-80 h-80 bg-orange-800/20 rounded-full blur-3xl"></div>

                <!-- Branding -->
                <div class="relative z-10 flex items-center gap-3">
                    <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h1 class="font-bold text-2xl tracking-wider">GSM MOTOR</h1>
                        <p class="text-xs text-orange-100 uppercase tracking-widest">Sparepart Terlengkap</p>
                    </div>
                </div>

                <!-- Hero Text -->
                <div class="relative z-10 mt-12 lg:mt-0">
                    <h2 class="text-5xl lg:text-7xl font-bold leading-tight">
                        Start <br/> Journey.
                    </h2>
                    <p class="mt-6 text-orange-100 text-lg max-w-sm leading-relaxed">
                        Akses ribuan produk sparepart dan aksesoris motor berkualitas dalam satu genggaman.
                    </p>
                </div>

                <!-- Footer/Decor -->
                <div class="relative z-10 mt-12 hidden lg:block">
                    <div class="flex items-center gap-4">
                        <div class="w-16 h-1 bg-white/50 rounded-full"></div>
                        <span class="text-sm font-medium text-orange-200">www.gsmmotor.com</span>
                    </div>
                </div>
            </div>

            <!-- Right Side: Form -->
            <div class="w-full lg:w-[45%] bg-white flex flex-col justify-center p-8 lg:p-12 xl:p-16">
                <!-- Wrapper for form content to ensure scrolling if needed -->
                <div class="w-full max-w-md mx-auto">
                    {{ $slot }}
                </div>
            </div>

        </div>
    </body>
</html>
