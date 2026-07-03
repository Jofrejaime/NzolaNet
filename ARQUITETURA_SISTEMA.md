# NzolaNet — Arquitetura Completa do Sistema

> **Stack:** Angular 19 (Standalone) + Laravel 11 API + MySQL  
> **Repositório:** github.com/Jofrejaime/NzolaNet  
> **Propósito:** Rede social com feed, posts, bazes (likes), comentários com aninhamento, seguidores/perfis e painel admin com hierarquia (admin/superadmin).

---

## 1. BACKEND — LARAVEL API

### 1.1 Estrutura de pastas (app/)

```
app/
├── Data/Api/            # DTOs (Data Transfer Objects)
│   ├── Post/CreatePostData.php
│   ├── User/LoginData.php, RegisterData.php, UpdateProfileData.php
│   └── Comment/CreateCommentData.php
├── Http/
│   ├── Controllers/Api/  # Controllers REST
│   │   ├── UserController.php      # Auth, perfil, followers
│   │   ├── PostController.php      # CRUD posts + feed
│   │   ├── CommentController.php   # CRUD comentários
│   │   ├── BazeController.php      # Like/baze toggle
│   │   ├── AdminController.php     # Dashboard + gestão
│   │   └── NotificationController.php
│   ├── Middleware/
│   │   ├── EnsureAdmin.php         # role === 'administrador' || 'superadministrador'
│   │   └── EnsureSuperAdmin.php    # role === 'superadministrador'
│   └── Requests/Api/    # FormRequests (validação de input)
│       ├── RegisterRequest.php, LoginRequest.php
│       ├── CreatePostRequest.php, CreateCommentRequest.php
│       ├── UpdateProfileRequest.php
│       └── ...
├── Models/
│   ├── User.php          # Authenticatable + HasApiTokens (Sanctum)
│   ├── Post.php          # BelongsTo User, HasMany comments/bazes
│   ├── Comment.php       # BelongsTo Post/User, parent_id (replies)
│   ├── Follow.php        # Pivot follows
│   └── PostBaze.php      # Like/baze
├── Repositories/Api/     # Abstração + Eloquent
│   ├── PostRepository.php           # Interface
│   ├── PostRepositoryEloquent.php   # Implementação concreta
│   ├── UserRepository.php / UserRepositoryEloquent.php
│   ├── CommentRepository.php / ...
│   └── FollowRepository.php / ...
├── Services/Api/         # Lógica de negócio
│   ├── PostService.php
│   ├── UserService.php
│   ├── FollowService.php
│   ├── CommentService.php
│   └── PostBazeService.php
└── Providers/
    └── AppServiceProvider.php
```

**Responsabilidades de cada camada:**

| Camada | Função | Exemplo |
|--------|--------|---------|
| **Controller** | Receber HTTP request, delegar para Service, retornar JSON | `PostController::index()` → chama `postService->getFeed()` |
| **FormRequest** | Validar dados de entrada antes do Controller | `CreatePostRequest` valida `content`, `image`, `video` |
| **Service** | Lógica de negócio, orquestração | `PostService::delete()` → verifica ownership → apaga ficheiros → chama Repository |
| **Repository** | Abstração de acesso a dados (interface) | `PostRepository` define contratos como `getLatestPosts()` |
| **RepositoryEloquent** | Implementação concreta com Eloquent ORM | `PostRepositoryEloquent` → queries com `with()`, `withCount()`, `paginate()` |
| **Model** | Entidade + relacionamentos do BD | `Post::user()`, `Post::comments()`, `Post::bazes()` |
| **Data (DTO)** | Objeto tipado para transporte de dados entre camadas | `CreatePostData::fromRequest($request)` |

---

### 1.2 Rotas de API (api.php)

```php
// PÚBLICAS (sem autenticação)
POST /api/register
POST /api/login
POST /api/recover-password
POST /api/reset-password

// PROTEGIDAS (middleware auth:sanctum)
POST   /api/logout
GET    /api/user
DELETE /api/user
PUT    /api/profile
PUT    /api/profile/password
POST   /api/profile/photo

// Utilizadores
GET    /api/users                    // Listar/pesquisar ?search=term
GET    /api/users/{id}               // Perfil público
GET    /api/users/{id}/posts         // Posts do user
GET    /api/users/{id}/comments
POST   /api/users/{id}/follow        // Seguir
DELETE /api/users/{id}/follow        // Deixar de seguir
GET    /api/users/{id}/following     // Quem segue
GET    /api/users/{id}/followers     // Seguidores

// Posts (apiResource gera: index, store, show, update, destroy)
GET    /api/posts
POST   /api/posts
GET    /api/posts/{id}
PUT    /api/posts/{id}
DELETE /api/posts/{id}
POST   /api/posts/{postId}/baze      // Dar baze (like)
DELETE /api/posts/{postId}/baze      // Remover baze

// Comentários
GET    /api/posts/{postId}/comments
POST   /api/posts/{postId}/comments
PUT    /api/comments/{id}
DELETE /api/comments/{id}

// ADMIN (middleware admin)
GET    /api/admin/dashboard
GET    /api/admin/users
PATCH  /api/admin/users/{id}/toggle   // Ativar/desativar
GET    /api/admin/posts
DELETE /api/admin/posts/{id}
GET    /api/admin/comments
DELETE /api/admin/comments/{id}

// SUPERADMIN (middleware superadmin + admin)
POST   /api/admin/users/{id}/promote  // Promover a admin
POST   /api/admin/users/{id}/demote   // Remover admin
DELETE /api/admin/users/{id}          // Eliminar user
```

