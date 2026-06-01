<?php

namespace App\Http\Requests\Pilates;

use Illuminate\Foundation\Http\FormRequest;

class BookSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Secured by Sanctum middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'pilates_session_id' => ['required', 'exists:pilates_sessions,id'],
            'payment_method' => ['required', 'in:wallet,cash,package'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'pilates_session_id.required' => 'حقل الجلسة مطلوب.',
            'pilates_session_id.exists' => 'الجلسة المحددة غير موجودة.',
            'payment_method.required' => 'طريقة الدفع مطلوبة.',
            'payment_method.in' => 'طريقة الدفع يجب أن تكون المحفظة (wallet) أو نقداً (cash) أو باقة (package).',
        ];
    }
}
