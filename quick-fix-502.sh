#!/bin/bash
# Script de recuperación rápida para error 502

echo "================================"
echo "🔧 RECUPERACIÓN RÁPIDA - ERROR 502"
echo "================================"

echo -e "\n📋 Paso 1: Deteniendo contenedores..."
docker-compose down

echo -e "\n📋 Paso 2: Limpiando contenedores viejos..."
docker ps -a | grep quizify-api | awk '{print $1}' | xargs -r docker rm -f

echo -e "\n📋 Paso 3: Descargando última imagen..."
docker pull alerr04/quizify-api:0.9.1-dev

echo -e "\n📋 Paso 4: Iniciando contenedor..."
docker-compose up -d

echo -e "\n📋 Paso 5: Esperando 15 segundos..."
sleep 15

echo -e "\n📋 Paso 6: Verificando logs..."
docker-compose logs --tail 50 quizify-api

echo -e "\n📋 Paso 7: Verificando estado..."
docker-compose ps

echo -e "\n📋 Paso 8: Probando conexión local..."
curl -I http://localhost:3010/api/v1/docs 2>&1 | head -5

echo -e "\n================================"
echo "✅ Intento de recuperación completado"
echo "================================"
echo ""
echo "Si ves errores arriba, ejecuta:"
echo "  docker-compose logs -f quizify-api"
echo ""
