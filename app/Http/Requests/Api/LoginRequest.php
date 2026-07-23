<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $identifier = $this->input('identifier') ?? $this->input('phone');
        if ($identifier && !filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
            $identifier = \App\Models\User::normalizePhone($identifier);
        }
        
        $this->merge([
            'identifier' => $identifier,
        ]);
    }

    public function rules(): array
    {
        return [
            'identifier' => ['required', 'string'],
            'password'   => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'identifier.required' => 'حقل رقم الهاتف أو البريد الإلكتروني مطلوب.',
            'password.required'   => 'حقل كلمة المرور مطلوب.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'status'  => 'error',
            'message' => $validator->errors()->first(),
            'errors'  => $validator->errors(),
        ], 422));
    }
}