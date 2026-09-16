#!/bin/bash
# Script de deploy automático para a VPS da Beck Barbearia

set -e

echo "💈 Iniciando deploy da Beck Barbearia na VPS..."

# 1. Puxar as atualizações mais recentes do repositório
git pull origin main

# 2. Reconstruir e subir os containers
docker compose -f vps-backend/docker-compose.yml up -d --build --remove-orphans

# 3. Limpeza de imagens antigas
docker image prune -f

echo "✅ Deploy concluído com sucesso!"
echo "📡 Verifique os logs com: docker logs -f beck-barbearia-backend"
