<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => [
                Rule::requiredIf(function () {
                    $hasNewMedia    = $this->hasFile('media');
                    $keepMedia      = json_decode($this->input('keep_media', '[]'), true);
                    $hasKeepMedia   = !empty($keepMedia);
                    return !$hasNewMedia && !$hasKeepMedia;
                }),
                'nullable', 'string', 'max:1000',
            ],
            'media'      => 'nullable|array|max:4',
            'media.*'    => 'file|mimes:jpeg,png,jpg,gif,webp,mp4,mov,avi,webm|max:20480',
            'keep_media' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'content.required_without' => 'A publicação deve conter texto ou média.',
            'media.max'                => 'Podes adicionar no máximo 4 ficheiros.',
            'media.*.mimes'            => 'Formato não suportado. Usa JPG, PNG, GIF, WEBP, MP4, MOV ou WEBM.',
            'media.*.max'              => 'Cada ficheiro não pode ultrapassar 20MB.',
        ];
    }
}
