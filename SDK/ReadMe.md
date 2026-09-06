
# TraceForge

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/badge/GitHub-TraceForge-black.svg)](https://github.com/ancientlaw0/TraceForge)

**LLM observability SDK for tracking requests, responses, latency, token usage, cost, and errors across multiple LLM providers.**

TraceForge makes it easy to add LLM observability to Python applications with minimal changes to existing code.

It instruments your existing LLM clients and automatically captures telemetry for every request without requiring changes to your application logic.

---

## Features

- Automatic LLM request and response tracing
- Provider and model identification
- Prompt and response capture
- Request latency measurement
- Input and output token tracking
- Automatic cost calculation
- Success, error, and timeout tracking
- Error message capture
- Synchronous client support
- Asynchronous client support
- Multiple LLM providers through a single SDK
- Background telemetry transmission
- Minimal changes to existing applications

---

## Supported Providers

TraceForge currently supports:

| Provider | Sync | Async |
|---|---:|---:|
| OpenAI | Yes | Yes |
| Groq | Yes | Yes |
| Google Gemini | Yes | Yes |
| Anthropic | Yes | Yes |
| DeepSeek | Yes | Yes |
| Ollama | Yes | Yes |

The same TraceForge SDK is used for all supported providers.

---

# Installation

Install TraceForge directly from PyPI:

```bash
pip install traceforge-instrumentation
````

TraceForge is designed to provide a single installation experience rather than requiring separate provider-specific packages.

---

# Quick Start

## 1. Initialize TraceForge

Initialize the SDK once when your application starts.

```
import traceforge

traceforge.init(
    api_key="YOUR_TRACEFORGE_API_KEY",
    endpoint="http://localhost:8000"
)
```

The `api_key` is your TraceForge API key.

The `endpoint` is the TraceForge backend endpoint where telemetry will be sent.

---

## 2. Create your LLM client

Create the client normally using the provider's SDK.

For example, with OpenAI:

```
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_OPENAI_API_KEY"
)
```

---

## 3. Instrument the client

Pass the client to the corresponding TraceForge instrumentation function:

```
traceforge.instrument_openai(client)
```

TraceForge patches the client's request method and automatically records the resulting LLM calls.

---

## 4. Use the provider normally

No changes are required to your existing LLM request.


```
response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[
        {
            "role": "user",
            "content": "Explain recursion in one sentence."
        }
    ]
)

print(response.choices[0].message.content)
```

TraceForge automatically records the request in the background.

---

## 5. Flush pending telemetry

For synchronous applications:

```
traceforge.flush_sync()
```

For asynchronous applications:


```
await traceforge.flush()
```

---

# Complete OpenAI Example

```
import traceforge
from openai import OpenAI

traceforge.init(
    api_key="YOUR_TRACEFORGE_API_KEY",
    endpoint="http://localhost:8000"
)

client = OpenAI(
    api_key="YOUR_OPENAI_API_KEY"
)

traceforge.instrument_openai(client)

response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[
        {
            "role": "user",
            "content": "Explain recursion in one sentence."
        }
    ]
)

print(response.choices[0].message.content)

traceforge.flush_sync()
```

---

# Async OpenAI

TraceForge also supports asynchronous OpenAI clients.


```
import asyncio
import traceforge

from openai import AsyncOpenAI


async def main():

    traceforge.init(
        api_key="YOUR_TRACEFORGE_API_KEY",
        endpoint="http://localhost:8000"
    )

    client = AsyncOpenAI(
        api_key="YOUR_OPENAI_API_KEY"
    )

    traceforge.instrument_openai(client)

    response = await client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "user",
                "content": "Explain recursion in one sentence."
            }
        ]
    )

    print(response.choices[0].message.content)

    await traceforge.flush()


if __name__ == "__main__":
    asyncio.run(main())
```

The same `instrument_openai()` function works with both `OpenAI` and `AsyncOpenAI`.

---

# Groq

TraceForge supports both synchronous and asynchronous Groq clients.

## Synchronous

```
import traceforge

from groq import Groq