**Hierarquia de middlewares:**
```
auth:sanctum  →  admin  →  superadmin
```
O middleware `admin` verifica se o role é 'administrador' ou 'superadministrador'.  
O middleware `superadmin` só passa se role === 'superadministrador'.

---

### 1.3 Autenticação — Laravel Sanctum

**Tipo:** Token-based API authentication via **Sanctum**.

**Modelo User usa:**
```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable {
    use HasApiTokens, HasFactory, Notifiable;
}
```

**Fluxo de login (UserService::login):**
1. Recebe `LoginData` (email + password)
2. `UserRepository::findByCredentials()` busca por email e verifica Hash::check
3. Verifica se `is_active === true`
4. `Auth::login($user, $rememberMe)` — login na sessão (opcional)
5. `$user->createToken('auth_token')->plainTextToken` — gera token SHA-256
6. Retorna `{ user, access_token, token_type: 'Bearer' }`

**Fluxo de logout:**
```php
$user->currentAccessToken()->delete();
```

**Proteção de rotas:**
```php
Route::middleware('auth:sanctum')->group(function () { ... });
```
O middleware `auth:sanctum` extrai o token do header `Authorization: Bearer {token}`, verifica na tabela `personal_access_tokens` e carrega o usuário autenticado via `$request->user()`.

---

### 1.4 Ciclo completo de um Controller (PostController::store)

```
Request HTTP POST /api/posts
    │
    ▼
[1] Rota: Route::apiResource('posts', PostController::class)
    │
    ▼
[2] Middleware auth:sanctum → verifica token → carrega User
    │
    ▼
[3] Laravel resolve CreatePostRequest (validação automática)
    ├── rules(): content required_without_all, image: mimes:jpeg,png,jpg,gif, max:5MB
    ├── video: mimes:mp4,mov,avi,webm, max:20MB
    └── Se falha → retorna 422 automaticamente com erros
    │
    ▼
[4] PostController::store(CreatePostRequest $request)
    ├── Faz upload: $request->file('image')->store('posts/images', 'public')
    ├── Cria DTO: CreatePostData::fromRequest($request, $imagePath, $videoPath)
    └── Chama PostService::create($dto, $request->user()->id)
    │
    ▼
[5] PostService::create($dto, $userId)
    ├── $data = $dto->toArray() + ['user_id' => $userId]
    └── Chama PostRepository::create($data)
    │
    ▼
[6] PostRepositoryEloquent (BaseRepository do Prettus)
    ├── Herda create() genérico do Prettus
    └── Eloquent: Post::create($data)
    │
    ▼
[7] Banco MySQL → INSERT INTO posts (user_id, content, image, video, ...)
    │
    ▼
[8] Controller retorna:
    return response()->json([
        'success' => true,
        'message' => 'Publicação criada com sucesso!',
        'data' => $post
    ], 201);
```

---

### 1.5 Eloquent ORM — Queries, Relacionamentos, Eager Loading

**Model Post:**
```php
class Post extends Model {
    protected $fillable = ['user_id', 'content', 'image', 'video'];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function comments(): HasMany { return $this->hasMany(Comment::class); }
    public function bazes(): HasMany { return $this->hasMany(PostBaze::class); }
}
```

**Exemplo de query real (PostRepositoryEloquent::getLatestPosts):**
```php
$this->model
    ->whereHas('user', fn($q) => $q->where('is_active', true))
    ->with(['user'])                              // EAGER LOADING: carrega user junto
    ->withCount(['comments', 'bazes'])             // SABER quantos comments/bazes
    ->withExists([                                 // SUBQUERY: se o viewer deu baze
        'bazes as has_bazed' => fn($q) => $q->where('user_id', $userId)
    ])
    ->orderBy('created_at', 'desc')
    ->paginate($perPage);                         // PAGINAÇÃO automática
```

**Isso gera SQL eficiente:**
```sql
SELECT posts.*,
    (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.id) AS comments_count,
    (SELECT COUNT(*) FROM post_bazes WHERE post_bazes.post_id = posts.id) AS bazes_count,
    (SELECT EXISTS(SELECT 1 FROM post_bazes WHERE post_id = posts.id AND user_id = ?)) AS has_bazed
FROM posts
WHERE EXISTS (SELECT 1 FROM users WHERE users.id = posts.user_id AND is_active = 1)
ORDER BY created_at DESC
LIMIT 15 OFFSET 0;
```

**Relacionamentos do User:**
```php
public function followers() {
    return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id');
}
public function followings() {
    return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id');
}
```

**Cuidados:**
- N+1 problem resolvido com `->with(['user'])`
- Subqueries com `withExists` para evitar carregar dados desnecessários
- `paginate()` retorna `LengthAwarePaginator` com `current_page`, `data`, `total`, `per_page`

