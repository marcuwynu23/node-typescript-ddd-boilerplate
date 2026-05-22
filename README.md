<div align="center">
  <h1>Node.js TypeScript DDD Boilerplate</h1>

  <p>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.3-blue.svg" alt="TypeScript"></a>
    <a href="https://expressjs.com/"><img src="https://img.shields.io/badge/Express-4.18-green.svg" alt="Express"></a>
    <a href="https://mongoosejs.com/"><img src="https://img.shields.io/badge/Mongoose-8.x-darkgreen.svg" alt="Mongoose"></a>
    <a href="https://en.wikipedia.org/wiki/Domain-driven_design"><img src="https://img.shields.io/badge/Architecture-DDD/Clean-red.svg" alt="DDD"></a>
  </p>

  <p>Enterprise-ready Node.js + TypeScript boilerplate using Domain-Driven Design (DDD) and Clean Architecture.</p>
</div>

## Architecture

This project follows Clean Architecture and DDD principles:

- **Domain**: Business entities, value objects, and repository interfaces (ports).
- **Application**: Use cases and orchestration.
- **Infrastructure**: Technical details (MongoDB/Mongoose, Config, Logging, Tracing).
- **Interface**: External adapters (HTTP Controllers, Routes, Middlewares).

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Start MongoDB (Docker)
docker run -d -p 27017:27017 --name mongo mongo:8

# Build
npm run build

# Run
npm start
```

## Commands

| Command            | Description              |
| ------------------ | ------------------------ |
| `npm run build`    | Build with esbuild       |
| `npm run dev`      | Watch mode (nodemon)     |
| `npm start`        | Start server (port 5000) |
| `npm test`         | Run Jest tests           |
| `npm run lint`     | Lint with Biome          |
| `npm run lint:fix` | Auto-fix lint issues     |
| `npm run check`    | Biome check (all)        |

## Environment Variables

| Variable             | Default                               | Description                    |
| -------------------- | ------------------------------------- | ------------------------------ |
| `NODE_ENV`           | `development`                         | Environment mode               |
| `PORT`               | `5000`                                | Server port                    |
| `HOST`               | `0.0.0.0`                             | Server host                    |
| `LOG_LEVEL`          | `info`                                | Pino log level                 |
| `MONGO_URI`          | `mongodb://localhost:27017/greetings` | MongoDB connection string      |
| `OPENTELEMETRY_URL`  | `http://localhost:4317`               | OTLP gRPC endpoint             |
| `SCALAR_ENABLED`     | `true`                                | Enable API docs at `/docs`     |
| `OPEN_API_SPEC_PATH` | `./openapi`                           | Path to OpenAPI spec directory |

## Endpoints

| Method | Route                | Description          |
| ------ | -------------------- | -------------------- |
| GET    | `/`                  | Hello message        |
| GET    | `/api/greetings`     | List all greetings   |
| GET    | `/api/greetings/:id` | Get greeting by ID   |
| POST   | `/api/greetings`     | Create greeting      |
| PUT    | `/api/greetings/:id` | Update greeting      |
| DELETE | `/api/greetings/:id` | Delete greeting      |
| GET    | `/health`            | Health check         |
| GET    | `/ready`             | Readiness check      |
| GET    | `/metrics`           | Prometheus metrics   |
| GET    | `/docs`              | Scalar API reference |
| GET    | `/openapi.yaml`      | Raw OpenAPI spec     |

### CRUD Example

```bash
# Create
curl -X POST http://localhost:5000/api/greetings \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World"}'

# List all
curl http://localhost:5000/api/greetings

# Get by ID
curl http://localhost:5000/api/greetings/<id>

# Update
curl -X PUT http://localhost:5000/api/greetings/<id> \
  -H "Content-Type: application/json" \
  -d '{"message": "Updated greeting"}'

# Delete
curl -X DELETE http://localhost:5000/api/greetings/<id>
```

## API Documentation (Scalar)

