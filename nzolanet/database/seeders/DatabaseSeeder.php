<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Post;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Criar utilizadores de teste
        $users = [
            ['name' => 'Maria Costa', 'email' => 'maria@teste.com', 'bio' => 'UX Designer · Luanda'],
            ['name' => 'João Ferreira', 'email' => 'joao@teste.com', 'bio' => 'Full-stack developer'],
            ['name' => 'Ana Rodrigues', 'email' => 'ana@teste.com', 'bio' => 'Fotografia & Arte Digital'],
            ['name' => 'TechNews Angola', 'email' => 'tech@teste.com', 'bio' => 'Notícias de tecnologia em Angola'],
            ['name' => 'Design Daily', 'email' => 'design@teste.com', 'bio' => 'Design e criatividade'],
            ['name' => 'Test User', 'email' => 'test@example.com', 'bio' => 'Conta de teste principal'],
        ];

        foreach ($users as $userData) {
            $user = User::factory()->create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => bcrypt('password'),
                'bio' => $userData['bio'],
                'role' => $userData['email'] === 'test@example.com' ? 'administrador' : 'utilizador',
            ]);

            // Criar algumas publicações para cada utilizador
            $contents = [
                'Olá NzolaNet! Primeira publicação por aqui!',
                'A tecnologia está a mudar Angola. Que futuro queremos?',
                'Alguém mais ama a vibe de Luanda ao entardecer?',
                'Dicas de produtividade para developers ',
                'Angola tem tanto talento! Vamos apoiar-nos uns aos outros',
                'Hoje aprendi algo novo sobre programação. Nunca parar de aprender!',
                'Música angolana é a melhor do mundo',
                'O que andam a ler? Preciso de recomendações',
                'A inteligência artificial vai mudar tudo...',
                'Bom dia NzolaNet! Que o dia seja produtivo',
            ];

            $postsCount = rand(1, 4);
            for ($i = 0; $i < $postsCount; $i++) {
                Post::create([
                    'user_id' => $user->id,
                    'content' => $contents[array_rand($contents)],
                ]);
            }
        }
    }
}