#!/bin/bash
sh down.sh
clear
touch logs/backend.log
touch logs/db.log
cat .env.example > .env
cat frontend.env.example > frontend/.env
#cat .docker/postgresql-extra.conf > .docker/database/postgresql/postgresql.conf
#rm -rf .docker/database/postgresql
#rm -rf .docker/database/mongodb
cat src/libraries/validaciones.ts > frontend/src/libraries/validacionesBackend.ts
cat frontend/src/libraries/peticiones.ts > src/libraries/peticiones.ts
npm install
npm audit
cd frontend
#cat .env.example > .env
npm install
npm audit
npm run build
npm run dev -- --port 8520 &
cd ..
docker compose -f ./docker-compose-dev.yml down
docker compose -f ./docker-compose.yml down
docker compose -f docker-compose-dev.yml up --build
#docker exec -it mediastray-frontend /bin/sh
#cd /usr/share/nginx/html/frontend/app
#npm install
#npm run dev