#!/bin/bash
sh down.sh
touch logs/backend.log
touch logs/db.log
cat .env.example > .env
mkdir .docker/database/mongodb
mkdir .docker/database/postgresql
#cat .docker/postgresql-extra.conf > .docker/database/postgresql/postgresql.conf
#rm -rf .docker/database/postgresql
#rm -rf .docker/database/mongodb
#cat src/libraries/validaciones.ts > frontend/src/libraries/validacionesBackend.ts
#cat frontend/src/libraries/peticiones.ts > src/libraries/peticiones.ts
npm install
npm run build
cd frontend
npm install
cat ../frontend.env.example > .env
npm run build
cd ..
docker compose -f ./docker-compose.yml down
docker compose -f ./docker-compose-dev.yml down
docker compose -f docker-compose.yml up -d --build

#En producción, seguramente las bases de datos se desplieguen en AtlasDB, Redis Cloud y ElephantSQL usando las free tier (cualquier usuario usando este código es libre de usarlas de cualquier manera)