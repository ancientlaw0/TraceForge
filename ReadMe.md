# TraceForge

TraceForge is a full-stack observability and governance platform for
applications that use Large Language Models (LLMs).

It sits around LLM traffic and turns requests into structured traces
that can be stored, analyzed, monitored, and queried. TraceForge
combines backend APIs, asynchronous event processing, analytics, alerts,
a web dashboard, usage limits, and an SDK that instruments supported LLM
providers with minimal application-side changes.

The project is designed to answer questions such as:

- What models and providers are being used?
- How many requests are being made?
- How long are requests taking?
- How many requests are failing?
- How many input/output tokens are being consumed?
- What is the estimated LLM cost?
- What traces are being generated?
- Are usage limits being exceeded?
- Which requests should trigger alerts?
- Can operational questions be asked in natural language and translated
  into SQL?

------------------------------------------------------------------------

## Table of Contents

1.  What TraceForge Does
2.  Core Capabilities
3.  Architecture
4.  Repository Structure
5.  Technology Stack
6.  Supported LLM Providers
7.  Backend
8.  Trace Ingestion
9.  Analytics
10. Usage Limits and Quotas
11. Alerts and Kafka Processing
12. Chat and Natural-Language SQL
13. Frontend
14. SDK
15. SDK Instrumentation Flow
16. SDK Sync and Async Support
17. Trace Data Model
18. Quick Start
19. Local Development Setup (Docker)
20. Local Development Setup (Github)
21. Starting TraceForge from VS Code
22. Starting the Infrastructure with DockerCompose
23. Running the Backend Manually
24. Running the Frontend Manually
25. Running the Kafka Consumer Manually
26. Running the Alert Handler Manually
27. Database
28. Redis
29. Kafka / Redpanda
30. Reqirements
31. Performance
32. Testing
33. SDK Packaging and PyPI
34. Common Development Workflow
35. Roadmap
36. License

------------------------------------------------------------------------

## What TraceForge Does

TraceForge provides observability for LLM applications.

An application uses the TraceForge SDK to instrument an LLM provider.
The SDK intercepts provider calls, extracts the request and response
information, calculates or records usage information, creates a trace,
and sends the trace to the TraceForge backend.

The backend stores the trace and feeds it into the event/analytics
pipeline.

At the same time:

- the dashboard exposes operational and analytics information;
- Redis is used for fast metrics and usage-limit accounting;
- Redpanda provides Kafka-compatible event streaming;
- the Kafka consumer processes asynchronous events;
- the alert handler evaluates alert-related events and actions;
- the Chat interface converts natural-language questions into SQL and
  executes them against user-scoped data.

TraceForge is therefore not just a logging endpoint. It is an
observability layer around LLM traffic.

------------------------------------------------------------------------

## Core Capabilities

### LLM tracing

TraceForge captures structured information for each instrumented
request, including provider, model, prompt, response, latency, token
usage, cost, status, errors, and trace metadata.

### Multi-provider instrumentation

The SDK supports multiple LLM clients through provider-specific
integrations.

Current integrations include:

- OpenAI
- Groq
- Google Gemini
- Anthropic
- DeepSeek
- Ollama

OpenAI-compatible clients such as DeepSeek can use the same high-level
integration pattern.

### Sync and async clients

The SDK supports synchronous and asynchronous provider clients. The
patcher detects whether the original method is synchronous or
coroutine-based and installs the appropriate wrapper.

### Analytics dashboard

The platform exposes:

- Overview
- Models
- Providers
- Time series
- Errors
- Traces

Analytics can be filtered by time, provider, model, and status, with
support for custom time ranges.

Available time filters include:

- hour
- day
- week
- month
- all
- custom

### Live observability

The dashboard includes a Live view for operational trace visibility.

### Alerts

Trace/event processing supports alert handling through the asynchronous
event pipeline.

### Usage limits

TraceForge separates quota enforcement from analytics.

Usage limits can include:

- requests per minute
- requests per hour
- requests per day
- input tokens per day
- output tokens per day
- cost per day
- cost per month

Limits can be enabled or disabled per user and can be configured to
block requests when a limit is reached.

### Natural-language Chat

The Chat interface allows operational questions to be expressed in
natural language.

The LLM converts the question into SQL, the backend executes the query
against the appropriate user-scoped data, and the result can be
summarized for the user.

