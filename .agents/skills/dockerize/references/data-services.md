# Stateful Services & Healthchecks

Pinned images, named volumes, env-overridable ports, and verified healthchecks.

## PostgreSQL (`postgres:16-alpine`)
```yaml
postgres:
  image: postgres:16-alpine
  restart: unless-stopped
  environment:
    POSTGRES_USER: ${POSTGRES_USER:-postgres}
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
    POSTGRES_DB: ${POSTGRES_DB:-app}
  ports: ["${POSTGRES_PORT:-5432}:5432"]
  volumes: [postgres_data:/var/lib/postgresql/data]
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-app}"]
    interval: 5s
    timeout: 5s
    retries: 5
```

## MongoDB (`mongo:7` / `mongo:8`)
```yaml
mongo:
  image: mongo:7
  restart: unless-stopped
  ports: ["${MONGO_PORT:-27017}:27017"]
  volumes: [mongo_data:/data/db]
  healthcheck:
    test: ["CMD-SHELL", "mongosh --quiet --eval \"db.adminCommand('ping').ok\" | grep 1"]
    interval: 5s
    timeout: 5s
    retries: 5
```

## Redis (`redis:7-alpine`)
```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes
  restart: unless-stopped
  ports: ["${REDIS_PORT:-6379}:6379"]
  volumes: [redis_data:/data]
  healthcheck:
    test: ["CMD-SHELL", "redis-cli ping | grep PONG"]
    interval: 5s
    timeout: 3s
    retries: 5
```

## MySQL & RabbitMQ References
- **MySQL (`mysql:8.0`):** `volumes: [mysql_data:/var/lib/mysql]`, `ports: ["${MYSQL_PORT:-3306}:3306"]`, healthcheck: `test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]`
- **RabbitMQ (`rabbitmq:3-management-alpine`):** `volumes: [rabbitmq_data:/var/lib/rabbitmq]`, `ports: ["${RABBITMQ_PORT:-5672}:5672", "${RABBITMQ_MGMT_PORT:-15672}:15672"]`, healthcheck: `test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]`
