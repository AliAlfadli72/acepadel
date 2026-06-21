<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

/**
 * WhatsApp Webhook Controller
 *
 * ─── إعداد Webhook في Meta Developer Console ───
 *
 * Callback URL : https://acepadel.com/api/webhook/whatsapp
 * Verify Token  : ace_padel_secure_webhook_token
 *
 * ─── اختبار محلي (XAMPP) ───
 * استخدم ngrok لتعريض المنفذ المحلي:
 *   ngrok http 80 --host-header="192.168.1.102"
 * ثم ضع الـ ngrok URL كـ Callback URL مؤقتاً.
 */
class WebhookController extends Controller
{
    /**
     * GET + POST  /api/webhook/whatsapp
     *
     * GET  → التحقق الأول من Meta (hub verification challenge)
     * POST → استقبال الأحداث والرسائل الواردة
     */
    public function handle(Request $request): Response|\Illuminate\Http\JsonResponse
    {
        // ════════════════════════════════════════════════════════
        // GET — Meta Webhook Verification Challenge
        // تُرسَل مرة واحدة عند إعداد الـ Webhook في Developer Console
        // ════════════════════════════════════════════════════════
        if ($request->isMethod('GET')) {
            $mode      = $request->query('hub_mode');
            $token     = $request->query('hub_verify_token');
            $challenge = $request->query('hub_challenge');

            $expectedToken = config('services.meta_wa.verify_token', 'ace_padel_secure_webhook_token');

            Log::info('[WhatsApp Webhook] Verification attempt', [
                'mode'      => $mode,
                'token'     => $token,
                'challenge' => $challenge,
                'expected'  => $expectedToken,
                'match'     => ($token === $expectedToken),
            ]);

            // التحقق من صحة الطلب — Meta تتحقق من mode + token معاً
            if ($mode === 'subscribe' && $token === $expectedToken) {
                Log::info('[WhatsApp Webhook] ✅ Verified successfully, returning challenge.');

                // ⚠️ CRITICAL: يجب إرجاع hub_challenge كنص خام (plain text) فقط
                // Meta ترفض أي رد JSON أو HTML أو headers إضافية
                return response($challenge, 200)
                    ->header('Content-Type', 'text/plain');
            }

            Log::error('[WhatsApp Webhook] ❌ Verification FAILED — token mismatch or wrong mode.', [
                'received_token'  => $token,
                'expected_token'  => $expectedToken,
                'received_mode'   => $mode,
            ]);

            return response('Forbidden', 403)
                ->header('Content-Type', 'text/plain');
        }

        // ════════════════════════════════════════════════════════
        // POST — استقبال أحداث واتساب (رسائل، إيصالات، إلخ)
        // ════════════════════════════════════════════════════════
        $payload = $request->all();

        Log::info('[WhatsApp Webhook] 📨 Incoming event', $payload);

        // يمكن معالجة الرسائل الواردة هنا لاحقاً
        // مثال: رسالة واردة من المستخدم → رد تلقائي أو تحديث حالة OTP

        // ⚠️ Meta تتوقع الرد بـ 200 فوراً (خلال ثوانٍ) وإلا تعيد الإرسال
        return response()->json(['status' => 'EVENT_RECEIVED'], 200);
    }
}
