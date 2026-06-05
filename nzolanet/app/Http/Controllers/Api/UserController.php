<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\UpdateProfileRequest;
use App\Http\Requests\Api\UploadProfilePhotoRequest;
use App\Http\Requests\Api\RecoverPasswordRequest;
use App\Http\Requests\Api\ResetPasswordRequest;
use App\Http\Requests\Api\ChangePasswordRequest;
use App\Services\Api\UserService;
use App\Services\Api\FollowService;
use App\Services\Api\PostService;
use App\Services\Api\CommentService;
use App\Data\Api\User\RegisterData;
use App\Data\Api\User\LoginData;
use App\Data\Api\User\UpdateProfileData;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService,
        protected FollowService $followService,
        protected PostService $postService,
        protected CommentService $commentService,
    ) {}

    /**
     * Listar / pesquisar utilizadores
     * GET /api/users?search=term
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $search = $request->query('search', '');
            $users = $this->userService->searchUsers($search, $request->user()->id);

            return response()->json([
                'success' => true,
                'data' => $users
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao listar utilizadores: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar utilizadores que o user autenticado segue
     * GET /api/users/{id}/following
     */
    public function following(int $id, Request $request): JsonResponse
    {
        try {
            $following = $this->followService->getFollowing($id, $request->user()->id);

            return response()->json([
                'success' => true,
                'data' => $following
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao listar seguidores: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Listar seguidores do utilizador
     * GET /api/users/{id}/followers
     */
    public function followers(int $id, Request $request): JsonResponse
    {
        try {
            $followers = $this->followService->getFollowers($id, $request->user()->id);

            return response()->json([
                'success' => true,
                'data' => $followers
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao listar seguidores: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar novo usuário
     * POST /api/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            $dto = RegisterData::fromRequest($request);
            $result = $this->userService->register($dto);
            
            return response()->json([
                'success' => true,
                'message' => 'Usuário registrado com sucesso!',
                'data' => $result
            ], 201);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao registrar usuário: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login do usuário
     * POST /api/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            $dto = LoginData::fromRequest($request);
            $result = $this->userService->login($dto);
            
            return response()->json([
                'success' => true,
                'message' => 'Login realizado com sucesso!',
                'data' => $result
            ], 200);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 401);
        }
    }

    /**
     * Logout do usuário
     * POST /api/logout
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $this->userService->logout($request->user());
            
            return response()->json([
                'success' => true,
                'message' => 'Logout realizado com sucesso!'
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao fazer logout: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obter usuário autenticado
     * GET /api/user
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()
        ], 200);
    }

    /**
     * Obter usuário por ID
     * GET /api/users/{id}
     */
    public function show(int $id, Request $request): JsonResponse
    {
        try {
            $viewerId = $request->user()?->id;
            $user = $this->userService->getUserById($id, $viewerId);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuário não encontrado'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $user
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao buscar usuário: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Atualizar perfil do utilizador
     * PUT /api/profile
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        try {
            $dto = UpdateProfileData::fromRequest($request);
            $user = $this->userService->updateProfile($dto, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Perfil atualizado com sucesso!',
                'data' => $user
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao atualizar perfil: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Alterar foto de perfil
     * POST /api/profile/photo
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        try {
            $this->userService->changePassword(
                $request->user()->id,
                $request->current_password,
                $request->password
            );

            return response()->json([
                'success' => true,
                'message' => 'Palavra-passe alterada com sucesso!',
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro de validação',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao alterar palavra-passe: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function userPosts(int $id, Request $request): JsonResponse
    {
        try {
            $posts = $this->postService->getPostsByUser($id, $request->user()->id);

            return response()->json([
                'success' => true,
                'data' => $posts,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao listar publicações: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function userComments(int $id): JsonResponse
    {
        try {
            $comments = $this->commentService->getCommentsByUser($id);

            return response()->json([
                'success' => true,
                'data' => $comments,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao listar comentários: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function updateProfilePhoto(UploadProfilePhotoRequest $request): JsonResponse
    {
        try {
            $photoPath = $request->file('photo')->store('profiles', 'public');
            $user = $this->userService->updateProfilePhoto($photoPath, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Foto de perfil atualizada com sucesso!',
                'data' => $user
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar foto de perfil: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Solicitar recuperação de senha
     * POST /api/recover-password
     */
    public function recoverPassword(RecoverPasswordRequest $request): JsonResponse
    {
        try {
            $message = $this->userService->recoverPassword($request->email);

            return response()->json([
                'success' => true,
                'message' => $message
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao solicitar recuperação de senha: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Definir nova senha
     * POST /api/reset-password
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        try {
            $this->userService->resetPassword($request->email, $request->password);

            return response()->json([
                'success' => true,
                'message' => 'Senha alterada com sucesso!'
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao resetar senha: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Seguir utilizador
     * POST /api/users/{id}/follow
     */
    public function follow(int $id, Request $request): JsonResponse
    {
        try {
            $this->followService->follow($request->user()->id, $id);

            return response()->json([
                'success' => true,
                'message' => 'Agora segue este utilizador.'
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao seguir utilizador: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deixar de seguir utilizador
     * DELETE /api/users/{id}/follow
     */
    public function unfollow(int $id, Request $request): JsonResponse
    {
        try {
            $this->followService->unfollow($request->user()->id, $id);

            return response()->json([
                'success' => true,
                'message' => 'Deixou de seguir este utilizador.'
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao deixar de seguir utilizador: ' . $e->getMessage()
            ], 500);
        }
    }

    public function deleteAccount(Request $request): JsonResponse
{
    try {
        $user = $request->user();

        // Verificar a password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Palavra-passe incorreta.'
            ], 401);
        }

        $this->userService->deleteAccount($user->id);

        return response()->json([
            'success' => true,
            'message' => 'Conta eliminada com sucesso.'
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Erro ao eliminar conta: ' . $e->getMessage()
        ], 500);
    }
}
}