The SQL layer uses `sqlglot` for SQL parsing/transformation and is
designed around controlled, user-scoped data access.

### API-key based authentication

Applications sending traces authenticate to the TraceForge API using an
API key.

The SDK sends:

``` text
Authorization: Bearer <API_KEY>
```

when posting traces.

### Persistent infrastructure

The development stack uses:

- PostgreSQL for durable application/trace data
- Redis for fast counters and metrics
- Redpanda as the Kafka-compatible event broker

------------------------------------------------------------------------

# Architecture

At a high level:

``` text
                    LLM Application
                          |
                          v
                   TraceForge SDK
                          |
                          v
                 Provider Integration
                          |
                          v
                    Trace Recorder
                          |
                          v
                 TraceForge Backend
                          |
             +------------+------------+
             |            |            |
             v            v            v
        PostgreSQL      Redis       Redpanda/Kafka
             |            |            |
             |            |            v
             |            |      Kafka Consumer
             |            |            |
             |            |            v
             |            |      Alert Handler
             |            |
             |            v
             |       Usage / Metrics
             |
             v
        Analytics API
             |
             v
          Frontend
             |
       +-----+------+
       |            |
       v            v
   Dashboard      Chat
```

------------------------------------------------------------------------

## Request / Trace Lifecycle

The SDK-side lifecycle is:

``` text
Application LLM call
        |
        v
Provider client
        |
        v
TraceForge integration
        |
        +--> extract request
        |
        +--> call original provider method
        |
        +--> extract response
        |
        +--> calculate latency / tokens / cost
        |
        +--> create Trace
        |
        v
Recorder
        |
        v
HTTP Transport
        |
        v
POST /traces/
        |
        v
Backend
```

The platform-side lifecycle is conceptually:

``` text
Trace received
      |
      +--> Persist trace
      |
      +--> Update analytics / Redis metrics
      |
      +--> Update usage counters
      |
      +--> Publish / process asynchronous events
                    |
                    +--> Kafka Consumer
                    |
                    +--> Alert Handler
```

------------------------------------------------------------------------

# Repository Structure

The repository is organized into the main application, frontend, SDK,
and supporting tooling.

