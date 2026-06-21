<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppAuthService
{
    /**
     * Meta WhatsApp Cloud API base URL
     */
    private const API_BASE = 'https://graph.facebook.com/v19.0';

    /**
     * مدة صلاحية OTP بالدقائق
     */
    public const OTP_TTL_MINUTES = 5;

    /**
     * توليد كود OTP عشوائي مكون من 6 أرقام
     */
    public function generateOtp(): string
    {
        return str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * إرسال OTP عبر واتساب باستخدام القالب المعتمد من Meta
     *
     * @param string $phone  رقم الهاتف الدولي بدون '+' (مثال: 963991234567)
     * @param string $otp    الكود المكون من 6 أرقام
     * @return array{success: bool, message: string}
     */
    public function sendOtp(string $phone, string $otp): array
    {
        $phoneNumberId   = config('services.meta_wa.phone_number_id');
        $accessToken     = config('services.meta_wa.access_token');
        $templateName    = config('services.meta_wa.template_name');

        // تنظيف رقم الهاتف — إزالة '+' فقط، ميتا تقبل الصيغة الدولية
        $cleanPhone = ltrim($phone, '+');

        $payload = [
            'messaging_product' => 'whatsapp',
            'to'                => $cleanPhone,
            'type'              => 'template',
            'template'          => [
                'name'       => $templateName,
                'language'   => ['code' => 'ar'],   // عربي
                'components' => [
                    [
                        'type'       => 'body',
                        'parameters' => [
                            [
                                'type' => 'text',
                                'text' => $otp,     // {{1}} في القالب
                            ],
                        ],
                    ],
                    // زر النسخ (Copy Code) مدعوم في قوالب Authentication
                    [
                        'type'     => 'button',
                        'sub_type' => 'url',
                        'index'    => '0',
                        'parameters' => [
                            [
                                'type' => 'text',
                                'text' => $otp,
                            ],
                        ],
                    ],
                ],
            ],
        ];

        try {
            $response = Http::withToken($accessToken)
                ->timeout(15)
                ->post(self::API_BASE . "/{$phoneNumberId}/messages", $payload);

            if ($response->successful()) {
                Log::info('[WhatsApp OTP] Sent successfully', [
                    'phone'    => $cleanPhone,
                    'msg_id'   => $response->json('messages.0.id'),
                ]);

                return ['success' => true, 'message' => 'OTP sent successfully'];
            }

            $error = $response->json('error.message', 'Unknown API error');
            $code  = $response->json('error.code', $response->status());

            Log::error('[WhatsApp OTP] API Error', [
                'phone'  => $cleanPhone,
                'code'   => $code,
                'error'  => $error,
                'body'   => $response->body(),
            ]);

            return [
                'success' => false,
                'message' => "WhatsApp API Error [{$code}]: {$error}",
            ];

        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('[WhatsApp OTP] Connection failed', ['error' => $e->getMessage()]);
            return ['success' => false, 'message' => 'Connection to WhatsApp API failed'];
        } catch (\Exception $e) {
            Log::error('[WhatsApp OTP] Unexpected error', ['error' => $e->getMessage()]);
            return ['success' => false, 'message' => 'Unexpected error sending OTP'];
        }
    }

    /**
     * التحقق من صلاحية كود OTP
     *
     * @param \App\Models\User $user
     * @param string           $otp   الكود المُدخَل من المستخدم
     */
    public function verifyOtp(\App\Models\User $user, string $otp): bool
    {
        if (!$user->otp_code || !$user->otp_expires_at) {
            return false;
        }

        if (now()->isAfter($user->otp_expires_at)) {
            return false; // OTP منتهي الصلاحية
        }

        return hash_equals($user->otp_code, $otp);
    }
}