When `SCALAR_ENABLED=true`, interactive API docs are served at `/docs` powered by [Scalar](https://scalar.com/). The OpenAPI spec is available at `/openapi.yaml`.

## Database (MongoDB + Mongoose)

The app uses Mongoose with a repository pattern:

- **Domain layer** defines the `GreetingRepository` interface (port)
- **Infrastructure layer** implements it with `MongoGreetingRepository` (adapter)
- Connection is established on startup via `MONGO_URI`

### Running MongoDB locally

```bash
# Docker
docker run -d -p 27017:27017 --name mongo mongo:8

# Or use Docker Compose (see below)
```

## Docker

The Dockerfile is multi-stage and hardened for production:

- **Alpine base** with security patches
- **Non-root user** (`node`)
- **dumb-init** for proper PID 1 signal handling
- **npm removed** from production image (reduces attack surface)
- **HEALTHCHECK** built in

```bash
# Build
docker build -t node-typescript-ddd-boilerplate .

# Run (production)
docker run --rm -p 5000:5000 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/greetings \
  node-typescript-ddd-boilerplate

# Run (development)
docker build --target development -t node-typescript-ddd-boilerplate:dev .
docker run --rm -p 5000:5000 -v $(pwd):/app \
  node-typescript-ddd-boilerplate:dev
```

## CI/CD (GitHub Actions)

Two workflows in `.github/workflows/`:

- **test.yml** — runs lint and tests on PRs
- **release.yml** — builds, tests, pushes to GHCR, and runs Snyk security scans

### Snyk Integration

The release workflow includes:

- `snyk/actions/node` — scans npm dependencies for vulnerabilities
- `snyk/actions/docker` — scans the Docker image for OS and app CVEs

Requires a `SNYK_TOKEN` repository secret (Snyk PAT from [app.snyk.io](https://app.snyk.io) → Account Settings → Auth Token).

## Logging (pino + pino-http) and Loki

This app uses `pino` + `pino-http` to emit **structured JSON logs** (good for Loki).

### Run with JSON logs

```bash
npm run dev
```

### Control log level

```bash
# examples
set LOG_LEVEL=debug
set LOG_LEVEL=info
set LOG_LEVEL=warn
```

### Send logs to Loki with Promtail (Docker)

Below is a minimal local setup. It tails Docker container logs and pushes them to Loki.

1. Create `docker-compose.observability.yml`:

```yaml
services:
  loki:
    image: grafana/loki:2.9.6
    command: -config.file=/etc/loki/local-config.yaml
    ports:
      - "3100:3100"

  promtail:
    image: grafana/promtail:2.9.6
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - ./promtail-config.yml:/etc/promtail/config.yml:ro
    command: -config.file=/etc/promtail/config.yml
    depends_on:
      - loki
```

### Podman notes (instead of Docker Engine)

Promtail's `docker_sd_configs` can also work with **Podman** if you expose Podman's Docker-compatible API socket.

- **Rootful Podman socket**: `unix:///run/podman/podman.sock`
- **Rootless Podman socket** (common): `unix:///$XDG_RUNTIME_DIR/podman/podman.sock`

If the socket isn't running, start it (examples):

```bash
# rootful Linux
sudo podman system service --time=0 unix:///run/podman/podman.sock

# rootless Linux
podman system service --time=0 unix:///$XDG_RUNTIME_DIR/podman/podman.sock
```

Then, in `docker-compose.observability.yml`, mount the Podman socket into Promtail and update the host in `promtail-config.yml` (shown below). Example (rootful socket):

```yaml
promtail:
  image: grafana/promtail:2.9.6
  volumes:
    - /run/podman/podman.sock:/var/run/docker.sock
    - ./promtail-config.yml:/etc/promtail/config.yml:ro
  command: -config.file=/etc/promtail/config.yml
  depends_on:
    - loki
```

2. Create `promtail-config.yml`:

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: [__meta_docker_container_name]
        regex: "/(.*)"
        target_label: container
    pipeline_stages:
      - json:
          expressions:
            level: level
            msg: msg
            time: time
            req: req
            res: res
      - labels:
          level:
          container:
```

### Alternative: tail application log files (no Docker/Podman service discovery)

If you **don't** want `docker_sd_configs`, you can have Promtail tail plain log files using `static_configs` + `__path__`.

This requires your app container to **write logs to a file** (not just stdout). The easiest approach is:

- mount a shared volume at `/var/log/express`
- redirect app stdout/stderr to `/var/log/express/app.log`
- have Promtail read `/var/log/express/*.log`

Update `promtail-config.yml` like this:

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: express-logs
    static_configs:
      - targets: [localhost]
        labels:
          job: express
          app: api
          __path__: /var/log/express/*.log
    pipeline_stages:
      - json:
          expressions:
            level: level
            msg: msg
            time: time
            req: req
            res: res
      - labels:
          level:
          app:
```

Then update `docker-compose.observability.yml` to include your app image (example uses `node-typescript-ddd-boilerplate:latest`) and a shared log volume:

```yaml
services:
  loki:
    image: grafana/loki:2.9.6
    command: -config.file=/etc/loki/local-config.yaml
    ports:
      - "3100:3100"

  app:
    image: node-typescript-ddd-boilerplate:latest
    ports:
      - "5000:5000"
    volumes:
      - express-logs:/var/log/express
    command: ["sh", "-c", "node dist/index.js >> /var/log/express/app.log 2>&1"]

  promtail:
    image: grafana/promtail:2.9.6
    volumes:
      - ./promtail-config.yml:/etc/promtail/config.yml:ro
      - express-logs:/var/log/express:ro
    command: -config.file=/etc/promtail/config.yml
    depends_on:
      - loki

volumes:
  express-logs:
```

3. Start Loki + Promtail:

```bash
docker compose -f docker-compose.observability.yml up -d
```

4. Run this app in Docker so Promtail can read logs from Docker:

```bash
docker build -t node-typescript-ddd-boilerplate .
docker run --rm -p 5000:5000 --name node-typescript-ddd-boilerplate node-typescript-ddd-boilerplate
```

5. Query logs in Grafana (see Grafana section below) using a label selector like:

- `{container="node-typescript-ddd-boilerplate"}`

## Metrics (Prometheus) and Grafana

This app exposes metrics at `GET /metrics` (Prometheus text exposition format).

### Prometheus scrape config

Add this to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: node-typescript-ddd-boilerplate
    metrics_path: /metrics
    static_configs:
      - targets: ["host.docker.internal:5000"]
```

If Prometheus is running on the host (not in Docker), you can instead use:

```yaml
- targets: ["localhost:5000"]
```

### Run Prometheus + Grafana (Docker)

1. Create `docker-compose.metrics.yml`:

```yaml
services:
  prometheus:
    image: prom/prometheus:v2.55.1
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro

  grafana:
    image: grafana/grafana:11.2.0
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
    depends_on:
      - prometheus
```

2. Create `prometheus.yml` in the repo root:

```yaml
global:
  scrape_interval: 5s

scrape_configs:
  - job_name: node-typescript-ddd-boilerplate
    metrics_path: /metrics
    static_configs:
      - targets: ["host.docker.internal:5000"]
```

3. Start services:

```bash
docker compose -f docker-compose.metrics.yml up -d
```

### Add Prometheus datasource in Grafana

- Open Grafana at `http://localhost:3000`
- Login with `admin` / `admin`
- Add datasource: **Prometheus**
  - URL: `http://prometheus:9090`

### Example Grafana queries

- **Request rate**:
  - `sum(rate(http_requests_total[1m])) by (route, status_code)`
- **Latency (p95)**:
  - `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))`

## Project Structure

```text
src/
├── domain/
│   ├── entities/          # Greeting entity
│   └── repositories/      # Repository interfaces (ports)
├── application/
│   └── use-cases/         # GetGreeting, CreateGreeting, UpdateGreeting, DeleteGreeting
├── infrastructure/
│   ├── config/            # Environment config
│   ├── database/          # Mongoose connection, models, repository implementations
│   ├── observability/     # Pino logger
│   └── tracer/            # OpenTelemetry tracing
├── interface/
│   ├── http/
│   │   ├── controllers/   # GreetingController, HealthController, DocsAPIController
│   │   └── routes/        # Express router
│   └── middlewares/       # httpLogger, metrics, scalar
├── tests/
│   ├── domain/            # Entity unit tests
│   ├── application/       # Use case unit tests
│   └── interface/         # Controller unit tests
└── index.ts               # Entry point
```

## Security

- Hardened Dockerfile (non-root, dumb-init, npm removed in production)
- Helmet middleware with CSP for API docs
- Snyk scanning in CI (dependencies + Docker image)
- Input validation on all CRUD endpoints
