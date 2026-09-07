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
19. Performance
20. Testing
21. SDK Packaging and PyPI
22. Common Development Workflow
23. Roadmap
24. License

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
├── docker-compose.yml       # Complete stack orchestration
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
- live
- Chat
- Alerts
- Usage
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

# Quick Start

TraceForge is provided as a fully containerized application.

Docker Compose starts the complete TraceForge stack, including the database,
cache, event broker, backend services, and frontend.

## Prerequisites

Install:

- Git
- Docker Desktop

No separate Python, Node.js, PostgreSQL, Redis, or Redpanda installation is
required when running TraceForge through Docker Compose.

---

## Clone the Repository

```bash
git clone https://github.com/ancientlaw0/TraceForge.git
cd TraceForge
````

---

## Environment Configuration

Create the required environment configuration using the provided
`.env.example` files.

Never commit real secrets or production credentials.

When running through Docker Compose, application services communicate using
their Compose service names.

```text
PostgreSQL → postgres
Redis      → redis
Redpanda   → redpanda
Backend    → backend
```

For example:

```env
REDIS_HOST=redis
REDIS_PORT=6379
KAFKA_BOOTSTRAP_SERVERS=redpanda:9092
```

The backend database connection uses the PostgreSQL service name:

```text
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@postgres:5432/DATABASE
```

`localhost` refers to the current container when used from inside Docker.
Docker services therefore communicate through their Compose service names.

---

# Run TraceForge

From the root of the repository:

```bash
docker compose up --build
```

This builds the required application images and starts the complete TraceForge
stack.

The stack contains:

```text
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

To run the application in the background:

```bash
docker compose up --build -d
```

Check the running services:

```bash
docker compose ps
```

A successful startup should contain:

```text
postgres
redis
redpanda
backend
kafka-consumer
alert-handler
frontend
```

---

# Access the Application

Once the containers are running:

### Frontend

```text
http://localhost:5173
```

### Backend

```text
http://localhost:8000
```

The browser accesses the application through the ports published by Docker.

Docker-internal services communicate through their Compose service names.

---

# Docker Architecture

The Docker-related files are organized as:

```text
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

The root `Dockerfile` is used by the Python services:

```text
Backend
Kafka Consumer
Alert Handler
```

The frontend uses its own Dockerfile because it runs on Node.js and Vite.

The root `docker-compose.yml` orchestrates the complete application stack.

---

# Docker Services

## PostgreSQL

PostgreSQL is TraceForge's persistent relational datastore.

```yaml
image: postgres:15
```

Database data is persisted using the Docker volume:

```text
postgres_data
```

The backend connects to PostgreSQL through:

```text
postgres:5432
```

Database migrations are managed using Alembic.

The repository includes:

```text
Backend/alembic.ini
```

and the Alembic migration environment.

---

## Redis

Redis provides low-latency infrastructure used by TraceForge for:

* usage counters
* quota enforcement
* analytics metrics
* other fast-access application state

The Redis container uses:

```yaml
image: redis:7-alpine
```

Inside the Docker network, Redis is available at:

```text
redis:6379
```

Redis data is persisted using:

```text
redis_data
```

TraceForge separates Redis responsibilities through services such as:

```text
RedisMetricsService
RedisUsageService
```

This keeps analytics processing separate from usage and quota enforcement.

---

## Kafka / Redpanda

Redpanda provides the Kafka-compatible event streaming layer used by
TraceForge.

The Docker deployment uses:

```yaml
image: redpandadata/redpanda:latest
```

Application services connect to Redpanda through:

```text
redpanda:9092
```

Redpanda data is persisted using:

```text
redpanda_data
```

The backend event-processing layer uses `aiokafka` to communicate with the
Kafka-compatible broker.

Kafka/Redpanda is used for asynchronous processing so event workloads can be
handled independently from the main HTTP request process.

---

## Backend

The FastAPI backend is built using the root `Dockerfile`.

The container runs the application through Uvicorn:

```text
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 6
```

The backend is published to the host at:

```text
http://localhost:8000
```

The backend supports multiple Uvicorn workers.

Worker count should be selected according to available CPU resources and the
application workload.

More workers do not automatically mean higher performance. Throughput and
latency should be validated using load testing.

---

## Kafka Consumer

The Kafka consumer uses the same Python image as the backend but runs as a
separate container.

It starts with:

```text
python -m app.kafka.consumer
```

The consumer processes asynchronous events from Redpanda independently of the
main FastAPI process.

---

## Alert Handler

The alert handler also uses the shared Python application image.

It starts with:

```text
python -m app.handlers.alert_handler
```

The alert handler processes alert-related events independently from the main
API process.

Running the backend, Kafka consumer, and alert handler as separate containers
keeps their workloads isolated while allowing them to share the same
application image and dependencies.

---

## Frontend

The frontend is built separately using:

```text
Frontend/Dockerfile
```

It runs the Vite development server inside a Node.js container:

```text
npm run dev -- --host 0.0.0.0
```

The frontend is published to:

```text
http://localhost:5173
```

The browser accesses the frontend through the published host port.

---

# Docker Networking

Docker Compose creates an internal network for the application services.

Inside this network, services communicate using their Compose service names.

```text
Backend
   │
   ├── PostgreSQL → postgres:5432
   ├── Redis      → redis:6379
   └── Redpanda   → redpanda:9092
```

The host machine accesses published services through `localhost`.

```text
Browser
   │
   ├── Frontend → localhost:5173
   └── Backend  → localhost:8000
```

This allows the application services to communicate internally without
changing application code between containers.

---

# Docker Logs

View logs for the complete stack:

```bash
docker compose logs -f
```

View logs for the backend:

```bash
docker compose logs -f backend
```

View logs for the Kafka consumer:

```bash
docker compose logs -f kafka-consumer
```

View logs for the alert handler:

```bash
docker compose logs -f alert-handler
```

View logs for the frontend:

```bash
docker compose logs -f frontend
```

---

# Stopping TraceForge

Stop the running containers:

```bash
docker compose down
```

This stops and removes the containers while keeping the named Docker volumes.

To remove the containers and persistent volumes:

```bash
docker compose down -v
```

The `-v` option removes the PostgreSQL, Redis, and Redpanda volumes and
therefore deletes their persisted local data.

Use this only when you intentionally want to reset the local environment.

---

# Development

Docker Compose is the recommended way to run the complete TraceForge stack
from a fresh clone.

The repository also contains:

```text
.vscode/tasks.json
```

with a `Start Everything` development task.

This workflow is intended for contributors who want to run individual
application components directly from VS Code for development and debugging.

The Docker Compose setup remains the primary reproducible environment for
running the complete platform.

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

Local Development Reference

| Component      | Local command                                                   | Working directory |
|----------------|-----------------------------------------------------------------|-------------------|
| Infrastructure | `docker compose up`                                             | repository root   |
| Backend        | `venv\Scripts\activate && uvicorn app.main:app`                 | `Backend/`        |
| Kafka Consumer | `venv\Scripts\activate && python -m app.kafka.consumer`         | `Backend/`        |
| Alert Handler  | `venv\Scripts\activate && python -m app.handlers.alert_handler` | `Backend/`        |
| Frontend       | `npm run dev`                                                   | `Frontend/`       |
| SDK test       | `python tests/test_<provider>_<mode>.py`                        | `SDK/`            |

These commands are intended for contributors working on individual
components. For running the complete platform, use Docker Compose.

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