---

### 1.6 API Resources (transformação de dados)

**Neste projeto NÃO foram usadas `Resource` classes do Laravel.** A transformação é feita diretamente nos Controllers/Services retornando os arrays/objetos Eloquent. O formato padronizado da resposta é:

```json
{
  "success": true|false,
  "message": "Mensagem opcional",
  "data": { ... },
  "errors": { "campo": ["erro 1"] }  // apenas em 422
}
```

Isso é uma decisão arquitetural: simplicidade > complexidade. Para um MVP ou escala pequena, funciona bem. Em projetos maiores, usar `PostResource::collection()` daria mais controle sobre campos expostos (ex: esconder `email` em listagens públicas).

---

### 1.7 Tratamento de erros e Status HTTP

**Padrão usado em todos os Controllers:**
```php
try {
    // lógica...
    return response()->json(['success' => true, 'data' => $post], 200);
} catch (AuthorizationException $e) {
    return response()->json(['success' => false, 'message' => $e->getMessage()], 403);
} catch (ValidationException $e) {
    return response()->json(['success' => false, 'errors' => $e->errors()], 422);
} catch (\Exception $e) {
    return response()->json(['success' => false, 'message' => 'Erro: ' . $e->getMessage()], 500);
}
```

**Tabela de Status HTTP:**
| Situação | Status |
|----------|--------|
| Sucesso (GET, PUT, DELETE) | `200` |
| Criado (POST) | `201` |
| Erro de validação | `422` |
| Não autorizado (login errado) | `401` |
| Proibido (sem permissão) | `403` |
| Não encontrado | `404` |
| Erro interno | `500` |

**Exceções customizadas:**
- `AuthorizationException` para ownership (editar/deletar post alheio) → 403
- `ValidationException` do Laravel para FormRequests → 422 automático

---

### 1.8 CORS

**Arquivo:** `config/cors.php`

Configurado via configuração do Laravel. Permite requisições de origens diferentes (necessário pois Angular roda em `localhost:4200` e Laravel em `localhost:8000`). O middleware CORS adiciona headers `Access-Control-Allow-Origin`, `Access-Control-Allow-Headers` etc.

---

### 1.9 Filtros, Paginação, Ordenação

**Paginação:**
- Todas as listagens usam `->paginate($perPage)`
- O frontend recebe: `{ current_page, data: [...], total, per_page }`
- Feed: 15 posts por página
- Perfil: 20 posts por página

**Filtros:**
- `UserController::index()` → `?search=term` (pesquisa por nome/email)
- `UserController::userPosts($id)` → posts de um usuário específico
- Feed inteligente: se o user segue alguém → posts de quem segue + próprios; se não segue ninguém → todos os posts

**Ordenação:**
- Sempre `orderBy('created_at', 'desc')` — mais recentes primeiro

---

## 2. COMUNICAÇÃO BACKEND ↔ FRONTEND

### 2.1 Endpoints e Formatos

**Base URL:** `http://localhost:8000/api`

**Headers padrão (adicionados pelo AuthInterceptor):**
```
Accept: application/json
Authorization: Bearer {token}   // se autenticado
Content-Type: application/json   // automático no HttpClient para JSON
Content-Type: multipart/form-data // automático quando envia FormData
```

**Payload de exemplo (login):**
```json
// REQUEST
POST /api/login
{
  "email": "user@email.com",
  "password": "123456",
  "remember_me": false
}

// RESPONSE (200)
{
  "success": true,
  "message": "Login realizado com sucesso!",
  "data": {
    "user": {
      "id": 1,
      "name": "João",
      "email": "user@email.com",
      "bio": null,
      "profile_photo": null,
      "is_private": false,
      "is_active": true,
      "role": "utilizador",
      "email_verified_at": null
    },
    "access_token": "1|aB3cD4eF5gH6iJ7kL8mN9oP0qR...",  
    "token_type": "Bearer"
  }
}
```

**Payload de exemplo (feed):**
```json
// REQUEST
GET /api/posts
Authorization: Bearer 1|aB3cD4eF5gH6iJ7kL8mN9oP0qR...

// RESPONSE (200)
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 42,
        "user_id": 1,
        "content": "Texto do post",
        "image": "posts/images/abc123.jpg",
        "video": null,
        "comments_count": 5,
        "bazes_count": 12,
        "has_bazed": true,
        "created_at": "2026-06-05T14:30:00.000000Z",
        "updated_at": "2026-06-05T14:30:00.000000Z",
        "user": {
          "id": 1,
          "name": "João",
          "profile_photo": null
        }
      }
    ],
    "total": 100,
    "per_page": 15
  }
}
```

### 2.2 Autenticação — Fluxo completo do token

