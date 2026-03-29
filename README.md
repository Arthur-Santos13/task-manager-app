# task-manager-app

Sistema completo de gerenciamento de tarefas com arquitetura moderna, utilizando Java (Spring Boot) no backend e Angular no frontend.

---

## Estrutura do monorepo

```text
TaskManagerApp
 ┣ docker-compose.yml               # Orquestra postgres + api + frontend
 ┣ task-manager-api/                # Backend Spring Boot
 ┃ ┣ src/main/java/com/taskmanager
 ┃ ┃ ┣ controller                   # AuthController, TaskController, UserController
 ┃ ┃ ┣ service
 ┃ ┃ ┃ ┣ AuthService / TaskService (interfaces)
 ┃ ┃ ┃ ┗ impl                       # AuthServiceImpl, TaskServiceImpl
 ┃ ┃ ┣ repository                   # TaskRepository (JpaSpecificationExecutor), UserRepository
 ┃ ┃ ┣ dto                          # Request / Response / Filter / Error records
 ┃ ┃ ┣ entity                       # User, Task, Role, TaskPriority, TaskStatus
 ┃ ┃ ┣ config                       # SecurityConfig
 ┃ ┃ ┣ security                     # JwtService, JwtAuthenticationFilter, CustomUserDetailsService
 ┃ ┃ ┣ specification                # TaskSpecification (filtros dinâmicos via JPA Criteria)
 ┃ ┃ ┗ exception                    # ResourceNotFoundException, BusinessException, GlobalExceptionHandler
 ┃ ┣ src/test                       # 9 suites · 51 testes (JUnit 5 + Mockito)
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
| H2 (testes) | — |
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

### Tarefas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/tasks` | Cria uma nova tarefa |
| `GET` | `/api/tasks` | Lista tarefas com filtros opcionais |
| `GET` | `/api/tasks/{id}` | Busca tarefa por ID |
| `PUT` | `/api/tasks/{id}` | Atualiza tarefa (criador ou ADMIN) |
| `DELETE` | `/api/tasks/{id}` | Remove tarefa (criador ou ADMIN) |
| `PATCH` | `/api/tasks/{id}/start` | Inicia a tarefa |
| `PATCH` | `/api/tasks/{id}/complete` | Conclui a tarefa |
| `PATCH` | `/api/tasks/{id}/cancel` | Cancela a tarefa |

### Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/users` | Lista todos os usuários |
| `GET` | `/api/users/{id}` | Busca usuário por ID |

---

## Filtros de tarefas (`GET /api/tasks`)

Todos os parâmetros são opcionais e podem ser combinados livremente:

| Parâmetro | Tipo | Comportamento |
|-----------|------|---------------|
| `title` | `string` | Busca parcial, case-insensitive |
| `description` | `string` | Busca parcial, case-insensitive |
| `assigneeId` | `number` | Filtra pelo responsável |
| `createdById` | `number` | Filtra pelo criador |
| `priority` | `HIGH \| MEDIUM \| LOW` | Filtra por prioridade |
| `status` | `TODO \| IN_PROGRESS \| COMPLETED \| CANCELLED` | Filtra por situação |
| `dueDateUntil` | `dd/MM/yyyy` | **Regra "até:"** — retorna apenas tarefas **não concluídas e não canceladas** cujo prazo seja ≤ à data informada |

**Exemplo:**
```
GET /api/tasks?dueDateUntil=31/12/2026&priority=HIGH
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
| `AuthControllerTest` | `@WebMvcTest` + JWT mock | 5 |
| `TaskControllerTest` | `@WebMvcTest` + JWT mock | 13 |
| `UserControllerTest` | `@WebMvcTest` + JWT mock | 5 |
| `AuthServiceImplTest` | Unitário (Mockito) | 6 |
| `TaskServiceImplTest` | Unitário (Mockito) | 16 |
| `GlobalExceptionHandlerTest` | Unitário | 3 |
| `CustomUserDetailsServiceTest` | Unitário | 2 |
| `JwtServiceTest` | Unitário | 3 |
| `TaskManagerApiApplicationTests` | Smoke test | 1 |
| **Total** | | **54** |

### Frontend

```bash
cd task-manager-frontend
npm test
```

| Suite de teste | Testes |
|----------------|--------|
| `AuthService` | 6 |
| `TaskService` | 5 |
| `UserService` | 3 |
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
| **Total** | **84** |

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

