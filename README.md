# task-manager-app

Sistema completo de gerenciamento de tarefas com arquitetura moderna, utilizando Java (Spring Boot) no backend e Angular no frontend.

---

## Estrutura do monorepo

```text
TaskManagerApp
 ┣ docker-compose.yml               # Orquestra postgres + api + frontend
 ┣ .github/workflows/               # CI (Maven + npm test)
 ┣ task-manager-api/                # Backend Spring Boot
 ┃ ┣ src/main/java/com/taskmanager
 ┃ ┃ ┣ controller                   # AuthController, TaskController, UserController
 ┃ ┃ ┣ service
 ┃ ┃ ┃ ┣ AuthService / TaskService (interfaces)
 ┃ ┃ ┃ ┗ impl                       # AuthServiceImpl, TaskServiceImpl
 ┃ ┃ ┣ repository                   # TaskRepository (JpaSpecificationExecutor), UserRepository
 ┃ ┃ ┣ dto                          # Request / Response / Filter / PagedTasksResponse / UserPickerResponse / Error records
 ┃ ┣ resources/db/migration       # Flyway (schema versionado)
 ┃ ┃ ┣ entity                       # User, Task, Role, TaskPriority, TaskStatus
 ┃ ┃ ┣ config                       # SecurityConfig
 ┃ ┃ ┣ security                     # JwtService, JwtAuthenticationFilter, CustomUserDetailsService
 ┃ ┃ ┣ specification                # TaskSpecification (filtros dinâmicos via JPA Criteria)
 ┃ ┃ ┗ exception                    # ResourceNotFoundException, BusinessException, GlobalExceptionHandler
 ┃ ┣ src/test                       # Suites JUnit 5 + Mockito (ver secção Testes)
 ┃ ┣ pom.xml
 ┃ ┣ Dockerfile
 ┃ ┗ .dockerignore
 ┗ task-manager-frontend/           # Frontend Angular
   ┣ src/app
   ┃ ┣ core
   ┃ ┃ ┣ adapters                   # PtBrDateAdapter
   ┃ ┃ ┣ guards                     # authGuard, guestGuard
   ┃ ┃ ┣ interceptors               # authInterceptor (JWT header)
   ┃ ┃ ┣ models                     # Interfaces TypeScript
   ┃ ┃ ┗ services                   # AuthService, TaskService, UserService
   ┃ ┣ features
   ┃ ┃ ┣ auth
   ┃ ┃ ┃ ┣ login
   ┃ ┃ ┃ ┗ register
   ┃ ┃ ┗ tasks
   ┃ ┃   ┣ task-list
   ┃ ┃   ┣ task-form
   ┃ ┃   ┗ task-shell
   ┃ ┗ shared
   ┃   ┣ components                 # AppLogoComponent, ConfirmDialogComponent
   ┃   └── directives               # DateMaskDirective
   ┣ Dockerfile
   ┣ nginx.conf
   ┣ .dockerignore
   ┣ angular.json
   ┗ package.json
```

---

## Stack

### Backend
| Tecnologia | Versão |
|---|---|
| Java | 21 |
| Spring Boot | 3.3.5 |
| Spring Security (JWT) | 6.3.x |
| JPA / Hibernate | 6.5.x |
| Maven | 3.9.9 |
| JUnit 5 + Mockito | 5.10.x |
| PostgreSQL | 16 |
| Flyway | (via Spring Boot BOM) |
| H2 (testes) | — |
| Spring Boot Actuator | 3.3.x |
| Springdoc OpenAPI (Swagger UI) | 2.6.x |
| Docker | — |

### Frontend
| Tecnologia | Versão |
|---|---|
| Angular | 21.2.x (standalone components) |
| Angular Material | 21.2.x |
| RxJS | 7.8.x |
| TypeScript | 5.9.x |
| SCSS | — |
| Jest + jest-preset-angular | 30.x / 16.x |
| Node.js | 22.x |

---