```
LOGIN:
┌─────────────────────────────────────────────────────────┐
│  Angular AuthService.login(credentials)                 │
│    ↓ POST /api/login                                    │
│  Laravel UserService.login(LoginData)                   │
│    ↓ password_hash(Hash::check)                         │
│    ↓ $user->createToken('auth_token')->plainTextToken   │
│    ↓ Retorna { user, access_token, token_type }         │
│  Angular AuthService.persistSession(payload)            │
│    ↓ localStorage.setItem('nzolanet_token', token)      │
│    ↓ localStorage.setItem('nzolanet_user', JSON...)     │
│    ↓ currentUser.set(user)  (signal)                   │
└─────────────────────────────────────────────────────────┘

CADA REQUISIÇÃO SEGUINTE:
┌─────────────────────────────────────────────────────────┐
│  Angular AuthInterceptor intercepta o HttpRequest       │
│    ↓ Lê token de localStorage                           │
│    ↓ Cria headers: { Accept, Authorization: Bearer X }  │
│    ↓ request.clone({ setHeaders })                      │
│  Laravel Middleware auth:sanctum                        │
│    ↓ Extrai token do header Authorization               │
│    ↓ Verifica na tabela personal_access_tokens          │
│    ↓ Carrega User e disponibiliza em $request->user()   │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Armazenamento do estado no frontend

- **Token:** `localStorage.getItem('nzolanet_token')` — texto puro
- **User logado:** `localStorage.getItem('nzolanet_user')` — JSON stringify
- **Reativo:** `currentUser = signal<NzolaUser | null>(this.restoreUser())` — persistência + reatividade
- **Logo após login ou register:** chamada `persistSession()` que salva ambos
- **No logout:** `clearSession()` → remove ambos do localStorage → seta currentUser como null → redireciona para /login

---

## 3. FRONTEND — ANGULAR (Standalone)

### 3.1 Estrutura de Features

```
src/app/
├── app.config.ts         # Providers: provideRouter + provideHttpClient + Interceptor
├── app.routes.ts         # Configuração de rotas com Guards
├── app.ts                # Root component standalone
├── core/
│   ├── guards/
│   │   └── auth.guard.ts           # authGuard, guestGuard, adminGuard
│   ├── interceptors/
│   │   └── auth.interceptor.ts     # Adiciona Bearer token + Accept header
│   ├── models/
│   │   └── api.models.ts           # Interfaces: ApiResponse, Post, User, Comment...
│   └── services/
│       ├── auth.service.ts         # Login, register, logout, user state (signal)
│       ├── post.service.ts         # CRUD posts + baze toggle
│       ├── comment.service.ts      # CRUD comentários
│       ├── user.service.ts         # Perfil, followers, search
│       ├── admin.service.ts        # Dashboard + gestão admin
│       ├── api-url.service.ts      # Base URL centralizada
│       ├── toast.service.ts        # Notificações toast
│       └── theme.service.ts        # Tema claro/escuro
├── features/                       # Páginas standalone
│   ├── feed/
│   │   ├── feed.ts                 # Componente do feed principal
│   │   └── feed.html
│   ├── login/
│   │   ├── login.ts
│   │   └── login.html
│   ├── compose/
│   ├── profile/
│   ├── thread/
│   ├── search/
│   ├── notifications/
│   ├── settings/ (account, privacy, security, help, about)
│   └── admin/
├── layouts/
│   ├── main-layout/               # Layout logado (sidebar + router-outlet)
│   └── components/                # Sidebar, BottomNav, RightSidebar
└── shared/
    └── components/                # Avatar, Skeleton, Toast
```

**Arquitetura Standalone:** Não usa `NgModule`. Cada componente é standalone com `imports: [CommonModule, ...]`. O bootstrap é feito via `bootstrapApplication(AppComponent, appConfig)`.

### 3.2 Services — HttpClient e Injeção de Dependência

**Padrão usado em todos os services:**

```typescript
@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private http: HttpClient, private apiUrl: ApiUrlService) {}

  list() {
    return this.http
      .get<ApiResponse<PaginatedResponse<Post>>>(`${this.apiUrl.apiUrl}/posts`)
      .pipe(map((response) => response.data));  // Extrai apenas data
  }
}
```

**Características:**
- `providedIn: 'root'` → singleton, uma instância para toda a app
- HttpClient injetado via DI (Angular cria singleton do HttpClientModule)
- `map(response => response.data)` → o component recebe apenas o payload, sem se preocupar com o envelope `{ success, message, data }`
- Para upload de ficheiros: `FormData` + `http.post` (não precisa setar Content-Type, Angular detecta FormData e seta `multipart/form-data` com boundary)

### 3.3 Auth Interceptor

```typescript
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('nzolanet_token');

  const headers: Record<string, string> = {
    Accept: 'application/json',  // OBRIGATÓRIO para Laravel API
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;  // Adiciona token
  }

  return next(request.clone({ setHeaders: headers }));
};
```

**Registrado em app.config.ts:**
```typescript
provideHttpClient(withInterceptors([authInterceptor]))
```

**O que faz:**
- Toda requisição HTTP passa pelo interceptor
- Adiciona `Accept: application/json` (Laravel precisa para retornar JSON em vez de redirect)
- Adiciona `Authorization: Bearer {token}` se existir no localStorage
- Clona a request com os novos headers e passa para o próximo handler

---

### 3.4 Components — Ciclo de vida com Observable

**Fluxo no FeedComponent:**

```typescript
ngOnInit(): void {
  this.loadFeed();          // 1. Chama no init
}

