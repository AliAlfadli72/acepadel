<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Secured by auth:sanctum
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'court_id'   => ['required', 'exists:courts,id'],
            'start_time' => ['required', 'date'],
            'end_time'   => ['required', 'date', 'after:start_time'],
            'coach_id'   => ['nullable', 'exists:coach_profiles,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'court_id.required'   => 'الملعب مطلوب.',
            'court_id.exists'     => 'الملعب المحدد غير موجود.',
            'start_time.required' => 'وقت البدء مطلوب.',
            'start_time.date'     => 'صيغة وقت البدء غير صالحة.',
            'end_time.required'   => 'وقت الانتهاء مطلوب.',
            'end_time.date'       => 'صيغة وقت الانتهاء غير صالحة.',
            'end_time.after'      => 'وقت الانتهاء يجب أن يكون بعد وقت البدء.',
            'coach_id.exists'     => 'المدرب المحدد غير موجود.',
        ];
    }
}
