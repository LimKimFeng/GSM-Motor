<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\View\View;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): View
    {
        return view('auth.register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:'.User::class],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        // Honeypot Check (Simple hidden field check)
        if ($request->filled('username_honey')) {
             // Silently fail or redirect back
             return back();
        }

        $otp = rand(100000, 999999);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'otp_code' => (string)$otp,
            'otp_expires_at' => now()->addMinutes(5),
            // User is not verified yet
        ]);

        // Send OTP
        try {
            \Illuminate\Support\Facades\Mail::to($user)->send(new \App\Mail\OtpMail($otp));
        } catch (\Exception $e) {
            // Log error but proceed? Or fail? 
            // For now proceed, user might need resend logic (future improvement)
        }

        // event(new Registered($user)); // Disable auto-login/verify event until OTP confirmed

        // Store User ID in session for OTP verification
        session(['otp_user_id' => $user->id]);

        return redirect(route('otp.verify'));
    }
}