loadFeed(): void {
  this.isLoading = true;    // 2. Mostra skeleton

  this.postService.list().subscribe({   // 3. Chama service → HttpClient
    next: (page) => {
      this.posts = [...page.data];       // 4. Atualiza array de posts
      this.isLoading = false;            // 5. Esconde loading
      this.cdr.detectChanges();          // 6. Força detecção de mudanças
    },
    error: (error) => {
      this.errorMessage = error?.error?.message;  // 7. Trata erro
      this.isLoading = false;
      this.toastService.error('Erro!', 'Não foi possível carregar o feed.');
    }
  });
}
```

**O template (feed.html) usa:**
```html
<!-- Loading state -->
<div *ngIf="isLoading"> <skeleton> </div>

<!-- Error state -->
<div *ngIf="errorMessage"> {{ errorMessage }} </div>

<!-- Empty state -->
<div *ngIf="!isLoading && !errorMessage && posts.length === 0">
  Nenhuma publicação encontrada.
</div>

<!-- Data state -->
<div *ngFor="let post of posts">
  {{ post.content }}
  <img [src]="mediaUrl(post.image)" (error)="onImageError($event)">
</div>
```

---

### 3.5 Routing e Guards

```typescript
export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },

  { path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],              // Toda rota filha exige auth
    children: [
      { path: 'home', component: FeedComponent },
      { path: 'profile/:id', component: ProfileComponent },
      { path: 'post/:id', component: ThreadComponent },
      { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
      // ...
    ]
  },
];
```

**authGuard:**
```typescript
export const authGuard: CanActivateFn = () => {
  if (authService.isAuthenticated) return true;    // Tem token?
  return router.createUrlTree(['/login']);          // Não → redireciona
};
```

**adminGuard:**
```typescript
export const adminGuard: CanActivateFn = () => {
  const role = authService.currentUser()?.role;
  if (role === 'superadministrador' || role === 'administrador') return true;
  return router.createUrlTree(['/home']);           // Não admin → home
};
```

**guestGuard:**
```typescript
export const guestGuard: CanActivateFn = () => {
  if (!authService.isAuthenticated) return true;     // Não logado → acesso
  return router.createUrlTree(['/home']);             // Logado → redireciona
};
```

**Três níveis de proteção:**
| Guard | Acesso permitido para | Redireciona para |
|-------|----------------------|------------------|
| `guestGuard` | Usuários NÃO logados (login, register) | `/home` |
| `authGuard` | Usuários logados (qualquer role) | `/login` |
| `adminGuard` | `administrador` ou `superadministrador` | `/home` |

---

### 3.6 Estado (Signals + localStorage)

**Não usa NgRx ou serviços de estado complexos.** A abordagem é simples e direta:

1. **AuthService** guarda usuário logado em:
   - `currentUser = signal<NzolaUser | null>(...)` — estado reativo
   - `localStorage` — persistência (recupera ao refresh)

2. **Outros dados** (posts, comments, users) são carregados via services e mantidos em arrays nos componentes (não compartilhados globalmente)

3. **Comunicação entre componentes:** via `@Input()`, `@Output()`, e serviços injetados (ex: `ToastService` para notificações)

---

### 3.7 Environment Variables

**Atualmente não usa arquivos `environment.ts`.** A URL base está hardcoded em `ApiUrlService`:

```typescript
@Injectable({ providedIn: 'root' })
export class ApiUrlService {
  private readonly baseUrl = 'http://localhost:8000';
  readonly apiUrl = `${this.baseUrl}/api`;

