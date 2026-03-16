#!/bin/bash
docker exec -it -e PGPASSWORD="123456789" mediastray-postgresql-1 psql -h localhost -U usuario -d base -c "DO \$\$ DECLARE r RECORD; BEGIN FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE'; END LOOP; END \$\$;"
docker exec -it mediastray-backend-1 npx drizzle-kit push
#docker exec -it mediastray-mongodb-1 mongosh -u usuario -p 123456789 -authenticationDatabase admin
#use base
#show collections
#db.intermediario.find()/deleteMany()