## Backend — Funcionalidades implementadas

### Autenticação (JWT)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/auth/register` | Cadastra novo usuário e retorna token JWT |
| `POST` | `/api/auth/login` | Autentica usuário e retorna token JWT |

> Todos os demais endpoints exigem o header `Authorization: Bearer <token>`.

### Visibilidade e permissões (tarefas)

| Contexto | Quem pode |
|----------|-----------|
| Listar / ver detalhe (`GET /api/tasks`, `GET /api/tasks/{id}`) | **Criador** ou **responsável** da tarefa; **ADMIN** vê todas. |
| Atualizar / excluir (`PUT`, `DELETE`) | **Criador** ou **ADMIN** (inalterado). |
| Iniciar (`PATCH …/start`) | **Responsável** ou **ADMIN** (inalterado). |
| Concluir / cancelar (`PATCH …/complete`, `…/cancel`) | **Criador**, **responsável** ou **ADMIN**. |

### Tarefas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/tasks` | Cria uma nova tarefa |
| `GET` | `/api/tasks` | Lista **paginada** tarefas visíveis ao utilizador, com filtros opcionais (JSON: `content`, `totalElements`, `totalPages`, `number`, `size`) |
| `GET` | `/api/tasks/{id}` | Busca tarefa por ID (se o utilizador tiver permissão de leitura) |
| `PUT` | `/api/tasks/{id}` | Atualiza tarefa (criador ou ADMIN) |
| `DELETE` | `/api/tasks/{id}` | Remove tarefa (criador ou ADMIN) |
| `PATCH` | `/api/tasks/{id}/start` | Inicia a tarefa |
| `PATCH` | `/api/tasks/{id}/complete` | Conclui a tarefa |
| `PATCH` | `/api/tasks/{id}/cancel` | Cancela a tarefa |

### Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/users/picker` | Lista mínima (`id`, `name`) para seletores — **qualquer utilizador autenticado** |
| `GET` | `/api/users` | Lista completa de utilizadores — **apenas ADMIN** |
| `GET` | `/api/users/{id}` | Perfil completo — **próprio utilizador** ou **ADMIN** |

### Operação e documentação (API)

| Recurso | URL / notas |
|---------|-------------|
| Health (sem auth) | `GET /actuator/health` |
| OpenAPI | `GET /v3/api-docs` |
| Swagger UI (sem auth) | `http://localhost:8080/swagger-ui/index.html` (caminho típico do Springdoc) |

### Base de dados

- Migrações **Flyway** em `task-manager-api/src/main/resources/db/migration/` (`V1__init_schema.sql`).
- Em produção/desenvolvimento com PostgreSQL, `spring.jpa.hibernate.ddl-auto` está em **`validate`** (o schema deve acompanhar o Flyway).
- **Nota:** volumes Docker antigos criados só com Hibernate `update` podem conflitar com a primeira migração; nesse caso use `docker-compose down -v` uma vez ou faça baseline/repair manual do Flyway.

---

## Filtros e paginação (`GET /api/tasks`)

Todos os parâmetros de filtro são opcionais e podem ser combinados. A resposta é um objeto paginado (não um array simples).

| Parâmetro | Tipo | Comportamento |
|-----------|------|---------------|
| `page` | `number` | Índice da página (base 0); predefinição `0` |
| `size` | `number` | Tamanho da página; predefinição `20`; máximo `100` |
| `title` | `string` | Busca parcial, case-insensitive |
| `description` | `string` | Busca parcial, case-insensitive |
| `assigneeId` | `number` | Filtra pelo responsável |
| `createdById` | `number` | Filtra pelo criador |
| `priority` | `HIGH \| MEDIUM \| LOW` | Filtra por prioridade |
| `status` | `TODO \| IN_PROGRESS \| COMPLETED \| CANCELLED` | Filtra por situação |
| `hideFinished` | `boolean` | Predefinição `true`. Com `true` e **sem** `status`, exclui `COMPLETED` e `CANCELLED`. Envie `false` quando filtrar por `status` (ex.: listar concluídas). |
| `dueDateUntil` | `dd/MM/yyyy` | **Regra "até:"** — retorna apenas tarefas **não concluídas e não canceladas** cujo prazo seja ≤ à data informada |

