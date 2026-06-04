<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class BuyPilatesPackageRequest extends FormRequest
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
            'pilates_package_id' => ['required', 'exists:pilates_packages,id']
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'pilates_package_id.required' => 'حقل الباقة مطلوب.',
            'pilates_package_id.exists'   => 'الباقة المحددة غير موجودة.',
        ];
    }
}
