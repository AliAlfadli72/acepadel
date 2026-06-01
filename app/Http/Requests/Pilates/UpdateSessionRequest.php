<?php

namespace App\Http\Requests\Pilates;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSessionRequest extends FormRequest
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
            'coach_name' => ['required', 'string', 'max:255'],
            'capacity' => ['required', 'integer', 'min:1'],
            'price_per_session' => ['required', 'numeric', 'min:0'],
            'session_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'status' => ['required', 'in:active,canceled'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'عنوان الجلسة مطلوب.',
            'coach_name.required' => 'اسم المدرب مطلوب.',
            'capacity.required' => 'سعة الجلسة مطلوبة.',
            'capacity.integer' => 'السعة يجب أن تكون رقماً صحيحاً.',
            'price_per_session.required' => 'سعر الجلسة مطلوب.',
            'session_date.required' => 'تاريخ الجلسة مطلوب.',
            'start_time.required' => 'وقت البدء مطلوب.',
            'end_time.required' => 'وقت الانتهاء مطلوب.',
            'end_time.after' => 'وقت الانتهاء يجب أن يكون بعد وقت البدء.',
            'status.required' => 'الحالة مطلوبة.',
            'status.in' => 'الحالة يجب أن تكون نشطة (active) أو ملغاة (canceled).',
        ];
    }
}
