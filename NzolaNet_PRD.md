# PRD — Product Requirements Document
# NzolaNet — Rede Social Web
**Versão:** 1.0  
**Data:** Maio 2026  
**Instituição:** ISPTEC — Instituto Superior Politécnico de Tecnologias e Ciências  
**Disciplina:** Aplicações Web (AW)  
**Classificação:** Documento Técnico Interno  

---

## Índice

1. [Visão Geral do Projecto](#1-visão-geral-do-projecto)
2. [Módulos do Sistema](#2-módulos-do-sistema)
3. [Actores do Sistema](#3-actores-do-sistema)
4. [Requisitos Funcionais](#4-requisitos-funcionais)
5. [Requisitos Não Funcionais](#5-requisitos-não-funcionais)
6. [Regras de Negócio](#6-regras-de-negócio)
7. [Casos de Uso](#7-casos-de-uso)
8. [Diagrama de Casos de Uso (Textual)](#8-diagrama-de-casos-de-uso-textual)
9. [Fluxos do Sistema](#9-fluxos-do-sistema)
10. [Entidades e Estrutura da Base de Dados](#10-entidades-e-estrutura-da-base-de-dados)
11. [Permissões e Controle de Acesso](#11-permissões-e-controle-de-acesso)
12. [Integrações Externas](#12-integrações-externas)
13. [Arquitectura e Tecnologias](#13-arquitectura-e-tecnologias)
14. [Ambiguidades, Riscos e Lacunas](#14-ambiguidades-riscos-e-lacunas)
15. [Perguntas para Stakeholders](#15-perguntas-para-stakeholders)
16. [Resumo Técnico Final](#16-resumo-técnico-final)
17. [Matriz de Rastreabilidade](#17-matriz-de-rastreabilidade)

---

## 1. Visão Geral do Projecto

### 1.1 Nome do Projecto
**NzolaNet**

### 1.2 Objectivo Principal
Desenvolver uma aplicação web de rede social que permita utilizadores publicarem conteúdos, interagirem através de reacções ("bazes") e comentários, seguirem outros utilizadores e manterem um perfil pessoal dentro da plataforma.

### 1.3 Problema que Resolve
A ausência de uma plataforma digital centralizada e comunitária que permita a comunicação, partilha de informações e interação social entre utilizadores de forma organizada, segura e fluida.

### 1.4 Público-Alvo
- Utilizadores individuais que pretendem partilhar conteúdo e interagir socialmente na web.
- Empresas e comunidades que procuram um canal digital para divulgação de conteúdos e fortalecimento da comunicação digital.

### 1.5 Contexto do Sistema
A NzolaNet é uma aplicação web de carácter académico desenvolvida no contexto da disciplina de Aplicações Web do ISPTEC. Funciona como uma rede social com funcionalidades similares a plataformas como Twitter/X e Instagram: publicações com multimédia, sistema de reacções ("bazes"), comentários, seguimento de utilizadores, feed de notícias e notificações em tempo real.

### 1.6 Resumo Executivo
O sistema será uma Single Page Application (SPA) desenvolvida com Angular no frontend, e uma API RESTful no backend (PHP Laravel). Os dados serão persistidos numa base de dados relacional MySQL. A arquitectura seguirá o padrão de separação de camadas (Repository, Service, Controller) com uso de DTOs para comunicação entre camadas. O projecto será entregue em duas fases: a primeira cobrindo Gestão de Utilizadores, Publicações e Comentários; a segunda cobrindo a aplicação completa com relatório técnico.

---

## 2. Módulos do Sistema

| # | Módulo | Objectivo | Principais Funcionalidades | Actores |
|---|--------|-----------|---------------------------|---------|
| M1 | Gestão de Utilizadores | Controlar o ciclo de vida dos utilizadores na plataforma | Registo, login, recuperação de senha, edição de perfil, foto de perfil, seguir/deixar de seguir | Utilizador, Administrador |
| M2 | Gestão de Publicações | Permitir a criação e gestão de conteúdos publicados | Criar, editar, excluir publicações; upload de imagem/vídeo; visualização de multimédia | Utilizador Autenticado |
| M3 | Sistema de Bazes | Gerir reacções dos utilizadores às publicações | Dar/remover baze, contagem de bazes, restrição de duplicados | Utilizador Autenticado |
| M4 | Sistema de Comentários | Permitir discussão em publicações | Adicionar, editar, excluir comentários; listagem por publicação | Utilizador Autenticado, Administrador |
| M5 | Feed de Notícias | Apresentar publicações relevantes ao utilizador | Feed principal, publicações de seguidos, ordenação cronológica, actualização dinâmica | Utilizador Autenticado |
| M6 | Notificações | Alertar utilizadores sobre interacções relevantes | Notificação de baze, comentário e novo seguidor | Utilizador Autenticado |
| M7 | Administração | Moderação e gestão da plataforma | Remover comentários ofensivos, gerir utilizadores | Administrador |

---

## 3. Actores do Sistema

### 3.1 Utilizador Não Autenticado (Visitante)

| Campo | Detalhe |
|-------|---------|
| **Nome** | Visitante |
| **Descrição** | Utilizador que acede à plataforma sem ter conta ou sem ter feito login |
| **Permissões** | Acesso apenas às páginas públicas (registo, login) |
| **Responsabilidades** | Criar conta, recuperar senha |
| **Interacções** | Registo, Login, Recuperação de senha |

### 3.2 Utilizador Autenticado

| Campo | Detalhe |
|-------|---------|
| **Nome** | Utilizador |
| **Descrição** | Utilizador registado e com sessão activa na plataforma |
| **Permissões** | Acesso completo às funcionalidades da plataforma (publicações, comentários, bazes, feed, notificações, perfil) |
| **Responsabilidades** | Criar e gerir conteúdo próprio, interagir com outros utilizadores |
| **Interacções** | Todas as funcionalidades do sistema excepto administração |

### 3.3 Administrador

| Campo | Detalhe |
|-------|---------|
| **Nome** | Administrador |
| **Descrição** | Utilizador com privilégios elevados responsável pela moderação e gestão da plataforma |
| **Permissões** | Todas as permissões do Utilizador + remoção de comentários de terceiros + gestão de utilizadores |
| **Responsabilidades** | Moderar conteúdo ofensivo, garantir a integridade da plataforma |
| **Interacções** | Remoção de comentários inadequados, gestão de utilizadores |

---

## 4. Requisitos Funcionais

---

### RF-001 — Registo de Novo Utilizador

**Descrição:** O sistema deve permitir que um visitante crie uma conta na plataforma fornecendo os dados necessários.  
**Prioridade:** Alta  
**Actores envolvidos:** Visitante  
**Fluxo principal:**
1. Visitante acede à página de registo.
2. Preenche o formulário com os dados (nome, email, senha, etc.).
3. Sistema valida os dados.
4. Sistema cria a conta do utilizador.
5. Sistema redireciona para o feed ou página de boas-vindas.

**Pré-condições:** Utilizador não possui conta; email não está em uso.  
**Pós-condições:** Conta criada e disponível para login.  
**Regras associadas:** RN-001, RN-006  

---

### RF-002 — Autenticação (Login)

**Descrição:** O sistema deve permitir que utilizadores registados façam login com as suas credenciais.  
**Prioridade:** Alta  
**Actores envolvidos:** Utilizador  
**Fluxo principal:**
1. Utilizador acede à página de login.
2. Insere email e senha.
3. Sistema valida as credenciais.
4. Sistema inicia sessão e redireciona para o feed.

**Pré-condições:** Utilizador possui conta activa.  
**Pós-condições:** Sessão iniciada; utilizador acede às funcionalidades protegidas.  
**Regras associadas:** RN-001  

---

### RF-003 — Recuperação de Senha

**Descrição:** O sistema deve permitir que utilizadores recuperem o acesso à conta em caso de esquecimento da senha.  
**Prioridade:** Alta  
**Actores envolvidos:** Visitante, Utilizador  
**Fluxo principal:**
1. Utilizador acede à opção de recuperação de senha.
2. Insere o email associado à conta.
3. Sistema envia um email com instruções de recuperação.
4. Utilizador redefine a senha.

**Pré-condições:** Email registado no sistema.  
**Pós-condições:** Senha redefinida com sucesso.  
**Regras associadas:** RN-001  
**Nota:** ⚠️ *Necessita Validação* — O mecanismo de envio de email (SMTP, serviço externo) não foi especificado no documento.

---

### RF-004 — Edição de Perfil

**Descrição:** O sistema deve permitir que o utilizador edite as informações do seu perfil pessoal.  
**Prioridade:** Média  
**Actores envolvidos:** Utilizador Autenticado  
**Fluxo principal:**
1. Utilizador acede à página de perfil.
2. Selecciona a opção de editar.
3. Modifica os campos desejados (nome, bio, etc.).
4. Salva as alterações.

**Pré-condições:** Utilizador autenticado.  
**Pós-condições:** Perfil actualizado na base de dados.  
**Regras associadas:** RN-002  

---

### RF-005 — Alteração de Foto de Perfil

**Descrição:** O sistema deve permitir que o utilizador faça upload e altere a sua foto de perfil.  
**Prioridade:** Média  
**Actores envolvidos:** Utilizador Autenticado  
**Fluxo principal:**
1. Utilizador acede ao perfil.
2. Selecciona a opção de alterar foto.
3. Faz upload de nova imagem.
4. Sistema valida e guarda a imagem.

**Pré-condições:** Utilizador autenticado.  
**Pós-condições:** Nova foto de perfil visível para todos os utilizadores.  
**Regras associadas:** RN-002  

---

### RF-006 — Seguir/Deixar de Seguir Utilizador

**Descrição:** O sistema deve permitir que um utilizador siga ou deixe de seguir outro utilizador.  
**Prioridade:** Alta  
**Actores envolvidos:** Utilizador Autenticado  
**Fluxo principal (Seguir):**
1. Utilizador acede ao perfil de outro utilizador.
2. Clica em "Seguir".
3. Sistema regista a relação de seguimento.
4. Sistema gera notificação para o utilizador seguido.

**Fluxo principal (Deixar de Seguir):**
1. Utilizador clica em "Deixar de Seguir".
2. Sistema remove a relação.

**Pré-condições:** Utilizador autenticado; perfil-alvo existe.  
**Pós-condições:** Relação de seguimento criada ou removida.  
**Regras associadas:** RN-005  

---

### RF-007 — Criar Publicação

**Descrição:** O sistema deve permitir que utilizadores autenticados criem publicações com texto e/ou multimédia.  
**Prioridade:** Alta  
**Actores envolvidos:** Utilizador Autenticado  
**Fluxo principal:**
1. Utilizador acede à opção de criar publicação.
2. Escreve o texto da publicação.
3. (Opcional) Faz upload de imagem ou vídeo.
4. Submete a publicação.
5. Sistema persiste e exibe no feed.

**Pré-condições:** Utilizador autenticado.  
**Pós-condições:** Publicação criada, associada ao utilizador, visível no feed.  
**Regras associadas:** RN-001, RN-003  

---

### RF-008 — Editar Publicação Própria

**Descrição:** O sistema deve permitir que o utilizador edite apenas as suas próprias publicações.  
**Prioridade:** Média  
**Actores envolvidos:** Utilizador Autenticado  
**Fluxo principal:**
1. Utilizador localiza a sua publicação.
2. Selecciona a opção de editar.
3. Modifica o conteúdo.
4. Guarda as alterações.

**Pré-condições:** Utilizador autenticado; publicação pertence ao utilizador.  
**Pós-condições:** Publicação actualizada.  
**Regras associadas:** RN-002  

---

### RF-009 — Excluir Publicação Própria

**Descrição:** O sistema deve permitir que o utilizador elimine apenas as suas próprias publicações.  
**Prioridade:** Média  
**Actores envolvidos:** Utilizador Autenticado  
**Fluxo principal:**
1. Utilizador localiza a sua publicação.
2. Selecciona a opção de excluir.
3. Sistema solicita confirmação.
4. Sistema remove a publicação e os dados associados (bazes, comentários).

**Pré-condições:** Utilizador autenticado; publicação pertence ao utilizador.  
**Pós-condições:** Publicação e dados associados removidos.  
**Regras associadas:** RN-002  

---

### RF-010 — Upload de Imagem e Vídeo

**Descrição:** O sistema deve permitir o upload de ficheiros de imagem e vídeo nas publicações.  
**Prioridade:** Alta  
**Actores envolvidos:** Utilizador Autenticado  
**Fluxo principal:**
1. Utilizador, ao criar/editar publicação, selecciona um ficheiro.
2. Sistema valida o formato e tamanho.
3. Ficheiro é armazenado e associado à publicação.

**Pré-condições:** Utilizador autenticado; ficheiro em formato suportado.  
**Pós-condições:** Multimédia armazenado e acessível.  
**Regras associadas:** RN-003  
**Nota:** ⚠️ *Necessita Validação* — Formatos aceites, tamanho máximo de ficheiro e local de armazenamento não foram especificados.

---

### RF-011 — Visualizar Publicações em Ordem Cronológica

**Descrição:** O sistema deve apresentar publicações ordenadas da mais recente para a mais antiga.  
**Prioridade:** Alta  
**Actores envolvidos:** Utilizador Autenticado  
**Pré-condições:** Existem publicações no sistema.  
**Pós-condições:** Publicações exibidas em ordem decrescente de data.  
**Regras associadas:** RN-003  

---

### RF-012 — Dar Baze em Publicação

**Descrição:** O sistema deve permitir que utilizadores autenticados reajam positivamente a uma publicação através de um "baze".  
**Prioridade:** Alta  
**Actores envolvidos:** Utilizador Autenticado  
**Fluxo principal:**
1. Utilizador visualiza uma publicação.
2. Clica no botão de baze.
3. Sistema regista a reacção.
4. Contador de bazes é incrementado.
5. Notificação gerada para o autor da publicação.

**Pré-condições:** Utilizador autenticado; utilizador não deu baze anteriormente nessa publicação.  
**Pós-condições:** Baze registado; contador actualizado.  
**Regras associadas:** RN-004  

---

### RF-013 — Remover Baze

**Descrição:** O sistema deve permitir que o utilizador remova o seu baze de uma publicação.  
**Prioridade:** Média  
**Actores envolvidos:** Utilizador Autenticado  
**Fluxo principal:**
1. Utilizador clica novamente no botão de baze (toggle).
2. Sistema remove o registo de baze.
3. Contador decrementado.

**Pré-condições:** Utilizador autenticado; utilizador já deu baze nessa publicação.  
**Pós-condições:** Baze removido; contador actualizado.  
**Regras associadas:** RN-004  

---

### RF-014 — Visualizar Quantidade de Bazes

**Descrição:** O sistema deve exibir o total de bazes por publicação de forma visível.  
**Prioridade:** Média  
**Actores envolvidos:** Utilizador Autenticado  
**Pós-condições:** Número de bazes visível em cada publicação.  

---

### RF-015 — Adicionar Comentário

**Descrição:** O sistema deve permitir que utilizadores autenticados comentem em publicações.  
**Prioridade:** Alta  
**Actores envolvidos:** Utilizador Autenticado  
**Fluxo principal:**
1. Utilizador acede aos comentários de uma publicação.
2. Escreve o comentário.
3. Submete.
4. Sistema persiste e exibe o comentário.
5. Notificação gerada para o autor da publicação.

**Pré-condições:** Utilizador autenticado; publicação existe.  
**Pós-condições:** Comentário guardado e visível.  
**Regras associadas:** RN-001  

---

### RF-016 — Editar Comentário Próprio

**Descrição:** O sistema deve permitir que o utilizador edite apenas os seus próprios comentários.  
**Prioridade:** Média  
**Actores envolvidos:** Utilizador Autenticado  
**Pré-condições:** Utilizador autenticado; comentário pertence ao utilizador.  
**Pós-condições:** Comentário actualizado.  
**Regras associadas:** RN-002  

---

### RF-017 — Excluir Comentário Próprio

**Descrição:** O sistema deve permitir que o utilizador elimine apenas os seus próprios comentários.  
**Prioridade:** Média  
**Actores envolvidos:** Utilizador Autenticado  
**Pré-condições:** Utilizador autenticado; comentário pertence ao utilizador.  
**Pós-condições:** Comentário removido da publicação.  
**Regras associadas:** RN-002  

---

### RF-018 — Visualizar Lista de Comentários por Publicação

**Descrição:** O sistema deve exibir todos os comentários associados a uma publicação.  
**Prioridade:** Alta  
**Actores envolvidos:** Utilizador Autenticado  
**Pós-condições:** Lista de comentários exibida correctamente.  

---

### RF-019 — Feed Principal com Publicações Recentes

**Descrição:** O sistema deve apresentar um feed com as publicações mais recentes de todos os utilizadores ou dos utilizados seguidos.  
**Prioridade:** Alta  
**Actores envolvidos:** Utilizador Autenticado  
**Pós-condições:** Feed exibido em ordem cronológica decrescente.  
**Regras associadas:** RN-003  

---

### RF-020 — Publicações de Utilizadores Seguidos no Feed

**Descrição:** O feed deve incluir publicações dos utilizadores que o utilizador autenticado segue.  
**Prioridade:** Alta  
**Actores envolvidos:** Utilizador Autenticado  
**Pré-condições:** Utilizador segue pelo menos um outro utilizador.  
**Pós-condições:** Feed personalizado com publicações dos seguidos.  
**Regras associadas:** RN-005  

---

### RF-021 — Actualização Dinâmica do Feed

**Descrição:** O feed deve actualizar-se automaticamente quando novas publicações são criadas, sem necessidade de recarregar a página manualmente.  
**Prioridade:** Média  
**Actores envolvidos:** Utilizador Autenticado  
**Nota:** ⚠️ *Necessita Validação* — O mecanismo de actualização dinâmica (polling, WebSockets, SSE) não foi especificado.

---

### RF-022 — Notificação de Baze Recebido

**Descrição:** O sistema deve notificar o utilizador quando uma das suas publicações receber um baze.  
**Prioridade:** Média  
**Actores envolvidos:** Utilizador Autenticado  
**Pós-condições:** Notificação gerada e visível para o utilizador.  
**Regras associadas:** RN-007  

---

### RF-023 — Notificação de Comentário Recebido

**Descrição:** O sistema deve notificar o utilizador quando uma das suas publicações receber um comentário.  
**Prioridade:** Média  
**Actores envolvidos:** Utilizador Autenticado  
**Pós-condições:** Notificação gerada e visível para o utilizador.  
**Regras associadas:** RN-007  

---

### RF-024 — Notificação de Novo Seguidor

**Descrição:** O sistema deve notificar o utilizador quando alguém começa a segui-lo.  
**Prioridade:** Média  
**Actores envolvidos:** Utilizador Autenticado  
**Pós-condições:** Notificação gerada e visível para o utilizador.  
**Regras associadas:** RN-007  

---

### RF-025 — Definir Privacidade do Perfil

**Descrição:** O utilizador pode definir o seu perfil como público (visível para todos) ou privado (visível apenas para utilizadores autorizados).  
**Prioridade:** Média  
**Actores envolvidos:** Utilizador Autenticado  
**Pré-condições:** Utilizador autenticado.  
**Pós-condições:** Configuração de privacidade salva e aplicada.  
**Regras associadas:** RN-006  
**Nota:** ⚠️ *Necessita Validação* — O fluxo de aprovação de acesso a perfis privados (solicitação de seguimento pendente) não foi especificado.

---

### RF-026 — Remover Comentário Ofensivo (Administrador)

**Descrição:** O administrador pode remover comentários que violem as políticas da plataforma, independentemente do autor.  
**Prioridade:** Alta  
**Actores envolvidos:** Administrador  
**Pré-condições:** Utilizador com perfil de Administrador autenticado.  
**Pós-condições:** Comentário removido da plataforma.  
**Regras associadas:** RN-008  

---

## 5. Requisitos Não Funcionais

### RNF-001 — Interface Responsiva

**Descrição:** A interface da aplicação deve adaptar-se a diferentes tamanhos de ecrã (desktop, tablet, mobile).  
**Impacto no sistema:** A experiência do utilizador deve ser consistente em todos os dispositivos.  
**Criticidade:** Alta  

---

### RNF-002 — Segurança na Autenticação

**Descrição:** O sistema deve implementar mecanismos seguros de autenticação, incluindo hashing de senhas (ex: bcrypt) e uso de tokens (ex: JWT).  
**Impacto no sistema:** Protege credenciais dos utilizadores e controla o acesso às funcionalidades protegidas.  
**Criticidade:** Alta  

---

### RNF-003 — Protecção Contra Acessos Não Autorizados

**Descrição:** Todas as rotas e endpoints que requerem autenticação devem ser protegidos. Utilizadores não autenticados não devem aceder a funcionalidades restritas.  
**Impacto no sistema:** Segurança do sistema e integridade dos dados.  
**Criticidade:** Alta  

---

### RNF-004 — Performance no Carregamento de Publicações

**Descrição:** O feed e as publicações devem carregar com tempo de resposta aceitável. Recomenda-se paginação ou lazy loading.  
**Impacto no sistema:** Experiência do utilizador degradada se o carregamento for lento.  
**Criticidade:** Alta  
**Nota:** ⚠️ *Necessita Validação* — O tempo de resposta máximo aceitável não foi definido no documento.

---

### RNF-005 — Compatibilidade com Dispositivos Móveis

**Descrição:** A aplicação deve ser acessível e utilizável em smartphones e tablets com diferentes sistemas operativos.  
**Impacto no sistema:** Alcance do produto e acessibilidade.  
**Criticidade:** Alta  

---

### RNF-006 — Usabilidade Intuitiva

**Descrição:** A interface deve ser de fácil compreensão, com navegação clara e sem necessidade de formação específica para o utilizador.  
**Impacto no sistema:** Taxa de adopção da plataforma.  
**Criticidade:** Média  

---

### RNF-007 — Arquitectura em Camadas

**Descrição:** O backend deve seguir uma arquitectura de separação de camadas: Controllers, Services e Repositories (ou equivalente).  
**Impacto no sistema:** Manutenibilidade, testabilidade e organização do código.  
**Criticidade:** Alta  

---

### RNF-008 — Uso de DTOs (Data Transfer Objects)

**Descrição:** A comunicação entre frontend e backend deve utilizar DTOs, evitando exposição directa das entidades da base de dados.  
**Impacto no sistema:** Segurança e desacoplamento da camada de apresentação com a camada de dados.  
**Criticidade:** Alta  

---

### RNF-009 — Disponibilidade

**Descrição:** O sistema deve estar disponível de forma contínua durante o período de avaliação académica.  
**Criticidade:** Média  
**Nota:** ⚠️ *Necessita Validação* — SLAs e requisitos de uptime não foram definidos.

---

## 6. Regras de Negócio

### RN-001 — Autenticação Obrigatória para Acções

**Descrição:** Apenas utilizadores devidamente autenticados podem realizar publicações, comentários, bazes e outras interacções na plataforma.  
**Impacto:** Toda a camada de acção da plataforma está bloqueada para utilizadores não autenticados.  
**Módulos afectados:** M2 (Publicações), M3 (Bazes), M4 (Comentários), M5 (Feed), M6 (Notificações)  
**Excepções:** Páginas de registo e login são acessíveis sem autenticação.  

---

### RN-002 — Controlo de Autoria (Princípio da Propriedade)

**Descrição:** Um utilizador só pode editar ou excluir conteúdos (publicações e comentários) da sua própria autoria. É proibido alterar conteúdo de outro utilizador.  
**Impacto:** Garante integridade e respeito pelos conteúdos alheios.  
**Módulos afectados:** M2 (Publicações), M4 (Comentários)  
**Excepções:** O Administrador pode remover comentários de qualquer utilizador (RN-008).  

---

### RN-003 — Estrutura de uma Publicação

**Descrição:** Uma publicação é composta obrigatoriamente por: nome do autor, foto do autor, data de publicação e texto. Opcionalmente pode conter imagem e/ou vídeo. O número de bazes e comentários deve ser sempre apresentado.  
**Impacto:** Define o modelo de dados e a interface de apresentação das publicações.  
**Módulos afectados:** M2 (Publicações), M5 (Feed)  
**Excepções:** Nenhuma.  

---

### RN-004 — Unicidade do Baze por Publicação

**Descrição:** Cada utilizador pode dar apenas um baze por publicação. O sistema deve impedir múltiplas reacções do mesmo utilizador na mesma publicação.  
**Impacto:** Garante consistência nos dados de interacção; o contador de bazes é fidedigno.  
**Módulos afectados:** M3 (Bazes)  
**Excepções:** O utilizador pode remover e dar novamente o baze (toggle).  

---

### RN-005 — Sistema de Seguimento

**Descrição:** Um utilizador pode seguir outros utilizadores para ver as suas publicações no feed personalizado.  
**Impacto:** Define a lógica de personalização do feed.  
**Módulos afectados:** M1 (Utilizadores), M5 (Feed)  
**Excepções:** ⚠️ *Necessita Validação* — Não está definido se um utilizador pode seguir-se a si próprio.  

---

### RN-006 — Privacidade do Perfil

**Descrição:** Os utilizadores podem configurar os seus perfis como público (visível para todos) ou privado (visível apenas para utilizadores autorizados/seguidores aprovados).  
**Impacto:** Controla a visibilidade do conteúdo e das publicações do utilizador.  
**Módulos afectados:** M1 (Utilizadores), M5 (Feed)  
**Excepções:** ⚠️ *Necessita Validação* — O mecanismo de autorização para perfis privados (pedido de seguimento pendente) não foi especificado.  

---

### RN-007 — Geração de Notificações

**Descrição:** O sistema gera automaticamente notificações nos seguintes eventos: receber um baze, receber um comentário numa publicação, ganhar um novo seguidor.  
**Impacto:** Mantém os utilizadores informados sobre as interacções relevantes.  
**Módulos afectados:** M6 (Notificações), M3 (Bazes), M4 (Comentários), M1 (Utilizadores)  
**Excepções:** ⚠️ *Necessita Validação* — Não está especificado se o utilizador pode desactivar notificações.  

---

### RN-008 — Moderação pelo Administrador

**Descrição:** Comentários considerados ofensivos, inadequados ou que violem as políticas da plataforma podem ser removidos pelo administrador, independentemente do autor.  
**Impacto:** Garante um ambiente saudável e respeitoso na plataforma.  
**Módulos afectados:** M4 (Comentários), M7 (Administração)  
**Excepções:** Nenhuma explícita.  

---

## 7. Casos de Uso

---

### UC-001 — Registar Utilizador

**Objectivo:** Criar uma nova conta de utilizador na plataforma.  
**Actores:** Visitante  
**Pré-condições:** Utilizador não possui conta; email não registado.  
**Fluxo principal:**
1. Visitante acede à página de registo.
2. Preenche nome, email e senha.
3. Sistema valida os dados (formato de email, senha forte).
4. Sistema cria a conta.
5. Sistema redireciona para o feed.

**Fluxos alternativos:**
- *Email já registado:* Sistema exibe mensagem de erro e solicita outro email.
- *Senha fraca:* Sistema informa os requisitos de senha.

**Pós-condições:** Conta criada; utilizador pode fazer login.  
**Excepções:** Email inválido; campos obrigatórios vazios.  

---

### UC-002 — Fazer Login

**Objectivo:** Autenticar o utilizador na plataforma.  
**Actores:** Utilizador  
**Pré-condições:** Conta existe.  
**Fluxo principal:**
1. Utilizador insere email e senha.
2. Sistema valida as credenciais.
3. Sistema gera token de sessão (JWT ou equivalente).
4. Utilizador é redirecionado para o feed.

**Fluxos alternativos:**
- *Credenciais inválidas:* Mensagem de erro genérica (não revelar qual campo está errado por segurança).

**Pós-condições:** Sessão iniciada; acesso a funcionalidades protegidas.  

---

### UC-003 — Recuperar Senha

**Objectivo:** Redefinir a senha de acesso.  
**Actores:** Visitante  
**Pré-condições:** Email registado.  
**Fluxo principal:**
1. Utilizador solicita recuperação de senha.
2. Insere email.
3. Sistema envia link/código de recuperação.
4. Utilizador define nova senha.

**Pós-condições:** Senha redefinida.  

---

### UC-004 — Editar Perfil

**Objectivo:** Actualizar informações pessoais do perfil.  
**Actores:** Utilizador Autenticado  
**Pré-condições:** Utilizador autenticado.  
**Fluxo principal:**
1. Aceder a "Editar Perfil".
2. Alterar dados (nome, bio, foto).
3. Guardar.

**Pós-condições:** Perfil actualizado.  

---

### UC-005 — Seguir Utilizador

**Objectivo:** Subscrever publicações de outro utilizador.  
**Actores:** Utilizador Autenticado  
**Pré-condições:** Utilizador autenticado; utilizador-alvo existe.  
**Fluxo principal:**
1. Aceder ao perfil do utilizador.
2. Clicar em "Seguir".
3. Sistema regista relação.
4. Sistema gera notificação para o utilizador seguido.

**Pós-condições:** Relação de seguimento criada; publicações do seguido aparecem no feed.  

---

### UC-006 — Criar Publicação

**Objectivo:** Publicar novo conteúdo na plataforma.  
**Actores:** Utilizador Autenticado  
**Pré-condições:** Utilizador autenticado.  
**Fluxo principal:**
1. Seleccionar "Nova Publicação".
2. Escrever texto.
3. (Opcional) Adicionar imagem/vídeo.
4. Publicar.

**Pós-condições:** Publicação visível no feed.  

---

### UC-007 — Editar Publicação

**Objectivo:** Modificar uma publicação própria existente.  
**Actores:** Utilizador Autenticado  
**Pré-condições:** Utilizador autenticado; é autor da publicação.  
**Fluxo principal:**
1. Localizar publicação própria.
2. Seleccionar "Editar".
3. Modificar conteúdo.
4. Guardar.

**Excepções:** Tentativa de editar publicação alheia → sistema nega acesso (403 Forbidden).  

---

### UC-008 — Excluir Publicação

**Objectivo:** Eliminar uma publicação própria.  
**Actores:** Utilizador Autenticado  
**Pré-condições:** Utilizador autenticado; é autor da publicação.  
**Fluxo principal:**
1. Seleccionar "Excluir" na publicação.
2. Confirmar.
3. Sistema remove publicação e dados associados.

**Pós-condições:** Publicação e bazes/comentários removidos.  
**Excepções:** Tentativa de excluir publicação alheia → negado (403).  

---

### UC-009 — Dar/Remover Baze

**Objectivo:** Reagir positivamente a uma publicação ou remover a reacção.  
**Actores:** Utilizador Autenticado  
**Pré-condições:** Utilizador autenticado; publicação existe.  
**Fluxo principal (Dar):**
1. Clicar em "Baze".
2. Sistema valida que utilizador não deu baze anteriormente.
3. Regista baze; incrementa contador; gera notificação.

**Fluxo principal (Remover):**
1. Clicar novamente em "Baze" (toggle).
2. Sistema remove baze; decrementa contador.

**Excepções:** Tentativa de segundo baze na mesma publicação → sistema bloqueia.  

---

### UC-010 — Comentar Publicação

**Objectivo:** Adicionar um comentário a uma publicação.  
**Actores:** Utilizador Autenticado  
**Pré-condições:** Utilizador autenticado; publicação existe.  
**Fluxo principal:**
1. Aceder aos comentários da publicação.
2. Escrever comentário.
3. Submeter.
4. Comentário exibido; notificação gerada para o autor da publicação.

**Pós-condições:** Comentário guardado e visível.  

---

### UC-011 — Editar/Excluir Comentário Próprio

**Objectivo:** Modificar ou eliminar um comentário próprio.  
**Actores:** Utilizador Autenticado  
**Pré-condições:** Utilizador autenticado; é autor do comentário.  
**Fluxo principal:** Seleccionar opção de editar ou excluir no comentário próprio.  
**Excepções:** Tentativa sobre comentário alheio → negado.  

---

### UC-012 — Visualizar Feed de Notícias

**Objectivo:** Consultar o feed com publicações recentes e de utilizadores seguidos.  
**Actores:** Utilizador Autenticado  
**Pré-condições:** Utilizador autenticado.  
**Fluxo principal:**
1. Aceder à página principal/feed.
2. Sistema carrega publicações em ordem cronológica decrescente.
3. Feed actualiza dinamicamente.

---

### UC-013 — Visualizar Notificações

**Objectivo:** Consultar as notificações recebidas.  
**Actores:** Utilizador Autenticado  
**Pré-condições:** Utilizador autenticado; existem notificações.  
**Fluxo principal:**
1. Aceder ao centro de notificações.
2. Sistema lista: bazes recebidos, comentários, novos seguidores.

---

### UC-014 — Remover Comentário Ofensivo (Admin)

**Objectivo:** Moderar conteúdo inapropriado na plataforma.  
**Actores:** Administrador  
**Pré-condições:** Utilizador com perfil de Administrador autenticado.  
**Fluxo principal:**
1.  identifica comentário ofensivo.
2. Selecciona "Remover".
3. Sistema elimina o comentário.

---

### UC-015 — Definir Privacidade do Perfil

**Objectivo:** Controlar quem pode ver o perfil do utilizador.  
**Actores:** Utilizador Autenticado  
**Fluxo principal:**
1. Aceder às configurações do perfil.
2. Seleccionar "Público" ou "Privado".
3. Guardar.

---

## 8. Diagrama de Casos de Uso (Textual)

```
====================================================
  DIAGRAMA DE CASOS DE USO — NzolaNet
====================================================

[Visitante]
├── UC-001: Registar utilizador
├── UC-002: Fazer login
└── UC-003: Recuperar senha

[Utilizador Autenticado]
├── Gestão de Perfil
│   ├── UC-004: Editar perfil
│   ├── RF-005: Alterar foto de perfil
│   ├── UC-015: Definir privacidade do perfil
│   └── UC-005: Seguir/Deixar de seguir utilizador
│
├── Gestão de Publicações
│   ├── UC-006: Criar publicação
│   ├── UC-007: Editar publicação (própria)
│   ├── UC-008: Excluir publicação (própria)
│   ├── RF-010: Upload de imagem/vídeo
│   └── RF-011: Visualizar publicações cronologicamente
│
├── Sistema de Bazes
│   ├── UC-009: Dar baze
│   ├── RF-013: Remover baze
│   └── RF-014: Visualizar quantidade de bazes
│
├── Sistema de Comentários
│   ├── UC-010: Adicionar comentário
│   ├── UC-011: Editar comentário (próprio)
│   ├── UC-011: Excluir comentário (próprio)
│   └── RF-018: Visualizar lista de comentários
│
├── Feed de Notícias
│   ├── UC-012: Visualizar feed principal
│   ├── RF-020: Ver publicações de seguidos
│   └── RF-021: Actualização dinâmica do feed
│
└── Notificações
    └── UC-013: Visualizar notificações
        ├── RF-022: Baze recebido
        ├── RF-023: Comentário recebido
        └── RF-024: Novo seguidor

[Administrador] (herda tudo do Utilizador Autenticado)
└── Moderação
    └── UC-014: Remover comentário ofensivo

====================================================
  RELAÇÕES:
  UC-007 <<extend>> UC-006 (editar requer publicação existente)
  UC-008 <<extend>> UC-006 (excluir requer publicação existente)
  UC-010 <<include>> UC-002 (comentar requer login)
  UC-014 <<extend>> UC-010 (admin pode remover qualquer comentário)
====================================================
```

---

## 9. Fluxos do Sistema

### 9.1 Fluxo de Registo e Autenticação

```
[Visitante] → Acede à plataforma
    │
    ├─→ [Já tem conta] → Página de Login
    │       │
    │       ├─→ [Credenciais válidas] → Gera Token JWT → Redireciona para Feed
    │       └─→ [Credenciais inválidas] → Exibe erro → Retry
    │
    └─→ [Novo utilizador] → Página de Registo
            │
            ├─→ [Dados válidos] → Cria conta → Login automático → Feed
            └─→ [Dados inválidos] → Exibe erros de validação → Retry
```

### 9.2 Fluxo de Criação de Publicação

```
[Utilizador Autenticado] → Clica em "Nova Publicação"
    │
    ├─→ Escreve texto
    ├─→ (Opcional) Upload de imagem/vídeo
    │       └─→ Sistema valida formato e tamanho
    │
    └─→ Submete
            │
            ├─→ [Sucesso] → Publicação criada → Aparece no Feed
            └─→ [Erro] → Mensagem de erro → Retry
```

### 9.3 Fluxo de Interacção (Baze)

```
[Utilizador] → Visualiza publicação
    │
    ├─→ Clica em "Baze"
    │       ├─→ [Primeiro baze] → Regista → Incrementa contador → Notifica autor
    │       └─→ [Já deu baze] → Sistema bloqueia (RN-004)
    │
    └─→ Clica novamente em "Baze" (toggle)
            └─→ Remove baze → Decrementa contador
```

### 9.4 Fluxo de Notificações

```
[Evento no Sistema]
    │
    ├─→ Baze recebido → Gera notificação para autor da publicação
    ├─→ Comentário recebido → Gera notificação para autor da publicação
    └─→ Novo seguidor → Gera notificação para o utilizador seguido
            │
            └─→ [Utilizador acede ao painel de notificações]
                    └─→ Sistema lista todas as notificações pendentes
```

### 9.5 Estados do Sistema — Publicação

```
[Rascunho] → (Submissão) → [Publicada]
    [Publicada] → (Edição pelo autor) → [Publicada (actualizada)]
    [Publicada] → (Exclusão pelo autor) → [Eliminada]
    [Publicada] → (Baze) → [Publicada + N bazes]
    [Publicada] → (Comentário) → [Publicada + N comentários]
```

---

## 10. Entidades e Estrutura da Base de Dados

### 10.1 Utilizador (`Users`)

| Atributo | Tipo | Restrições |
|----------|------|------------|
| `id` | INT / UUID | PK, NOT NULL, AUTO_INCREMENT |
| `nome` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE |
| `senha_hash` | VARCHAR(255) | NOT NULL |
| `foto_perfil` | VARCHAR(500) | NULL (URL ou caminho) |
| `bio` | TEXT | NULL |
| `privacidade` | ENUM('publico','privado') | NOT NULL, DEFAULT 'publico' |
| `role` | ENUM('utilizador','administrador') | NOT NULL, DEFAULT 'utilizador' |
| `criado_em` | DATETIME | NOT NULL, DEFAULT NOW() |
| `actualizado_em` | DATETIME | NULL |

**Relacionamentos:**
- 1:N com `Publicacoes`
- 1:N com `Comentarios`
- 1:N com `Bazes`
- N:M com `Users` (auto-relacionamento via tabela `Seguimentos`)
- 1:N com `Notificacoes`

---

### 10.2 Publicação (`Publicacoes`)

| Atributo | Tipo | Restrições |
|----------|------|------------|
| `id` | INT / UUID | PK, NOT NULL |
| `autor_id` | INT / UUID | FK → Users.id, NOT NULL |
| `texto` | TEXT | NOT NULL |
| `imagem_url` | VARCHAR(500) | NULL |
| `video_url` | VARCHAR(500) | NULL |
| `criada_em` | DATETIME | NOT NULL, DEFAULT NOW() |
| `actualizada_em` | DATETIME | NULL |

**Relacionamentos:**
- N:1 com `Users`
- 1:N com `Comentarios`
- 1:N com `Bazes`

---

### 10.3 Comentário (`Comentarios`)

| Atributo | Tipo | Restrições |
|----------|------|------------|
| `id` | INT / UUID | PK, NOT NULL |
| `publicacao_id` | INT / UUID | FK → Publicacoes.id, NOT NULL |
| `autor_id` | INT / UUID | FK → Users.id, NOT NULL |
| `texto` | TEXT | NOT NULL |
| `criado_em` | DATETIME | NOT NULL, DEFAULT NOW() |
| `actualizado_em` | DATETIME | NULL |

**Relacionamentos:**
- N:1 com `Publicacoes`
- N:1 com `Users`

---

### 10.4 Baze (`Bazes`)

| Atributo | Tipo | Restrições |
|----------|------|------------|
| `id` | INT / UUID | PK, NOT NULL |
| `publicacao_id` | INT / UUID | FK → Publicacoes.id, NOT NULL |
| `utilizador_id` | INT / UUID | FK → Users.id, NOT NULL |
| `criado_em` | DATETIME | NOT NULL, DEFAULT NOW() |

**Restrição:** UNIQUE(`publicacao_id`, `utilizador_id`) — garante unicidade por RN-004.  
**Relacionamentos:** N:1 com `Publicacoes`; N:1 com `Users`

---

### 10.5 Seguimento (`Seguimentos`)

| Atributo | Tipo | Restrições |
|----------|------|------------|
| `seguidor_id` | INT / UUID | FK → Users.id, NOT NULL |
| `seguido_id` | INT / UUID | FK → Users.id, NOT NULL |
| `criado_em` | DATETIME | NOT NULL, DEFAULT NOW() |

**Restrição:** PK composta (`seguidor_id`, `seguido_id`); `seguidor_id ≠ seguido_id`.  
**Relacionamentos:** N:N auto-referencial em `Users`

---

### 10.6 Notificação (`Notificacoes`)

| Atributo | Tipo | Restrições |
|----------|------|------------|
| `id` | INT / UUID | PK, NOT NULL |
| `destinatario_id` | INT / UUID | FK → Users.id, NOT NULL |
| `tipo` | ENUM('baze','comentario','seguidor') | NOT NULL |
| `referencia_id` | INT / UUID | NULL (ID do recurso relacionado) |
| `lida` | BOOLEAN | NOT NULL, DEFAULT FALSE |
| `criada_em` | DATETIME | NOT NULL, DEFAULT NOW() |

**Relacionamentos:** N:1 com `Users`

---

### 10.7 Diagrama de Relacionamentos (ERD Textual)

```
Users ──────────────────────── Publicacoes
  │ (1:N pelo autor_id)             │
  │                                 │
  │ (N:M via Seguimentos)      (1:N) Comentarios
  │                                 │
  │ (1:N pelo utilizador_id)   (1:N) Bazes
  │                                 
  └── Notificacoes (destinatario_id)

Bazes: UNIQUE(publicacao_id, utilizador_id)
Seguimentos: PK(seguidor_id, seguido_id)
```

---

## 11. Permissões e Controle de Acesso

### 11.1 Perfis e Roles

| Role | Descrição |
|------|-----------|
| `visitante` | Utilizador não autenticado — acesso apenas a páginas públicas |
| `utilizador` | Utilizador autenticado com acesso completo à plataforma |
| `administrador` | Utilizador com privilégios de moderação e gestão |

### 11.2 Matriz de Permissões

| Funcionalidade | Visitante | Utilizador | Administrador |
|---------------|-----------|------------|---------------|
| Registar conta | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ |
| Recuperar senha | ✅ | ✅ | ✅ |
| Visualizar perfis públicos | ✅ | ✅ | ✅ |
| Ver feed | ❌ | ✅ | ✅ |
| Criar publicação | ❌ | ✅ | ✅ |
| Editar publicação própria | ❌ | ✅ | ✅ |
| Excluir publicação própria | ❌ | ✅ | ✅ |
| Excluir publicação alheia | ❌ | ❌ | ⚠️ NV* |
| Dar/Remover baze | ❌ | ✅ | ✅ |
| Adicionar comentário | ❌ | ✅ | ✅ |
| Editar comentário próprio | ❌ | ✅ | ✅ |
| Excluir comentário próprio | ❌ | ✅ | ✅ |
| Excluir comentário alheio | ❌ | ❌ | ✅ |
| Seguir utilizador | ❌ | ✅ | ✅ |
| Ver notificações | ❌ | ✅ | ✅ |
| Gerir utilizadores | ❌ | ❌ | ✅ |

*⚠️ NV = Necessita Validação — o documento menciona gestão de utilizadores pelo admin mas não especifica se inclui remoção de publicações alheias.

### 11.3 Restrições de Acesso

- Todas as rotas da API (excepto `/auth/*`) devem exigir token JWT válido.
- Verificação de propriedade (`autor_id === utilizador_autenticado`) deve ser feita no backend antes de qualquer operação de edição/exclusão.
- Perfis privados: conteúdo não visível para utilizadores não autorizados.

---

## 12. Integrações Externas

| Integração | Tipo | Detalhe | Estado |
|-----------|------|---------|--------|
| Serviço de Email | SMTP / API | Recuperação de senha (RF-003) | ⚠️ Necessita Validação — não especificado |
| Armazenamento de Ficheiros | Storage | Upload de imagens e vídeos (RF-010) | ⚠️ Necessita Validação — local storage vs cloud (S3, Azure Blob) não definido |
| Autenticação JWT | Interna | Tokens de sessão para autenticação | Implícita pelo RNF-002 |
| WebSockets / SSE | Protocolo | Actualização dinâmica do feed (RF-021) | ⚠️ Necessita Validação |

**Nota:** O documento não especifica integrações com serviços de terceiros de forma explícita. As acima são deduzidas das funcionalidades descritas.

---

## 13. Arquitectura e Tecnologias

### 13.1 Stack Tecnológico Definido

| Camada | Tecnologia | Observações |
|--------|-----------|-------------|
| **Frontend** | Angular | SPA; comunicação com API via HTTP |
| **Backend** | ASP.NET Web API / PHP Laravel / PHP | ⚠️ Múltiplas opções — cada grupo escolhe uma |
| **Base de Dados** | SQL Server / MySQL / PostgreSQL | ⚠️ Múltiplas opções — cada grupo escolhe uma |

### 13.2 Arquitectura de Software

O documento especifica explicitamente:

- **Padrão de separação de camadas:**
  ```
  [Frontend Angular]
       ↕ HTTP/REST (DTOs)
  [Controller Layer]  ← Recebe requisições HTTP
       ↕
  [Service Layer]     ← Lógica de negócio
       ↕
  [Repository Layer]  ← Acesso à base de dados
       ↕
  [Base de Dados]
  ```

- **DTOs (Data Transfer Objects):** Usados para transferência de dados entre Frontend e Backend e vice-versa. Evita exposição directa das entidades da base de dados.

### 13.3 Arquitectura Recomendada (Deduzida)

```
┌─────────────────────────────────────────┐
│           Frontend (Angular)            │
│  Components → Services → HTTP Client   │
└─────────────────┬───────────────────────┘
                  │ REST API (JSON/DTOs)
┌─────────────────┴───────────────────────┐
│            Backend API                  │
│  Controllers → Services → Repositories │
│            + JWT Middleware             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────┴───────────────────────┐
│         Base de Dados Relacional        │
│    (SQL Server / MySQL / PostgreSQL)    │
└─────────────────────────────────────────┘
```

### 13.4 APIs Implícitas (Endpoints RESTful deduzidos)

| Método | Endpoint | Descrição |
|--------|---------|-----------|
| POST | `/api/auth/register` | Registo |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/recover-password` | Recuperação de senha |
| GET | `/api/users/{id}` | Ver perfil |
| PUT | `/api/users/{id}` | Editar perfil |
| POST | `/api/users/{id}/follow` | Seguir utilizador |
| DELETE | `/api/users/{id}/follow` | Deixar de seguir |
| GET | `/api/feed` | Feed de notícias |
| GET | `/api/posts` | Listar publicações |
| POST | `/api/posts` | Criar publicação |
| PUT | `/api/posts/{id}` | Editar publicação |
| DELETE | `/api/posts/{id}` | Excluir publicação |
| POST | `/api/posts/{id}/bazes` | Dar baze |
| DELETE | `/api/posts/{id}/bazes` | Remover baze |
| GET | `/api/posts/{id}/comments` | Listar comentários |
| POST | `/api/posts/{id}/comments` | Adicionar comentário |
| PUT | `/api/comments/{id}` | Editar comentário |
| DELETE | `/api/comments/{id}` | Excluir comentário |
| GET | `/api/notifications` | Listar notificações |

---

## 14. Ambiguidades, Riscos e Lacunas

### 14.1 Ambiguidades

| ID | Descrição | Localização no Doc | Impacto |
|----|-----------|-------------------|---------|
| AMB-001 | Não está claro se o feed principal mostra publicações de todos os utilizadores ou apenas dos seguidos | Secção 1.5 | Alto — define completamente a lógica do feed |
| AMB-002 | O mecanismo de "actualização dinâmica do feed" não foi especificado (polling, WebSockets, SSE) | Secção 1.5 | Médio — impacta arquitectura e complexidade |
| AMB-003 | "Utilizadores autorizados" para perfis privados — quem autoriza e como? | Secção das Regras de Negócio | Alto — define fluxo de seguimento privado |
| AMB-004 | Não está definido se o upload de vídeo inclui reprodução em streaming ou download | Secção 1.2 | Médio — impacta armazenamento e infraestrutura |
| AMB-005 | "Gestão de Utilizadores" pelo Admin — quais operações estão incluídas? | Secção 4 (Datas de Entrega) | Alto — define escopo do painel admin |

### 14.2 Lacunas (Informações em falta)

| ID | Descrição | Impacto |
|----|-----------|---------|
| LAC-001 | Formatos aceites para imagens e vídeos não especificados | Médio |
| LAC-002 | Tamanho máximo de ficheiros não definido | Médio |
| LAC-003 | Local de armazenamento de multimédia não definido (local vs cloud) | Alto |
| LAC-004 | Mecanismo de envio de email para recuperação de senha não especificado | Alto |
| LAC-005 | Paginação do feed não mencionada | Médio |
| LAC-006 | Não há definição de campos obrigatórios no registo (além do implícito) | Médio |
| LAC-007 | Ausência de especificação de busca/pesquisa de utilizadores ou publicações | Baixo |
| LAC-008 | Não está definido se notificações são em tempo real ou apenas no próximo login | Médio |
| LAC-009 | Regras de senha (comprimento mínimo, caracteres especiais) não definidas | Alto |
| LAC-010 | Não existe especificação de testes (unitários, de integração, E2E) | Médio |

### 14.3 Riscos Técnicos

| ID | Risco | Probabilidade | Impacto | Mitigação |
|----|-------|--------------|---------|-----------|
| RSC-001 | Múltiplas opções de backend (ASP.NET, Laravel, PHP) sem definição clara por grupo | Alta | Alto | Definir stack antes de iniciar desenvolvimento |
| RSC-002 | Upload e armazenamento de vídeo sem especificação de solução | Média | Alto | Definir estratégia de armazenamento cedo |
| RSC-003 | Actualização dinâmica do feed pode aumentar complexidade arquitectural | Média | Médio | Começar com polling simples; evoluir se necessário |
| RSC-004 | Gestão de perfis privados sem fluxo definido pode gerar inconsistências | Alta | Alto | Clarificar com professor/stakeholder |
| RSC-005 | Projectos com soluções semelhantes têm cotação 0 (nota do enunciado) | Baixa | Crítico | Garantir diferenciação no design e implementação |

---

## 15. Perguntas para Stakeholders

### 15.1 Negócio / Produto

1. O feed principal deve mostrar publicações de **todos os utilizadores** ou apenas dos **seguidos**? Ou os dois separados?
2. O que acontece quando um utilizador com perfil **privado** recebe um pedido de seguimento? Existe aprovação manual?
3. A plataforma deve ter função de **pesquisa** (utilizadores, publicações, hashtags)?
4. Existe necessidade de **denúncia** de publicações ou utilizadores?

### 15.2 UX / UI

5. Existe um **protótipo ou mockup** de referência para a interface?
6. A ordenação do feed deve ser estritamente **cronológica** ou pode incluir algoritmo de relevância no futuro?
7. As notificações devem aparecer como **badge** no ícone ou como **painel lateral**?

### 15.3 Segurança

8. Qual o mecanismo de **recuperação de senha** — link por email, código SMS, ou código por email?
9. Deve existir **rate limiting** para prevenção de spam (ex: limite de publicações por minuto)?
10. Quais são os **requisitos mínimos de senha**?

### 15.4 Infraestrutura

11. O upload de imagens e vídeos deve ser armazenado **localmente no servidor** ou num serviço de cloud (ex: AWS S3, Azure Blob)?
12. Quais os **tamanhos máximos** e **formatos aceites** para imagens e vídeos?
13. Qual o **servidor de email (SMTP)** a usar para recuperação de senha?

### 15.5 Dados

14. Existe requisito de **soft delete** (manter registos eliminados na BD marcados como inactivos) ou **hard delete**?
15. As publicações eliminadas devem **remover os bazes e comentários** associados em cascata?
16. Deve existir **histórico de edições** de publicações/comentários?

### 15.6 Integrações

17. A "actualização dinâmica do feed" deve usar **polling HTTP**, **Server-Sent Events (SSE)** ou **WebSockets**?
18. Existe alguma integração com **redes sociais externas** (login com Google, Facebook) necessária?

---

## 16. Resumo Técnico Final

### 16.1 Complexidade Geral do Sistema

**Nível:** Médio-Alto para um projecto académico

### 16.2 Principais Desafios

| Desafio | Descrição |
|---------|-----------|
| Upload de Multimédia | Gestão de imagens e vídeos requer estratégia de armazenamento bem definida |
| Feed Dinâmico | Actualização em tempo real implica WebSockets ou polling eficiente |
| Controlo de Autorização | Verificação de propriedade em cada operação de edição/exclusão |
| Perfis Privados | Fluxo de aprovação de seguimento não documentado |
| Unicidade de Baze | Restrição de nível de BD + validação no backend |

### 16.3 Módulos Críticos (por Prioridade de Implementação)

```
Fase 1 (Segunda Parcelar):
  1. Autenticação (RF-001, RF-002, RF-003) — Base de tudo
  2. Gestão de Utilizadores (RF-004, RF-005, RF-006)
  3. Gestão de Publicações (RF-007 ao RF-011)
  4. Gestão de Comentários (RF-015 ao RF-018)

Fase 2 (Exame Época Normal):
  5. Sistema de Bazes (RF-012 ao RF-014)
  6. Feed de Notícias (RF-019 ao RF-021)
  7. Notificações (RF-022 ao RF-024)
  8. Privacidade de Perfil (RF-025)
  9. Moderação Admin (RF-026)
```

### 16.4 Recomendações Técnicas

- **Começar pela autenticação:** JWT com middleware global de protecção de rotas.
- **DTOs desde o início:** Criar DTOs para cada entidade antes de codificar os controllers.
- **Repository Pattern:** Isolar todo acesso à BD nos repositórios; os services não devem ter SQL.
- **Validações no backend:** Nunca confiar apenas em validações do frontend.
- **UNIQUE constraint na BD:** Para a tabela `Bazes(publicacao_id, utilizador_id)`.
- **Paginação:** Implementar desde o início no feed para evitar problemas de performance.
- **Variáveis de ambiente:** Credenciais da BD, chaves JWT e configs de email em ficheiros `.env`.

---

## 17. Matriz de Rastreabilidade

| Requisito | Caso de Uso | Actor | Módulo | Regra de Negócio |
|-----------|------------|-------|--------|-----------------|
| RF-001 | UC-001 | Visitante | M1 — Utilizadores | RN-001, RN-006 |
| RF-002 | UC-002 | Utilizador | M1 — Utilizadores | RN-001 |
| RF-003 | UC-003 | Visitante | M1 — Utilizadores | RN-001 |
| RF-004 | UC-004 | Utilizador | M1 — Utilizadores | RN-002 |
| RF-005 | UC-004 | Utilizador | M1 — Utilizadores | RN-002 |
| RF-006 | UC-005 | Utilizador | M1 — Utilizadores | RN-005, RN-007 |
| RF-007 | UC-006 | Utilizador | M2 — Publicações | RN-001, RN-003 |
| RF-008 | UC-007 | Utilizador | M2 — Publicações | RN-002 |
| RF-009 | UC-008 | Utilizador | M2 — Publicações | RN-002 |
| RF-010 | UC-006 | Utilizador | M2 — Publicações | RN-003 |
| RF-011 | UC-012 | Utilizador | M5 — Feed | RN-003 |
| RF-012 | UC-009 | Utilizador | M3 — Bazes | RN-004, RN-007 |
| RF-013 | UC-009 | Utilizador | M3 — Bazes | RN-004 |
| RF-014 | UC-009 | Utilizador | M3 — Bazes | RN-003 |
| RF-015 | UC-010 | Utilizador | M4 — Comentários | RN-001, RN-007 |
| RF-016 | UC-011 | Utilizador | M4 — Comentários | RN-002 |
| RF-017 | UC-011 | Utilizador | M4 — Comentários | RN-002 |
| RF-018 | UC-010 | Utilizador | M4 — Comentários | RN-003 |
| RF-019 | UC-012 | Utilizador | M5 — Feed | RN-003, RN-005 |
| RF-020 | UC-012 | Utilizador | M5 — Feed | RN-005 |
| RF-021 | UC-012 | Utilizador | M5 — Feed | — |
| RF-022 | UC-013 | Utilizador | M6 — Notificações | RN-007 |
| RF-023 | UC-013 | Utilizador | M6 — Notificações | RN-007 |
| RF-024 | UC-013 | Utilizador | M6 — Notificações | RN-007 |
| RF-025 | UC-015 | Utilizador | M1 — Utilizadores | RN-006 |
| RF-026 | UC-014 | Administrador | M7 — Administração | RN-008 |

---

*Documento gerado com base no enunciado do Projecto AW — NzolaNet, ISPTEC, 2026.*  
*Legenda: ⚠️ NV = Necessita Validação com o professor/stakeholder antes da implementação.*
