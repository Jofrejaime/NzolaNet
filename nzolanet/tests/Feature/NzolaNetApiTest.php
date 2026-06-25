<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Post;
use App\Models\Comment;

class NzolaNetApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_update_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'Old Name',
            'bio' => 'Old Bio',
            'is_private' => false,
        ]);

        $response = $this->actingAs($user, 'sanctum')->putJson('/api/profile', [
            'name' => 'New Name',
            'bio' => 'New Bio',
            'is_private' => true,
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'New Name',
            'bio' => 'New Bio',
            'is_private' => true,
        ]);
    }

    public function test_user_can_follow_and_unfollow_others(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Follow
        $response = $this->actingAs($user1, 'sanctum')->postJson("/api/users/{$user2->id}/follow");
        $response->assertStatus(200);
        $this->assertDatabaseHas('follows', [
            'follower_id' => $user1->id,
            'following_id' => $user2->id,
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $user2->id,
            'type' => 'follow',
            'from_user_id' => $user1->id,
        ]);

        // Unfollow
        $response = $this->actingAs($user1, 'sanctum')->deleteJson("/api/users/{$user2->id}/follow");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('follows', [
            'follower_id' => $user1->id,
            'following_id' => $user2->id,
        ]);
    }

    public function test_user_can_recover_and_reset_password(): void
    {
        $user = User::factory()->create([
            'email' => 'recover@example.com',
            'password' => bcrypt('old_password'),
        ]);

        // Recover request
        $response = $this->postJson('/api/recover-password', [
            'email' => 'recover@example.com',
        ]);
        $response->assertStatus(200);

        // Reset request
        $response = $this->postJson('/api/reset-password', [
            'email' => 'recover@example.com',
            'password' => 'new_password_123',
            'password_confirmation' => 'new_password_123',
        ]);
        $response->assertStatus(200);

        // Try login with new password
        $response = $this->postJson('/api/login', [
            'email' => 'recover@example.com',
            'password' => 'new_password_123',
        ]);
        $response->assertStatus(200);
    }

    public function test_post_lifecycle(): void
    {
        $user = User::factory()->create();

        // Create post
        $response = $this->actingAs($user, 'sanctum')->postJson('/api/posts', [
            'content' => 'Hello World Post',
        ]);
        $response->assertStatus(201);
        $postId = $response->json('data.id');

        $this->assertDatabaseHas('posts', [
            'id' => $postId,
            'content' => 'Hello World Post',
            'user_id' => $user->id,
        ]);

        // List posts
        $response = $this->actingAs($user, 'sanctum')->getJson('/api/posts');
        $response->assertStatus(200);
        $response->assertJsonFragment(['content' => 'Hello World Post']);

        // Update post
        $response = $this->actingAs($user, 'sanctum')->putJson("/api/posts/{$postId}", [
            'content' => 'Updated content',
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('posts', [
            'id' => $postId,
            'content' => 'Updated content',
        ]);

        // Delete post
        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/posts/{$postId}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('posts', [
            'id' => $postId,
        ]);
    }

    public function test_comment_lifecycle(): void
    {
        $user = User::factory()->create();
        $post = Post::create([
            'user_id' => $user->id,
            'content' => 'Original Post',
        ]);

        // Create comment
        $response = $this->actingAs($user, 'sanctum')->postJson("/api/posts/{$post->id}/comments", [
            'content' => 'This is a comment',
        ]);
        $response->assertStatus(201);
        $commentId = $response->json('data.id');

        $this->assertDatabaseHas('comments', [
            'id' => $commentId,
            'content' => 'This is a comment',
            'user_id' => $user->id,
            'post_id' => $post->id,
        ]);

        // List comments
        $response = $this->actingAs($user, 'sanctum')->getJson("/api/posts/{$post->id}/comments");
        $response->assertStatus(200);
        $response->assertJsonFragment(['content' => 'This is a comment']);

        // Update comment
        $response = $this->actingAs($user, 'sanctum')->putJson("/api/comments/{$commentId}", [
            'content' => 'Updated comment',
        ]);
        $response->assertStatus(200);
        $this->assertDatabaseHas('comments', [
            'id' => $commentId,
            'content' => 'Updated comment',
        ]);

        // Delete comment
        $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/comments/{$commentId}");
        $response->assertStatus(200);
        $this->assertDatabaseMissing('comments', [
            'id' => $commentId,
        ]);
    }

    public function test_comment_creates_notification_for_post_owner(): void
    {
        $owner = User::factory()->create();
        $commenter = User::factory()->create();
        $post = Post::create([
            'user_id' => $owner->id,
            'content' => 'Original Post',
        ]);

        $response = $this->actingAs($commenter, 'sanctum')->postJson("/api/posts/{$post->id}/comments", [
            'content' => 'Nice post',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $owner->id,
            'type' => 'comment',
            'from_user_id' => $commenter->id,
            'post_id' => $post->id,
        ]);
    }

    public function test_notifications_can_be_listed_and_marked_as_read(): void
    {
        $owner = User::factory()->create();
        $fan = User::factory()->create();
        $post = Post::create([
            'user_id' => $owner->id,
            'content' => 'Original Post',
        ]);

        $this->actingAs($fan, 'sanctum')->postJson("/api/posts/{$post->id}/baze")
            ->assertStatus(200);

        $listResponse = $this->actingAs($owner, 'sanctum')->getJson('/api/notifications');
        $listResponse->assertStatus(200);
        $listResponse->assertJsonFragment(['type' => 'baze']);

        $notificationId = $listResponse->json('data.data.0.id');
        $this->actingAs($owner, 'sanctum')->putJson("/api/notifications/{$notificationId}/read")
            ->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'id' => $notificationId,
            'is_read' => true,
        ]);
    }

    public function test_private_profile_posts_are_visible_only_to_followers_or_owner(): void
    {
        $privateUser = User::factory()->create(['is_private' => true]);
        $stranger = User::factory()->create();
        $follower = User::factory()->create();

        $post = Post::create([
            'user_id' => $privateUser->id,
            'content' => 'Private post',
        ]);

        $this->actingAs($stranger, 'sanctum')->getJson('/api/posts')
            ->assertStatus(200)
            ->assertJsonMissing(['content' => 'Private post']);

        $this->actingAs($follower, 'sanctum')->postJson("/api/users/{$privateUser->id}/follow")
            ->assertStatus(200);

        $this->actingAs($follower, 'sanctum')->getJson('/api/posts')
            ->assertStatus(200)
            ->assertJsonFragment(['content' => 'Private post']);

        $this->actingAs($privateUser, 'sanctum')->getJson("/api/posts/{$post->id}")
            ->assertStatus(200)
            ->assertJsonFragment(['content' => 'Private post']);
    }
}
