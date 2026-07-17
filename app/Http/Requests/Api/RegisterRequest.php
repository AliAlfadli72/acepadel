<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class RegisterRequest extends FormRequest
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
        $isEmail = filter_var($this->input('identifier'), FILTER_VALIDATE_EMAIL);
        return [
            'name'       => ['required', 'string', 'max:255'],
            'identifier' => [
                'required',
                'string',
                $isEmail 
                    ? Rule::unique('users', 'email')->whereNotNull('password')
                    : Rule::unique('users', 'phone')->whereNotNull('password')
            ],
            'password'   => ['required', 'string', 'min:8'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'حقل الاسم الكامل مطلوب.',
            'name.string' => 'الاسم يجب أن يكون نصاً.',
            'name.max' => 'الاسم يجب ألا يتجاوز 255 حرفاً.',
            'identifier.required' => 'حقل  رقم الهاتف مطلوب.',
            'identifier.unique' => 'رقم الهاتف مستخدم بالفعل.',
            'password.required' => 'حقل كلمة المرور مطلوب.',
            'password.min' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
            'password.confirmed' => 'تأكيد كلمة المرور غير متطابق.',
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
