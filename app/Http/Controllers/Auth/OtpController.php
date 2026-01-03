<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class OtpController extends Controller
{
    public function showVerifyForm()
    {
        if (!session('otp_user_id')) {
            return redirect()->route('login');
        }
        return view('auth.verify-otp');
    }

    public function verify(Request $request)
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $userId = session('otp_user_id');
        if (!$userId) {
            return redirect()->route('login');
        }

        $user = User::findOrFail($userId);

        if ($user->otp_code !== $request->otp) {
            throw ValidationException::withMessages(['otp' => 'Kode OTP salah.']);
        }

        if (now()->greaterThan($user->otp_expires_at)) {
            throw ValidationException::withMessages(['otp' => 'Kode OTP sudah kadaluarsa. Silakan daftar ulang atau minta kode baru.']);
        }

        // OTP Valid
        $user->update([
            'otp_code' => null,
            'otp_expires_at' => null,
            'email_verified_at' => now(), // Mark email as verified
        ]);

        Auth::login($user, true); // Login & Remember
        session()->forget('otp_user_id');

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
