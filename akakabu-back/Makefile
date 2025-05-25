.PHONY: clean

up:
	docker compose up -d
dev: 
	docker compose exec app npm run dev
down: 
	docker-compose down -v
migrate:
	docker-compose exec supabase-db psql -U postgres -d mydatabase -f /docker-entrypoint-initdb.d/migrate.sql