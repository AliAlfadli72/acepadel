<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * تهيئة البيانات قبل عملية التحقق.
     */
    protected function prepareForValidation()
    {
        $identifier = $this->input('identifier');
        if ($identifier && !filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            $this->merge([
                'identifier' => \App\Models\User::normalizePhone($identifier),
            ]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string'],
            'password'   => ['required', 'string'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'identifier.required' => 'حقل البريد الإلكتروني أو رقم الهاتف مطلوب.',
            'password.required' => 'حقل كلمة المرور مطلوب.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'status'  => 'error',
            'message' => 'بيانات التحقق غير صالحة.',
            'errors'  => $validator->errors(),
        ], 422));
    }
}