traceforge.init(
    api_key="YOUR_TRACEFORGE_API_KEY",
    endpoint="http://localhost:8000"
)

client = Groq(
    api_key="YOUR_GROQ_API_KEY"
)

traceforge.instrument_groq(client)

response = client.chat.completions.create(
    model="openai/gpt-oss-20b",
    messages=[
        {
            "role": "user",
            "content": "What is a binary tree?"
        }
    ]
)

print(response.choices[0].message.content)

traceforge.flush_sync()
```

## Asynchronous

```
import asyncio
import traceforge

from groq import AsyncGroq


async def main():

    traceforge.init(
        api_key="YOUR_TRACEFORGE_API_KEY",
        endpoint="http://localhost:8000"
    )

    client = AsyncGroq(
        api_key="YOUR_GROQ_API_KEY"
    )

    traceforge.instrument_groq(client)

    response = await client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": "What is a binary tree?"
            }
        ]
    )

    print(response.choices[0].message.content)

    await traceforge.flush()


if __name__ == "__main__":
    asyncio.run(main())
```

---

# Google Gemini

TraceForge supports the Google Gemini Python SDK.

```
import traceforge

from google import genai


traceforge.init(
    api_key="YOUR_TRACEFORGE_API_KEY",
    endpoint="http://localhost:8000"
)

client = genai.Client(
    api_key="YOUR_GEMINI_API_KEY"
)

traceforge.instrument_gemini(client)

response = client.models.generate_content(
    model="gemini-2.5-flash-lite",
    contents="Explain recursion in one sentence."
)

print(response.text)

traceforge.flush_sync()
```

---

## Async Gemini

Gemini exposes asynchronous functionality through the client's `aio` interface.

TraceForge instruments both the synchronous and asynchronous Gemini interfaces.

```
import asyncio
import traceforge

from google import genai


async def main():

    traceforge.init(
        api_key="YOUR_TRACEFORGE_API_KEY",
        endpoint="http://localhost:8000"
    )

    client = genai.Client(
        api_key="YOUR_GEMINI_API_KEY"
    )

    traceforge.instrument_gemini(client)

    response = await client.aio.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents="Explain recursion in one sentence."
    )

    print(response.text)

    await traceforge.flush()


if __name__ == "__main__":
    asyncio.run(main())
```

---

# Anthropic

TraceForge supports Anthropic's synchronous and asynchronous clients.

## Synchronous

```
import traceforge

from anthropic import Anthropic


traceforge.init(
    api_key="YOUR_TRACEFORGE_API_KEY",
    endpoint="http://localhost:8000"
)

client = Anthropic(
    api_key="YOUR_ANTHROPIC_API_KEY"
)

traceforge.instrument_anthropic(client)

response = client.messages.create(
    model="claude-haiku-4-5",
    max_tokens=100,
    messages=[
        {
            "role": "user",
            "content": "Explain recursion in one sentence."
        }
    ]
)

print(response.content)

traceforge.flush_sync()
```

## Asynchronous

```
import asyncio
import traceforge

from anthropic import AsyncAnthropic


async def main():

    traceforge.init(
        api_key="YOUR_TRACEFORGE_API_KEY",
        endpoint="http://localhost:8000"
    )

    client = AsyncAnthropic(
        api_key="YOUR_ANTHROPIC_API_KEY"
    )

    traceforge.instrument_anthropic(client)

    response = await client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=100,
        messages=[
            {
                "role": "user",
                "content": "Explain recursion in one sentence."
            }
        ]
    )

    print(response.content)

    await traceforge.flush()


if __name__ == "__main__":
    asyncio.run(main())
```

---

# DeepSeek

DeepSeek can be used through its OpenAI-compatible API.

TraceForge supports both synchronous and asynchronous OpenAI-compatible clients configured for DeepSeek.

## Synchronous

```
import os
import traceforge

from openai import OpenAI


traceforge.init(
    api_key="YOUR_TRACEFORGE_API_KEY",
    endpoint="http://localhost:8000"
)

client = OpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url="https://api.deepseek.com"
)