``` text
TraceForge/
│
├── .github/                 # GitHub configuration/workflows, when present
│
├── .vscode/
│   └── tasks.json           # One-command local development startup
│
├── Backend/
│   ├── app/
│   │   ├── ...              # FastAPI application and backend modules
│   │   ├── kafka/
│   │   │   └── consumer.py
│   │   └── handlers/
│   │       └── alert_handler.py
│   │
│   ├── venv/                # Local only; never commit
│   ├── .env                 # Local secrets/config; never commit
│   ├── .env.example         # Safe configuration template
│   ├── alembic.ini
│   └── requirements.txt
│
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── SDK/
│   ├── traceforge/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── patcher.py
│   │   ├── recorder.py
│   │   ├── trace.py
│   │   ├── transport.py
│   │   └── integrations/
│   │       ├── base.py
│   │       ├── gemini.py
│   │       ├── groq.py
│   │       ├── openai.py
│   │       ├── anthropic.py
│   │       ├── deepseek.py
│   │       └── ollama.py
│   │
│   ├── tests/
│   │   ├── test_openai_sync.py
│   │   ├── test_openai_async.py
│   │   ├── test_groq_sync.py
│   │   ├── test_groq_async.py
│   │   ├── test_gemini_sync.py
│   │   ├── test_gemini_async.py
│   │   ├── test_anthropic_sync.py
│   │   ├── test_anthropic_async.py
│   │   ├── test_deepseek_sync.py
│   │   ├── test_deepseek_async.py
│   │   ├── test_ollama_sync.py
│   │   └── test_ollama_async.py
│   │
│   ├── pyproject.toml
│   └── README.md
│
├── Locusts/                 # Load/performance testing assets
│
├── docker-compose.yml       # Local infrastructure
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

`venv/`, `node_modules/`, and `.env` are local development artifacts and
should not be committed.

------------------------------------------------------------------------

# Technology Stack

## Backend

- Python
- FastAPI
- Uvicorn
- Pydantic
- Pydantic Settings
- SQLAlchemy
- Alembic
- PostgreSQL
- asyncpg
- Redis
- aiokafka
- HTTPX
- SQLGlot

## Authentication / Security

- JWT-based authentication
- Password hashing tooling
- API-key based SDK authentication

Relevant Python packages include:

- `python-jose`
- `passlib`
- `bcrypt`
- `cryptography`
- `email-validator`

## Frontend

- React
- Vite
- JavaScript
- npm

## Eventing

- Redpanda
- Kafka-compatible APIs
- aiokafka

## SDK

- Python
- HTTPX
- Provider-specific LLM SDKs
- Async-compatible instrumentation

------------------------------------------------------------------------

# Supported LLM Providers

The TraceForge SDK currently contains integrations for:

| Provider  | Integration            | Typical client target                                 |
|-----------|------------------------|-------------------------------------------------------|
| OpenAI    | `OpenAIIntegration`    | `client.chat.completions.create`                      |
| Groq      | `GroqIntegration`      | `client.chat.completions.create`                      |
| Gemini    | `GeminiIntegration`    | `client.models.generate_content` and async equivalent |
| Anthropic | `AnthropicIntegration` | `client.messages.create`                              |
| DeepSeek  | `DeepSeekIntegration`  | `client.chat.completions.create`                      |
| Ollama    | `OllamaIntegration`    | `client.generate`                                     |

Provider support is implemented through the common `ProviderIntegration`
interface.

------------------------------------------------------------------------

# Backend

The backend is a FastAPI application.

The main entry point used by local development is:

``` bash
uvicorn app.main:app
```

The API is responsible for:

- authentication
- API-key validation
- trace ingestion
- persistence
- analytics
- usage enforcement
- metrics
- alerts
- chat / SQL execution

------------------------------------------------------------------------

## Trace ingestion

The SDK sends traces to:

``` text
POST /traces/
```

using:

``` http
Authorization: Bearer <TRACEFORGE_API_KEY>
```

A trace includes structured values such as:

``` json
{
  "trace_id": "uuid",
  "provider": "openai",
  "model": "gpt-4.1-mini",
  "prompt": "...",
  "response": "...",
  "latency_ms": 123.45,
  "input_tokens": 100,
  "output_tokens": 50,
  "cost": 0.001,
  "status": "success",
  "error_message": null,
  "metadata_trace": {}
}
```

------------------------------------------------------------------------

# Analytics

The analytics layer is exposed through routes for:

``` text
GET /analytics/overview
GET /analytics/models
GET /analytics/providers
GET /analytics/timeseries
GET /analytics/errors
GET /analytics/traces
```

Analytics filters support:

``` text
time
provider
model
status
custom start/end
```

The frontend’s shared time-filter values are:

``` text
hour
day
week
month
all
custom
```

Analytics are intended to provide both high-level summaries and detailed
trace views.

------------------------------------------------------------------------

# Usage Limits and Quotas

Usage limits are deliberately separate from analytics.

The quota configuration is represented by `usage_limits` and includes:

``` text
id
user_id
enabled
max_requests_per_minute
max_requests_per_hour
max_requests_per_day
max_input_tokens_per_day
max_output_tokens_per_day
max_cost_per_day
max_cost_per_month
block_on_limit
created_at
updated_at
```

The intended flow is:

``` text
Incoming request
      |
      v
Authenticate API key
      |
      v
UsageLimiter
      |
      v
RedisUsageService
      |
      +--> Allowed
      |      |
      |      v
      |   Provider call
      |
      +--> Not allowed
             |
             v
          Reject request
```

The analytics service and the usage-limit service are separate concepts:

- `RedisMetricsService` is for analytics/metrics.
- `RedisUsageService` is for quotas, admission control, and usage
  counters.

This separation prevents analytics concerns from being mixed with
request-admission logic.

For strict request-per-minute enforcement, the intended model is an
atomic Redis reservation/increment before the provider request, followed
by reconciliation using the actual usage/cost.

------------------------------------------------------------------------

# Alerts and Kafka Processing

TraceForge uses Redpanda as a Kafka-compatible event broker.

The local development system includes a Kafka consumer:

``` bash
python -m app.kafka.consumer
```

and an alert handler:

``` bash
python -m app.handlers.alert_handler
```

These are long-running background processes in development.

The event-processing flow is conceptually:

``` text
Trace / event
    |
    v
Redpanda
    |
    v
Kafka Consumer
    |
    v
Event handling
    |
    v
