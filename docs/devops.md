# DevOps & Operations

## Environments

- Profiles: dev, staging, prod.
- Config via env vars (.env for local only); secrets in vault/secret manager.

## Database

- PostgreSQL; migrations with Flyway/Liquibase.
- Backups: daily snapshots; tested restore playbook.
- Connection pooling configured per env; SSL in prod.

## Storage

- Object storage (S3-compatible) for photos, PDFs, EFD receipts; signed URLs.
- Virus scan and size limits on upload.

## CI/CD

- Steps: lint → test → build → migrations dry-run → package.
- Backend: Maven build; Frontend: npm/yarn build.
- Artifacts: backend jar/image; frontend static bundle.

## Container Strategy & Orchestration

- **Containerization**: All services Dockerized (Multi-stage builds: Build -> Runtime).
- **Orchestration**: Kubernetes (K8s) for Prod/Staging, Docker Compose for Dev.
  - _Manifests_: Helm charts for managing deployments, services, and ingress.
  - _Scaling_: HPA (Horizontal Pod Autoscaler) based on CPU/Memory and custom metrics (queue depth).

## Observability Stack

- **Metrics**: Prometheus for scraping `/actuator/prometheus` endpoints.
- **Visualization**: Grafana Dashboards (JVM stats, HikariCP pool, API Latency, Business Metrics).
- **Logs**: Loki (or ELK) for log aggregation; Promtail for shipping logs.
- **Tracing**: Zipkin/Jaeger for distributed tracing (correlated via `traceId`).

## CORS & Security Headers

- Strict origin allowlist; HSTS; content security policy tuned for assets and API.

## Backup & Disaster Recovery (DR)

- **Database**:
  - _Strategy_: Continuous archiving (WAL) + Daily Full Snapshots.
  - _Retention_: 30 days daily, 12 months monthly.
  - _Testing_: Automated weekly restore to a "Verify" environment.
- **Object Storage**: Versioning enabled; Cross-region replication (if budget permits) or periodic sync to secondary provider.
- **RPO/RTO**: Target RPO < 15 mins, RTO < 4 hours.

## WhatsApp & Email Gateways

- External gateway credentials rotated; timeout/retry strategy; dead-letter on failures.

## Performance & Caching

- Cache static catalogs/BOQ; CDN for frontend assets.
- Pagination everywhere; avoid N+1 with JPA fetch tuning.