**Exemplos:**
```
GET /api/tasks?page=0&size=20&priority=HIGH
GET /api/tasks?dueDateUntil=31/12/2026&priority=HIGH
GET /api/tasks?status=COMPLETED&hideFinished=false
```

---

## Situação das tarefas

| Status | Descrição |
|--------|-----------|
| `TODO` | Tarefa criada, ainda não iniciada |
| `IN_PROGRESS` | Em andamento |
| `COMPLETED` | Concluída |
| `CANCELLED` | Cancelada |

> **Regras de negócio:** Uma tarefa `COMPLETED` ou `CANCELLED` não pode voltar para status ativo. Uma tarefa `CANCELLED` não pode ser concluída e vice-versa.

---

## Testes

### Backend

```bash
cd task-manager-api
mvn test
```

| Classe de teste | Tipo | Testes |
|-----------------|------|--------|
| `AuthControllerTest` | `@WebMvcTest` + JWT mock | 8 |
| `TaskControllerTest` | `@WebMvcTest` + JWT mock | 26 |
| `UserControllerTest` | `@WebMvcTest` + JWT mock | 9 |
| `AuthServiceImplTest` | Unitário (Mockito) | 4 |
| `TaskServiceImplTest` | Unitário (Mockito) | 31 |
| `GlobalExceptionHandlerTest` | Unitário | 10 |
| `CustomUserDetailsServiceTest` | Unitário | 2 |
| `JwtServiceTest` | Unitário | 6 |
| `TaskManagerApiApplicationTests` | Smoke test | 1 |
| **Total** | | **97** |

### Frontend

```bash
cd task-manager-frontend
npm test
```

| Suite de teste | Testes |
|----------------|--------|
| `AuthService` | 6 |
| `TaskService` | 6 |
| `UserService` | 4 |
| `authInterceptor` | 2 |
| `authGuard` | 2 |
| `guestGuard` | 2 |
| `PtBrDateAdapter` | 6 |
| `DateMaskDirective` | 8 |
| `AppLogoComponent` | 5 |
| `ConfirmDialogComponent` | 3 |
| `LoginComponent` | 8 |
| `RegisterComponent` | 8 |
| `TaskShellComponent` | 3 |
| `TaskFormComponent` | 8 |
| `TaskListComponent` | 9 |
| **Total** | **85** |

---

## CI (GitHub Actions)

No repositório existe o workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml): em cada `push` / `pull_request` executa `mvn test` na API e `npm ci` + `npm test -- --ci` no frontend.

---

## Como executar

### Com Docker (recomendado)

Sobe PostgreSQL, API e frontend com um único comando a partir da raiz do projeto:

```bash
docker-compose up -d --build
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| API | http://localhost:8080 |
| PostgreSQL | localhost:5435 |

Para parar:

```bash
docker-compose down
```

---

### Desenvolvimento local

#### Backend

```bash
# Requer PostgreSQL rodando (porta 5435) ou ajuste application.yml
cd task-manager-api
mvn spring-boot:run
```

#### Frontend

```bash
cd task-manager-frontend
npm install
npm start        # http://localhost:4200 (proxy /api → localhost:8080)
```

---

## Paleta de cores (frontend)

| Token | Valor | Uso |
|---|---|---|
| `$bg-darkest` | `#080810` | Fundo principal |
| `$bg-surface` | `#10101b` | Cards e painéis |
| `$primary` | `#7c3aed` | Botões, destaques |
| `$primary-light` | `#a855f7` | Links, chips ativos |
| `$text-primary` | `#ffffff` | Texto principal |
| `$text-secondary` | `#8888a8` | Texto secundário |

