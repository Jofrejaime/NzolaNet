<?php

declare(strict_types=1);

namespace App\Services\Api;

use App\Repositories\Api\PostRepository;

class ExploreService
{
    public function __construct(
        protected PostRepository $postRepository
    ) {}

    /**
     * Get popular posts based on engagement (comments + bazes)
     */
    public function getPopularPosts(?int $userId = null, int $perPage = 15)
    {
        return $this->postRepository->getPopularPosts($userId, $perPage);
    }

    /**
     * Get trending hashtags from recent posts
     */
    public function getTrends(int $limit = 5)
    {
        // Extract from the last 200 public posts to keep it somewhat light
        $posts = $this->postRepository->getRecentPublicPosts(200);
        
        $hashtagCounts = [];

        foreach ($posts as $post) {
            // Match #hashtags. Ignore trailing punctuation.
            // Example: "Hello #world! #tech" -> ["world", "tech"]
            preg_match_all('/#(\w+)/u', $post->content, $matches);
            
            if (!empty($matches[1])) {
                // Ensure unique hashtags per post so a spam post with "#tech #tech" counts only once
                $uniqueTags = array_unique($matches[1]);
                
                foreach ($uniqueTags as $tag) {
                    $lowerTag = mb_strtolower($tag);
                    if (!isset($hashtagCounts[$lowerTag])) {
                        $hashtagCounts[$lowerTag] = [
                            'original' => $tag,
                            'count' => 0
                        ];
                    }
                    $hashtagCounts[$lowerTag]['count']++;
                }
            }
        }

        // Sort by frequency descending
        usort($hashtagCounts, function ($a, $b) {
            return $b['count'] <=> $a['count'];
        });

        // Take top N
        $topTags = array_slice($hashtagCounts, 0, $limit);

        // Map to frontend expected format
        $trends = [];
        foreach ($topTags as $tagData) {
            $trends[] = [
                'category' => 'Tendência NzolaNet',
                'tag' => '#' . $tagData['original'],
                'posts' => $tagData['count'] . ($tagData['count'] == 1 ? ' post' : ' posts'),
            ];
        }

        return $trends;
    }
}
