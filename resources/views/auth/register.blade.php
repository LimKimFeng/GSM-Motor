<x-guest-layout>
    <div class="text-left mb-10">
        <h2 class="text-4xl font-bold text-gray-800 tracking-tight">Create Account</h2>
        <p class="mt-2 text-sm text-gray-500">Daftar sekarang untuk mulai berbelanja.</p>
    </div>

    <form method="POST" action="{{ route('register') }}" class="space-y-5">
        @csrf

        <!-- Name -->
        <div class="group">
            <label for="name" class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-orange-500 transition-colors">Full Name</label>
            <input id="name" type="text" name="name" :value="old('name')" required autofocus 
                class="block w-full border-0 border-b-2 border-gray-200 bg-transparent py-3 px-0 text-gray-900 placeholder-gray-300 focus:border-orange-500 focus:ring-0 transition-all duration-300 text-base"
                placeholder="John Doe">
            <x-input-error :messages="$errors->get('name')" class="mt-2" />
        </div>

        <!-- Email -->
        <div class="group">
            <label for="email" class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-orange-500 transition-colors">Email Address</label>
            <input id="email" type="email" name="email" :value="old('email')" required
                class="block w-full border-0 border-b-2 border-gray-200 bg-transparent py-3 px-0 text-gray-900 placeholder-gray-300 focus:border-orange-500 focus:ring-0 transition-all duration-300 text-base"
                placeholder="nama@email.com">
            <x-input-error :messages="$errors->get('email')" class="mt-2" />
        </div>

        <!-- Phone -->
         <div class="group">
            <label for="phone" class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-orange-500 transition-colors">Phone (WhatsApp)</label>
            <input id="phone" type="text" name="phone" :value="old('phone')"
                class="block w-full border-0 border-b-2 border-gray-200 bg-transparent py-3 px-0 text-gray-900 placeholder-gray-300 focus:border-orange-500 focus:ring-0 transition-all duration-300 text-base"
                placeholder="0812...">
            <x-input-error :messages="$errors->get('phone')" class="mt-2" />
        </div>

        <!-- Password -->
        <div class="group">
            <label for="password" class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-orange-500 transition-colors">Password</label>
            <input id="password" type="password" name="password" required autocomplete="new-password"
                class="block w-full border-0 border-b-2 border-gray-200 bg-transparent py-3 px-0 text-gray-900 placeholder-gray-300 focus:border-orange-500 focus:ring-0 transition-all duration-300 text-base"
                placeholder="••••••">
            <x-input-error :messages="$errors->get('password')" class="mt-2" />
        </div>
        
        <div class="group">
            <label for="password_confirmation" class="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-orange-500 transition-colors">Confirm Password</label>
            <input id="password_confirmation" type="password" name="password_confirmation" required autocomplete="new-password"
                class="block w-full border-0 border-b-2 border-gray-200 bg-transparent py-3 px-0 text-gray-900 placeholder-gray-300 focus:border-orange-500 focus:ring-0 transition-all duration-300 text-base"
                placeholder="••••••">
        </div>
        
        <!-- Honeypot -->
        <div style="display:none; visibility:hidden;">
            <label for="username_honey">Username</label>
            <input id="username_honey" type="text" name="username_honey" tabindex="-1" autocomplete="off">
        </div>

        <!-- Submit Button -->
        <button type="submit" class="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transform hover:-translate-y-1 transition duration-300 group mt-4">
            <span class="tracking-widest uppercase text-sm">Register Now</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
        </button>
    </form>

    <div class="mt-8 text-center">
        <p class="text-sm text-gray-500">Already have an account? <a href="{{ route('login') }}" class="font-bold text-orange-600 hover:text-orange-800 transition-colors">Sign In</a></p>
    </div>
</x-guest-layout>
