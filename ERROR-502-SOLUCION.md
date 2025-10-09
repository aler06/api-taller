# 🚨 Solución Error 502 - Bad Gateway

## ⚠️ ¿Qué significa el error 502?

El error 502 de Cloudflare significa que **tu servidor backend no está respondiendo**. Posibles causas:

1. ❌ El contenedor Docker está caído
2. ❌ La aplicación crasheó al iniciar
3. ❌ Faltan variables de entorno críticas
4. ❌ Error de conexión a la base de datos
5. ❌ El puerto 3010 no está accesible

---

## 🔍 PASO 1: Diagnóstico (HACER PRIMERO)

### En tu servidor, ejecuta:

```bash
# SSH a tu servidor
ssh usuario@tu-servidor

# Navega al directorio del proyecto
cd /ruta/donde/esta/docker-compose.yml

# Dale permisos y ejecuta el diagnóstico
chmod +x diagnose-502.sh
./diagnose-502.sh
```

**Esto te mostrará:**
- ✅ Si el contenedor está corriendo
- ✅ Los logs de error
- ✅ El estado del puerto 3010
- ✅ Si la aplicación responde localmente

---

## 🔧 PASO 2: Solución Rápida

### Si el diagnóstico muestra que el contenedor está caído:

```bash
# Ejecuta el script de recuperación
chmod +x quick-fix-502.sh
./quick-fix-502.sh
```

### O manualmente:

```bash
# 1. Detener todo
docker-compose down

# 2. Ver qué salió mal
docker-compose logs --tail 100 quizify-api

# 3. Reiniciar
docker-compose up -d

# 4. Ver logs en tiempo real
docker-compose logs -f quizify-api
```

---

## 📋 PASO 3: Verifica Variables de Entorno

### Tu archivo `.env` DEBE tener estas variables:

```env
# Puerto (CRÍTICO)
PORT=3010

# Node Environment
NODE_ENV=production

# API Prefix
API_PREFIX=api/v1

# Base de datos (CRÍTICO - ajusta según tu DB)
DATABASE_URL=postgresql://usuario:password@host:5432/database
# O si usas variables separadas:
DB_HOST=tu_host
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=tu_database

# JWT (CRÍTICO para auth)
JWT_SECRET=tu_secreto_super_seguro_minimo_32_caracteres
JWT_EXPIRES_IN=24h

# API Keys (si usas Gemini/OpenAI)
GEMINI_API_KEY=tu_clave_api
# O
OPENAI_API_KEY=tu_clave_api

# CORS (opcional)
CORS_ORIGINS=https://tu-frontend.com
```

### ⚠️ Variables CRÍTICAS que DEBES tener:
- `PORT` → Sin esto, la app no sabrá en qué puerto escuchar
- `DATABASE_URL` o `DB_HOST/DB_PORT/etc` → Sin DB, la app crashea
- `JWT_SECRET` → Sin esto, el auth no funciona

---

## 🔍 PASO 4: Revisa los Logs

### Errores comunes y sus soluciones:

#### ❌ Error: "Cannot connect to database"
```bash
# Solución: Verifica tu DATABASE_URL
echo $DATABASE_URL
# Debe ser algo como: postgresql://user:pass@host:5432/dbname

# Prueba la conexión manualmente
docker exec -it quizify-api sh
apk add postgresql-client
psql $DATABASE_URL -c "SELECT 1;"
```

#### ❌ Error: "JWT_SECRET is not defined"
```bash
# Solución: Agrega JWT_SECRET a tu .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env
docker-compose restart
```

#### ❌ Error: "Port 3010 is already in use"
```bash
# Solución: Mata el proceso que usa el puerto
sudo lsof -ti:3010 | xargs kill -9
docker-compose up -d
```

#### ❌ Error: "Module not found" o "Cannot find module"
```bash
# Solución: Reconstruye la imagen
docker-compose build --no-cache
docker-compose up -d
```

---

## 🚀 PASO 5: Reconstruir y Redesplegar (Cambios en código)

Si hiciste cambios en el código o Dockerfile:

```bash
# 1. Localmente (en tu máquina de desarrollo)
cd /Users/alessandro/API\ TALLER/api-taller

# 2. Construir nueva imagen
docker build -t alerr04/quizify-api:0.9.1-dev .

# 3. Subir a Docker Hub
docker push alerr04/quizify-api:0.9.1-dev

# 4. En tu servidor
ssh usuario@tu-servidor
cd /ruta/del/proyecto
docker-compose pull
docker-compose down
docker-compose up -d

# 5. Ver logs
docker-compose logs -f quizify-api
```

