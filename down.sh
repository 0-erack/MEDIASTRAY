#!/bin/bash
docker compose -f ./docker-compose-dev.yml down --remove-orphans
docker compose -f ./docker-compose.yml down --remove-orphans
#rm logs/backend.log
#rm logs/db.log
#docker system prune -a --volumes