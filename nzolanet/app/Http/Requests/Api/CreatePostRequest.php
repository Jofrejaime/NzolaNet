<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class CreatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => 'required_without_all:image,video|nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'video' => 'nullable|file|mimes:mp4,mov,avi,webm|max:20480',
        ];
    }

    public function messages(): array
    {
        return [
            'content.required_without_all' => 'A publicação deve conter texto, imagem ou vídeo',
            'image.image' => 'O ficheiro de imagem deve ser uma imagem',
            'image.max' => 'A imagem não pode ultrapassar 5MB',
            'video.file' => 'O ficheiro de vídeo deve ser um ficheiro',
            'video.mimes' => 'Formatos de vídeo suportados: mp4, mov, avi, webm',
            'video.max' => 'O vídeo não pode ultrapassar 20MB',
        ];
    }
}
