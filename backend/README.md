# TravelForge Backend
Backend API проекта TravelForge на базе Express и TypeScript.

## Назначение
**Backend реализует:**
- API для городов, поездок, валют и TravelBot;
- JWT-аутентификацию;
- интеграцию с GigaChat;
- health-check endpoint;
- экспорт Prometheus-метрик.

## Локальный запуск
```bash
cp env.example .env
npm install
npm run dev
```

**Проверка доступности:**
```bash
curl http://localhost:5000/health
curl http://localhost:5000/metrics
```

## Сборка
```bash
npm run build
npm start
```

## Docker
```bash
docker build -t travelforge-backend:local .
```

## Основные endpoints
- `GET /health`
- `GET /metrics`
- `GET /metrics/json`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/cities`
- `GET /api/cities/:id`
- `POST /api/cities/search`
- `GET /api/trips`
- `POST /api/trips`
- `DELETE /api/trips/:id`
- `GET /api/currencies`
- `POST /api/currencies/convert`
- `POST /api/travelbot`
- `POST /api/travelbot/ask`

Актуальный набор маршрутов определяется файлами `src/routes/*`.

## Метрики
Экспорт метрик доступен через `/metrics`.

**Основные серии:**
- `travelforge_requests_total`
- `travelforge_http_requests_in_flight`
- `travelforge_process_heap_used_bytes`
- `travelforge_heap_used_bytes`
- `travelforge_process_rss_bytes`
- `travelforge_process_cpu_user_seconds_total`
- `travelforge_process_cpu_system_seconds_total`
- `travelforge_event_loop_lag_ms`
- `travelforge_request_duration_ms_*`
- `travelforge_route_requests_total`
- `travelforge_route_avg_latency_ms`
- `travelforge_gigachat_requests_total`
- `travelforge_gigachat_request_duration_ms_*`

## Переменные окружения
Минимально значимые параметры:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=change-me
GIGACHAT_CLIENT_ID=...
GIGACHAT_SECRET=...
GIGACHAT_SCOPE=GIGACHAT_API_PERS
GIGACHAT_TIMEOUT=60
GIGACHAT_TLS_VERIFY=1
ALLOWED_ORIGINS=http://localhost:3000
```

## Kubernetes
**В Kubernetes backend обычно использует:**
- `ConfigMap` для не-секретных параметров;
- `Secret` для JWT и учетных данных GigaChat;
- `Deployment`;
- `Service`;
- readiness/liveness probes на `/health`.

**Типовой цикл обновления образа в локальном кластере:**
```bash
npm run build
docker build -t travelforge-backend:metrics-vX .
minikube image load travelforge-backend:metrics-vX
kubectl -n travelforge set image deployment/travelforge-backend backend=travelforge-backend:metrics-vX
kubectl -n travelforge rollout status deployment/travelforge-backend
```

**Проверка после rollout:**
```bash
kubectl -n travelforge port-forward svc/travelforge-backend 5000:5000
curl -s http://127.0.0.1:5000/metrics | head -40
```