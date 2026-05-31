# Documentação da API — NzolaNet

Esta documentação descreve todos os endpoints disponíveis na API REST do **NzolaNet**, incluindo os métodos HTTP, parâmetros necessários, headers e exemplos de requisição e resposta.

---

## 1. Configurações Gerais

* **URL Base:** `http://localhost:8000`
* **Prefixo de API:** `/api`
* **Header Obrigatório para Respostas JSON:**
  ```http
  Accept: application/json
  ```

### Autenticação
A API utiliza o **Laravel Sanctum** para autenticação baseada em tokens.
* Para endpoints protegidos, deve incluir o token no header `Authorization` como um `Bearer token`:
  ```http
  Authorization: Bearer <seu_token_aqui>
  ```

---

## 2. Rotas Públicas (Sem Autenticação)

### 2.1 Registo de Novo Utilizador
Cria uma nova conta na plataforma.
* **URL:** `/api/register`
* **Método:** `POST`
* **Corpo da Requisição (JSON):**
  ```json
  {
    "name": "Abel Nkele Canas",
    "email": "abelcanas@gmail.com",
    "password": "senha_segura_123",
    "password_confirmation": "senha_segura_123",
    "bio": "I'm a developer",
    "is_private": false
  }
  ```
* **Resposta de Sucesso (201 Created):**
  ```json
  {
    "success": true,
    "message": "Usuário registrado com sucesso!",
    "data": {
      "user": {
        "id": 1,
        "name": "Abel Nkele Canas",
        "email": "abelcanas@gmail.com",
        "bio": "I'm a developer",
        "profile_photo": null,
        "is_private": false,
        "is_active": true,
        "role": "utilizador"
      },
      "access_token": "1|kAkaP5EEOJBv...",
      "token_type": "Bearer"
    }
  }
  ```

### 2.2 Login do Utilizador
Autentica o utilizador e gera um token de acesso.
* **URL:** `/api/login`
* **Método:** `POST`
* **Corpo da Requisição (JSON):**
  ```json
  {
    "email": "abelcanas@gmail.com",
    "password": "senha_segura_123"
  }
  ```
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login realizado com sucesso!",
    "data": {
      "user": {
        "id": 1,
        "name": "Abel Nkele Canas",
        "email": "abelcanas@gmail.com",
        "bio": "I'm a developer",
        "profile_photo": null,
        "is_private": false,
        "is_active": true,
        "role": "utilizador"
      },
      "access_token": "2|HsN1Aa6dspZE...",
      "token_type": "Bearer"
    }
  }
  ```

### 2.3 Solicitar Recuperação de Senha
Gera uma simulação de envio de instruções de recuperação.
* **URL:** `/api/recover-password`
* **Método:** `POST`
* **Corpo da Requisição (JSON):**
  ```json
  {
    "email": "abelcanas@gmail.com"
  }
  ```
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "message": "Instruções de recuperação enviadas para o email."
  }
  ```

### 2.4 Definir Nova Senha
Altera a senha de uma conta ativa através do email.
* **URL:** `/api/reset-password`
* **Método:** `POST`
* **Corpo da Requisição (JSON):**
  ```json
  {
    "email": "abelcanas@gmail.com",
    "password": "nova_senha_segura_123",
    "password_confirmation": "nova_senha_segura_123"
  }
  ```
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "message": "Senha alterada com sucesso!"
  }
  ```

---

## 3. Rotas Protegidas (Requer Autenticação)

### 3.1 Terminar Sessão (Logout)
Invalida o token de acesso atual.
* **URL:** `/api/logout`
* **Método:** `POST`
* **Headers:** `Authorization: Bearer <token>`
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logout realizado com sucesso!"
  }
  ```