Alert Handler
```

The services are intentionally separated from the FastAPI process so
asynchronous/background processing does not have to run inside the API
request lifecycle.

------------------------------------------------------------------------

# Chat and Natural-Language SQL

TraceForge includes a Chat interface designed for operational and
analytics questions.

A typical flow is:

``` text
User question
     |
     v
Chat backend
     |
     v
LLM generates SQL
     |
     v
SQL validation / transformation
     |
     v
Execute against user-scoped data
     |
     v
Return structured result
     |
     v
Summarize result
```

`sqlglot` is used as part of the SQL-processing layer.

Example questions the interface is intended to support:

``` text
Which model had the highest usage today?
What provider produced the most errors?
How many requests failed this week?
Which traces were most expensive?
Show me the average latency by model.
```

The exact SQL generated depends on the schema and the question.

User scoping is important: Chat queries must operate only on data the
authenticated user is allowed to access.

------------------------------------------------------------------------

# Frontend

The frontend is a React/Vite application.

The frontend contains the TraceForge dashboard and
authenticated/protected views.

The protected layout uses:

``` text
ProtectedLayout
    |
    +--> Sidebar
    |
    +--> Outlet
```

The sidebar contains navigation for the main observability areas,
including:

- Dashboard / overview
- Analytics
- Live
- Chat
- Logout

Analytics exposes multiple views for:

- overview
- models
- providers
- time series
- errors
- traces

The frontend is run locally with Vite:

``` bash
npm run dev
```

------------------------------------------------------------------------

# SDK

The TraceForge SDK provides provider instrumentation without requiring
the application to manually create trace objects around every LLM call.

The SDK structure is:

``` text
SDK/
└── traceforge/
    ├── __init__.py
    ├── config.py
    ├── patcher.py
    ├── recorder.py
    ├── trace.py
    ├── transport.py
    └── integrations/
        ├── base.py
        ├── gemini.py
        ├── groq.py
        ├── openai.py
        ├── anthropic.py
        ├── deepseek.py
        └── ollama.py
```

------------------------------------------------------------------------

## SDK Public API

Initialization:

``` python
import traceforge

traceforge.init(
    api_key="YOUR_TRACEFORGE_API_KEY",
    endpoint="http://localhost:8000"
)
```

Then instrument the provider client.

OpenAI:

``` python
traceforge.instrument_openai(client)
```

Groq:

``` python
traceforge.instrument_groq(client)
```

Gemini:

``` python
traceforge.instrument_gemini(client)
```

Anthropic:

``` python
traceforge.instrument_anthropic(client)
```

DeepSeek:

``` python
traceforge.instrument_deepseek(client)
```

Ollama:

``` python
traceforge.instrument_ollama(client)
```

Flush asynchronous telemetry:

``` python
await traceforge.flush()
```

Flush synchronous telemetry:

``` python
traceforge.flush_sync()
```

`init()` is idempotent: calling it more than once does not create
another recorder.

Provider instrumentation is separate from initialization so an
application can initialize TraceForge once and instrument one or
multiple clients.

------------------------------------------------------------------------

# SDK Instrumentation Flow

The SDK uses three major pieces:

### Integration

A provider integration knows how to:

- identify the provider
- extract request information
- extract response information
- calculate cost
- extract useful error information
- install the provider-specific patch

### Patcher

The patcher replaces a client method with an instrumentation wrapper.

It supports both:

``` text
synchronous functions
```

and:

``` text
asynchronous coroutine functions
```

The patched method still behaves like the original provider method from
the application’s perspective.

### Recorder

The recorder sends traces in the background so telemetry failures do not
block the application.

The recorder has:

- an async task set for active event-loop execution
- a thread-pool path for synchronous execution
- async `flush()`
- synchronous `flush_sync()`

### Transport

The default HTTP transport sends a trace to the TraceForge backend
through HTTPX.

The payload includes the trace fields and the bearer API key.

------------------------------------------------------------------------

# SDK Sync and Async Support

The same instrumentation model is designed to work with both synchronous
and asynchronous provider clients.

For example, Groq can be used as:

``` text
Groq()
```

or:

``` text
AsyncGroq()
```

and the patcher determines which wrapper is necessary.

The same principle is applied to:

- OpenAI
- Anthropic
- DeepSeek
- Gemini
- Ollama
- other supported integrations

Gemini exposes different sync and async client paths, so its integration
installs patches on both:

``` text
client.models.generate_content
client.aio.models.generate_content
```

------------------------------------------------------------------------

# Trace Data Model

The SDK trace model contains:

``` text
trace_id
provider
model
prompt
response
latency_ms
input_tokens
output_tokens
cost
status
error_message
metadata_trace
```

Trace status values are:

``` text
success
error
timeout
```

The trace object is represented by a Python dataclass.

------------------------------------------------------------------------

## Quick Start

For an existing development environment:

``` cmd
git clone https://github.com/ancientlaw0/TraceForge.git
cd TraceForge
```

Configure your local environment from the provided `.env.example` files.

Install backend dependencies:

``` cmd
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Install frontend dependencies:

