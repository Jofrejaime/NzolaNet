<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Repositories\Api\Admin\AdminRepository;
use App\Repositories\Api\Admin\AdminRepositoryEloquent;
use App\Repositories\Api\UserRepository;
use App\Repositories\Api\UserRepositoryEloquent;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->register(\Prettus\Repository\Providers\RepositoryServiceProvider::class);
        $this->app->bind(
            UserRepository::class,
            UserRepositoryEloquent::class
        );
        $this->app->bind(
            \App\Repositories\Api\PostRepository::class,
            \App\Repositories\Api\PostRepositoryEloquent::class
        );
        $this->app->bind(
            \App\Repositories\Api\CommentRepository::class,
            \App\Repositories\Api\CommentRepositoryEloquent::class
        );
        $this->app->bind(
            \App\Repositories\Api\FollowRepository::class,
            \App\Repositories\Api\FollowRepositoryEloquent::class
        );
        $this->app->bind(
            \App\Repositories\Api\PostBazeRepository::class,
            \App\Repositories\Api\PostBazeRepositoryEloquent::class
        );
        $this->app->bind(
            \App\Repositories\Api\NotificationRepository::class,
            \App\Repositories\Api\NotificationRepositoryEloquent::class
        );
        $this->app->bind(
            AdminRepository::class,
            AdminRepositoryEloquent::class
        );
        $this->app->bind(
            \App\Repositories\Api\ReportRepository::class,
            \App\Repositories\Api\ReportRepositoryEloquent::class
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
