up:
	docker compose up -d

install:
	docker compose exec app bash -c "(npm install)"

dev:
	docker compose exec app bash -c "(npm run dev)"

down:
	docker compose down

lint:
	docker compose exec app bash -c "(cd /app/src && npm run lint)"

typecheck:
	docker compose exec app bash -c "(cd /app/src && npm run typecheck)"

format:
	docker compose exec app bash -c "(cd /app/src && npm run format)"

all-check:
	docker compose exec app bash -c "(cd /app/src && npm run lint && npm run typecheck && npm run format)"

test:
	docker compose exec app bash -c "(cd /app/src && npm run test)"

test-watch:
	docker compose exec app bash -c "(cd /app/src && npm run test:watch)"

test-coverage:
	docker compose exec app bash -c "(cd /app/src && npm run test:coverage)"

test-ui:
	docker compose exec app bash -c "(cd /app/src && npm run test:ui)"
