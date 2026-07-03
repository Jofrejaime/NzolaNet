# NzolaNet — Como o Frontend (Angular) Consome o Backend (Laravel API)

> **Guia prático e técnico:** Da rota no Angular até o JSON do Laravel, passando por Services, Interceptors, Guards e o fluxo completo de dados.

---

## ÍNDICE

1. [Arquitetura da comunicação](#1-arquitetura-da-comunicação)
2. [Configuração inicial (app.config.ts)](#2-configuração-inicial)
3. [Url base da API (ApiUrlService)](#3-url-base-da-api)
4. [Services — Ponte entre Componentes e API](#4-services)
5. [AuthInterceptor — O cérebro dos Headers HTTP](#5-authinterceptor)
6. [Models/Interfaces TypeScript](#6-models-interfaces)
7. [Components — Consumindo os Services](#7-components)
8. [Rotas no Angular (app.routes.ts)](#8-rotas-no-angular)
9. [Guards — Proteção de Rotas](#9-guards)
10. [Fluxo completo de autenticação](#10-fluxo-completo-de-autenticação)
11. [Método HTTP para cada operação](#11-métodos-http)
12. [Tratamento de erros em cada camada](#12-tratamento-de-erros)
13. [Upload de ficheiros (FormData)](#13-upload-de-ficheiros)
14. [Mapeamento completo: Rota Angular → Endpoint Laravel](#14-mapeamento-completo)
15. [Diagrama visual de toda a comunicação](#15-diagrama-visual)

---

## 1. Arquitetura da Comunicação

```
┌───────────────────────────────────────────────────────────┐
│                    NAVEGADOR (Angular)                     │
│                                                           │
│  Rota Angular ──▶ Guard (protege?) ──▶ Component          │
│                                              │            │
│                                              ▼            │
│  Service ──▶ HttpClient ──▶ Interceptor ──▶ HTTP Request  │
│  (injeta      (faz a        (add token,     (GET/POST/    │
│   HttpClient)  chamada)      headers)        PUT/DELETE)  │
└──────────────────────────┬────────────────────────────────┘
                           │ http://localhost:8000/api/...
                           │ Authorization: Bearer {token}
                           │ Accept: application/json
                           ▼
┌───────────────────────────────────────────────────────────┐
│               SERVIDOR (Laravel 11)                        │
│                                                           │
│  public/index.php → Kernel → Middleware Stack             │
│    1. CORS                                                │
│    2. auth:sanctum (se rota protegida)                    │
│                                                           │
│  Router → Controller → Service → Repository → Model → BD │
│                                                           │
│  response()->json([ success, data, message ])             │
└───────────────────────────────────────────────────────────┘
```

**Stack completa:**
- **Angular 19** (Standalone Components, sem NgModules)
- **HttpClient** do Angular (módulo `@angular/common/http`)
- **Laravel 11** como API REST
- **Sanctum** para autenticação por token
- **MySQL** como banco de dados

---

## 2. Configuração Inicial (app.config.ts)

**Arquivo:** `frontend/src/app/app.config.ts`

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),                              // Habilita o sistema de rotas
    provideHttpClient(withInterceptors([authInterceptor])) // Habilita HTTP + interceptors
  ]
};
```

**O que cada provider faz:**

| Provider | Função |
|----------|--------|
| `provideRouter(routes)` | Ativa o roteamento Angular com as rotas definidas |
| `provideHttpClient(...)` | Torna o `HttpClient` disponível para injeção em toda a app |
| `withInterceptors([authInterceptor])` | Registra o interceptor que adiciona automaticamente o token Bearer e o header `Accept: application/json` a todas as requisições HTTP |

**Este ficheiro é referenciado no `main.ts`:**
```typescript
// frontend/src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
```

---

## 3. URL Base da API (ApiUrlService)

**Arquivo:** `frontend/src/app/core/services/api-url.service.ts`

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiUrlService {
  private readonly baseUrl = 'http://localhost:8000';   // ← URL do Laravel
  readonly apiUrl = `${this.baseUrl}/api`;               // ← http://localhost:8000/api

  storageUrl(path?: string | null): string | null {
    if (!path) return null;

    // Se já for URL completa (ex: https://...), retorna como está
    if (/^https?:\/\//i.test(path)) return path;

    // Se for caminho relativo (ex: posts/images/abc.jpg), monta a URL
    return `${this.baseUrl}/storage/${path}`;
  }
}
```

**Este serviço é usado por TODOS os outros services como a fonte central da URL da API.**

**Exemplo de uso em qualquer service:**
```typescript
this.http.get(`${this.apiUrl.apiUrl}/posts`)
// Gera: GET http://localhost:8000/api/posts
```

**Exemplo de uso no template para mostrar imagens:**
```typescript
// No component:
mediaUrl(path?: string | null): string | null {
  return this.apiUrl.storageUrl(path);
}

// No HTML: <img [src]="mediaUrl(post.image)" />
```

---

## 4. Services — Ponte entre Componentes e API

### 4.1 Anatomia de um Service

**Arquivo:** `frontend/src/app/core/services/post.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { ApiUrlService } from './api-url.service';
import { ApiResponse, PaginatedResponse, Post } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class PostService {

  // HttpClient e ApiUrlService são INJETADOS pelo Angular (DI)
  constructor(
    private http: HttpClient,
    private apiUrl: ApiUrlService
  ) {}

  // ============================================
  // LISTAR (GET)
  // ============================================
  list() {
    return this.http
      .get<ApiResponse<PaginatedResponse<Post>>>(`${this.apiUrl.apiUrl}/posts`)
      .pipe(map((response) => response.data));   // Extrai apenas o 'data' do envelope
  }

  // ============================================
  // DETALHE (GET por ID)
  // ============================================
  show(id: number) {
    return this.http
      .get<ApiResponse<Post>>(`${this.apiUrl.apiUrl}/posts/${id}`)
      .pipe(map((response) => response.data));
  }

  // ============================================
  // CRIAR (POST com FormData)
  // ============================================
  create(payload: { content: string; image?: File | null; video?: File | null }) {
    const formData = new FormData();

    if (payload.content?.trim()) {
      formData.append('content', payload.content.trim());
    }
    if (payload.image) {
      formData.append('image', payload.image);
    }
    if (payload.video) {
      formData.append('video', payload.video);
    }

    return this.http
      .post<ApiResponse<Post>>(`${this.apiUrl.apiUrl}/posts`, formData)
      .pipe(map((response) => response.data));
  }

  // ============================================
  // ATUALIZAR (POST com _method=PUT — FormData)
  // ============================================
  update(id: number, payload: { content: string; image?: File | null; video?: File | null }) {
    const formData = new FormData();
    formData.append('content', payload.content.trim());
    if (payload.image) formData.append('image', payload.image);
    if (payload.video) formData.append('video', payload.video);
    formData.append('_method', 'PUT');   // ← Laravel precisa disso para PUT com FormData

    return this.http
      .post<ApiResponse<Post>>(`${this.apiUrl.apiUrl}/posts/${id}`, formData)
      .pipe(map((response) => response.data));
  }

  // ============================================
  // DELETAR (DELETE)
  // ============================================
  delete(id: number) {
    return this.http
      .delete<ApiResponse<null>>(`${this.apiUrl.apiUrl}/posts/${id}`)
      .pipe(map((response) => response));
  }

  // ============================================
  // BAZE (Like) — POST e DELETE
  // ============================================
  addBaze(id: number) {
    return this.http
      .post<ApiResponse<null>>(`${this.apiUrl.apiUrl}/posts/${id}/baze`, {})
      .pipe(map((response) => response));
  }

  removeBaze(id: number) {
    return this.http
      .delete<ApiResponse<null>>(`${this.apiUrl.apiUrl}/posts/${id}/baze`)
      .pipe(map((response) => response));
  }
}
```

### 4.2 Padrão usado em todos os services

```typescript
@Injectable({ providedIn: 'root' })   // → Singleton: uma instância para toda a app
export class NomeService {
  constructor(
    private http: HttpClient,          // → Injeção de dependência do Angular
    private apiUrl: ApiUrlService      // → URL base centralizada
  ) {}

  metodo() {
    return this.http
      .get<T>(`${this.apiUrl.apiUrl}/endpoint`)   // → Chama API
      .pipe(map((response) => response.data));     // → Extrai data do envelope
  }
}
```

### 4.3 Todos os Services da aplicação

| Service | Função | Métodos principais |
|---------|--------|-------------------|
| **AuthService** | Login, register, logout, estado do user | `login()`, `register()`, `logout()`, `loadUser()` |
| **PostService** | CRUD de posts + baze | `list()`, `show()`, `create()`, `update()`, `delete()`, `addBaze()`, `removeBaze()` |
| **UserService** | Perfil, seguidores, pesquisa | `show()`, `list()`, `follow()`, `unfollow()`, `getFollowers()`, `updateProfile()` |
| **CommentService** | CRUD de comentários | `list(postId)`, `create()`, `update()`, `delete()` |
| **AdminService** | Dashboard e gestão admin | `dashboard()`, `users()`, `posts()`, `toggleUser()`, `promoteToAdmin()` |
| **ToastService** | Notificações toast | `success()`, `error()`, `warning()`, `info()` |
| **ApiUrlService** | URL base da API | `apiUrl`, `storageUrl()` |
| **ThemeService** | Tema claro/escuro | `toggle()`, `currentTheme` |

---

## 5. AuthInterceptor — O Cérebro dos Headers HTTP

**Arquivo:** `frontend/src/app/core/interceptors/auth.interceptor.ts`

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

// HttpInterceptorFn → Nova API do Angular 15+ (funcional, sem classe)
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  // 1. Lê o token do localStorage
  const token = localStorage.getItem('nzolanet_token');

  // 2. Define headers padrão
  const headers: Record<string, string> = {
    Accept: 'application/json',        // ← OBRIGATÓRIO! Sem isso, Laravel retorna HTML/redirect
  };

  // 3. Se existe token, adiciona Authorization Bearer
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 4. Clona a request com os novos headers e passa para o próximo handler
  return next(request.clone({ setHeaders: headers }));
};
```

### 5.1 O que acontece sem o Interceptor

**Requisição SEM interceptor:**
```
GET /api/posts
Headers: (nenhum custom)
→ Laravel vê que não tem Accept: application/json
→ Retorna 404 HTML ou redirect
→ Angular recebe HTML em vez de JSON → erro de parsing
```

**Requisição COM interceptor:**
```
GET /api/posts
Headers:
  Accept: application/json
  Authorization: Bearer 1|aB3cD4eF5gH6iJ7kL8mN9oP0qR...
→ Laravel vê Accept: application/json
→ Retorna JSON corretamente
→ Sanctum valida o token e carrega o usuário
```

### 5.2 Registro do Interceptor

Em `app.config.ts`:
```typescript
provideHttpClient(withInterceptors([authInterceptor]))
```

Isso faz com que **TODAS** as requisições HTTP passem pelo interceptor automaticamente.

### 5.3 Fluxo de interceptação

```
Component chama: this.postService.list()
         ↓
PostService faz: this.http.get('/api/posts')
         ↓
HttpClient cria HttpRequest (sem headers custom)
         ↓
Interceptor authInterceptor é chamado automaticamente
         ↓
  - Lê token do localStorage
  - Cria headers: { Accept, Authorization }
  - request.clone({ setHeaders })
         ↓
HttpClient envia a request MODIFICADA para a rede
         ↓
Servidor recebe com headers corretos
```

---

## 6. Models/Interfaces TypeScript

**Arquivo:** `frontend/src/app/core/models/api.models.ts`

```typescript
// ============================================
// ENVELOPE DA RESPOSTA (padrão usado em TODOS os endpoints)
// ============================================
export interface ApiResponse<T> {
  success: boolean;               // true/false
  message?: string;               // Mensagem opcional
  data: T;                        // Payload real (o que interessa)
  errors?: Record<string, string[]>;  // Erros de validação (422)
}

// ============================================
// RESPOSTA PAGINADA
// ============================================
export interface PaginatedResponse<T> {
  current_page: number;       // Página atual
  data: T[];                  // Array de itens da página
  per_page?: number;          // Itens por página
  total?: number;             // Total de itens
}

// ============================================
// USUÁRIO
// ============================================
export interface NzolaUser {
  id: number;
  name: string;
  email?: string;
  bio?: string | null;
  profile_photo?: string | null;
  is_private?: boolean;
  is_active?: boolean;
  is_following?: boolean;     // Se o user logado segue este user
  role?: string;              // 'utilizador' | 'administrador' | 'superadministrador'
  created_at?: string;
}

// ============================================
// PAYLOAD DE AUTENTICAÇÃO (login/register retornam isso)
// ============================================
export interface AuthPayload {
  user: NzolaUser;           // Dados do usuário
  access_token: string;       // Token Sanctum (ex: "1|aB3cD4eF5g...")
  token_type: string;         // "Bearer"
}

// ============================================
// POST (Publicação)
// ============================================
export interface Post {
  id: number;
  user_id: number;
  content?: string | null;
  image?: string | null;
  video?: string | null;
  comments_count?: number;    // eager loaded (withCount)
  bazes_count?: number;       // eager loaded (withCount)
  has_bazed?: boolean;        // eager loaded (withExists) — se user atual deu baze
  created_at?: string;
  updated_at?: string;
  user?: NzolaUser;           // eager loaded (with)
}

// ============================================
// COMENTÁRIO
// ============================================
export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id?: number | null;  // Para replies aninhados
  content: string;
  created_at?: string;
  updated_at?: string;
  user?: NzolaUser;
  post?: Post;
  replies?: Comment[];        // Comentários-filho
}

// ============================================
// ADMIN
// ============================================
export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalPosts: number;
  totalComments: number;
  totalBazes: number;
  totalAdmins: number;
  recentUsers: NzolaUser[];
  recentPosts: Post[];
  usersByMonth: Record<string, number>;
  postsByMonth: Record<string, number>;
}
```

### 6.1 Como as interfaces são usadas

```typescript
// Service tipa a resposta completa
this.http.get<ApiResponse<PaginatedResponse<Post>>>('/api/posts')
         .pipe(map(res => res.data))      // → PaginatedResponse<Post>

// Component recebe apenas o data
subscribe((page: PaginatedResponse<Post>) => {
  this.posts = page.data;   // → Post[]
})
```

---

## 7. Components — Consumindo os Services

### 7.1 Anatomia de um Component (FeedComponent)

**Arquivo:** `frontend/src/app/features/feed/feed.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Post } from '../../core/models/api.models';
import { PostService } from '../../core/services/post.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ApiUrlService } from '../../core/services/api-url.service';

@Component({
  selector: 'nzola-feed',
  standalone: true,                          // ← Standalone (sem NgModule)
  imports: [CommonModule],                   // ← Importa diretivas do Angular
  templateUrl: './feed.html',                // ← Template HTML
  host: { class: 'block w-full' }
})
export class FeedComponent implements OnInit {
  posts: Post[] = [];                        // ← Array de posts (estado do component)
  isLoading = false;                         // ← Controla loading
  errorMessage = '';                         // ← Controla erro

  // Services são INJETADOS via construtor
  constructor(
    private postService: PostService,
    private apiUrl: ApiUrlService,
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  // ============================================
  // ngOnInit → Carrega dados ao iniciar
  // ============================================
  ngOnInit(): void {
    this.loadFeed();   // Chama no momento em que o component é montado
  }

  // ============================================
  // loadFeed() → Chama o Service e trata resposta
  // ============================================
  loadFeed(): void {
    this.isLoading = true;     // Ativa loading (mostra skeleton no template)
    this.errorMessage = '';    // Limpa erro anterior

    // Chama o service → retorna Observable
    // .subscribe() → EXECUTA a requisição
    this.postService.list().subscribe({
      next: (page) => {
        // SUCESSO: popula o array de posts
        this.posts = [...page.data];
        this.isLoading = false;
      },
      error: (error) => {
        // ERRO: extrai mensagem do backend
        this.errorMessage = error?.error?.message || 'Não foi possível carregar o feed.';
        this.isLoading = false;
        this.toastService.error('Erro!', 'Não foi possível carregar o feed.');
      }
    });
  }

  // ============================================
  // Métodos auxiliares usados no template
  // ============================================

  // Monta URL completa para imagens
  mediaUrl(path?: string | null): string | null {
    return this.apiUrl.storageUrl(path);
  }

  // Navega para o thread do post
  goToThread(post: Post): void {
    this.router.navigate(['/post', post.id]);
  }

  // Verifica se o post é do user logado
  isOwnPost(post: Post): boolean {
    return this.authService.currentUser()?.id === post.user_id;
  }

  // Formata tempo relativo (ex: "5m", "3h", "2d")
  relativeTime(date?: string): string {
    if (!date) return 'agora';
    const diffMs = Date.now() - new Date(date).getTime();
    const minutes = Math.max(1, Math.floor(diffMs / 60000));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  }
}
```

### 7.2 Template HTML (feed.html — conceitual)

```html
<!-- LOADING STATE → mostra skeleton enquanto carrega -->
<div *ngIf="isLoading">
  <nzola-skeleton></nzola-skeleton>
</div>

<!-- ERROR STATE → mostra mensagem de erro -->
<div *ngIf="errorMessage" class="error">
  {{ errorMessage }}
</div>

<!-- EMPTY STATE → sem posts ainda -->
<div *ngIf="!isLoading && !errorMessage && posts.length === 0">
  Nenhuma publicação encontrada.
</div>

<!-- DATA STATE → lista os posts -->
<div *ngFor="let post of posts" class="post-card" (click)="goToThread(post)">
  
  <!-- Avatar + Nome do autor -->
  <div class="post-header">
    <img [src]="mediaUrl(post.user?.profile_photo)" (error)="onImageError($event)">
    <span>{{ post.user?.name }}</span>
  </div>

  <!-- Conteúdo do post -->
  <p>{{ post.content }}</p>

  <!-- Imagem (se existir) -->
  <img *ngIf="post.image" [src]="mediaUrl(post.image)" class="post-image">

  <!-- Ações: Baze, Comentários -->
  <div class="post-actions">
    <button (click)="toggleBaze(post, $event)">
      {{ post.has_bazed ? '❤️' : '🤍' }} {{ post.bazes_count }}
    </button>
    <span>💬 {{ post.comments_count }}</span>
  </div>

  <!-- Tempo relativo -->
  <span class="time">{{ relativeTime(post.created_at) }}</span>
</div>
```

### 7.3 Ciclo de vida completo (Component → Service → API → Resposta)

```
1. Component.ngOnInit()
   ↓
2. Component.loadFeed()
   ↓ isLoading = true (template mostra skeleton)
   ↓
3. Chama PostService.list()
   ↓ Retorna Observable<PaginatedResponse<Post>>
   ↓
4. Component se INSCREVE no Observable (subscribe)
   ↓ A requisição HTTP só é ENVIADA quando alguém dá subscribe
   ↓
5. HttpClient faz GET http://localhost:8000/api/posts
   ↓ Interceptor adiciona headers automaticamente
   ↓
6. [AGUARDA RESPOSTA DO SERVIDOR]
   ↓
7a. SUCESSO (next):
      ↓ page = { data: [...], current_page, total }
      ↓ this.posts = page.data
      ↓ this.isLoading = false
      ↓ Angular detecta mudanças e atualiza template

7b. ERRO (error):
      ↓ errorMessage = error.error.message
      ↓ this.isLoading = false
      ↓ Template mostra mensagem de erro
```

---

## 8. Rotas no Angular (app.routes.ts)

**Arquivo:** `frontend/src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { FeedComponent } from './features/feed/feed';
import { ProfileComponent } from './features/profile/profile';
import { ThreadComponent } from './features/thread/thread';
import { LoginComponent } from './features/login/login';
import { ComposeComponent } from './features/compose/compose';
import { SearchComponent } from './features/search/search';
import { NotificationsComponent } from './features/notifications/notifications';
import { SettingsComponent } from './features/settings/settings';
import { AccountComponent } from './features/settings/account/account';
import { PrivacyComponent } from './features/settings/privacy/privacy';
import { SecurityComponent } from './features/settings/security/security';
import { HelpComponent } from './features/settings/help/help';
import { AboutComponent } from './features/settings/about/about';
import { authGuard, adminGuard, guestGuard } from './core/guards/auth.guard';
import { AdminComponent } from './features/admin/admin';
import { FollowersComponent } from './features/profile/followers/followers';
import { FollowingComponent } from './features/profile/following/following';

export const routes: Routes = [
  // ============================================
  // ROTA PÚBLICA (só para quem NÃO está logado)
  // ============================================
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]           // ← Só acessa se NÃO estiver logado
  },

  // ============================================
  // ROTAS PROTEGIDAS (exigem autenticação)
  // ============================================
  {
    path: '',
    component: MainLayoutComponent,      // ← Layout com sidebar + router-outlet
    canActivate: [authGuard],            // ← Só acessa se estiver logado
    children: [
      // --- Feed principal ---
      { path: 'home', component: FeedComponent },

      // --- Perfil ---
      { path: 'profile', component: ProfileComponent },
      { path: 'profile/:id', component: ProfileComponent },
      { path: 'profile/followers', component: FollowersComponent },
      { path: 'profile/following', component: FollowingComponent },
      { path: 'profile/:id/followers', component: FollowersComponent },
      { path: 'profile/:id/following', component: FollowingComponent },

      // --- Post individual (thread) ---
      { path: 'post/:id', component: ThreadComponent },

      // --- Criar post ---
      { path: 'compose', component: ComposeComponent },

      // --- Pesquisa ---
      { path: 'search', component: SearchComponent },

      // --- Notificações ---
      { path: 'notifications', component: NotificationsComponent },

      // --- Configurações ---
      { path: 'settings', component: SettingsComponent },
      { path: 'settings/account', component: AccountComponent },
      { path: 'settings/privacy', component: PrivacyComponent },
      { path: 'settings/security', component: SecurityComponent },
      { path: 'settings/help', component: HelpComponent },
      { path: 'settings/about', component: AboutComponent },

      // --- Admin (exige role admin) ---
      {
        path: 'admin',
        component: AdminComponent,
        canActivate: [adminGuard]       // ← Só admin/superadmin
      },

      // --- Redirecionamento padrão ---
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ]
  },

  // ============================================
  // ROTA CORINGA (404 → redireciona para home)
  // ============================================
  { path: '**', redirectTo: 'home' }
];
```

### 8.1 Como as rotas funcionam na prática

**Quando o usuário digita `http://localhost:4200/profile/5`:**
```
1. Angular Router analisa a URL: /profile/5
2. Match: path: 'profile/:id' → id = '5'
3. Verifica authGuard → está logado? Se não → redireciona /login
4. Se está logado → renderiza ProfileComponent
5. ProfileComponent recebe o id via ActivatedRoute
6. Chama UserService.show(5) → GET /api/users/5
```

### 8.2 Navegação programática (no component)

```typescript
// Navegar para rota pelo código (não por link HTML)
this.router.navigate(['/profile', userId]);          // /profile/42
this.router.navigate(['/post', post.id]);            // /post/7
this.router.navigate(['/home']);                     // /home
this.router.navigate(['/settings/security']);        // /settings/security

// Navegar com evento de clique (no template)
goToUserProfile(userId: number, event: Event): void {
  event.stopPropagation();
  this.router.navigate(['/profile', userId]);
}
```

### 8.3 Hierarquia de navegação

```
/login                          → LoginComponent (guestGuard)

/home                           → FeedComponent (authGuard)
/profile                        → ProfileComponent (authGuard)
/profile/5                      → ProfileComponent com id=5
/profile/5/followers            → FollowersComponent
/post/42                        → ThreadComponent com id=42
/compose                        → ComposeComponent
/search                         → SearchComponent
/notifications                  → NotificationsComponent
/settings/account               → AccountComponent
/admin                          → AdminComponent (authGuard + adminGuard)

(qualquer outra rota)           → redirectTo '/home'
```

---

## 9. Guards — Proteção de Rotas

**Arquivo:** `frontend/src/app/core/guards/auth.guard.ts`

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// ============================================
// authGuard — Só acessa se estiver LOGADO
// ============================================
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);   // Injeta o serviço
  const router = inject(Router);              // Injeta o router

  if (authService.isAuthenticated) {         // Tem token no localStorage?
    return true;                              // → Permite acesso
  }

  return router.createUrlTree(['/login']);    // → Redireciona para login
};

// ============================================
// guestGuard — Só acessa se NÃO estiver logado
// (para páginas como login, register)
// ============================================
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated) {         // Não tem token?
    return true;                               // → Permite acesso (pode ver login)
  }

  return router.createUrlTree(['/home']);      // → Redireciona para home
};

// ============================================
// adminGuard — Só acessa se for ADMIN
// ============================================
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated) {
    return router.createUrlTree(['/login']);   // Não logado → login
  }

  const role = authService.currentUser()?.role;
  if (role === 'superadministrador' || role === 'administrador') {
    return true;                                // É admin → permite
  }

  return router.createUrlTree(['/home']);       // Não admin → home
};
```

### 9.1 Como os Guards funcionam visualmente

```
URL digitada: /admin
       ↓
Angular Router verifica a config:
  path: 'admin', canActivate: [authGuard, adminGuard]
       ↓
       ↓ authGuard executa PRIMEIRO:
       ↓   authService.isAuthenticated? (tem token?)
       ↓   NÃO → redirectTo: '/login' (PARA AQUI)
       ↓   SIM → continua
       ↓
       ↓ adminGuard executa DEPOIS:
       ↓   currentUser.role === 'administrador' || 'superadministrador'?
       ↓   NÃO → redirectTo: '/home' (PARA AQUI)
       ↓   SIM → Renderiza AdminComponent
```

### 9.2 Fluxo de decisão dos Guards

```
┌───────────────────────────────────────────────┐
│              ROTA SOLICITADA                    │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │  guestGuard?     │ ← Se a rota tiver guestGuard
              │  (login/register)│
              └────────┬────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   Token existe?              Token NÃO existe?
   SIM → redirect /home       SIM → permite acesso
          │                         │
          ▼                         ▼
    (não renderiza)           Renderiza LoginComponent

              ┌─────────────────┐
              │  authGuard?      │ ← Se a rota tiver authGuard
              │ (home, profile)  │
              └────────┬────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   Token existe?              Token NÃO existe?
   SIM → permite acesso       SIM → redirect /login
          │                         │
          ▼                         ▼
    Renderiza Component       (não renderiza)

              ┌─────────────────┐
              │  adminGuard?     │ ← Se a rota tiver adminGuard
              │  (/admin)        │
              └────────┬────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
   role é admin?              role NÃO é admin?
   SIM → permite acesso       SIM → redirect /home
          │                         │
          ▼                         ▼
    Renderiza AdminComponent   (não renderiza)
```

---

## 10. Fluxo Completo de Autenticação

### 10.1 Login

```
┌────────────────────────────────────────────────────────────────────┐
│ ANGULAR: LoginComponent                                            │
│                                                                    │
│ 1. Usuário preenche email + password + clica "Entrar"             │
│ 2. LoginComponent.login()                                          │
│    ↓                                                               │
│ 3. AuthService.login(credentials)                                  │
│    ↓ this.http.post('/api/login', { email, password })             │
│    ↓ Interceptor adiciona headers: Accept: application/json        │
│    ↓                                                               │
├────────────────────────────────────────────────────────────────────┤
│ NETWORK: POST http://localhost:8000/api/login                      │
│ Body: { email: "user@test.com", password: "123456" }              │
│ Headers: Accept: application/json                                  │
├────────────────────────────────────────────────────────────────────┤
│ LARAVEL: UserController.login(LoginRequest)                        │
│    ↓ Valida (email obrigatório, password obrigatório)              │
│    ↓ UserService.login(LoginData)                                  │
│    ↓ UserRepository::findByCredentials(email, password)            │
│    ↓ Hash::check(password, $user->password)                        │
│    ↓ Verifica is_active === true                                   │
│    ↓ $user->createToken('auth_token')->plainTextToken              │
│    ↓                                                               │
│ RESPONSE 200:                                                      │
│ {                                                                  │
│   "success": true,                                                 │
│   "message": "Login realizado com sucesso!",                       │
│   "data": {                                                        │
│     "user": { id: 1, name: "João", email: "...", role: "..." },   │
│     "access_token": "1|aB3cD4eF5gH6iJ7kL8mN9oP0qR...",           │
│     "token_type": "Bearer"                                         │
│   }                                                                │
│ }                                                                  │
├────────────────────────────────────────────────────────────────────┤
│ ANGULAR: AuthService recebe resposta                               │
│                                                                    │
│ 4. persistSession(response.data)                                    │
│    ↓ localStorage.setItem('nzolanet_token', '1|aB3c...')          │
│    ↓ localStorage.setItem('nzolanet_user', JSON.stringify(user))   │
│    ↓ this.currentUser.set(user)  (atualiza signal)                │
│    ↓                                                               │
│ 5. LoginComponent no subscribe:                                    │
│    ↓ toastService.success('Bem-vindo!', 'Login realizado...')      │
│    ↓ router.navigate(['/home'])                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 10.2 Register

```
┌────────────────────────────────────────────────────────────────────┐
│ ANGULAR: LoginComponent.register()                                 │
│                                                                    │
│ 1. Valida no frontend:                                             │
│    - terms aceitos                                                 │
│    - password === password_confirmation                            │
│    - password.length >= 8                                          │
│ 2. AuthService.register(payload)                                    │
│    ↓ this.http.post('/api/register', { name, email, password... }) │
├────────────────────────────────────────────────────────────────────┤
│ LARAVEL: UserController.register(RegisterRequest)                  │
│    ↓ Valida: name, email (unique), password (min:8), confirmed     │
│    ↓ UserService.register(RegisterData)                            │
│    ↓ Verifica se email já existe → 422 se existir                  │
│    ↓ UserRepository::create($data)                                 │
│    ↓ $user->createToken('auth_token')->plainTextToken              │
│    ↓ Retorna { user, access_token, token_type }                    │
├────────────────────────────────────────────────────────────────────┤
│ ANGULAR: AuthService.persistSession() → salva token + user         │
│ LoginComponent → router.navigate(['/home'])                        │
└────────────────────────────────────────────────────────────────────┘
```

### 10.3 Logout

```
┌────────────────────────────────────────────────────────────────────┐
│ ANGULAR: AuthService.logout()                                      │
│                                                                    │
│ 1. Pega o token do localStorage                                    │
│ 2. Se existe token → POST /api/logout (Interceptor add token)      │
│ 3. Sucesso ou erro → finishLogout()                                │
│    ↓ clearSession()                                                 │
│    ↓ localStorage.removeItem('nzolanet_token')                     │
│    ↓ localStorage.removeItem('nzolanet_user')                      │
│    ↓ this.currentUser.set(null)                                    │
│    ↓ router.navigate(['/login'])                                   │
├────────────────────────────────────────────────────────────────────┤
│ LARAVEL: UserController.logout()                                   │
│    ↓ $user->currentAccessToken()->delete()                         │
│    ↓ Token é invalidado (não pode mais ser usado)                  │
└────────────────────────────────────────────────────────────────────┘
```

### 10.4 Como o token é reutilizado

```
A cada requisição:
┌──────────────────────────────┐
│  1. AuthInterceptor          │
│  2. localStorage.getItem()   │
│  3. headers['Authorization'] │
│     = 'Bearer 1|aB3c...'     │
│  4. request.clone()          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  5. HTTP Request             │
│  Authorization: Bearer 1|... │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│  6. Laravel Sanctum          │
│  7. auth:sanctum middleware  │
│  8. Verifica token na tabela │
│  9. Carrega User autenticado │
│  10. $request->user()        │
└──────────────────────────────┘
```

---

## 11. Método HTTP para cada Operação

### Mapeamento completo: Operação → Angular → Laravel

| Operação | Angular | HTTP Method | Endpoint | Laravel Action |
|----------|---------|-------------|----------|----------------|
| Login | `authService.login()` | **POST** | `/api/login` | `UserController@login` |
| Register | `authService.register()` | **POST** | `/api/register` | `UserController@register` |
| Logout | `authService.logout()` | **POST** | `/api/logout` | `UserController@logout` |
| Listar feed | `postService.list()` | **GET** | `/api/posts` | `PostController@index` |
| Ver post | `postService.show(id)` | **GET** | `/api/posts/{id}` | `PostController@show` |
| Criar post | `postService.create()` | **POST** | `/api/posts` | `PostController@store` |
| Editar post | `postService.update(id)` | **POST** `_method=PUT` | `/api/posts/{id}` | `PostController@update` |
| Excluir post | `postService.delete(id)` | **DELETE** | `/api/posts/{id}` | `PostController@destroy` |
| Dar baze | `postService.addBaze(id)` | **POST** | `/api/posts/{id}/baze` | `BazeController@store` |
| Remover baze | `postService.removeBaze(id)` | **DELETE** | `/api/posts/{id}/baze` | `BazeController@destroy` |
| Listar users | `userService.list()` | **GET** | `/api/users?search=` | `UserController@index` |
| Ver user | `userService.show(id)` | **GET** | `/api/users/{id}` | `UserController@show` |
| Seguir | `userService.follow(id)` | **POST** | `/api/users/{id}/follow` | `UserController@follow` |
| Deixar seguir | `userService.unfollow(id)` | **DELETE** | `/api/users/{id}/follow` | `UserController@unfollow` |
| Ver seguidores | `userService.getFollowers(id)` | **GET** | `/api/users/{id}/followers` | `UserController@followers` |
| Ver seguindo | `userService.getFollowing(id)` | **GET** | `/api/users/{id}/following` | `UserController@following` |
| Atualizar perfil | `userService.updateProfile()` | **PUT** | `/api/profile` | `UserController@updateProfile` |
| Upload foto | `userService.uploadProfilePhoto()` | **POST** | `/api/profile/photo` | `UserController@updateProfilePhoto` |
| Trocar senha | `userService.changePassword()` | **PUT** | `/api/profile/password` | `UserController@changePassword` |
| Deletar conta | `userService.deleteAccount()` | **DELETE** | `/api/user` | `UserController@deleteAccount` |
| Comentários do post | `commentService.list(postId)` | **GET** | `/api/posts/{id}/comments` | `CommentController@index` |
| Criar comentário | `commentService.create()` | **POST** | `/api/posts/{id}/comments` | `CommentController@store` |
| Admin dashboard | `adminService.dashboard()` | **GET** | `/api/admin/dashboard` | `AdminController@dashboard` |

### Observações importantes:

**PUT com FormData:**
```typescript
// Angular NÃO consegue fazer PUT com FormData diretamente
// Solução: POST + campo _method = 'PUT'
formData.append('_method', 'PUT');
return this.http.post(url, formData);

// Laravel interpreta _method e roteia para o método update()
```

**DELETE com body:**
```typescript
// Angular permite body em DELETE
return this.http.delete(url, { body: { password } });

// Laravel recebe o password no request para confirmar exclusão
```

---

## 12. Tratamento de Erros em Cada Camada

### 12.1 Erros HTTP possíveis

| Status | Significado | Quando ocorre |
|--------|-------------|---------------|
| `200` | Sucesso | GET, PUT, DELETE |
| `201` | Criado | POST (store) |
| `401` | Não autorizado | Credenciais inválidas |
| `403` | Proibido | Sem permissão (ex: editar post alheio) |
| `404` | Não encontrado | Recurso não existe |
| `422` | Erro de validação | Campos inválidos |
| `500` | Erro interno | Exception no servidor |

### 12.2 Formato do erro (vindo do Laravel)

```json
// 422 — Erro de validação
{
  "success": false,
  "message": "Erro de validação",
  "errors": {
    "email": ["Este email já está registado."],
    "password": ["A palavra-passe deve ter pelo menos 8 caracteres."]
  }
}

// 401 — Credenciais inválidas
{
  "success": false,
  "message": "As credenciais fornecidas estão incorretas."
}

// 403 — Sem permissão
{
  "success": false,
  "message": "Não tem permissão para editar esta publicação."
}

// 500 — Erro interno
{
  "success": false,
  "message": "Erro ao listar publicações: SQLSTATE[HY000]..."
}
```

### 12.3 Como cada camada trata os erros

**Camada 1: Interceptor (ainda não implementado, mas potencial):**
```typescript
// Possível melhoria: Error Interceptor para tratamento global
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expirado → redirecionar para login
        localStorage.removeItem('nzolanet_token');
        window.location.href = '/login';
      }
      return throwError(() => error);
    })
  );
};
```

**Camada 2: Component (onde o erro é tratado atualmente):**
```typescript
loadFeed(): void {
  this.postService.list().subscribe({
    next: (page) => {
      this.posts = page.data;
      this.isLoading = false;
    },
    error: (error) => {
      // Extrai mensagem do backend
      this.errorMessage = error?.error?.message || 'Não foi possível carregar.';
      this.isLoading = false;
      this.toastService.error('Erro!', this.errorMessage);
    }
  });
}
```

**Camada 3: Login component — extrai erros de validação:**
```typescript
login(): void {
  this.authService.login(this.loginForm).subscribe({
    next: () => {
      this.router.navigate(['/home']);
    },
    error: (error) => {
      // Tenta extrair mensagem principal
      const msg = error?.error?.message
        // Se não tem message, tenta primeiro erro de validação
        || this.firstValidationError(error)
        // Fallback
        || 'Email ou palavra-passe incorrectos.';
      this.errorMessage = msg;
    }
  });
}

// Pega o primeiro erro de validação do objeto errors
private firstValidationError(error: any): string | null {
  const errors = error?.error?.errors;
  if (!errors) return null;
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey][0] : null;
}
```

### 12.4 Padrão subscribe nos components

```typescript
// PADRÃO 1: Tratar next e error separadamente
this.service.metodo().subscribe({
  next: (data) => { /* sucesso */ },
  error: (err) => { /* erro */ }
});

// PADRÃO 2: Encadear map antes do subscribe (já vem no service)
this.http.get<T>(url).pipe(map(res => res.data)).subscribe({
  next: (data) => { /* já é o data puro */ }
});

// PADRÃO 3: Upload com complete (usado no register)
this.authService.register(payload).subscribe({
  next: () => { /* sucesso */ },
  error: (err) => { /* erro */ },
  complete: () => { this.isLoading = false; }  // Executa em ambos os casos
});
```

---

## 13. Upload de Ficheiros (FormData)

### 13.1 Como funciona o upload

```typescript
// Exemplo: Criar post com imagem
create(payload: { content: string; image?: File | null; video?: File | null }) {
  const formData = new FormData();          // ← Objeto especial para multipart

  if (payload.content?.trim()) {
    formData.append('content', payload.content.trim());   // ← Campo de texto
  }
  if (payload.image) {
    formData.append('image', payload.image);              // ← Ficheiro
  }
  if (payload.video) {
    formData.append('video', payload.video);              // ← Ficheiro
  }

  return this.http
    .post<ApiResponse<Post>>(`${this.apiUrl.apiUrl}/posts`, formData)
    .pipe(map((response) => response.data));
}
```

### 13.2 Características do FormData

- **Angular detecta automaticamente** que é FormData e **não seta** `Content-Type`
- O browser **seta** `Content-Type: multipart/form-data; boundary=---XXX`
- **Não precisa** de interceptor especial para isso
- Para **edição** (PUT), usa `_method: 'PUT'` no FormData:
  ```typescript
  formData.append('_method', 'PUT');   // ← Trick para Laravel
  return this.http.post(url, formData);
  ```

### 13.3 Exemplo no template

```typescript
// No component de criar post
selectedImage: File | null = null;

onImageSelected(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedImage = file;
  }
}

createPost(): void {
  this.postService.create({
    content: this.content,
    image: this.selectedImage
  }).subscribe(...);
}
```

```html
<!-- Template -->
<input type="file" accept="image/*" (change)="onImageSelected($event)">
<textarea [(ngModel)]="content"></textarea>
<button (click)="createPost()">Publicar</button>
```

---

## 14. Mapeamento Completo: Rota Angular → Endpoint Laravel

| Rota Angular | Componente | Guard | Endpoint Laravel | Método |
|-------------|------------|-------|-----------------|--------|
| `/login` | LoginComponent | guestGuard | `/api/login` + `/api/register` | POST |
| `/home` | FeedComponent | authGuard | `/api/posts` | GET |
| `/post/:id` | ThreadComponent | authGuard | `/api/posts/{id}` | GET |
| `/compose` | ComposeComponent | authGuard | `/api/posts` | POST |
| `/profile` | ProfileComponent | authGuard | `/api/user` | GET |
| `/profile/:id` | ProfileComponent | authGuard | `/api/users/{id}` | GET |
| `/profile/:id/posts` | — | — | `/api/users/{id}/posts` | GET |
| `/profile/:id/followers` | FollowersComponent | authGuard | `/api/users/{id}/followers` | GET |
| `/profile/:id/following` | FollowingComponent | authGuard | `/api/users/{id}/following` | GET |
| `/search` | SearchComponent | authGuard | `/api/users?search=` | GET |
| `/notifications` | NotificationsComponent | authGuard | *(futuro)* | — |
| `/settings` | SettingsComponent | authGuard | `/api/profile` | PUT |
| `/settings/account` | AccountComponent | authGuard | `/api/profile` | PUT |
| `/settings/security` | SecurityComponent | authGuard | `/api/profile/password` | PUT |
| `/settings/privacy` | PrivacyComponent | authGuard | `/api/profile` | PUT |
| `/admin` | AdminComponent | authGuard + adminGuard | `/api/admin/dashboard` | GET |

---

## 15. Diagrama Visual de Toda a Comunicação

```
                           ┌──────────────────────┐
                           │     Navegador         │
                           │   (Angular App)       │
                           └──────────┬───────────┘
                                      │
                         ┌────────────┴────────────┐
                         │                         │
                    ┌────┴────┐              ┌─────┴─────┐
                    │  Login  │              │  Home     │
                    │  Page   │              │  (Feed)   │
                    │ /login  │              │  /home    │
                    └────┬────┘              └─────┬─────┘
                         │                         │
                         ▼                         ▼
               ┌─────────────────┐      ┌──────────────────┐
               │ AuthService     │      │ PostService      │
               │ login()         │      │ list()           │
               │ register()      │      │ show()           │
               │ logout()        │      │ create()         │
               │ loadUser()      │      │ update()         │
               └────────┬────────┘      │ delete()         │
                        │               │ addBaze()        │
                        │               │ removeBaze()     │
                        │               └────────┬─────────┘
                        │                         │
                        └──────┬──────────────────┘
                               │
                               ▼
                     ┌─────────────────┐
                     │  HttpClient     │
                     │  (Angular)      │
                     └────────┬────────┘
                              │
                              ▼
                     ┌─────────────────┐
                     │  AuthInterceptor │
                     │  → Accept: json  │
                     │  → Bearer token  │
                     └────────┬────────┘
                              │
                              ▼
                   ╔═══════════════════════╗
                   ║     INTERNET          ║
                   ║  HTTP Request/Response ║
                   ╚═══════════════════════╝
                              │
                              ▼
                   ┌─────────────────────┐
                   │  Laravel public/     │
                   │  index.php           │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │  Middleware Stack    │
                   │  CORS + Sanctum     │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │  Router → Controller │
                   │  → Service          │
                   │  → Repository       │
                   │  → Model (Eloquent) │
                   │  → MySQL            │
                   └─────────────────────┘
                              │
                              ▼
                   ╔═══════════════════════╗
                   ║   JSON Response       ║
                   ║  { success, data }    ║
                   ╚═══════════════════════╝
                              │
                              ▼
                   ┌─────────────────────┐
                   │  Angular recebe JSON │
                   │  Subscribe next()    │
                   │  Atualiza template   │
                   └─────────────────────┘
```

---

## RESUMO EXECUTIVO (para a banca)

**"Como o frontend Angular consome o backend Laravel?"**

1. **Configuração**: `app.config.ts` registra o `provideHttpClient` com o `authInterceptor`.

2. **URL base**: `ApiUrlService` centraliza `http://localhost:8000/api` — todos os services usam isso.

3. **Services**: Cada entidade (Post, User, Comment) tem um service que injeta `HttpClient`, constrói a URL completa e faz a chamada HTTP com o tipo correto (`get`, `post`, `put`, `delete`). A resposta é extraída do envelope `{ success, data }` via `pipe(map(res => res.data))`.

4. **Interceptor**: Toda request recebe automaticamente `Accept: application/json` e `Authorization: Bearer {token}`. Sem isso, o Laravel não retorna JSON.

5. **Components**: Chamam os services no `ngOnInit()`, se inscrevem nos Observables com `.subscribe()` e atualizam o template. Tratam erro extraindo `error?.error?.message`.

6. **Rotas**: Definidas em `app.routes.ts`. Três guards protegem:
   - `authGuard` → só logado
   - `guestGuard` → só não-logado
   - `adminGuard` → só admin/superadmin

7. **Autenticação**: Token Sanctum gerado no login, armazenado em `localStorage`, reenviado a cada request pelo interceptor, e deletado no logout.

8. **Upload**: FormData para enviar ficheiros. PUT simulado com `_method=PUT` no FormData.

9. **Erros**: Cada component trata no `subscribe.error`. Mensagens extraídas do `error.error.message` (Laravel) ou `error.error.errors` (validação).
"