  storageUrl(path?: string | null): string | null {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;  // URL completa → retorna como está
    return `${this.baseUrl}/storage/${path}`;       // Relativa → monta URL
  }
}
```

**Melhoria possível:** usar arquivos `src/environments/environment.ts` e `environment.prod.ts` com `API_URL` configurável.

---

## 4. FLUXO COMPLETO (Exemplo Prático)

### "Usuário clica em Listar Publicações no Feed"

```
┌─────────────────────────────────────────────────────────────────────┐
│  ANGULAR                                                           │
│                                                                     │
│  1. FeedComponent.ngOnInit()                                        │
│     ↓                                                              │
│  2. FeedComponent.loadFeed()                                        │
│     ↓ isLoading = true (mostra skeleton)                           │
│     ↓                                                              │
│  3. PostService.list()                                              │
│     ↓ http.get<ApiResponse<PaginatedResponse<Post>>>(...)           │
│     ↓                                                              │
│  4. AuthInterceptor (intercepta a request)                          │
│     ↓ Lê localStorage.getItem('nzolanet_token')                     │
│     ↓ Adiciona headers:                                             │
│       Accept: application/json                                      │
│       Authorization: Bearer 1|aB3cD4eF5gH6iJ7kL8mN9oP0qR...       │
│     ↓ request.clone({ setHeaders })                                 │
│     ↓ next(request) → envia HTTP                                   │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  NETWORK (HTTP GET http://localhost:8000/api/posts)                 │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  LARAVEL                                                           │
│                                                                     │
│  5. public/index.php → bootstrap → Kernel                           │
│     ↓                                                              │
│  6. Middleware CORS → adiciona headers de permissão                 │
│     ↓                                                              │
│  7. Router → matches GET /api/posts → PostController@index          │
│     ↓                                                              │
│  8. Middleware auth:sanctum                                          │
│     ↓ Extrai Bearer token do header Authorization                   │
│     ↓ Verifica na tabela personal_access_tokens                     │
│     ↓ Carrega User e seta $request->user()                          │
│     ↓                                                              │
│  9. PostController::index(Request $request)                          │
│     ↓ $userId = $request->user('sanctum')->id                       │
│     ↓ Chama PostService::getFeed($userId)                           │
│     ↓                                                              │
│ 10. PostService::getFeed($userId)                                   │
│     ↓ Verifica se user segue alguém (DB::table('follows')->count()) │
│     ↓ Se segue → PostRepository::getLatestPostsForUser()            │
│     ↓ Se não → PostRepository::getLatestPosts()                     │
│     ↓                                                              │
│ 11. PostRepositoryEloquent::getLatestPostsForUser()                  │
│     ↓ DB: SELECT follows.following_id WHERE follower_id = $userId   │
│     ↓ DB: SELECT posts.* FROM posts                                 │
│           WHERE user_id IN (followingIds + próprio)                 │
│           WITH user, withCount comments/bazes, withExists has_bazed │
│           ORDER BY created_at DESC, paginate(15)                    │
│     ↓ Retorna LengthAwarePaginator                                  │
│     ↓                                                              │
│ 12. Controller retorna:                                             │
│     response()->json([                                              │
│       'success' => true,                                            │
│       'data' => $posts  (objeto paginado)                          │
│     ], 200)                                                         │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  ANGULAR (resposta recebida)                                       │
│                                                                     │
│ 13. FeedComponent recebe resposta no subscribe:                     │
│     ↓ page = { current_page, data: [...], total, per_page }        │
│     ↓ this.posts = [...page.data]                                   │
│     ↓ this.isLoading = false                                        │
│     ↓ this.cdr.detectChanges()                                      │
│     ↓                                                              │
│ 14. Angular Change Detection atualiza o template:                   │
│     ↓ *ngFor="let post of posts" renderiza cards com:               │
│       - Avatar + nome do usuário (post.user.name)                   │
│       - Conteúdo (post.content)                                     │
│       - Imagem (mediaUrl(post.image))                               │
│       - Botões: comentar, baze, menu de ações                       │
│       - Contadores: comments_count, bazes_count                     │
│       - has_bazed (heart/icon cheio ou vazio)                       │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  TRATAMENTO DE ERRO (caso falhe)                                   │
│                                                                     │
│  Rede/Laravel retorna erro:                                         │
│     │                                                              │
│     ↓ subscribe.error:                                              │
│       this.errorMessage = error?.error?.message                     │
│       this.toastService.error('Erro!', 'Não foi possível...')       │
│       Template mostra mensagem de erro                              │
│       Skeleton oculto                                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. SEGURANÇA

### 5.1 Proteção de rotas no Laravel

| Rota | Middleware | Proteção |
|------|-----------|----------|
| `/api/posts` (CRUD) | `auth:sanctum` | Token válido |
| `/api/admin/*` | `auth:sanctum` + `admin` | Token + role admin |
| `/api/admin/*/promote` | `auth:sanctum` + `admin` + `superadmin` | Token + role superadmin |

**Middleware `EnsureAdmin`:**
```php
if (auth()->user()->role !== 'administrador' && auth()->user()->role !== 'superadministrador') {
    abort(403, 'Acesso restrito a administradores.');
}
```

**Middleware `EnsureSuperAdmin`:**
```php
if (auth()->user()->role !== 'superadministrador') {
    abort(403, 'Acesso restrito a superadministradores.');
}
```

### 5.2 Proteção de rotas no Angular (CanActivate)

- `authGuard`: verifica `!!localStorage.getItem('nzolanet_token')` → redirect `/login`
- `guestGuard`: verifica se NÃO está logado → redirect `/home`
- `adminGuard`: verifica `currentUser()?.role === 'administrador' || 'superadministrador'` → redirect `/home`

**Nota importante:** A proteção do Angular é UX (evita que o usuário veja telas sem permissão). A segurança REAL está no backend — nunca confie apenas no frontend.

### 5.3 Validação de entrada (FormRequests)

```php
class CreatePostRequest extends FormRequest {
    public function rules(): array {
        return [
            'content' => 'required_without_all:image,video|nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'video' => 'nullable|file|mimes:mp4,mov,avi,webm|max:20480',
        ];
    }
}
```

- **required_without_all:** conteúdo, imagem OU vídeo é obrigatório
- **max:1000:** limite de caracteres
- **mimes + max:** validação de tipo e tamanho de ficheiro (5MB imagem, 20MB vídeo)
- **Se falha:** Laravel retorna `422` com erros no formato `{ "campo": ["mensagem"] }`

### 5.4 SQL Injection

**Protegido pelo Eloquent ORM.** Todos os dados são passados como prepared statements:
```php
Post::whereIn('user_id', $followingIds)   // escape automático
Post::create($data)                        // fillable protege contra mass assignment
$query->where('user_id', $userId)          // binding seguro
```

### 5.5 XSS (Cross-Site Scripting)

- **Angular:** sanitiza automaticamente toda interpolação `{{ userContent }}`. Não usa `innerHTML` sem sanitização explícita.
- **Laravel:** Blade não é usado na API. Para renderização futura, `{{ $var }}` no Blade escaparia HTML.

### 5.6 CSRF (Cross-Site Request Forgery)

- **API com Sanctum (tokens):** não precisa de CSRF. Como cada requisição carrega o token no header `Authorization`, um ataque CSRF não conseguiria incluir esse header (requer JavaScript, e o Same-Origin Policy protege).
- Sanctum oferece proteção CSRF para SPA se usar cookies de sessão, mas aqui o fluxo é **token puro** (stateless).

---

## 6. INFRAESTRUTURA E DIFERENCIAIS

### 6.1 Ambiente de Desenvolvimento

**Backend (Laravel):**
```bash
cd nzolanet
cp .env.example .env          # Configurar BD, APP_URL, etc.
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve             # http://localhost:8000
```

**Frontend (Angular):**
```bash
cd frontend
npm install
ng serve                     # http://localhost:4200
```

### 6.2 Variáveis de Ambiente

**Laravel (.env):**
```
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nzolanet
DB_USERNAME=root
DB_PASSWORD=
SANCTUM_STATEFUL_DOMAINS=localhost:4200
SESSION_DRIVER=file
```

**Angular:** Hardcoded em `ApiUrlService` com `baseUrl = 'http://localhost:8000'`.  
**Melhoria:** usar `src/environments/environment.ts` com `API_URL` e `production: false/true`.

### 6.3 Queues, Events, Listeners, Jobs

**Neste projeto não foram implementados.** O sistema é síncrono — todas as operações (criar post, seguir, comentar) são feitas no mesmo request-response cycle.

**Potencial futuro:** 
- Notificações push (quando alguém segue ou comenta)
- Processamento de imagens/vídeos em background (redimensionar thumbnails)
- Email de recuperação de senha (atualmente só retorna mensagem, não envia email de fato)

### 6.4 Logs

**Laravel:**
```php
\Log::info('Mensagem');                    // storage/logs/laravel.log
\Log::error('Erro ao criar post: ' . $e);   // Com stack trace
```

**Angular:**
```typescript
console.error('Erro ao carregar imagem:', img.src);   // FeedComponent
```
(apenas em desenvolvimento)

### 6.5 Arquitetura em Camadas (Diagrama Conceitual)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Angular 19)                          │
│                                                                        │
│  Routes ──▶ Guards ──▶ Components ──▶ Services ──▶ Interceptors       │
│  (canActivate)   (template + logic)   (HttpClient)   (headers + Auth)  │
│                                                                        │
│  Estado: Signals (AuthService) + localStorage                          │
│  UI: Tailwind CSS + Skeleton + Toast                                   │
└───────────────────────┬────────────────────────────────────────────────┘
                        │ HTTP (JSON)
                        │ Authorization: Bearer {token}
                        │ Accept: application/json
                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Laravel 11)                             │