traceforge.instrument_deepseek(client)

response = client.chat.completions.create(
    model="deepseek-v4-flash",
    messages=[
        {
            "role": "user",
            "content": "Explain recursion in one sentence."
        }
    ]
)

print(response.choices[0].message.content)

traceforge.flush_sync()
```

## Asynchronous

```
import asyncio
import os
import traceforge

from openai import AsyncOpenAI


async def main():

    traceforge.init(
        api_key="YOUR_TRACEFORGE_API_KEY",
        endpoint="http://localhost:8000"
    )

    client = AsyncOpenAI(
        api_key=os.getenv("DEEPSEEK_API_KEY"),
        base_url="https://api.deepseek.com"
    )

    traceforge.instrument_deepseek(client)

    response = await client.chat.completions.create(
        model="deepseek-v4-flash",
        messages=[
            {
                "role": "user",
                "content": "Explain recursion in one sentence."
            }
        ]
    )

    print(response.choices[0].message.content)

    await traceforge.flush()


if __name__ == "__main__":
    asyncio.run(main())
```

---

# Ollama

TraceForge also supports local Ollama deployments.

## Synchronous

```
import traceforge
import ollama


traceforge.init(
    api_key="YOUR_TRACEFORGE_API_KEY",
    endpoint="http://localhost:8000"
)

client = ollama.Client()

traceforge.instrument_ollama(client)

response = client.generate(
    model="llama3.2",
    prompt="Explain recursion in one sentence."
)

print(response["response"])

traceforge.flush_sync()
```

## Asynchronous

```
import asyncio
import traceforge
import ollama


async def main():

    traceforge.init(
        api_key="YOUR_TRACEFORGE_API_KEY",
        endpoint="http://localhost:8000"
    )

    client = ollama.AsyncClient()

    traceforge.instrument_ollama(client)

    response = await client.generate(
        model="llama3.2",
        prompt="Explain recursion in one sentence."
    )

    print(response["response"])

    await traceforge.flush()


if __name__ == "__main__":
    asyncio.run(main())
```

---

# How Instrumentation Works

TraceForge uses lightweight runtime instrumentation rather than requiring users to rewrite their application code.

The basic flow is:

```
Your Application
       |
       v
LLM Client
       |
       v
TraceForge Instrumentation
       |
       +------> Original LLM Request
       |
       v
Trace Collection
       |
       v
Background Telemetry
       |
       v
