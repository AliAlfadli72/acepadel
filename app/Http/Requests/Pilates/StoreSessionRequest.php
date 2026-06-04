<?php

namespace App\Http\Requests\Pilates;

use Illuminate\Foundation\Http\FormRequest;

class StoreSessionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Secured by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'coach_id' => ['required', 'exists:users,id'],
            'session_type' => ['required', 'in:indoor,outdoor'],
            'capacity' => ['required', 'integer', 'min:1'],
            'price_per_session' => ['required', 'numeric', 'min:0'],
            'session_date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => [
                'required', 
                'date_format:H:i',
                function ($attribute, $value, $fail) {
                    $parts = explode(':', $value);
                    if (count($parts) < 2 || ($parts[1] !== '00' && $parts[1] !== '30')) {
                        $fail('يجب أن يكون وقت البدء على رأس الساعة أو نصفها (مثال: 14:00 أو 14:30).');
                    }
                }
            ],
            'end_time' => [
                'required', 
                'date_format:H:i', 
                'after:start_time',
                function ($attribute, $value, $fail) {
                    $parts = explode(':', $value);
                    if (count($parts) < 2 || ($parts[1] !== '00' && $parts[1] !== '30')) {
                        $fail('يجب أن يكون وقت الانتهاء على رأس الساعة أو نصفها (مثال: 15:00 أو 15:30).');
                    }
                }
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'عنوان الجلسة مطلوب.',
            'coach_id.required' => 'المدرب مطلوب.',
            'coach_id.exists' => 'المدرب المحدد غير موجود.',
            'session_type.required' => 'نوع الجلسة مطلوب.',
            'session_type.in' => 'نوع الجلسة غير صالح.',
            'capacity.required' => 'سعة الجلسة مطلوبة.',
            'capacity.integer' => 'السعة يجب أن تكون رقماً صحيحاً.',
            'price_per_session.required' => 'سعر الجلسة مطلوب.',
            'session_date.required' => 'تاريخ الجلسة مطلوب.',
            'session_date.after_or_equal' => 'تاريخ الجلسة يجب أن يكون اليوم أو في المستقبل.',
            'start_time.required' => 'وقت البدء مطلوب.',
            'end_time.required' => 'وقت الانتهاء مطلوب.',
            'end_time.after' => 'وقت الانتهاء يجب أن يكون بعد وقت البدء.',
        ];
    }
}