---

## 🧪 PASO 6: Verificar que Funciona

### Prueba 1: Desde el servidor (debe funcionar)
```bash
curl -I http://localhost:3010/api/v1/docs
# Debe retornar: HTTP/1.1 301 Moved Permanently o 200 OK
```

### Prueba 2: Desde Internet (debe funcionar)
```bash
curl -I https://edu-ai-api.automaginex-ai.lat/api/v1/docs
# Debe retornar: HTTP/2 200 o 301
```

### Prueba 3: Desde el navegador
Abre: `https://edu-ai-api.automaginex-ai.lat/api/v1/docs`
- ✅ Debe mostrar Swagger UI
- ❌ Si muestra 502 → Vuelve al Paso 1

---

## 🔧 PASO 7: Configuración de Cloudflare (si persiste el error)

Si la app funciona localmente pero Cloudflare da 502:

### Verifica en Cloudflare:
1. Ve a **SSL/TLS** → Debe estar en **"Full"** o **"Flexible"**
2. Ve a **DNS** → Verifica que el registro A apunte a la IP correcta
3. Ve a **Network** → Desactiva temporalmente "HTTPS Automatic Rewrites"

### Si usas Dokploy/Traefik:
```bash
# Verifica que Traefik esté corriendo
docker ps | grep traefik

# Verifica logs de Traefik
docker logs $(docker ps -q -f name=traefik) --tail 50
```

---

## 📞 Checklist de Troubleshooting

Antes de pedir ayuda, verifica:

- [ ] ✅ `docker ps` muestra el contenedor corriendo
- [ ] ✅ `docker logs` no muestra errores críticos
- [ ] ✅ `.env` tiene todas las variables necesarias
- [ ] ✅ `curl http://localhost:3010/api/v1/docs` funciona en el servidor
- [ ] ✅ El puerto 3010 está escuchando (`netstat -tuln | grep 3010`)
- [ ] ✅ La base de datos es accesible desde el contenedor
- [ ] ✅ No hay puertos duplicados
- [ ] ✅ Cloudflare DNS apunta a la IP correcta

---

## 🆘 Si Nada Funciona

### Opción Nuclear: Reset completo

```bash
# ⚠️ ESTO BORRARÁ TODO - Haz backup primero
docker-compose down -v
docker rmi alerr04/quizify-api:0.9.1-dev
docker-compose pull
docker-compose up -d
docker-compose logs -f
```

### Envíame esta información:

1. **Output del diagnóstico:**
   ```bash
   ./diagnose-502.sh > diagnostico.txt
   # Envíame diagnostico.txt
   ```

2. **Variables de entorno (sin passwords):**
   ```bash
   cat .env | sed 's/=.*/=***/' > env-info.txt
   # Envíame env-info.txt
   ```

3. **Estado actual:**
   ```bash
   docker ps -a > docker-status.txt
   docker-compose logs --tail 200 > logs.txt
   # Envíame ambos archivos
   ```

---

## ✅ Cambios Realizados en Esta Actualización

1. ✅ **Dockerfile:**
   - Aumentado `start-period` de 30s a 60s
   - Aumentado `timeout` de 3s a 10s
   - Esto da más tiempo para que la app inicie

2. ✅ **docker-compose.yml:**
   - Cambiado puerto de `"3010"` a `"3010:3010"` (más explícito)
   - Agregado healthcheck en docker-compose también

3. ✅ **Scripts de ayuda:**
   - `diagnose-502.sh` → Para diagnosticar el problema
   - `quick-fix-502.sh` → Para recuperación rápida

---

## 🎯 Resultado Esperado

Después de seguir estos pasos:

1. ✅ El contenedor está corriendo (`docker ps` lo muestra)
2. ✅ Los logs no muestran errores
3. ✅ `curl http://localhost:3010/api/v1/docs` funciona
4. ✅ La URL pública funciona sin error 502
5. ✅ Swagger UI es accesible

---

**Siguiente paso:** Ejecuta `./diagnose-502.sh` y muéstrame el output. Con eso sabré exactamente qué está fallando. 🚀

