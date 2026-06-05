<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Post;
use App\Models\Comment;
use App\Models\PostBaze;
use App\Models\Follow;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $users = [
            ['name' => 'Maria Costa',         'email' => 'maria@teste.com',      'bio' => 'UX Designer · Luanda',             'role' => 'utilizador'],
            ['name' => 'João Ferreira',        'email' => 'joao@teste.com',       'bio' => 'Full-stack developer',             'role' => 'utilizador'],
            ['name' => 'Ana Rodrigues',        'email' => 'ana@teste.com',        'bio' => 'Fotografia & Arte Digital',        'role' => 'utilizador'],
            ['name' => 'TechNews Angola',      'email' => 'tech@teste.com',       'bio' => 'Notícias de tecnologia em Angola', 'role' => 'utilizador'],
            ['name' => 'Design Daily',         'email' => 'design@teste.com',     'bio' => 'Design e criatividade',            'role' => 'utilizador'],
            ['name' => 'Test User',            'email' => 'test@example.com',     'bio' => 'Conta de teste principal',         'role' => 'administrador'],
            ['name' => 'Super Admin',          'email' => 'super@nzola.com',      'bio' => 'Conta superadmin',                 'role' => 'superadmin'],
            ['name' => 'Kizua Mbala',          'email' => 'kizua@teste.com',      'bio' => 'Músico & produtor · Luanda',       'role' => 'utilizador'],
            ['name' => 'Esperança Lopes',      'email' => 'esperanca@teste.com',  'bio' => 'Estudante de Direito · Luanda',    'role' => 'utilizador'],
            ['name' => 'Tiago Neto',           'email' => 'tiago@teste.com',      'bio' => 'Empreendedor & investidor',        'role' => 'utilizador'],
            ['name' => 'Beatriz Sousa',        'email' => 'beatriz@teste.com',    'bio' => 'Jornalista · NzolaNet',            'role' => 'utilizador'],
            ['name' => 'Carlos Diogo',         'email' => 'carlos@teste.com',     'bio' => 'Engenheiro Civil · Luanda',        'role' => 'utilizador'],
            ['name' => 'Inês Tavares',         'email' => 'ines@teste.com',       'bio' => 'Criadora de conteúdo digital',     'role' => 'utilizador'],
            ['name' => 'Manuel Sebastião',     'email' => 'manuel@teste.com',     'bio' => 'Programador Python & IA',          'role' => 'utilizador'],
            ['name' => 'Flávia Cardoso',       'email' => 'flavia@teste.com',     'bio' => 'Designer gráfico · Benguela',      'role' => 'utilizador'],
            ['name' => 'Pedro Almada',         'email' => 'pedro@teste.com',      'bio' => 'DevOps Engineer · Luanda',         'role' => 'utilizador'],
            ['name' => 'Luana Baptista',       'email' => 'luana@teste.com',      'bio' => 'Gestora de projetos digitais',     'role' => 'utilizador'],
            ['name' => 'Rui Mendonça',         'email' => 'rui@teste.com',        'bio' => 'Cybersecurity · Luanda',           'role' => 'utilizador'],
            ['name' => 'Patrícia Vieira',      'email' => 'patricia@teste.com',   'bio' => 'Marketing Digital & SEO',          'role' => 'utilizador'],
            ['name' => 'Nuno Correia',         'email' => 'nuno@teste.com',       'bio' => 'Mobile developer · Flutter',       'role' => 'utilizador'],
            ['name' => 'Sofia Martins',        'email' => 'sofia@teste.com',      'bio' => 'Estudante de Medicina · Luanda',   'role' => 'utilizador'],
            ['name' => 'André Fonseca',        'email' => 'andre@teste.com',      'bio' => 'Fotógrafo profissional',           'role' => 'utilizador'],
            ['name' => 'Cláudia Pinto',        'email' => 'claudia@teste.com',    'bio' => 'Professora universitária',         'role' => 'utilizador'],
            ['name' => 'Hélder Nascimento',    'email' => 'helder@teste.com',     'bio' => 'Arquiteto · Benguela',             'role' => 'utilizador'],
            ['name' => 'Vanessa Lima',         'email' => 'vanessa@teste.com',    'bio' => 'Influencer & criadora de moda',    'role' => 'utilizador'],
            ['name' => 'Bruno Gaspar',         'email' => 'bruno@teste.com',      'bio' => 'Data scientist · Luanda',          'role' => 'utilizador'],
            ['name' => 'Leonor Alves',         'email' => 'leonor@teste.com',     'bio' => 'Advogada & activista digital',     'role' => 'utilizador'],
            ['name' => 'Simão Pereira',        'email' => 'simao@teste.com',      'bio' => 'Engenheiro de software · Luanda',  'role' => 'utilizador'],
            ['name' => 'Daniela Cruz',         'email' => 'daniela@teste.com',    'bio' => 'Psicóloga & escritora',            'role' => 'utilizador'],
            ['name' => 'Francisco Teixeira',   'email' => 'francisco@teste.com',  'bio' => 'CEO de startup angolana',          'role' => 'utilizador'],
        ];

        $postContents = [
            'Olá NzolaNet! Primeira publicação por aqui! 👋',
            'A tecnologia está a mudar Angola. Que futuro queremos?',
            'Alguém mais ama a vibe de Luanda ao entardecer? 🌅',
            'Dicas de produtividade para developers 🚀',
            'Angola tem tanto talento! Vamos apoiar-nos uns aos outros 🇦🇴',
            'Hoje aprendi algo novo sobre programação. Nunca parar de aprender!',
            'Música angolana é a melhor do mundo 🎵',
            'O que andam a ler? Preciso de recomendações 📚',
            'A inteligência artificial vai mudar tudo...',
            'Bom dia NzolaNet! Que o dia seja produtivo ☀️',
            'Qual é a vossa stack favorita? React, Angular ou Vue?',
            'Luanda de noite é outra cidade 🌙',
            'Acabei de lançar o meu primeiro projeto open source!',
            'Cada erro é uma lição. Não desistam! 💪',
            'Quem mais está a aprender sobre machine learning?',
            'Angola precisa de mais startups tecnológicas. Concordam?',
            'Fim de semana de código e café ☕',
            'Partilhem os vossos projetos! Quero ver o que andam a criar.',
            'A comunidade NzolaNet está a crescer muito. Que orgulho! 🙌',
            'Trabalhar remotamente mudou a minha vida completamente.',
            'Alguém recomenda algum curso online de UX/UI?',
            'Benguela também tem muito talento! Não é só Luanda 😄',
            'Open source é o futuro. Contribuam para projetos angolanos!',
            'Qual o maior desafio que já enfrentaram num projeto?',
            'Hoje fiz deploy sem erros. Dia de vitória! 🎉',
            'A saúde mental dos developers é um tema sério. Cuidem-se! 🧠',
            'Quanto tempo demoram a revistar o código de outra pessoa?',
            'Git rebase ou git merge? Eterna discussão 😂',
            'Cinco anos a programar e ainda aprendo algo novo todos os dias.',
            'Quem mais usa dark mode em tudo? 🌑',
            'O mercado de trabalho tech em Angola está a crescer muito!',
            'Hoje ajudei um colega a resolver um bug de 3 horas em 5 minutos 😅',
            'Qual a vossa opinião sobre trabalho híbrido?',
            'Sonho em criar uma plataforma 100% angolana. Quem se junta? 🇦🇴',
            'Aprender inglês foi o melhor investimento que fiz na minha carreira.',
            'Mockups prontos! Amanhã começo o desenvolvimento. 🎨',
            'Code review é amor ao próximo. Façam sempre! ❤️',
            'Primeiro emprego na área de tecnologia conseguido! 🥳',
            'Qual IDE usam no dia a dia? VS Code gang! 💻',
            'Angola no mapa do tech mundial. É possível! 🌍',
            'Fiz uma API do zero hoje. Orgulho máximo! 🔧',
            'Quem mais acha que os testes unitários salvam vidas? 😂',
            'Luanda tem energia que não existe em mais lugar nenhum.',
            'Backend ou frontend? Sempre esta guerra 😄',
            'Hoje o servidor caiu e aprendi muito sobre resiliência 🙃',
        ];

        $commentContents = [
            'Concordo totalmente! 👏',
            'Muito interessante, obrigado por partilhar.',
            'Nunca tinha pensado nisso assim.',
            'Boa publicação! Continua assim.',
            'Partilhei com os meus amigos.',
            'Continua a partilhar este tipo de conteúdo!',
            'Angola representa! 🇦🇴',
            'Que perspetiva incrível.',
            'Aprendi muito com isto, obrigado.',
            'Totalmente de acordo contigo.',
            'Precisamos de mais pessoas a pensar assim.',
            'Isto é exatamente o que precisava de ler hoje.',
            'Vou experimentar isso no meu próximo projeto.',
            'Tens mais recursos sobre este tema?',
            'Segui-te para não perder mais publicações! 🔔',
            'Grande conteúdo como sempre!',
            'Partilha mais sobre este assunto por favor.',
            'Inspirador! Obrigado 🙏',
            'Eu também passei por isso! Força! 💪',
            'Que boa dica, vou aplicar já.',
            'Estou a guardar esta publicação para mais tarde.',
            'Isto merecia mais atenção da comunidade.',
            'Já segui! Conteúdo de qualidade.',
            'Faz sentido, nunca tinha visto assim.',
            'Obrigado por partilhar a tua experiência.',
            'Isto vai ajudar muita gente.',
            'Exactamente o que eu precisava hoje.',
            'Tens razão em tudo isso.',
            'Vou partilhar com a minha equipa.',
            'Que post incrível, parabéns! 🎉',
        ];

        $replyContents = [
            'Boa pergunta! Também tenho curiosidade.',
            'Obrigado pelo feedback! 😊',
            'Vou ver isso sim, obrigado pela dica.',
            'Exactamente o que eu penso também!',
            'Haha sim, acontece muito isso!',
            'Vou partilhar mais em breve, fica atento.',
            'Obrigado pelo apoio! 🙌',
            'Fico feliz que tenha ajudado!',
            'Sim, vou explorar mais este tema.',
            'Obrigado por comentares! 🙏',
            'Concordo, é mesmo assim.',
            'Tens razão, vou melhorar isso.',
            'Boa observação, obrigado!',
            'Vamos trocar experiências em privado? 😄',
            'Isso mesmo! Estamos juntos nisto.',
        ];

        $createdUsers = [];

        foreach ($users as $userData) {
            $createdUsers[] = User::create([
                'name'       => $userData['name'],
                'email'      => $userData['email'],
                'password'   => bcrypt('password'),
                'bio'        => $userData['bio'],
                'role'       => $userData['role'],
                'is_active'  => true,
                'is_private' => false,
            ]);
        }

        $allPosts = [];

        foreach ($createdUsers as $user) {
            $postsCount = rand(8, 15);
            for ($i = 0; $i < $postsCount; $i++) {
                $allPosts[] = Post::create([
                    'user_id' => $user->id,
                    'content' => $postContents[array_rand($postContents)],
                ]);
            }
        }

        foreach ($allPosts as $post) {
            $commentCount    = rand(5, 12);
            $createdComments = [];

            for ($i = 0; $i < $commentCount; $i++) {
                $commenter         = $createdUsers[array_rand($createdUsers)];
                $createdComments[] = Comment::create([
                    'user_id'   => $commenter->id,
                    'post_id'   => $post->id,
                    'parent_id' => null,
                    'content'   => $commentContents[array_rand($commentContents)],
                ]);
            }

            foreach ($createdComments as $comment) {
                $replyCount = rand(1, 5);
                for ($i = 0; $i < $replyCount; $i++) {
                    $replier = $createdUsers[array_rand($createdUsers)];
                    Comment::create([
                        'user_id'   => $replier->id,
                        'post_id'   => $post->id,
                        'parent_id' => $comment->id,
                        'content'   => $replyContents[array_rand($replyContents)],
                    ]);
                }
            }
        }

        foreach ($allPosts as $post) {
            $shuffled = collect($createdUsers)->shuffle()->take(rand(3, count($createdUsers)));
            foreach ($shuffled as $user) {
                PostBaze::firstOrCreate([
                    'user_id' => $user->id,
                    'post_id' => $post->id,
                ]);
            }
        }

        foreach ($createdUsers as $follower) {
            $toFollow = collect($createdUsers)
                ->filter(fn($u) => $u->id !== $follower->id)
                ->shuffle()
                ->take(rand(5, count($createdUsers) - 1));

            foreach ($toFollow as $following) {
                Follow::firstOrCreate([
                    'follower_id'  => $follower->id,
                    'following_id' => $following->id,
                ]);
            }
        }
    }
}