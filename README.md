# task-manager-app

Sistema completo de gerenciamento de tarefas com arquitetura moderna, utilizando Java (Spring Boot) no backend e Angular no frontend.

---

## Estrutura do monorepo

```text
TaskManagerApp
 ┣ task-manager-api/               # Backend Spring Boot
 ┃ ┣ src/main/java/com/taskmanager
 ┃ ┃ ┣ controller                  # AuthController, TaskController, UserController
 ┃ ┃ ┣ service
 ┃ ┃ ┃ ┣ AuthService / TaskService (interfaces)
 ┃ ┃ ┃ ┗ impl                      # AuthServiceImpl, TaskServiceImpl
 ┃ ┃ ┣ repository                  # TaskRepository (JpaSpecificationExecutor), UserRepository
 ┃ ┃ ┣ dto                         # Request / Response / Filter / Error records
 ┃ ┃ ┣ entity                      # User, Task, Role, TaskPriority, TaskStatus
 ┃ ┃ ┣ config                      # SecurityConfig
 ┃ ┃ ┣ security                    # JwtService, JwtAuthenticationFilter, CustomUserDetailsService
 ┃ ┃ ┣ specification               # TaskSpecification (filtros dinâmicos via JPA Criteria)
 ┃ ┃ ┗ exception                   # ResourceNotFoundException, BusinessException, GlobalExceptionHandler
 ┃ ┣ src/main/resources
 ┃ ┣ src/test                      # TaskServiceImplTest, TaskControllerTest (30 testes)
 ┃ ┣ pom.xml
 ┃ ┣ Dockerfile
 ┃ ┗ docker-compose.yml
 ┗ task-manager-frontend/          # Frontend Angular
   ┣ src/app
   ┃ ┣ core
   ┃ ┃ ┣ guards
   ┃ ┃ ┣ interceptors
   ┃ ┃ ┣ models
   ┃ ┃ ┗ services
   ┃ ┣ features
   ┃ ┃ ┣ auth
   ┃ ┃ ┃ ┣ login
   ┃ ┃ ┃ ┗ register
   ┃ ┃ ┗ tasks
   ┃ ┃   ┣ task-list
   ┃ ┃   ┗ task-form
   ┃ ┗ shared
   ┃   ┗ components
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
| Maven | 3.9.x |
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
| Node.js | 22.22.2 |

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
| `COMPLETED` | Concluída — não aparece na listagem de andamento |
| `CANCELLED` | Cancelada — não aparece na listagem de andamento |

> **Regras de negócio:** Uma tarefa `COMPLETED` ou `CANCELLED` não pode voltar para status ativo. Uma tarefa `CANCELLED` não pode ser concluída e vice-versa.

---

## Testes

```bash
cd task-manager-api
mvn test
```

| Classe de teste | Tipo | Testes |
|-----------------|------|--------|
| `TaskServiceImplTest` | Unitário (Mockito puro) | 16 |
| `TaskControllerTest` | Camada web (`@WebMvcTest` + JWT Bearer mock) | 13 |
| `TaskManagerApiApplicationTests` | Smoke test | 1 |
| **Total** | | **30** |

---

## Como executar

### Backend

```bash
# Subir PostgreSQL + API via Docker Compose
cd task-manager-api
docker-compose up -d
```

### Frontend

```bash
cd task-manager-frontend
npm install
npm start        # http://localhost:4200
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