``` cmd
cd ..\Frontend
npm install
```

Start the infrastructure:

``` cmd
cd ..
docker compose up
```

Then use the VS Code task:

``` text
Start Everything
```

to run the backend, Kafka consumer, alert handler, and frontend through
the repository’s configured development tasks.

The resulting development environment is:

``` text
TraceForge
│
├── PostgreSQL
├── Redis
├── Redpanda
├── FastAPI Backend
├── Kafka Consumer
├── Alert Handler
└── React/Vite Frontend
```

The SDK remains independently installable and can instrument supported
LLM providers to send traces into the backend.

------------------------------------------------------------------------
# Local Development Setup [Docker]
## Docker Setup

TraceForge can be run as a fully containerized application using Docker Compose.

The Docker setup runs the complete application stack:

```text
Docker Compose
│
├── PostgreSQL
├── Redis
├── Redpanda
├── Backend
├── Kafka Consumer
├── Alert Handler
└── Frontend
```

This allows the complete platform to be started with a single command instead of manually starting each service.


---

### Docker Project Structure

The Docker-related files are organized as:

```
TraceForge/
│
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
│
├── Backend/
│   ├── requirements.txt
│   └── ...
│
├── Frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
│
├── SDK/
└── Locusts/
```

The root `Dockerfile` is used for the Python services:

```
Backend
Kafka Consumer
Alert Handler
```

The frontend uses its own Dockerfile because it runs on Node/Vite rather than Python.

The root `docker-compose.yml` orchestrates the entire stack.

---

### Environment Variables

A typical Docker environment uses the Compose service names for internal communication:

```
PostgreSQL → postgres
Redis      → redis
Redpanda   → redpanda
Backend    → backend
```

For example:

```
REDIS_HOST=redis
REDIS_PORT=6379
KAFKA_BOOTSTRAP_SERVERS=redpanda:9092
```

The backend database URL must also use the PostgreSQL service name rather than `localhost`:

```
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@postgres:5432/DATABASE
```

`localhost` refers to the current container when used from inside Docker, so Docker services must communicate through their Compose service names.

---

### Build and Start TraceForge

From the root of the repository:

```
docker compose up --build
```

This builds the application images and starts all services.

For detached/background mode:

```
docker compose up --build -d
```

Check running containers:

```
docker compose ps
```

A successful startup should show the following services:

```
postgres
redis
redpanda
backend
kafka-consumer
alert-handler
frontend
```

---

### Accessing the Application

Once the containers are running:

Frontend:

```
http://localhost:5173
```

Backend:

```
http://localhost:8000
```

Locust, when running separately:

```
http://localhost:8089
```

The browser communicates with the backend through the host-published port:

```
http://localhost:8000
```

Docker-internal services communicate through their Compose service names.

---

### Docker Services

#### PostgreSQL

PostgreSQL stores TraceForge persistent application data.

```
postgres:
  image: postgres:15
```

The database data is persisted through a Docker volume:

```
postgres_data
```

---

#### Redis

Redis is used for caching, metrics/usage infrastructure, and other low-latency application operations.

The Redis container uses a persistent volume:

```
redis_data
```

Redis is available internally as:

```
redis:6379
```

---

#### Redpanda

Redpanda provides the Kafka-compatible event streaming layer used by TraceForge.

The Dockerized application connects to:

```
redpanda:9092
```

The Redpanda data is persisted using:

```
redpanda_data
```

---

#### Backend

The backend is built using the root `Dockerfile`.

The container runs FastAPI through Uvicorn:

```
uvicorn app.main:app
```

The backend is exposed to the host on:

```
localhost:8000
```

The backend image can be configured to run multiple Uvicorn workers:

```
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 6
```