│                                                                        │
│  PHP-FPM → public/index.php → Kernel → Middleware Stack                │
│    1. CORS                                                             │
│    2. auth:sanctum (se rota protegida)                                 │
│    3. admin / superadmin (se rota admin)                               │
│                                                                        │
│  Router → Controller → FormRequest (validação)                        │
│              ↓                                                         │
│           Service (lógica de negócio + authorization checks)           │
│              ↓                                                         │
│           Repository (abstração BD)                                    │
│              ↓                                                         │
│           Model (Eloquent ORM)                                         │
│              ↓                                                         │
│  response()->json([success, data, message])                            │
└───────────────────────┬────────────────────────────────────────────────┘
                        │ PDO/MySQL
                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      BANCO DE DADOS (MySQL)                           │
│                                                                        │
│  users ──── hasMany ──── posts                                        │
│    │                      │                                            │
│    │                      ├── hasMany ──── comments (parent_id)        │
│    │                      └── hasMany ──── post_bazes                  │
│    │                                                                   │
│    ├── hasMany (follower_id) ──── follows ──── hasMany (following_id) │
│    │                                                                   │
│    └── personal_access_tokens (Sanctum)                                │
│                                                                        │
│  notifications (para notificações futuras)                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. PADRÃO REPOSITORY — Por que foi usado?

O projeto usa o pacote **`prettus/l5-repository`** que implementa o padrão Repository.

**Interface (PostRepository):**
```php
interface PostRepository extends RepositoryInterface {
    public function getLatestPosts(int $perPage = 15, ?int $userId = null);
    public function getLatestPostsForUser(int $userId, int $perPage = 15);
    public function getPostsByUser(int $authorId, ?int $viewerId = null, int $perPage = 20);
}
```

**Implementação (PostRepositoryEloquent):**
```php
class PostRepositoryEloquent extends BaseRepository implements PostRepository {
    public function model() { return Post::class; }
    // CRUD genérico herdado + métodos customizados
}
```

