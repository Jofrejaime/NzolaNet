<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class CreateCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => 'required|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'content.required' => 'O conteúdo do comentário é obrigatório',
            'content.max' => 'O comentário não pode ultrapassar 500 caracteres',
        ];
    }
}