TraceForge Backend
```

When an instrumented method is called, TraceForge:

1.  Extracts request information. 
2.  Starts a latency timer. 
3.  Executes the original provider method. 
4.  Extracts the response. 
5.  Calculates token usage and cost where available. 
6.  Records the request status. 
7.  Creates a Trace object. 
8.  Sends telemetry to the TraceForge backend. 

The original provider response is returned normally to your application.

---

# Sync and Async Support

TraceForge supports both synchronous and asynchronous LLM clients.

The SDK determines whether the underlying provider method is synchronous or asynchronous and wraps it accordingly.

For example:

```
client = OpenAI(...)
traceforge.instrument_openai(client)
```

uses synchronous instrumentation.

While:


```
client = AsyncOpenAI(...)
traceforge.instrument_openai(client)
```

uses asynchronous instrumentation.

No separate TraceForge integration is required.

---

# Initialization

Initialize TraceForge once:


```
traceforge.init(
    api_key="YOUR_TRACEFORGE_API_KEY",
    endpoint="http://localhost:8000"
)
```

### Parameters

| ParameterDescription |                             |
| -------------------- | --------------------------- |
| `api_key`            | TraceForge API key          |
| `endpoint`           | TraceForge backend endpoint |

The endpoint defaults to:


```
http://localhost:8000
```

Therefore:


```
traceforge.init(
    api_key="YOUR_TRACEFORGE_API_KEY"
)
```

is also valid when using a local TraceForge backend.

---

# Instrumentation Functions

TraceForge exposes a provider-specific instrumentation function for each supported provider.

| ProviderFunction |                                           |
| ---------------- | ----------------------------------------- |
| OpenAI           | `traceforge.instrument_openai(client)`    |
| Groq             | `traceforge.instrument_groq(client)`      |
| Gemini           | `traceforge.instrument_gemini(client)`    |
| Anthropic        | `traceforge.instrument_anthropic(client)` |
| DeepSeek         | `traceforge.instrument_deepseek(client)`  |
| Ollama           | `traceforge.instrument_ollama(client)`    |

The client should be created normally using the provider's SDK and then passed to the appropriate instrumentation function.

---

# Captured Trace Data

Each LLM request produces a Trace containing information such as:


```
Trace
├── trace_id
├── provider
├── model
├── prompt
├── response
├── latency_ms
├── input_tokens
├── output_tokens
├── cost
├── status
├── error_message
└── metadata_trace
```

### Provider

Identifies the LLM provider.

Example:

```
openai
groq
gemini
anthropic
deepseek
ollama
```

### Model

The model used for the request.

Example:


```
gpt-4.1-mini
```

### Prompt

The extracted user input or request content.

### Response

The generated model response.

### Latency

The time taken by the LLM request in milliseconds.

Example:

```
842.37 ms
```

### Input Tokens

Number of tokens contained in the input.

### Output Tokens

Number of tokens generated by the model.

### Cost

Estimated request cost based on the model's configured pricing.

### Status

TraceForge records the request status as one of:


```
success
error
timeout
```

### Error Message

If a provider request fails, TraceForge captures the associated error message when available.

### Metadata

Additional provider-specific information can be stored in:

```
metadata_trace
```

---

# Error Handling

TraceForge is designed so that telemetry failures do not break the application's LLM workflow.

Telemetry transmission errors are handled internally by the recorder.

For example, if the TraceForge backend is temporarily unavailable, the application can still receive the original provider response.

Telemetry errors are reported separately rather than replacing the original LLM error.

---

# Flushing Telemetry

TraceForge sends telemetry asynchronously where possible so that telemetry transmission does not unnecessarily block the LLM request.

Before shutting down an application, it is recommended to flush pending traces.

## Synchronous applications


```
traceforge.flush_sync()
```

## Asynchronous applications

```
await traceforge.flush()
```

For example:

```
try:
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "user",
                "content": "Hello"
            }
        ]
    )
finally:
    traceforge.flush_sync()
```

---

# Using Environment Variables

For production applications, API keys should not be hard-coded.

Example:


```
TRACEFORGE_API_KEY=your_traceforge_key
OPENAI_API_KEY=your_openai_key
```

Then:

```
import os
import traceforge

from openai import OpenAI


traceforge.init(
    api_key=os.getenv("TRACEFORGE_API_KEY"),
    endpoint="http://localhost:8000"
)

client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

traceforge.instrument_openai(client)
```

---

# Multiple Providers

TraceForge can instrument multiple providers in the same application.

For example:

```
import traceforge

from openai import OpenAI
from groq import Groq


traceforge.init(
    api_key="YOUR_TRACEFORGE_API_KEY",
    endpoint="http://localhost:8000"
)

openai_client = OpenAI(
    api_key="YOUR_OPENAI_API_KEY"
)

groq_client = Groq(
    api_key="YOUR_GROQ_API_KEY"
)

traceforge.instrument_openai(openai_client)
traceforge.instrument_groq(groq_client)
```

Both providers can then be used normally.

TraceForge identifies the provider and model for each trace.

---

# Minimal Integration

Adding TraceForge to an existing application generally requires only three steps:

### Before

```
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_OPENAI_API_KEY"
)

response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[
        {
            "role": "user",
            "content": "Hello"
        }
    ]
)
```

### After


```
import traceforge

from openai import OpenAI


traceforge.init(
    api_key="YOUR_TRACEFORGE_API_KEY"
)

client = OpenAI(
    api_key="YOUR_OPENAI_API_KEY"
)

traceforge.instrument_openai(client)

response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[
        {
            "role": "user",
            "content": "Hello"
        }
    ]
)