Worker count should be chosen according to the available CPU and workload.

For local performance testing, multiple workers were used to increase concurrency.

---

#### Kafka Consumer

The Kafka consumer uses the same Python image as the backend but runs a different application command:

```
python -m app.kafka.consumer
```

It consumes Kafka/Redpanda events and processes asynchronous TraceForge workloads.

---

#### Alert Handler

The alert handler also uses the same Python image:

```
python -m app.handlers.alert_handler
```

It processes alert-related events independently from the main API process.

Using separate containers for the backend, Kafka consumer, and alert handler keeps these workloads isolated while allowing them to share the same application image and dependencies.

---

#### Frontend

The frontend is built separately using the `Frontend/Dockerfile`.

It runs the Vite development server:

```
npm run dev -- --host 0.0.0.0
```

The frontend is exposed on:

```
localhost:5173
```

The frontend runs inside a Node container, while the browser accesses it through the published host port.

---

### Uvicorn Workers

The backend supports multiple Uvicorn workers.

Example:

```
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 6
```

The worker count controls how many independent application worker processes run inside the backend container.

Increasing workers can improve throughput when the application has available CPU capacity, but more workers do not automatically mean higher performance.

Performance should be validated using load testing rather than assuming a linear relationship.

For example:

```
4 workers  → benchmark
6 workers  → benchmark
8 workers  → benchmark
```

Record throughput, latency, and failures for each configuration.

For production deployments, choose the worker count based on the host's CPU resources and the workload rather than simply using the largest possible number.

---

### Docker Logs

View logs for the complete stack:

```
docker compose logs -f
```

View logs for a specific service:

```
docker compose logs -f backend
```

```
docker compose logs -f kafka-consumer
```

```
docker compose logs -f alert-handler
```

```
docker compose logs -f frontend
```

---

### Stopping TraceForge

Stop all containers:

```
docker compose down
```

This stops the services but keeps named Docker volumes.

To remove the containers and volumes as well:

```
docker compose down -v
```

The `-v` option removes persistent Docker volumes and therefore deletes persisted local PostgreSQL, Redis, and Redpanda data.

Use it only when you intentionally want to reset the local environment.

------------------------------------------------------------------------

# Local Development Setup [Github]

## Prerequisites

Install the tools needed for your part of the stack:

- Python
- Node.js and npm
- Docker Desktop
- Git

For SDK development/packaging, also use a Python environment capable of
building a wheel and source distribution.

------------------------------------------------------------------------

## Clone the Repository

``` bash
git clone https://github.com/ancientlaw0/TraceForge.git
cd TraceForge
```

------------------------------------------------------------------------

# Backend Setup

Go to the backend:

``` cmd
cd Backend
```

Create a virtual environment:

``` cmd
python -m venv venv
```

Activate it on Windows:

``` cmd
venv\Scripts\activate
```

Install backend requirements:

``` cmd
pip install -r requirements.txt
```

The `requirements.txt` file contains the backend’s direct project
dependencies.

Do not commit:

``` text
Backend/venv/
```

------------------------------------------------------------------------

# Frontend Setup

Open a terminal in the frontend:

``` cmd
cd Frontend
```

Install JavaScript dependencies:

``` cmd
npm install
```

Do not create a Python virtual environment for the frontend.

The frontend uses:

``` text
package.json
package-lock.json
node_modules/
```

`node_modules/` is generated locally and should not be committed.

------------------------------------------------------------------------

# Environment Configuration

Create your local environment files from the provided examples.

For the backend, the development configuration includes values such as:

``` env
DATABASE_URL=postgresql+asyncpg://admin:secret@localhost:5432/lumen
JWT_SECRET_KEY=change_this_in_your_local_environment
ALGORITHM=HS256
```

Never commit real secrets.

Use `.env.example` as the safe template for the variables required by
the project.

------------------------------------------------------------------------

# Starting TraceForge from VS Code

The repository contains:

``` text
.vscode/tasks.json
```

This file defines a development startup chain named:

``` text
Start Everything
```

The dependency chain is:

``` text
Docker Task
     ↓
Backend Server Task
     ↓
Kafka Consumer Task
     ↓
Alert Handler Task
     ↓
Frontend Task
```

The actual commands are:

### Docker

``` cmd
docker compose up
```

### Backend

``` cmd
venv\Scripts\activate && uvicorn app.main:app
```

