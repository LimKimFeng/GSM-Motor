<x-guest-layout>
    <div class="text-left mb-10">
        <h2 class="text-4xl font-bold text-gray-800 tracking-tight">Sign In</h2>
        <p class="mt-2 text-sm text-gray-500">Silakan masukkan akun Anda untuk melanjutkan.</p>
    </div>

    <form method="POST" action="{{ route('login') }}" class="space-y-6">
        @csrf

        <!-- Email Address -->
        <div class="group">
            <label for="email" class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-orange-500 transition-colors">Email Address</label>
            <input id="email" type="email" name="email" :value="old('email')" required autofocus 
                class="block w-full border-0 border-b-2 border-gray-200 bg-transparent py-3 px-0 text-gray-900 placeholder-gray-300 focus:border-orange-500 focus:ring-0 transition-all duration-300 text-base"
                placeholder="nama@email.com">
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <!-- Password -->
        <div class="group">
            <label for="password" class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-orange-500 transition-colors">Password</label>
            <input id="password" type="password" name="password" required autocomplete="current-password"
                class="block w-full border-0 border-b-2 border-gray-200 bg-transparent py-3 px-0 text-gray-900 placeholder-gray-300 focus:border-orange-500 focus:ring-0 transition-all duration-300 text-base"
                placeholder="Password Anda">
            <x-input-error :messages="$errors->get('password')" class="mt-2" />
            
            <div class="flex justify-end mt-2">
                 @if (Route::has('password.request'))
                    <a class="text-xs text-gray-400 hover:text-orange-600 transition-colors" href="{{ route('password.request') }}">
                        Forgot Password?
                    </a>
                @endif
            </div>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transform hover:-translate-y-1 transition duration-300 group">
            <span class="tracking-widest uppercase text-sm">Continue</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
        </button>
    </form>

    <div class="relative my-8">
        <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
        </div>
        <div class="relative flex justify-center text-xs uppercase">
            <span class="px-2 bg-white text-gray-400 tracking-wider">or Connect with Social Media</span>
        </div>
    </div>

    <div class="space-y-3">

        
        <!-- Google Button Styled like Twitter in ref image for variety, or stick to Google branding -->
        <a href="{{ route('socialite.redirect', 'google') }}" class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
            <svg class="h-5 w-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            <span class="font-semibold text-sm">Sign In With Google</span>
        </a>
    </div>

    <div class="mt-8 text-center">
        <p class="text-sm text-gray-500">Don't have an account? <a href="{{ route('register') }}" class="font-bold text-orange-600 hover:text-orange-800 transition-colors">Sign Up</a></p>
    </div>
</x-guest-layout>