traceforge.flush_sync()
```

The actual LLM request remains unchanged.

---

# Architecture

TraceForge consists of several core components.

```
                 LLM Application
                       |
                       v
              Provider Integration
                       |
                       v
                    Patcher
                       |
                       v
               Original LLM Call
                       |
                       v
                    Trace
                       |
                       v
                   Recorder
                       |
                       v
                  HTTPTransport
                       |
                       v
                TraceForge API
```

### Provider Integrations

Each provider integration is responsible for understanding the provider's request and response format.

### Patcher

The patcher wraps the provider's target method while preserving the original client interface.

### Trace

The Trace object represents a single LLM operation and contains the collected telemetry.

### Recorder

The recorder handles telemetry submission without requiring the application to manually send each trace.

### HTTP Transport

The HTTP transport sends traces to the configured TraceForge backend.

---

# Project Structure

The SDK is organized into provider integrations and core tracing components.

```
traceforge/
├── __init__.py
├── config.py
├── patcher.py
├── recorder.py
├── trace.py
├── transport.py
└── integrations/
    ├── __init__.py
    ├── base.py
    ├── openai.py
    ├── groq.py
    ├── gemini.py
    ├── anthropic.py
    ├── deepseek.py
    └── ollama.py
```

---

# Development

Clone the repository and navigate to the SDK directory:

```
git clone https://github.com/ancientlaw0/TraceForge
cd traceForge/SDK
```

Create a virtual environment:

```
python -m venv .venv
```

Activate it on Windows:

```
.venv\Scripts\activate
```

Activate it on Linux/macOS:

```
source .venv/bin/activate
```

Install the SDK in editable mode:

```
pip install -e .
```

Install the test dependencies required for provider testing as needed.

---

# Running Tests

The SDK contains tests for synchronous and asynchronous provider integrations.


```
tests/
├── test_openai_sync.py
├── test_openai_async.py
├── test_groq_sync.py
├── test_groq_async.py
├── test_gemini_sync.py
├── test_gemini_async.py
├── test_anthropic_sync.py
├── test_anthropic_async.py
├── test_deepseek_sync.py
├── test_deepseek_async.py
├── test_ollama_sync.py
└── test_ollama_async.py
```

The SDK includes test scripts for synchronous and asynchronous integrations
across all supported providers.

Each test can be run directly using Python.

For example:

```bash
python tests/test_openai_sync.py

Provider API keys should be supplied through environment variables rather than committed to the repository.

---

# Requirements

Provider integrations require the corresponding provider SDKs.

Examples:

```
pip install openai
pip install groq
pip install anthropic
pip install google-genai
pip install ollama
```

These provider SDKs are used by the application itself and are not required to use TraceForge's core tracing functionality.

---

# Security

TraceForge API keys should be treated as secrets.

Do not commit API keys to source control.

Recommended:

```
import os

traceforge.init(
    api_key=os.getenv("TRACEFORGE_API_KEY")
)
```

instead of:


```
traceforge.init(
    api_key="actual-secret-key"
)
```

Provider API keys should be handled in the same way.

---

# Compatibility

TraceForge is designed to work with both synchronous and asynchronous Python applications.

The provider-specific integration is selected explicitly through the corresponding instrumentation function, while the SDK automatically determines whether the supplied client method is synchronous or asynchronous.

---

# Roadmap

Potential future improvements include:

-  Streaming response instrumentation 
-  More LLM providers 
-  More detailed provider metadata 
-  Additional cost models 
-  Advanced batching 
-  Retry handling for telemetry delivery 
-  Configurable telemetry sampling 
-  Additional instrumentation targets 

---

# Contributing

Contributions, bug reports, and feature requests are welcome.

Before submitting a change:

1.  Create a branch. 
2.  Make the required changes. 
3.  Add or update tests. 
4.  Verify both synchronous and asynchronous behavior where applicable. 
5.  Submit a pull request. 

---

# License

TraceForge is released under the MIT License.

See the `LICENSE` file for the complete license text.

---

# Author

[GitHub](https://github.com/ancientlaw0)

An LLM observability platform and Python SDK for monitoring LLM applications.
