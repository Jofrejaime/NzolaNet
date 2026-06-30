<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email'    => 'required|email',
            'token'    => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required'    => 'O email é obrigatório',
            'email.email'       => 'Insira um email válido',
            'token.required'    => 'O token de recuperação é obrigatório',
            'password.required' => 'A nova senha é obrigatória',
            'password.min'      => 'A senha deve ter pelo menos 8 caracteres',
            'password.confirmed'=> 'A confirmação da senha não corresponde',
        ];
    }
}