### 3.2 Obter Dados do Utilizador Autenticado
Retorna o perfil do utilizador atualmente autenticado.
* **URL:** `/api/user`
* **Método:** `GET`
* **Headers:** `Authorization: Bearer <token>`
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "name": "Abel Nkele Canas",
      "email": "abelcanas@gmail.com",
      "bio": "I'm a developer",
      "profile_photo": null,
      "is_private": false,
      "is_active": true,
      "role": "utilizador"
    }
  }
  ```

### 3.3 Editar Perfil
Atualiza os campos informativos do perfil.
* **URL:** `/api/profile`
* **Método:** `PUT`
* **Headers:** `Authorization: Bearer <token>`
* **Corpo da Requisição (JSON):**
  ```json
  {
    "name": "Abel Canas Editado",
    "bio": "Novo bio do utilizador",
    "is_private": true
  }
  ```
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "message": "Perfil atualizado com sucesso!",
    "data": {
      "id": 1,
      "name": "Abel Canas Editado",
      "email": "abelcanas@gmail.com",
      "bio": "Novo bio do utilizador",
      "profile_photo": null,
      "is_private": true,
      "is_active": true,
      "role": "utilizador"
    }
  }
  ```

### 3.4 Alterar Foto de Perfil
Faz o upload de uma nova imagem de perfil do utilizador.
* **URL:** `/api/profile/photo`
* **Método:** `POST`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Corpo da Requisição (form-data):**
  * `photo`: Ficheiro de imagem (jpeg, png, jpg, gif, max: 2MB)
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "message": "Foto de perfil atualizada com sucesso!",
    "data": {
      "id": 1,
      "profile_photo": "profiles/nome_do_arquivo.jpg"
    }
  }
  ```

### 3.5 Seguir outro Utilizador
Começa a seguir um utilizador específico pelo seu ID.
* **URL:** `/api/users/{id}/follow`
* **Método:** `POST`
* **Headers:** `Authorization: Bearer <token>`
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "message": "Agora segue este utilizador."
  }
  ```

### 3.6 Deixar de Seguir Utilizador
Para de seguir um utilizador específico pelo seu ID.
* **URL:** `/api/users/{id}/follow`
* **Método:** `DELETE`
* **Headers:** `Authorization: Bearer <token>`
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "message": "Deixou de seguir este utilizador."
  }
  ```

---

## 4. Gestão de Publicações (Posts)

### 4.1 Criar Publicação
Cria uma nova publicação contendo texto e/ou arquivos multimédia (imagem/vídeo).
* **URL:** `/api/posts`
* **Método:** `POST`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Corpo da Requisição (form-data):**
  * `content`: Texto da publicação (opcional se houver imagem ou vídeo)
  * `image`: Ficheiro de imagem (opcional, max: 5MB)
  * `video`: Ficheiro de vídeo (opcional, max: 20MB)
* **Resposta de Sucesso (201 Created):**
  ```json
  {
    "success": true,
    "message": "Publicação criada com sucesso!",
    "data": {
      "id": 1,
      "user_id": 1,
      "content": "Hello World Post",
      "image": null,
      "video": null,
      "created_at": "2026-05-31T19:00:00Z",
      "updated_at": "2026-05-31T19:00:00Z"
    }
  }
  ```

### 4.2 Listar Publicações (Feed)
Lista publicações em ordem cronológica decrescente. Se o utilizador estiver autenticado, prioriza utilizadores seguidos e publicações próprias.
* **URL:** `/api/posts`
* **Método:** `GET`
* **Headers:** `Authorization: Bearer <token>`
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "current_page": 1,
      "data": [
        {
          "id": 1,
          "user_id": 1,
          "content": "Hello World Post",
          "image": null,
          "video": null,
          "created_at": "2026-05-31T19:00:00.000000Z",
          "comments_count": 0,
          "bazes_count": 0,
          "user": {
            "id": 1,
            "name": "Abel Nkele Canas",
            "profile_photo": null
          }
        }
      ],
      "first_page_url": "http://localhost:8000/api/posts?page=1",
      "per_page": 15,
      "to": 1,
      "total": 1
    }
  }
  ```

