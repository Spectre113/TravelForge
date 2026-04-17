# TravelForge
**TravelForge** - учебный full-stack проект для планирования поездок с учетом бюджета, пользовательских предпочтений и ответов TravelBot на базе GigaChat.

## Состав проекта
- **frontend** — React + TypeScript SPA;
- **backend** — Express + TypeScript API с JWT-аутентификацией и Prometheus-метриками;
- **k8s** — Kubernetes-манифесты для локального кластера и учебного деплоя.

## Функциональность
- каталог городов и получение деталей по выбранному направлению;
- создание и удаление поездок;
- конвертация валют;
- TravelBot с интеграцией GigaChat;
- health-check и экспорт метрик через `/metrics`.

## Технологии
### Frontend
- React
- TypeScript
- React Router
- Recharts
- Leaflet

### Backend
- Node.js
- Express
- TypeScript
- JWT
- Axios
- Helmet
- Pino HTTP

### Infrastructure
- Docker
- Kubernetes / Kustomize
- Prometheus-compatible metrics

## Структура
```text
TravelForge/
├── backend/
├── frontend/
├── k8s/
├── start-app.sh
└── README.md
```

## Основные endpoints
### Backend
- `/health`
- `/metrics`
- `/metrics/json`
- `/api/auth/*`
- `/api/cities/*`
- `/api/trips/*`
- `/api/currencies/*`
- `/api/travelbot/*`
Фактический набор маршрутов определяется файлами `backend/src/routes/*`.

## Метрики
Экспорт метрик выполняется через `/metrics` в формате Prometheus exposition format.

**Примеры метрик:**
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
### Backend
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

### Frontend
Параметры фронтенда определяются файлами `frontend/.env*`.

## Локальный запуск
### Через общий скрипт

```bash
chmod +x start-app.sh
./start-app.sh
```

**Ожидаемые адреса:**
- frontend: `http://localhost:3000`
- backend: `http://localhost:5000`

### Ручной запуск
**Backed:**
```bash
cd backend
cp -n env.example .env
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
cp -n .env.example .env
npm install
npm start
```

**Проверка backend:**
```bash
curl http://localhost:5000/health
curl http://localhost:5000/metrics
```

## Локальный запуск в Kubernetes
Ниже приведен базовый сценарий для `minikube`.

### Подготовка кластера
```bash
minikube start
minikube addons enable ingress
```

### Подготовка секретов
На основе шаблона `k8s/secret.example.yaml` формируется рабочий `k8s/secret.yaml` с фактическими значениями:
- `JWT_SECRET`
- `GIGACHAT_CLIENT_ID`
- `GIGACHAT_SECRET`

При использовании `kustomize` файл `secret.yaml` должен быть включен в `k8s/kustomization.yaml`, либо применяться отдельно.

### Сборка образов
```bash
cd backend
npm install
npm run build
docker build -t travelforge-backend:local .

cd ../frontend
npm install
npm run build
docker build -t travelforge-frontend:local .

cd ..
```

### Загрузка образов в minikube
```bash
minikube image load travelforge-backend:local
minikube image load travelforge-frontend:local
```

### Применение манифестов
```bash
kubectl apply -k k8s
kubectl -n travelforge rollout status deployment/travelforge-backend
kubectl -n travelforge rollout status deployment/travelforge-frontend
```

### Проверка backend
```bash
kubectl -n travelforge port-forward svc/travelforge-backend 5000:5000
```

**В отдельном терминале:**
```bash
curl http://127.0.0.1:5000/health
curl http://127.0.0.1:5000/metrics
```

### Проверка frontend
```bash
kubectl -n travelforge port-forward svc/travelforge-frontend 8080:80
```

**Доступ:**
- `http://127.0.0.1:8080`

## Обновление backend в локальном кластере
```bash
cd backend
npm run build
docker build -t travelforge-backend:metrics-vX .
minikube image load travelforge-backend:metrics-vX
kubectl -n travelforge set image deployment/travelforge-backend backend=travelforge-backend:metrics-vX
kubectl -n travelforge rollout status deployment/travelforge-backend
```

## Частые проблемы
### `curl: (7) Failed to connect to 127.0.0.1:5000`
Обычно это означает отсутствие активного `port-forward` либо недоступность backend pod.

### Пустые панели Grafana
**Типовые причины:**
- серия отсутствует в `/metrics`;
- используется устаревшее имя метрики;
- для `rate()` накоплено недостаточно scrape-точек;
- Prometheus не выполняет scrape target.

### После rollout локальный доступ пропадает
После пересоздания pod ранее открытый `port-forward` перестает быть валидным и поднимается повторно.

### Проблемы с ingress
**Следует проверить:**
- наличие ingress controller;
- корректность `ingressClassName`;
- резолвинг host в `/etc/hosts`;
- наличие TLS secret, если ingress использует TLS.

## Деплой в учебный Kubernetes-кластер
Типовой сценарий для внешнего кластера включает:
1. сборку frontend и backend образов;
2. публикацию образов в доступный registry;
3. замену image reference в deployment-манифестах;
4. подготовку секретов под целевое окружение;
5. применение namespace, secrets, configmap, deployment, service и ingress;
6. проверку rollout, `/health`, `/metrics` и базового пользовательского сценария.

Если registry отсутствует, способ доставки образов определяется ограничениями учебной инфраструктуры: локальный registry, импорт на ноды или иной поддерживаемый механизм.

## Диагностические команды
```bash
kubectl get pods -n travelforge -o wide
kubectl get svc -n travelforge
kubectl get ingress -n travelforge
kubectl logs -n travelforge deploy/travelforge-backend --tail=100
kubectl -n travelforge rollout status deployment/travelforge-backend
kubectl -n travelforge rollout status deployment/travelforge-frontend
```
