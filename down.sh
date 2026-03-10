#!/bin/bash
docker compose -f ./docker-compose-dev.yml down
docker compose -f ./docker-compose.yml down
#rm logs/backend.log
#rm logs/db.log
#docker system prune -a --volumes