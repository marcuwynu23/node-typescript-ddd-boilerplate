# Express + TypeScript + esbuild Sample

A minimal Express.js project with TypeScript and esbuild.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18-green.svg)](https://expressjs.com/)
[![esbuild](https://img.shields.io/badge/esbuild-0.19-orange.svg)](https://esbuild.github.io/)

## Quick Start

```bash
# Install dependencies
npm install

# Build
npm run build

# Run
npm start
```

## Commands

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run build` | Build with esbuild       |
| `npm run dev`   | Watch mode               |
| `npm start`     | Start server (port 5000) |
| `npm test`      | Run Jest tests           |

## Endpoints

| Method | Endpoint      | Description        |
| ------ | ------------- | ------------------ |
| GET    | `/`           | Hello message      |
| GET    | `/api/health` | Health check       |
| GET    | `/metrics`    | Prometheus metrics |

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

Promtail’s `docker_sd_configs` can also work with **Podman** if you expose Podman’s Docker-compatible API socket.

- **Rootful Podman socket**: `unix:///run/podman/podman.sock`
- **Rootless Podman socket** (common): `unix:///$XDG_RUNTIME_DIR/podman/podman.sock`

If the socket isn’t running, start it (examples):

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

If you **don’t** want `docker_sd_configs`, you can have Promtail tail plain log files using `static_configs` + `__path__`.

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

Then update `docker-compose.observability.yml` to include your app image (example uses `express-typescript-sample:latest`) and a shared log volume:

```yaml
services:
  loki:
    image: grafana/loki:2.9.6
    command: -config.file=/etc/loki/local-config.yaml
    ports:
      - "3100:3100"

  app:
    image: express-typescript-sample:latest
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
docker build -t express-typescript-sample .
docker run --rm -p 5000:5000 --name express-typescript-sample express-typescript-sample
```

5. Query logs in Grafana (see Grafana section below) using a label selector like:

- `{container="express-typescript-sample"}`

## Metrics (Prometheus) and Grafana

This app exposes metrics at `GET /metrics` (Prometheus text exposition format).

### Prometheus scrape config

Add this to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: express-typescript-sample
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
  - job_name: express-typescript-sample
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

```
express-typescript-sample/
├── src/
│   └── index.ts       # Express app entry point
├── dist/               # Compiled output
├── build.js            # esbuild configuration
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies
└── README.md           # This file
```