### Kafka Consumer

``` cmd
venv\Scripts\activate && python -m app.kafka.consumer
```

### Alert Handler

``` cmd
venv\Scripts\activate && python -m app.handlers.alert_handler
```

### Frontend

``` cmd
npm run dev
```

The `Start Everything` task depends on the frontend task, which in turn
depends on the previous tasks, so the whole development chain can be
launched from VS Code instead of manually opening multiple terminals.

This is the preferred convenience workflow for local development.

------------------------------------------------------------------------

# Starting the Infrastructure with Docker Compose

The current `docker-compose.yml` is used for local infrastructure.

It starts:

``` text
PostgreSQL
Redpanda
Redis
```

Run:

``` bash
docker compose up
```

The current Compose services are:

### PostgreSQL

``` yaml
image: postgres:15
```

### Redpanda

``` yaml
image: redpandadata/redpanda:latest
```

### Redis

``` yaml
image: redis:7-alpine
```

The data directories use named volumes so data can persist between
container restarts:

``` text
postgres_data
redpanda_data
redis_data
```

At present, Docker Compose is the infrastructure layer; the FastAPI
backend, Kafka consumer, alert handler, and Vite frontend are run by the
local VS Code tasks.

That distinction is intentional for the current development workflow.

------------------------------------------------------------------------

# Running the Backend Manually

From `Backend/`:

``` cmd
venv\Scripts\activate
uvicorn app.main:app
```

For a development-only auto-reload workflow, Uvicorn can also be started
with:

``` cmd
uvicorn app.main:app --reload
```

------------------------------------------------------------------------

# Running the Frontend Manually

From `Frontend/`:

``` cmd
npm install
npm run dev
```

------------------------------------------------------------------------

# Running the Kafka Consumer Manually

From `Backend/`:

``` cmd
venv\Scripts\activate
python -m app.kafka.consumer
```

------------------------------------------------------------------------

# Running the Alert Handler Manually

From `Backend/`:

``` cmd
venv\Scripts\activate
python -m app.handlers.alert_handler
```

------------------------------------------------------------------------

# Database

TraceForge uses PostgreSQL as its persistent relational datastore.

The development Compose configuration creates PostgreSQL with
environment variables:

``` text
POSTGRES_DB
POSTGRES_USER
POSTGRES_PASSWORD
POSTGRES_PORT
```

The backend uses:

``` text
postgresql+asyncpg://...
```

through SQLAlchemy’s async engine.

The primary async PostgreSQL driver required by the backend is:

``` text
asyncpg
```

Database migrations are managed with Alembic.

The repository includes:

``` text
Backend/alembic.ini
```

and the Alembic migration environment.

------------------------------------------------------------------------

# Redis

Redis is used for fast, low-latency data such as:

- usage counters
- quota enforcement
- analytics metrics
- other ephemeral/fast-access state

The local Compose configuration uses:

``` text
redis:7-alpine
```

on:

``` text
localhost:6379
```

and enables append-only persistence.

The project separates Redis responsibilities into services such as:

``` text
RedisMetricsService
RedisUsageService
```

so usage enforcement and analytics do not become the same subsystem.

------------------------------------------------------------------------

# Kafka / Redpanda

Redpanda provides the Kafka-compatible broker for local development.

The current Compose configuration uses:

``` text
redpandadata/redpanda:latest
```

and exposes Kafka on:

``` text
9092
```

The backend’s event-processing code uses `aiokafka`.

The Kafka-compatible infrastructure is used for asynchronous processing
rather than forcing all event work through the main HTTP request
process.

When application services are later containerized, Kafka connection
strings should use the Compose service name from inside Docker rather
than `localhost`.

For the current host-based development workflow, the broker is exposed
on the host as configured by Compose.

------------------------------------------------------------------------

# Requirements

The backend uses a project-specific `requirements.txt`.

The SDK is maintained separately as a Python package and has its own
`pyproject.toml`.

The frontend uses npm rather than `requirements.txt`.

In short:

``` text
Backend
    -> requirements.txt

Frontend
    -> package.json / package-lock.json

SDK
    -> pyproject.toml
```

------------------------------------------------------------------------
## Performance

TraceForge was load tested in a Dockerized local environment using distributed
Locust workers.

