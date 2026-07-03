# NzolaNet — Padrões Arquiteturais: Services, Repositories, DTOs e FormRequests

> **Guia completo:** O que são, por que usamos, como implementamos e como cada camada sabe o que fazer.

---

## ÍNDICE

1. [Introdução: Por que usar padrões?](#1-introdução)
2. [FormRequest — Validação na porta de entrada](#2-formrequest)
3. [DTO (Data Transfer Object) — O veículo dos dados](#3-dto)
4. [Service — O cérebro da lógica de negócio](#4-service)
5. [Repository — A abstração do banco de dados](#5-repository)
6. [Como as camadas se conectam](#6-como-as-camadas-se-conectam)
7. [O ciclo completo passo a passo](#7-ciclo-completo)
8. [Benefícios de cada padrão](#8-benefícios)
9. [E se não usássemos esses padrões?](#9-e-se-não-usássemos)
10. [Perguntas e respostas para a banca](#10-perguntas-e-respostas)

---

## 1. Introdução

### 1.1 O problema que resolvemos

Imagine um sistema sem padrões. O Controller faria tudo:

```php
// ❌ SEM PADRÕES — Tudo misturado no Controller
class PostController extends Controller {
    public function store(Request $request) {
        // 1. Validação manual
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:1000',
            'image' => 'nullable|image|max:5120'
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 2. Upload manual
        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('posts', 'public');
        }

        // 3. Query direta no banco
        $post = Post::create([
            'user_id' => $request->user()->id,
            'content' => $request->content,
            'image' => $imagePath
        ]);

        // 4. Retorno
        return response()->json($post, 201);
    }
}
```

**Problemas dessa abordagem:**
- ❌ Controller faz **validação + upload + query + response** — viola Single Responsibility
- ❌ Se a regra de negócio mudar (ex: aceitar vídeo), mexe no Controller
- ❌ Se trocar de ORM (Ex: Eloquent → Doctrine), reescreve tudo
- ❌ Impossível testar a lógica de criação sem chamar a API inteira
- ❌ Código duplicado se outro Controller precisar criar post

### 1.2 A solução com padrões

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│  Controller  │───▶│  Service     │───▶│  Repository   │───▶│  Model (Eloquent)│
│  (orquestra) │    │  (regras)    │    │  (acesso BD)  │    │  (ORM)           │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────────────┘
       │                    │                    │
       │ usa                │ usa                │ usa
       ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────────┐
│  FormRequest │    │  DTO (Data)  │    │  MySQL (BD)      │
│  (validação) │    │  (transporte)│    │  (banco real)    │
└──────────────┘    └──────────────┘    └──────────────────┘
```

**Cada camada tem UMA responsabilidade:**

| Camada | Responsabilidade | Sabe sobre... |
|--------|-----------------|---------------|
| **FormRequest** | Validar dados de entrada | Regras de validação (campos obrigatórios, tipos, tamanhos) |
| **Controller** | Receber request, delegar, retornar JSON | HTTP (status codes, headers), injeção de dependências |
| **DTO** | Transportar dados validados entre camadas | A estrutura dos dados (tipos, nomes dos campos) |
| **Service** | Lógica de negócio, regras, orquestração | O negócio (quem pode editar, o que fazer antes/depois) |
| **Repository** | Abstrair acesso a dados | Queries, banco de dados, ORM |
| **Model** | Mapear entidade do banco (ORM) | Tabelas, relacionamentos, colunas |

---

## 2. FormRequest — Validação na Porta de Entrada

### 2.1 O que é?

**FormRequest** é uma classe do Laravel que **encapsula a validação** dos dados recebidos. Em vez de validar dentro do Controller, o Laravel resolve automaticamente a FormRequest antes de chegar ao método do Controller.

### 2.2 Implementação no projeto

**Arquivo:** `nzolanet/app/Http/Requests/Api/CreatePostRequest.php`

```php
namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class CreatePostRequest extends FormRequest
{
    // 1. Quem pode fazer esta requisição?
    public function authorize(): bool
    {
        return true;  // ← true = qualquer user autenticado pode criar post
                     // Se fosse false, Laravel retornaria 403 automaticamente
    }

    // 2. Quais as regras de validação?
    public function rules(): array
    {
        return [
            'content' => 'required_without_all:image,video|nullable|string|max:1000',
            //          ↑ conteúdo é obrigatório SE não tiver imagem nem vídeo
            'image'   => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            //          ↑ opcional, tem que ser imagem, máx 5MB
            'video'   => 'nullable|file|mimes:mp4,mov,avi,webm|max:20480',
            //          ↑ opcional, tem que ser vídeo, máx 20MB
        ];
    }

    // 3. Mensagens de erro customizadas (em português)
    public function messages(): array
    {
        return [
            'content.required_without_all' => 'A publicação deve conter texto, imagem ou vídeo',
            'image.image' => 'O ficheiro de imagem deve ser uma imagem',
            'image.max' => 'A imagem não pode ultrapassar 5MB',
            'video.max' => 'O vídeo não pode ultrapassar 20MB',
        ];
    }
}
```

**Outro exemplo — RegisterRequest:**

```php
// Arquivo: RegisterRequest.php
class RegisterRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name'     => 'required|string|max:255',     // Obrigatório
            'email'    => 'required|email|unique:users,email', // Deve ser único
            'password' => 'required|string|min:8|confirmed',   // Mínimo 8, com confirmação
            'bio'      => 'nullable|string|max:500',           // Opcional
            'is_private' => 'boolean'
        ];
    }
}
```

### 2.3 Como o Laravel "sabe" usar a FormRequest?

**Mágica do Laravel (Injeção de Dependência + Service Container):**

```php
// No Controller — em vez de receber Request, recebe a FormRequest específica
public function store(CreatePostRequest $request): JsonResponse
//                          ↑
// Laravel vê o tipo hint e automaticamente:
//  1. Instancia CreatePostRequest
//  2. Executa o método authorize() — se false → 403
//  3. Executa o método rules() — valida os dados
//  4. Se falhar → retorna 422 automaticamente (NUNCA chega ao Controller)
//  5. Se passar → injeta a request já validada no Controller
```

**Fluxo visual:**
```
HTTP POST /api/posts (body: { content: "", image: null, video: null })
    │
    ▼
Laravel Router: PostController@store(CreatePostRequest $request)
    │
    ▼
Laravel Service Container cria CreatePostRequest
    │
    ▼
authorize() → true (pode continuar)
    │
    ▼
rules() → valida:
  - content: required_without_all:image,video → VAZIO e SEM imagem/vídeo → FALHA
    │
    ▼
Retorna 422 automaticamente:
{
  "message": "A publicação deve conter texto, imagem ou vídeo",
  "errors": {
    "content": ["A publicação deve conter texto, imagem ou vídeo"]
  }
}
    │
    ▼
(NUNCA chega ao Controller.store)
```

### 2.4 Por que usar FormRequest em vez de validar no Controller?

| Abordagem | Problema |
|-----------|----------|
| Validar no Controller | Se precisar da mesma validação em outro lugar, duplica código |
| Usar `$request->validate()` | Funciona, mas polui o Controller com regras |
| **FormRequest** | ✅ Isolado, reutilizável, testável, mensagens em português |

### 2.5 Como o FormRequest "sabe" validar?

O Laravel fornece métodos que você **sobrescreve**:
- `rules()` → retorna array de regras de validação
- `messages()` → retorna array de mensagens customizadas
- `authorize()` → retorna bool (permissão)

O Laravel **chama esses métodos automaticamente** quando a classe é injetada no Controller.

---

## 3. DTO (Data Transfer Object) — O Veículo dos Dados

### 3.1 O que é?

**DTO** é um objeto simples que **transporta dados** entre camadas. No projeto, ele tem duas funções:
1. **Extrair** os dados validados da Request (transformar)
2. **Carregar** esses dados para o Service de forma tipada e segura

### 3.2 Implementação no projeto

**Arquivo:** `nzolanet/app/Data/Api/Post/CreatePostData.php`

```php
namespace App\Data\Api\Post;

use Spatie\LaravelData\Data;              // ← Biblioteca spatie/laravel-data
use App\Http\Requests\Api\CreatePostRequest;

class CreatePostData extends Data          // ← Estende a classe base Data
{
    // Propriedades tipadas com readonly (só leitura, imutáveis)
    public function __construct(
        public readonly ?string $content = null,    // string ou null
        public readonly ?string $image = null,       // caminho do ficheiro
        public readonly ?string $video = null        // caminho do ficheiro
    ) {}

    // Factory method: cria o DTO a partir da Request
    public static function fromRequest(
        CreatePostRequest $request,
        ?string $imagePath = null,
        ?string $videoPath = null
    ): self {
        return new self(
            content: $request->content,      // Pega o conteúdo validado da Request
            image: $imagePath,               // Caminho do upload (já processado)
            video: $videoPath
        );
    }

    // Converte o DTO para array (para criar no banco)
    public function toArray(): array
    {
        return [
            'content' => $this->content,
            'image' => $this->image,
            'video' => $this->video,
        ];
    }
}
```

**Outro exemplo — LoginData (sem biblioteca, implementação manual):**

```php
namespace App\Data\Api\User;

use App\Http\Requests\Api\LoginRequest;

class LoginData        // ← NÃO estende nada (implementação manual)
{
    public function __construct(
        public readonly string $email,
        public readonly string $password,
        public readonly bool $rememberMe = false
    ) {}

    public static function fromRequest(LoginRequest $request): self
    {
        return new self(
            email: $request->email,
            password: $request->password,
            rememberMe: $request->remember_me ?? false
        );
    }

    public function toArray(): array
    {
        return [
            'email' => $this->email,
            'password' => $this->password
        ];
    }
}
```

### 3.3 Fluxo de uso do DTO

```
Request HTTP bruta (array associativo)
    │
    ▼
[1] FormRequest valida os dados
    │
    ▼
[2] Controller chama: CreatePostData::fromRequest($request, $imagePath)
    │
    ├── Pega $request->content (já validado)
    ├── Pega $imagePath (resultado do upload)
    └── Cria objeto tipado
    │
    ▼
[3] DTO é passado para o Service:
    $this->postService->create($dto, $userId);
    │
    ▼
[4] Service usa $dto->content, $dto->image, $dto->video
    │    (com autocomplete, type safety, imutável)
    │
    ▼
[5] Service chama $dto->toArray() para passar ao Repository
```

### 3.4 Por que usar DTO em vez de passar array puro?

| Abordagem | Problema |
|-----------|----------|
| `$data = $request->all()` | Array sem tipo, pode ter campos extras, sem segurança |
| `$data = ['content' => $request->content]` | Manual, sujeito a erros de digitação |
| **DTO** | ✅ Tipado, imutável, com factory, autocomplete no IDE |

### 3.5 Como o DTO "sabe" se transformar?

Ele tem dois métodos **definidos por nós**:
- **`fromRequest()`** — método estático que recebe a Request e extrai os campos necessários
- **`toArray()`** — método que converte o objeto de volta para array

O pattern é sempre o mesmo:
```php
// Criar DTO a partir da request
$dto = CreatePostData::fromRequest($request, $imagePath, $videoPath);

// Usar DTO no Service
public function create(CreatePostData $dto, int $userId): Post
{
    $data = $dto->toArray();           // → ['content' => '...', 'image' => '...']
    $data['user_id'] = $userId;        // Adiciona campo extra
    return $this->postRepository->create($data);
}
```

---

## 4. Service — O Cérebro da Lógica de Negócio

### 4.1 O que é?

**Service** é a camada onde **toda a lógica de negócio** vive. O Controller não toma decisões — ele só pergunta ao Service o que fazer.

### 4.2 Implementação no projeto

**Arquivo:** `nzolanet/app/Services/Api/PostService.php`

```php
namespace App\Services\Api;

use App\Data\Api\Post\CreatePostData;
use App\Repositories\Api\PostRepository;
use App\Models\Post;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Storage;

class PostService
{
    // O Service RECEBE o Repository via construtor (injeção de dependência)
    public function __construct(
        protected PostRepository $postRepository
    ) {}

    /**
     * Obter feed principal de posts
     * REGRA DE NEGÓCIO:
     *   - Se user segue alguém → mostra posts de quem segue + próprios
     *   - Se não segue ninguém → mostra todos os posts
     */
    public function getFeed(?int $userId = null, int $perPage = 15)
    {
        if ($userId) {
            // REGRA: verificar se o user segue alguém
            $followingCount = \DB::table('follows')
                ->where('follower_id', $userId)
                ->count();

            if ($followingCount > 0) {
                // REGRA: feed personalizado
                return $this->postRepository->getLatestPostsForUser($userId, $perPage);
            }
        }

        // REGRA: feed global
        return $this->postRepository->getLatestPosts($perPage, $userId);
    }

    /**
     * Criar novo post
     * REGRA DE NEGÓCIO: apenas adiciona o user_id aos dados
     */
    public function create(CreatePostData $dto, int $userId): Post
    {
        $data = $dto->toArray();
        $data['user_id'] = $userId;

        return $this->postRepository->create($data);
    }

    /**
     * Atualizar post próprio
     * REGRA DE NEGÓCIO: SÓ o dono pode editar
     *   → Se user_id !== userId → AuthorizationException (403)
     */
    public function update(int $id, array $data, int $userId): Post
    {
        $post = $this->postRepository->find($id);

        // REGRA DE NEGÓCIO: verificar ownership
        if ($post->user_id !== $userId) {
            throw new AuthorizationException("Não tem permissão para editar esta publicação.");
        }

        return $this->postRepository->update($data, $id);
    }

    /**
     * Excluir post próprio
     * REGRA DE NEGÓCIO: SÓ o dono pode excluir
     *   → Remove ficheiros do storage antes de deletar
     */
    public function delete(int $id, int $userId): void
    {
        $post = $this->postRepository->find($id);

        // REGRA: verificar ownership
        if ($post->user_id !== $userId) {
            throw new AuthorizationException("Não tem permissão para excluir esta publicação.");
        }

        // REGRA: apagar ficheiros associados
        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }
        if ($post->video) {
            Storage::disk('public')->delete($post->video);
        }

        $this->postRepository->delete($id);
    }
}
```

**Outro exemplo — UserService com regras mais complexas:**

```php
class UserService
{
    public function register(RegisterData $dto): array
    {
        // REGRA 1: Email não pode estar duplicado
        $existingUser = $this->userRepository->findByEmail($dto->email);
        if ($existingUser) {
            throw ValidationException::withMessages([
                'email' => ['Este email já está registado.']
            ]);
        }

        // REGRA 2: Criar usuário
        $userData = $this->userRepository->create($dto->toArray());

        // REGRA 3: Todo novo usuário ganha um token de acesso
        $user = User::find($userData['id']);
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $userData,
            'access_token' => $token,
            'token_type' => 'Bearer'
        ];
    }

    public function login(LoginData $dto): array
    {
        // REGRA 1: Verificar credenciais
        $userData = $this->userRepository->findByCredentials($dto->email, $dto->password);
        if (!$userData) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.']
            ]);
        }

        // REGRA 2: Conta deve estar ativa
        if (!$userData['is_active']) {
            throw ValidationException::withMessages([
                'email' => ['Esta conta está desativada.']
            ]);
        }

        // REGRA 3: Gerar token de acesso
        $user = User::find($userData['id']);
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user->toArray(),
            'access_token' => $token,
            'token_type' => 'Bearer'
        ];
    }
}
```

### 4.3 O que o Service "sabe" fazer?

| Regra de negócio | Onde está | Código |
|-----------------|-----------|--------|
| Só o dono pode editar/excluir post | `PostService::update/delete` | `if ($post->user_id !== $userId) throw AuthorizationException` |
| Feed personalizado vs global | `PostService::getFeed` | `if (followingCount > 0) → posts de quem segue; senão → todos` |
| Email não pode duplicar | `UserService::register` | `if (findByEmail) throw ValidationException` |
| Conta desativada não pode logar | `UserService::login` | `if (!$userData['is_active']) throw ValidationException` |
| Apagar ficheiros ao deletar post | `PostService::delete` | `Storage::disk('public')->delete($post->image)` |
| Todo registro gera token | `UserService::register` | `$user->createToken('auth_token')->plainTextToken` |

### 4.4 Por que usar Service em vez de colocar lógica no Controller?

| Abordagem | Problema |
|-----------|----------|
| Lógica no Controller | Se precisar da mesma regra em outro lugar (ex: CLI, fila), duplica |
| Lógica no Model | Model fica gigante (God class), mistura ORM com regras |
| Lógica na View | Impossível testar |
| **Service** | ✅ Isolado, testável, reutilizável, orquestra várias fontes |

---

## 5. Repository — A Abstração do Banco de Dados

### 5.1 O que é?

**Repository** é uma camada que **abstrai o acesso a dados**. O Service nunca chama `Model::query()` diretamente — ele chama o Repository. Assim, se um dia trocar de ORM ou banco de dados, só muda a implementação do Repository.

### 5.2 Implementação no projeto: Interface + Implementação

O projeto usa o padrão **Repository Interface + Repository Eloquent**, com o pacote `prettus/l5-repository`.

**PASSO 1: Interface (contrato)**

**Arquivo:** `nzolanet/app/Repositories/Api/PostRepository.php`

```php
namespace App\Repositories\Api;

use Prettus\Repository\Contracts\RepositoryInterface;

interface PostRepository extends RepositoryInterface
{
    // Métodos CUSTOMIZADOS (além do CRUD genérico)
    public function getLatestPosts(int $perPage = 15, ?int $userId = null);
    public function getLatestPostsForUser(int $userId, int $perPage = 15);
    public function getPostsByUser(int $authorId, ?int $viewerId = null, int $perPage = 20);
}
```

**PASSO 2: Implementação concreta (Eloquent)**

**Arquivo:** `nzolanet/app/Repositories/Api/PostRepositoryEloquent.php`

```php
namespace App\Repositories\Api;

use Prettus\Repository\Eloquent\BaseRepository;  // ← Já tem create, update, delete, find
use Prettus\Repository\Criteria\RequestCriteria;
use App\Repositories\Api\PostRepository;
use App\Models\Post;

class PostRepositoryEloquent extends BaseRepository implements PostRepository
{
    // Diz para o Repository qual Model usar
    public function model()
    {
        return Post::class;
    }

    // Boot: aplica critérios globais (ex: filtros via query string)
    public function boot()
    {
        $this->pushCriteria(app(RequestCriteria::class));
    }

    // ============================================
    // MÉTODOS CUSTOMIZADOS
    // ============================================

    // Feed global: posts de users ativos, com user, withCount, withExists
    public function getLatestPosts(int $perPage = 15, ?int $userId = null)
    {
        $query = $this->model
            ->whereHas('user', fn($q) => $q->where('is_active', true))
            ->with(['user'])
            ->withCount(['comments', 'bazes'])
            ->orderBy('created_at', 'desc');

        if ($userId) {
            $query->withExists([
                'bazes as has_bazed' => fn($q) => $q->where('user_id', $userId),
            ]);
        }

        return $query->paginate($perPage);
    }

    // Feed personalizado: posts de quem o user segue
    public function getLatestPostsForUser(int $userId, int $perPage = 15)
    {
        $followingIds = \DB::table('follows')
            ->where('follower_id', $userId)
            ->join('users', 'users.id', '=', 'follows.following_id')
            ->where('users.is_active', true)
            ->pluck('follows.following_id')
            ->toArray();

        $followingIds[] = $userId;  // Inclui próprios posts

        return $this->model
            ->whereIn('user_id', $followingIds)
            ->with(['user'])
            ->withCount(['comments', 'bazes'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    // Posts de um autor específico
    public function getPostsByUser(int $authorId, ?int $viewerId = null, int $perPage = 20)
    {
        $query = $this->model
            ->where('user_id', $authorId)
            ->with(['user'])
            ->withCount(['comments', 'bazes'])
            ->orderBy('created_at', 'desc');

        if ($viewerId) {
            $query->withExists([
                'bazes as has_bazed' => fn($q) => $q->where('user_id', $viewerId),
            ]);
        }

        return $query->paginate($perPage);
    }
}
```

**Outro exemplo — UserRepositoryEloquent:**

```php
class UserRepositoryEloquent extends BaseRepository implements UserRepository
{
    public function model() { return User::class; }

    // Método customizado: busca por email
    public function findByEmail(string $email): ?array
    {
        $user = $this->findWhere(['email' => $email])->first();
        return $user ? $user->toArray() : null;
    }

    // Método customizado: busca por credenciais (verifica hash)
    public function findByCredentials(string $email, string $password): ?array
    {
        $user = $this->findWhere(['email' => $email])->first();
        if ($user && Hash::check($password, $user['password'])) {
            return $user->toArray();
        }
        return null;
    }

    // Método customizado: pesquisa com like + is_following
    public function searchUsers(string $search, int $currentUserId): array
    {
        $query = $this->model
            ->where('id', '!=', $currentUserId)
            ->where('is_active', true);

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->limit(50)->get();

        // Para cada user, verifica se o currentUser segue
        $result = [];
        foreach ($users as $user) {
            $isFollowing = \DB::table('follows')
                ->where('follower_id', $currentUserId)
                ->where('following_id', $user->id)
                ->exists();

            $result[] = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'bio' => $user->bio,
                'profile_photo' => $user->profile_photo,
                'is_private' => $user->is_private,
                'is_active' => $user->is_active,
                'is_following' => $isFollowing,      // ← Campo extra
                'created_at' => $user->created_at,
            ];
        }

        return $result;
    }
}
```

### 5.3 CRUD genérico herdado do BaseRepository

O pacote `prettus/l5-repository` já fornece métodos prontos:

```php
// Herdados do BaseRepository (não precisamos reimplementar):
$this->all()                    // SELECT * FROM posts
$this->find($id)                // SELECT * FROM posts WHERE id = ?
$this->create($data)            // INSERT INTO posts (...)
$this->update($data, $id)       // UPDATE posts SET ... WHERE id = ?
$this->delete($id)              // DELETE FROM posts WHERE id = ?
$this->paginate($perPage)       // SELECT ... LIMIT ? OFFSET ?
$this->findWhere(['field' => value])  // SELECT ... WHERE field = ?
```

### 5.4 Como o Service "sabe" qual Repository usar?

**Injeção de Dependência via construtor (DI):**

```php
class PostService
{
    public function __construct(
        protected PostRepository $postRepository  // ← Tipo: Interface
    ) {}
    //      ↑
    // O Laravel Service Container vê que precisa de PostRepository
    // Procura no container e encontra PostRepositoryEloquent
    // Injeta automaticamente a implementação concreta
}
```

**No Laravel, o binding é feito em AppServiceProvider (ou não precisa se usar binding automático):**

```php
// Se o nome da interface + 'Eloquent' for o padrão,
// o pacote Prettus resolve automaticamente.
// Caso contrário, faríamos:
// $this->app->bind(PostRepository::class, PostRepositoryEloquent::class);
```

### 5.5 Por que usar Interface + Implementação?

| Motivo | Explicação |
|--------|-----------|
| **Troca de ORM** | Se trocar Eloquent por Doctrine, só muda `PostRepositoryEloquent` |
| **Testes** | Pode criar `PostRepositoryFake` para testar o Service sem BD |
| **Contrato claro** | A interface define O QUE o Service pode fazer com os dados |
| **Acoplamento fraco** | Service depende de abstração, não de implementação concreta |

---

## 6. Como as Camadas se Conectam

### 6.1 Mapa de dependências (quem depende de quem)

```
Controller
  ├── depende de: FormRequest (Laravel injeta automaticamente)
  ├── depende de: Service (injetado no construtor)
  └── depende de: response()->json() (Laravel)

Service
  ├── depende de: DTO (recebido como parâmetro)
  ├── depende de: Repository Interface (injetado no construtor)
  └── depende de: Storage, Exceptions (Laravel)

Repository
  ├── implementa: Repository Interface
  └── depende de: Model (Eloquent)

DTO
  └── depende de: FormRequest (no método fromRequest)
```

### 6.2 Fluxo de injeção de dependências

```
Laravel Service Container
    │
    ├── Quando PostController é instanciado:
    │   ├── Vê que precisa de PostService no construtor
    │   ├── Cria PostService
    │   │   ├── Vê que precisa de PostRepository
    │   │   ├── Procura binding: PostRepository → PostRepositoryEloquent
    │   │   ├── Cria PostRepositoryEloquent
    │   │   │   ├── Vê que precisa de Model (Post::class)
    │   │   │   └── Usa o Model
    │   │   └── Injeta PostRepositoryEloquent em PostService
    │   └── Injeta PostService em PostController
    │
    ├── Quando PostController::store() é chamado:
    │   └── Vê que precisa de CreatePostRequest
    │       ├── Cria CreatePostRequest
    │       ├── Executa authorize() → true
    │       ├── Executa rules() → valida
    │       └── Injeta CreatePostRequest em store()
    │
    └── Pronto! Controller tem Service, Service tem Repository
```

### 6.3 Exemplo visual: CriarPost

```
[HTTP POST /api/posts] 
    │ body: { content: "Olá!", image: arquivo.jpg }
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Laravel resolve CreatePostRequest                        │
│    ├── authorize() → true                                   │
│    ├── rules(): content OK, image OK                        │
│    └── request validada                                     │
└──────────────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. PostController.store(CreatePostRequest $request)         │
│    ├── $imagePath = $request->file('image')->store(...)     │
│    ├── $dto = CreatePostData::fromRequest($request, $path)  │
│    └── $this->postService->create($dto, $userId)            │
└──────────────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. PostService.create(CreatePostData $dto, int $userId)     │
│    ├── $data = $dto->toArray()                              │
│    ├── $data['user_id'] = $userId                           │
│    └── $this->postRepository->create($data)                 │
└──────────────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. PostRepositoryEloquent.create($data)                     │
│    ├── Herdado do BaseRepository                            │
│    └── Post::create($data) → INSERT INTO posts              │
└──────────────────────────────────┬──────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. MySQL: INSERT INTO posts (user_id, content, image, ...)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Benefícios de Cada Padrão

### 7.1 Tabela comparativa

| Padrão | O que resolve | Benefício para o projeto |
|--------|--------------|--------------------------|
| **FormRequest** | Validação espalhada | Regras de validação centralizadas, mensagens em português, 422 automático |
| **DTO** | Dados sem tipo e inseguros | Objetos tipados, imutáveis, com autocomplete, factory method |
| **Service** | Controller fazendo tudo | Lógica de negócio isolada, testável, reutilizável |
| **Repository** | Model sendo chamado diretamente | Abstração do BD, troca de ORM possível, testes mais fáceis |

### 7.2 Testabilidade

**Com os padrões, podemos testar cada camada isoladamente:**

```php
// Testar apenas o Service (sem BD real)
public function test_user_can_only_edit_own_post()
{
    // Criar um mock do Repository
    $repository = Mockery::mock(PostRepository::class);
    $repository->shouldReceive('find')->with(1)->andReturn(
        new Post(['user_id' => 2])  // Post de outro user
    );

    $service = new PostService($repository);

    $this->expectException(AuthorizationException::class);
    $service->update(1, ['content' => 'novo'], 1);  // User 1 tentando editar post do user 2
}
```

### 7.3 Reutilização

**O mesmo Service pode ser usado por diferentes controllers:**

```php
// Controller da API
class PostController extends Controller {
    public function store(CreatePostRequest $request) {
        return $this->postService->create($dto, $request->user()->id);
    }
}

// Controller do admin (se houver painel Blade)
class AdminPostController extends Controller {
    public function store(AdminCreatePostRequest $request) {
        return $this->postService->create($dto, $request->user()->id);
    }
}

// Comando Artisan (CLI)
class ImportPosts extends Command {
    public function handle() {
        $this->postService->create($dto, $userId);
    }
}

// Job de fila (processamento assíncrono)
class ProcessPostJob implements ShouldQueue {
    public function handle(PostService $postService) {
        $postService->create($dto, $userId);
    }
}
```

---

## 8. E se não usássemos esses padrões?

### 8.1 Exemplo sem padrões (código real que EVITAMOS)

```php
// ❌ SEM FORMREQUEST
class PostController extends Controller {
    public function store(Request $request) {
        $validator = Validator::make($request->all(), [
            'content' => 'required_without_all:image,video|max:1000',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // ❌ SEM DTO (usa request direto no Service)
        $this->postService->create($request->all(), $request->user()->id);
        //                          ↑ array solto, sem tipo, pode ter lixo
    }
}

// ❌ SEM SERVICE (lógica de negócio no Controller)
class PostController extends Controller {
    public function destroy($id, Request $request) {
        $post = Post::find($id);                // Query direta no Controller
        if ($post->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Não pode'], 403);
        }
        Storage::delete($post->image);          // Lógica de storage no Controller
        $post->delete();                         // Delete direto
    }
}

// ❌ SEM REPOSITORY (Model sendo chamado em todo lugar)
class PostService {
    public function getFeed($userId) {
        return Post::whereHas('user', function($q) {
            $q->where('is_active', true);
        })->with('user')->paginate(15);
        //  ↑ Post::query() CHAMADO DIRETO NO SERVICE
        // Se trocar ORM, TEM que mudar aqui
    }
}
```

### 8.2 Problemas de não usar os padrões

| Problema | Consequência |
|----------|-------------|
| Validação no Controller | Se precisar validar igual em outro lugar, duplica código |
| Request array no Service | Service recebe array sem tipo — pode ter campos inesperados |
| Lógica no Controller | Controller gigante, difícil de testar, viola SRP |
| Query no Service | Se trocar ORM, reescreve Service inteiro |
| Model direto | Acoplamento forte, teste depende de BD |

### 8.3 Exemplo COM padrões (como fizemos)

```php
// ✅ FORMREQUEST valida
// ✅ DTO transporta dados tipados
// ✅ SERVICE tem a lógica
// ✅ REPOSITORY abstrai o BD

class PostController extends Controller {
    public function store(CreatePostRequest $request): JsonResponse {
        $imagePath = $request->hasFile('image')
            ? $request->file('image')->store('posts/images', 'public')
            : null;

        $dto = CreatePostData::fromRequest($request, $imagePath);
        $post = $this->postService->create($dto, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Publicação criada com sucesso!',
            'data' => $post
        ], 201);
    }
}
```

---

## 9. Perguntas e Respostas para a Banca

### P1: "Por que você usou Repository? Não é overengineering para um projeto pequeno?"

**Resposta:**
"Não considero overengineering porque:
1. O pacote `prettus/l5-repository` já fornece CRUD pronto — não precisei escrever create/update/find manualmente
2. A separação Service/Repository me permitiu colocar toda a lógica de queries complexas (como o feed personalizado com `withExists`, `withCount`, joins em follows) fora do Service, mantendo o Service focado em regras de negócio
3. Para testes, posso mockar o Repository e testar o Service sem banco de dados
4. Se no futuro precisarmos de cache (ex: Redis para o feed), a mudança é apenas na implementação do Repository, sem afetar Service ou Controller"

### P2: "DTO parece repetir os mesmos campos do Request. Por que não usar o Request diretamente no Service?"

**Resposta:**
"Usar o Request diretamente no Service criaria um acoplamento com o HTTP. O DTO desacopla a camada de transporte (HTTP) da camada de domínio (Service). Benefícios:
1. O Service pode ser chamado de qualquer lugar (Controller, CLI, Jobs) sem depender de `Request`
2. O DTO é imutável (`readonly`) — garante que os dados não são alterados no meio do caminho
3. O DTO tem `toArray()` que controla EXATAMENTE quais campos vão para o banco — evita mass assignment
4. Usamos a biblioteca `spatie/laravel-data` que fornece helpers adicionais como validação e transformação"

### P3: "Como o Laravel sabe qual classe instanciar quando você tipa `PostRepository $repository` no construtor?"

**Resposta:**
"O Laravel utiliza **Service Container** com **reflection**. Quando vê que o construtor do Service precisa de `PostRepository` (uma interface), ele:
1. Verifica se existe um binding registrado: `PostRepository::class → PostRepositoryEloquent::class`
2. No nosso caso, o pacote `prettus/l5-repository` usa convenção de nomes: se a interface se chama `PostRepository`, ele procura `PostRepositoryEloquent` automaticamente
3. Instancia `PostRepositoryEloquent` com suas próprias dependências (Model Post)
4. Injeta a instância no Service

Ou seja: o desenvolvedor **não precisa instanciar nada manualmente**. O Laravel resolve toda a árvore de dependências automaticamente."

### P4: "E o FormRequest? Como ele intercepta a requisição antes do Controller?"

**Resposta:**
"Isso é feito pelo **Middleware `ValidatePostSize`** e pelo **Service Container**. Quando o Controller declara:
```php
public function store(CreatePostRequest $request)
```
O Laravel:
1. Instancia `CreatePostRequest` (que estende `FormRequest`, que estende `Request`)
2. Chama `authorize()` — se false, retorna 403
3. Chama `rules()` — valida os dados
4. Se falhar, lança `ValidationException` → middleware transforma em JSON 422
5. Se passar, o Controller recebe a request já validada

O desenvolvedor **não chama validação manualmente** — o framework faz isso antes de entrar no método do Controller."

### P5: "Qual a diferença entre DTO e FormRequest? Ambos não são 'objetos de dados'?"

**Resposta:**
"São conceitos diferentes:

| FormRequest | DTO |
|-------------|-----|
| Sabe sobre HTTP (authorize, rules, messages) | Só transporta dados |
| É específico do Controller | Pode ser usado em qualquer camada |
| Valida os dados brutos da requisição | Recebe dados já validados |
| Tem dependência do Laravel | É um objeto PHP puro (desacoplado) |
| Não pode ser reutilizado em Jobs/CLI | Pode ser usado em qualquer contexto |

No fluxo: `HTTP → FormRequest (valida) → DTO (transporta) → Service (processa)`"

### P6: "Por que alguns DTOs usam `spatie/laravel-data` e outros são manuais?"

**Resposta:**
"O pacote `spatie/laravel-data` (usado em `CreatePostData`) oferece vantagens como:
- Conversão automática para array/JSON
- Validação integrada
- Transformação de tipos

Mas optei por implementações manuais (como `LoginData`) para DTOs mais simples, onde a complexidade adicional da biblioteca não traria benefício significativo. Ambos seguem o mesmo pattern: construtor tipado, `fromRequest()`, `toArray()`."

---

## 10. RESUMO: O Padrão em Uma Frase

| Camada | Uma frase |
|--------|-----------|
| **FormRequest** | "Valida os dados antes de entrar" |
| **DTO** | "Transporta dados tipados entre camadas" |
| **Service** | "Toma decisões e aplica regras de negócio" |
| **Repository** | "Fala com o banco de dados" |
| **Controller** | "Recebe o request, orquestra, retorna resposta" |

### Como saber o que vai em cada camada?

**Regra prática para o desenvolvedor:**

```
O que é?                                          → Vai em...
────────────────────────────────────────────────────────────────
Regra de validação (campo obrigatório, tamanho)   → FormRequest
Estrutura dos dados (o que compõe um post)         → DTO
Regra de negócio (só o dono pode editar)           → Service
Query no banco (SELECT com joins)                  → Repository
Upload de ficheiro                                 → Controller ou Service
Status HTTP (200, 201, 403, 422)                  → Controller
Mensagem de erro                                   → Controller
```

### O fluxo de "quem sabe o quê"

```
                    ┌──────────────┐
                    │  HTTP Request│
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │  FormRequest "sabe":    │
              │  - Quais campos são     │
              │    obrigatórios         │
              │  - Tamanho máximo       │
              │  - Tipos (image, file)  │
              └────────────┬────────────┘
                           │ (dados validados)
                           ▼
              ┌──────────────────────┐
              │  DTO "sabe":         │
              │  - Quais campos      │
              │    existem           │
              │  - Tipos (string,    │
              │    ?string)          │
              └──────────┬───────────┘
                         │ (objeto tipado)
                         ▼
              ┌──────────────────────┐
              │  Service "sabe":     │
              │  - Quem pode fazer o │
              │    quê (ownership)   │
              │  - Regras (feed      │
              │    personalizado)    │
              │  - Efeitos colaterais│
              │    (apagar ficheiros) │
              └──────────┬───────────┘
                         │ (dados processados)
                         ▼
              ┌──────────────────────┐
              │  Repository "sabe":  │
              │  - Como buscar no BD │
              │  - Relacionamentos   │
              │  - Paginação         │
              └──────────┬───────────┘
                         │ (resultado)
                         ▼
              ┌──────────────────────┐
              │  Model "sabe":       │
              │  - Mapeamento da     │
              │    tabela            │
              │  - Relacionamentos   │
              │    ORM               │
              └──────────────────────┘
```

---

> **Resumo para a banca (2 minutos):**  
> "Usamos **FormRequest** para validar os dados de entrada de forma declarativa e com 422 automático. Os dados validados são transformados em **DTOs** — objetos tipados e imutáveis que transportam as informações entre as camadas de forma segura. O **Service** contém toda a lógica de negócio: quem pode editar, o feed personalizado, exclusão de ficheiros associados. O **Repository** abstrai o acesso ao banco de dados, permitindo queries complexas com Eloquent sem poluir o Service.  
> Cada camada sabe exatamente o que fazer: o Controller só orquestra e retorna JSON, o Service decide, o Repository consulta. Isso nos dá testabilidade, reutilização e baixo acoplamento — se um dia trocarmos de ORM ou adicionarmos cache, só uma camada é afetada."