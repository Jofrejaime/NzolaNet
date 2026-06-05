<?php

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\BazeController;
use App\Http\Controllers\Api\AdminController;
use Illuminate\Support\Facades\Route;

// Rotas públicas (sem autenticação)
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::post('/recover-password', [UserController::class, 'recoverPassword']);
Route::post('/reset-password', [UserController::class, 'resetPassword']);

// Rotas protegidas (requerem token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/user', [UserController::class, 'user']);

    // Gestão de Perfil e Seguidores
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::put('/profile/password', [UserController::class, 'changePassword']);
    Route::post('/profile/photo', [UserController::class, 'updateProfilePhoto']);

    // Listar e pesquisar utilizadores
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::get('/users/{id}/posts', [UserController::class, 'userPosts']);
    Route::get('/users/{id}/comments', [UserController::class, 'userComments']);
    Route::post('/users/{id}/follow', [UserController::class, 'follow']);
    Route::delete('/users/{id}/follow', [UserController::class, 'unfollow']);
    Route::get('/users/{id}/following', [UserController::class, 'following']);
    Route::get('/users/{id}/followers', [UserController::class, 'followers']);

    // Gestão de Publicações
    Route::apiResource('posts', PostController::class);
    Route::post('/posts/{postId}/baze', [BazeController::class, 'store']);
    Route::delete('/posts/{postId}/baze', [BazeController::class, 'destroy']);

    // Gestão de Comentários
    Route::get('/posts/{postId}/comments', [CommentController::class, 'index']);
    Route::post('/posts/{postId}/comments', [CommentController::class, 'store']);
    Route::put('/comments/{id}', [CommentController::class, 'update']);
    Route::delete('/comments/{id}', [CommentController::class, 'destroy']);

    // Painel administrativo (admin + superadmin)
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::patch('/users/{id}/toggle', [AdminController::class, 'toggleUser']);
        Route::get('/posts', [AdminController::class, 'posts']);
        Route::delete('/posts/{id}', [AdminController::class, 'deletePost']);
        Route::get('/comments', [AdminController::class, 'comments']);
        Route::delete('/comments/{id}', [AdminController::class, 'deleteComment']);

        // SuperAdmin apenas: gerir admins e eliminar users
        Route::middleware('superadmin')->group(function () {
            Route::post('/users/{id}/promote', [AdminController::class, 'promoteToAdmin']);
            Route::post('/users/{id}/demote', [AdminController::class, 'demoteFromAdmin']);
            Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        });
    });
});
