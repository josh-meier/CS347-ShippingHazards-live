#!/bin/bash
# This script uses the Docker Compose V2 command syntax.
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
