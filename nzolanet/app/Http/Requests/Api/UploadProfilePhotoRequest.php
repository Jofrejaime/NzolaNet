<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class UploadProfilePhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'photo.required' => 'A foto de perfil é obrigatória',
            'photo.image' => 'O ficheiro deve ser uma imagem',
            'photo.mimes' => 'Formatos aceites: jpeg, png, jpg, gif',
            'photo.max' => 'A foto não pode ultrapassar 2MB',
        ];
    }
}
