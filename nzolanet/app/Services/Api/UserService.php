<?php

declare(strict_types=1);

namespace App\Services\Api;

use App\Data\Api\User\RegisterData;
use App\Data\Api\User\LoginData;
use App\Data\Api\User\UpdateProfileData;
use App\Repositories\Api\UserRepository;
use App\Models\User;
use App\Repositories\Api\FollowRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserService
{
    public function __construct(
        protected UserRepository $userRepository,
        protected FollowRepository $followRepository,
    ) {}

    /**
     * Registrar novo usuário
     */
    public function register(RegisterData $dto): array
    {
        // Verificar se email já existe
        $existingUser = $this->userRepository->findByEmail($dto->email);

        if ($existingUser) {
            throw ValidationException::withMessages([
                'email' => ['Este email já está registado.']
            ]);
        }

        // Criar usuário
        $userData = $this->userRepository->create($dto->toArray());

        // Buscar o usuário para gerar token
        $user = User::find($userData['id']);
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => [
                'id' => $userData['id'],
                'name' => $userData['name'],
                'email' => $userData['email'],
                'bio' => $userData['bio'] ?? null,
                'profile_photo' => $userData['profile_photo'] ?? null,
                'is_private' => $userData['is_private'],
                'is_active' => $userData['is_active'],
                'created_at' => $userData['created_at'] ?? now(),
                'updated_at' => $userData['updated_at'] ?? now(),
            ],
            'access_token' => $token,
            'token_type' => 'Bearer'
        ];
    }

    /**
     * Login do usuário
     */
    public function login(LoginData $dto): array
    {
        // Verificar credenciais
        $userData = $this->userRepository->findByCredentials($dto->email, $dto->password);

        if (!$userData) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.']
            ]);
        }

        // Verificar se usuário está ativo
        if (!$userData['is_active']) {
            throw ValidationException::withMessages([
                'email' => ['Esta conta está desativada.']
            ]);
        }

        // Buscar usuário para login
        $user = User::find($userData['id']);

        // Login usando Laravel Auth
        Auth::login($user, $dto->rememberMe);
        // Criar novo token
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'bio' => $user->bio,
                'profile_photo' => $user->profile_photo,
                'is_private' => $user->is_private,
                'is_active' => $user->is_active,
                'email_verified_at' => $user->email_verified_at,
            ],
            'access_token' => $token,
            'token_type' => 'Bearer'
        ];
    }

    /**
     * Logout do usuário
     */
    public function logout($user): void
    {
        $user->currentAccessToken()->delete();
    }

    /**
     * Obter usuário por ID
     */
    public function getUserById(int $id, ?int $viewerId = null): ?array
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return null;
        }

        $data = $user->toArray();
        unset($data['password']);

        if ($viewerId) {
            $data['is_following'] = $this->followRepository->isFollowing($viewerId, $id);
        }

        return $data;
    }

    public function changePassword(int $userId, string $currentPassword, string $newPassword): void
    {
        $user = User::findOrFail($userId);

        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['A palavra-passe actual está incorrecta.'],
            ]);
        }

        $user->update(['password' => bcrypt($newPassword)]);
    }

    /**
     * Atualizar perfil do usuário
     */
    public function updateProfile(UpdateProfileData $dto, int $userId): array
    {
        $user = $this->userRepository->update($dto->toArray(), $userId);
        return $user->toArray();
    }

    /**
     * Atualizar foto de perfil do usuário
     */
    public function updateProfilePhoto(string $photoPath, int $userId): array
    {
        $user = $this->userRepository->update([
            'profile_photo' => $photoPath
        ], $userId);
        return $user->toArray();
    }

    /**
     * Pesquisar utilizadores
     */
    public function searchUsers(string $search, int $currentUserId): array
    {
        return $this->userRepository->searchUsers($search, $currentUserId);
    }

    /**
     * Recuperar senha (solicitar reset)
     */
    public function recoverPassword(string $email): string
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Este email não está associado a nenhuma conta.']
            ]);
        }

        return "Instruções de recuperação enviadas para o email.";
    }

    /**
     * Resetar senha com nova senha
     */
    public function resetPassword(string $email, string $newPassword): void
    {
        $userArray = $this->userRepository->findByEmail($email);

        if (!$userArray) {
            throw ValidationException::withMessages([
                'email' => ['Este email não está associado a nenhuma conta.']
            ]);
        }

        $this->userRepository->update([
            'password' => bcrypt($newPassword)
        ], $userArray['id']);
    }
}
