#!/bin/bash

#SOLO UNA GUIA

docker compose -f docker-compose.yml down
docker compose -f docker-compose-monitorize.yml down
mkdir .docker/database/mongodb
mkdir .docker/database/postgresql
#cd frontend
#pnpm install
pnpm run build
#cd ..
#cd backend
#pnpm install
#cd ..
docker compose -f docker-compose-dev.yml up --build -d #docker compose -f ./docker-compose-dev.yml down
docker compose -f docker-compose.yml up --build -d #docker compose -f ./docker-compose.yml down
docker compose -f docker-compose-monitorize.yml up --build -d #docker compose -f ./docker-compose-monitorize.yml down


#docker compose -f docker-compose.yml down ; docker compose -f docker-compose.yml up --build
