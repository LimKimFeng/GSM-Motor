<x-mail::message>
# Halo!

Terima kasih telah mendaftar di GSM Motor. Berikut adalah kode verifikasi OTP Anda:

<x-mail::panel>
# {{ $otpCode }}
</x-mail::panel>

Kode ini berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun.

Terima kasih,<br>
{{ config('app.name') }}
</x-mail::message>
