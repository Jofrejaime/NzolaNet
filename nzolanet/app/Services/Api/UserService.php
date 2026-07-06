<?php

declare(strict_types=1);

namespace App\Services\Api;

use App\Data\Api\User\RegisterData;
use App\Data\Api\User\LoginData;
use App\Data\Api\User\UpdateProfileData;
use App\Mail\PasswordRecoveryMail;
use App\Repositories\Api\UserRepository;
use App\Models\User;
use App\Repositories\Api\FollowRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
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
                'role' => 'utilizador',
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
                'role' => $user->role,
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
            $data['is_follow_pending'] = $this->followRepository->isFollowPending($viewerId, $id);
        }

        return $data;
    }

    public function getAuthenticatedUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'bio' => $user->bio,
            'profile_photo' => $user->profile_photo,
            'is_private' => $user->is_private,
            'is_active' => $user->is_active,
            'role' => $user->role,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
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
     * Solicitar recuperação de senha — gera token e envia email
     */
    public function recoverPassword(string $email): string
    {
        $userArray = $this->userRepository->findByEmail($email);

        if (!$userArray) {
            // Resposta genérica para não revelar se o email existe
            return 'Se o email estiver associado a uma conta, receberás as instruções em breve.';
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:4200');
        $resetUrl    = $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($email);

        Mail::to($email)->send(new PasswordRecoveryMail(
            userName: $userArray['name'],
            resetUrl: $resetUrl,
        ));

        return 'Se o email estiver associado a uma conta, receberás as instruções em breve.';
    }

    /**
     * Redefinir senha com token de recuperação
     */
    public function resetPassword(string $email, string $token, string $newPassword): void
    {
        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$record) {
            throw ValidationException::withMessages([
                'token' => ['Token inválido ou expirado.']
            ]);
        }

        // Verificar expiração (60 minutos)
        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            throw ValidationException::withMessages([
                'token' => ['O link de recuperação expirou. Solicita um novo.']
            ]);
        }

        if (!Hash::check($token, $record->token)) {
            throw ValidationException::withMessages([
                'token' => ['Token inválido ou expirado.']
            ]);
        }

        $userArray = $this->userRepository->findByEmail($email);

        if (!$userArray) {
            throw ValidationException::withMessages([
                'email' => ['Este email não está associado a nenhuma conta.']
            ]);
        }

        $this->userRepository->update(
            ['password' => Hash::make($newPassword)],
            $userArray['id']
        );

        DB::table('password_reset_tokens')->where('email', $email)->delete();
    }

    public function deleteAccount(int $userId): void
{
    User::findOrFail($userId)->delete();
}
}