**Benefícios:**
- **Troca de ORM:** Se um dia trocar Eloquent por Doctrine, só muda a implementação
- **Testabilidade:** Pode criar `PostRepositoryFake` para testes
- **Critérios reutilizáveis:** `RequestCriteria` aplica filtros dinâmicos
- **Separation of Concerns:** Camada Repository só fala com BD, Service só tem lógica

---

## 8. PONTOS DE ATENÇÃO PARA A BANCA

### O que está bem feito:

1. **Separação em camadas:** Controller → Service → Repository → Model → BD
2. **Middleware hierárquico:** auth:sanctum → admin → superadmin (cada nível adiciona uma restrição)
3. **DTOs (Data Transfer Objects):** `CreatePostData`, `LoginData` — tipagem forte
4. **FormRequests:** validação desacoplada dos Controllers
5. **Eager loading:** `with(['user'])` + `withCount()` evitam N+1
6. **Subqueries eficientes:** `withExists` para saber se o user já deu baze
7. **Paginação:** Laravel `paginate()` + Angular `PaginatedResponse<T>`
8. **Standalone Angular:** sem NgModules, mais leve e moderno
9. **Interceptors funcionais:** `HttpInterceptorFn` (nova API Angular 15+)
10. **Signals:** estado reativo sem dependência externa (NgRx)
11. **Optimistic UI:** no toggle baze, atualiza UI primeiro e reverte se erro

### O que pode ser questionado (e como responder):

| Ponto | Pergunta possível | Resposta |
|-------|-------------------|----------|
| **Sem API Resources** | "Por que não usou Resource/Collection do Laravel?" | O projeto é enxuto e a transformação é feita diretamente nos Controllers. Para escala maior, Resources dariam mais controle sobre campos expostos. |
| **Token no localStorage** | "Não é inseguro guardar token no localStorage?" | Para uma SPA que se comunica apenas com API própria, é aceitável. Em cenários de alta segurança, usar HttpOnly cookies com CSRF seria melhor. |
| **Sem refresh token** | "O token nunca expira?" | Atualmente não implementado. Sanctum permite definir expiração via `config/sanctum.php`. Seria uma evolução. |
| **Sem testes** | "Onde estão os testes?" | O projeto tem estrutura de testes (`tests/`) mas não foram implementados ainda. Testes unitários para Services e feature tests para endpoints seriam o próximo passo. |
| **URL hardcoded no frontend** | "Como muda para produção?" | Criar `environment.prod.ts` com a URL de produção e substituir no build. |
| **Sem filas (queues)** | "Notificações/emails são síncronos?" | Sim. Para produção, implementar Laravel Queue com Redis para enviar emails e notificações em background. |

---

## 9. MAPA DE CORRELAÇÃO CÓDIGO-FONTE

| O que perguntam | Onde está no código |
|----------------|-------------------|
| Rotas da API | `nzolanet/routes/api.php` |
| Controller de posts | `nzolanet/app/Http/Controllers/Api/PostController.php` |
| Controller de users/auth | `nzolanet/app/Http/Controllers/Api/UserController.php` |
| Service de posts | `nzolanet/app/Services/Api/PostService.php` |
| Service de users | `nzolanet/app/Services/Api/UserService.php` |
| Repository interface | `nzolanet/app/Repositories/Api/PostRepository.php` |
| Repository implementação | `nzolanet/app/Repositories/Api/PostRepositoryEloquent.php` |
| Model Post | `nzolanet/app/Models/Post.php` |
| Model User | `nzolanet/app/Models/User.php` |
| FormRequest (validação) | `nzolanet/app/Http/Requests/Api/CreatePostRequest.php` |
| Middleware admin | `nzolanet/app/Http/Middleware/EnsureAdmin.php` |
| Routes do Angular | `frontend/src/app/app.routes.ts` |
| AuthGuard Angular | `frontend/src/app/core/guards/auth.guard.ts` |
| AuthInterceptor | `frontend/src/app/core/interceptors/auth.interceptor.ts` |
| AuthService | `frontend/src/app/core/services/auth.service.ts` |
| PostService Angular | `frontend/src/app/core/services/post.service.ts` |
| Componente Feed | `frontend/src/app/features/feed/feed.ts` |
| Config do App | `frontend/src/app/app.config.ts` |
| URL Base | `frontend/src/app/core/services/api-url.service.ts` |
| Models (interfaces TS) | `frontend/src/app/core/models/api.models.ts` |

---

> **Resumo para a defesa (elevator pitch, 2 minutos):**  
> "NzolaNet é uma rede social construída com Angular 19 Standalone no frontend e Laravel 11 no backend. A comunicação é via API RESTful com autenticação por tokens Sanctum.  
> O backend segue uma arquitetura em camadas: **Controllers** recebem requests, delegam para **Services** com a lógica de negócio, que usam **Repositories** para acesso a dados via **Eloquent ORM** com MySQL.  
> O frontend usa **Standalone Components**, **Signals** para estado reativo, **Interceptors** para autenticação automática e **Guards** para proteção de rotas.  
> A segurança é garantida por middlewares hierárquicos no Laravel (auth → admin → superadmin), validação com FormRequests, proteção contra SQL injection via Eloquent, e sanitização XSS pelo Angular."