### 4.3 Visualizar Publicação Específica
Retorna os detalhes de uma publicação específica.
* **URL:** `/api/posts/{id}`
* **Método:** `GET`
* **Headers:** `Authorization: Bearer <token>`
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "user_id": 1,
      "content": "Hello World Post",
      "image": null,
      "video": null,
      "comments_count": 0,
      "bazes_count": 0,
      "user": {
        "id": 1,
        "name": "Abel Nkele Canas",
        "profile_photo": null
      }
    }
  }
  ```

### 4.4 Editar Publicação Própria
Atualiza o conteúdo de uma publicação de autoria própria.
* **URL:** `/api/posts/{id}`
* **Método:** `PUT` (ou `POST` com `_method=PUT` para envio de arquivos em form-data)
* **Headers:** `Authorization: Bearer <token>`
* **Corpo da Requisição (JSON):**
  ```json
  {
    "content": "Conteúdo editado da minha publicação"
  }
  ```
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "message": "Publicação atualizada com sucesso!",
    "data": {
      "id": 1,
      "content": "Conteúdo editado da minha publicação"
    }
  }
  ```

### 4.5 Excluir Publicação Própria
Elimina permanentemente um post próprio e os seus arquivos multimédia associados do armazenamento.
* **URL:** `/api/posts/{id}`
* **Método:** `DELETE`
* **Headers:** `Authorization: Bearer <token>`
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "message": "Publicação excluída com sucesso!"
  }
  ```

---

## 5. Gestão de Comentários

### 5.1 Adicionar Comentário
Escreve um comentário sob uma publicação.
* **URL:** `/api/posts/{postId}/comments`
* **Método:** `POST`
* **Headers:** `Authorization: Bearer <token>`
* **Corpo da Requisição (JSON):**
  ```json
  {
    "content": "Gostei muito deste post!"
  }
  ```
* **Resposta de Sucesso (201 Created):**
  ```json
  {
    "success": true,
    "message": "Comentário adicionado com sucesso!",
    "data": {
      "id": 1,
      "post_id": 1,
      "user_id": 2,
      "content": "Gostei muito deste post!",
      "created_at": "2026-05-31T19:05:00Z"
    }
  }
  ```

### 5.2 Listar Comentários por Publicação
Retorna os comentários associados a uma publicação específica.
* **URL:** `/api/posts/{postId}/comments`
* **Método:** `GET`
* **Headers:** `Authorization: Bearer <token>`
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "current_page": 1,
      "data": [
        {
          "id": 1,
          "content": "Gostei muito deste post!",
          "user_id": 2,
          "post_id": 1,
          "created_at": "2026-05-31T19:05:00.000000Z",
          "user": {
            "id": 2,
            "name": "Outro Utilizador",
            "profile_photo": null
          }
        }
      ]
    }
  }
  ```

### 5.3 Editar Comentário Próprio
Edita o texto de um comentário de própria autoria.
* **URL:** `/api/comments/{id}`
* **Método:** `PUT`
* **Headers:** `Authorization: Bearer <token>`
* **Corpo da Requisição (JSON):**
  ```json
  {
    "content": "Gostei imenso deste post (comentário editado)!"
  }
  ```
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "message": "Comentário atualizado com sucesso!",
    "data": {
      "id": 1,
      "content": "Gostei imenso deste post (comentário editado)!"
    }
  }
  ```

### 5.4 Excluir Comentário
Elimina um comentário. É permitido apenas para o **autor do comentário** OU por um utilizador com perfil de **administrador** (moderação).
* **URL:** `/api/comments/{id}`
* **Método:** `DELETE`
* **Headers:** `Authorization: Bearer <token>`
* **Resposta de Sucesso (200 OK):**
  ```json
  {
    "success": true,
    "message": "Comentário excluído com sucesso!"
  }
  ```