| Metric | Result |
|---|---:|
| Baseline telemetry latency | 30–50 ms |
| Peak observed throughput | ~950–1,000 RPS |
| Failure rate at reported run | ~0.6% |
| p50 latency at highlighted load | ~1.1 s |
| p95 latency at highlighted load | ~3.1 s |

At peak saturation, latency increased significantly and the system began
returning errors. These results represent a local benchmark rather than a
production deployment.


------------------------------------------------------------------------
# Testing

## Backend

Backend tests should be run using the project’s Python environment.

Example:

``` cmd
cd Backend
venv\Scripts\activate
```

Then execute the project’s test suite as configured.

## SDK

The SDK provider tests are organized by provider and sync/async mode.

Examples:

``` cmd
cd SDK
python tests/test_openai_sync.py
python tests/test_openai_async.py
```

The same pattern is available for:

``` text
Groq
Gemini
Anthropic
DeepSeek
Ollama
```

The test files currently include:

``` text
test_openai_sync.py
test_openai_async.py

test_groq_sync.py
test_groq_async.py

test_gemini_sync.py
test_gemini_async.py

test_anthropic_sync.py
test_anthropic_async.py

test_deepseek_sync.py
test_deepseek_async.py

test_ollama_sync.py
test_ollama_async.py
```

Provider tests generally require valid provider credentials and a
reachable TraceForge backend when end-to-end telemetry is being tested.

------------------------------------------------------------------------

# SDK Packaging and PyPI

The SDK is a standalone package separate from the TraceForge application
itself.

Users should be able to install the SDK without installing the complete
backend and frontend platform.

The package’s Python import namespace is:

``` python
import traceforge
```

The distribution/project name is intended to be:

``` text
traceforge-instrumentation
```

The import name and distribution name do not have to be identical.

The SDK package is built from:

``` text
SDK/pyproject.toml
```

and documented independently in:

``` text
SDK/README.md
```
----------------------------------------------
# Development Entry Points

For quick reference:

| Component      | Local command                                                   | Working directory |
|----------------|-----------------------------------------------------------------|-------------------|
| Infrastructure | `docker compose up`                                             | repository root   |
| Backend        | `venv\Scripts\activate && uvicorn app.main:app`                 | `Backend/`        |
| Kafka Consumer | `venv\Scripts\activate && python -m app.kafka.consumer`         | `Backend/`        |
| Alert Handler  | `venv\Scripts\activate && python -m app.handlers.alert_handler` | `Backend/`        |
| Frontend       | `npm run dev`                                                   | `Frontend/`       |
| SDK test       | `python tests/test_<provider>_<mode>.py`                        | `SDK/`            |

------------------------------------------------------------------------

# Roadmap

Possible future improvements include:

- production Docker deployment
- richer alert rules and alert destinations
- stronger usage-limit reservation/reconciliation
- distributed worker scaling
- more provider integrations
- richer SDK metadata
- improved trace search
- more detailed cost reporting
- organization/tenant-level administration
- improved Chat query controls
- automated SDK publishing through GitHub Actions and PyPI Trusted
  Publishing
- deployment documentation for cloud environments

------------------------------------------------------------------------

# License

TraceForge is released under the MIT License.

See [LICENSE](LICENSE) for the complete license text.

------------------------------------------------------------------------

# Repository

GitHub:
https://github.com/ancientlaw0/TraceForge

------------------------------------------------------------------------

# Screenshots

## Login

![TraceForge Dashboard](Screenshots/Login.png)

## SignUp

![TraceForge Dashboard](Screenshots/SignUp.png)

## Dashboard

![TraceForge Dashboard](Screenshots/Dashboard_1.png)

![TraceForge Dashboard](Screenshots/Dashboard_2.png)

## Analytics

![TraceForge Dashboard](Screenshots/Analytics_1.png)

![TraceForge Dashboard](Screenshots/Analytics_2.png)

![TraceForge Dashboard](Screenshots/Analytics_3.png)

![TraceForge Dashboard](Screenshots/Analytics_4.png)

## Live

![TraceForge Dashboard](Screenshots/Live_1.png)

## API Keys 

![TraceForge Dashboard](Screenshots/APIKeys_1.png)

## Chat

![TraceForge Dashboard](Screenshots/Chat_1.png)

## Alerts

![TraceForge Dashboard](Screenshots/Alerts_1.png)

## Usage

![TraceForge Dashboard](Screenshots/Usage_1.png)