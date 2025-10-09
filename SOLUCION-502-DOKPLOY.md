# 🎯 SOLUCIÓN ERROR 502 - DOKPLOY

## ✅ Diagnóstico Completado

Tu aplicación **SÍ está corriendo correctamente** dentro del contenedor:
- ✅ MongoDB conectado
- ✅ Todas las rutas mapeadas  
- ✅ CORS habilitado
- ✅ Nest application successfully started

## 🚨 PROBLEMA IDENTIFICADO

**❌ FALTA LA VARIABLE DE ENTORNO `PORT=3010`**

Tu aplicación está escuchando en el puerto **3000** (default), pero **Traefik/Cloudflare busca en el puerto 3010**.

---

## 🔧 SOLUCIÓN (3 PASOS)

### **PASO 1: Agregar variable PORT en Dokploy**

1. Ve a Dokploy → Tu aplicación **"taller-api"**
2. Click en **"Settings"** o **"Environment"** o **"Advanced"**
3. Busca **"Environment Variables"**
4. **Agrega esta variable:**

```
PORT=3010
```

5. **Guarda los cambios**

---

### **PASO 2: Commit y push del código actualizado**

Tu archivo `main.ts` ahora tiene mejor logging. Necesitas hacer commit:

```bash
cd "/Users/alessandro/API TALLER/api-taller"

git add src/main.ts Dockerfile
git commit -m "fix: Add PORT logging and improve healthcheck timing"
git push origin develop
```

---

### **PASO 3: Redeploy en Dokploy**

1. En Dokploy, ve a tu aplicación
2. Click en **"Redeploy"** o **"Rebuild"**
3. Espera a que termine el deployment (30-60 segundos)
4. Verifica los logs

---

## ✅ VERIFICACIÓN

### **Después del redeploy, deberías ver en los logs:**

```
🌐 CORS enabled for ALL origins
[Nest] 7 - LOG [NestApplication] Nest application successfully started

🚀 Application is running on: http://0.0.0.0:3010
📚 Swagger documentation: http://0.0.0.0:3010/api/v1/docs
🌍 Environment: production
🔐 CORS: Enabled for all origins
```

**Nota el puerto 3010** en los logs.

---

### **Prueba desde tu navegador:**

```
https://edu-ai-api.automaginex-ai.lat/api/v1/docs
```

✅ Debería mostrar Swagger UI
✅ No más error 502

---

### **Prueba el login desde el frontend:**

```
https://edu-ai.automaginex-ai.lat/
```

✅ El login debería funcionar
✅ No más errores de CORS

---

## 📋 RESUMEN DE VARIABLES DE ENTORNO NECESARIAS

Asegúrate de tener todas estas en Dokploy:

```env
# Puerto (CRÍTICO)
PORT=3010

# Node
NODE_ENV=production

# MongoDB
MONGODB_HOST=173.212.248.96
MONGODB_PORT=27017
MONGODB_DATABASE=api-taller-db
MONGODB_USER=root
MONGODB_PASSWORD=Oracle@2025

# JWT
JWT_SECRET=5080ba5668a1288e0dacf3ffb59e75fd77f2a6f23750cdb4f285899b3e7e1a5d
JWT_EXPIRES_IN=1h

# API Keys
GEMINI_KEY=AIzaSyAOKtFIc6xXh3F9celhVBZxd0k4V_kYGh0

# CORS (opcional)
CORS_ORIGINS=https://edu-ai.automaginex-ai.lat
```

---

## 🔍 CONFIGURACIÓN DE DOKPLOY

### **Asegúrate de que el puerto esté configurado:**

En la configuración de tu aplicación en Dokploy:

- **Internal Port (Container Port):** `3010`
- **External Port:** Puede ser asignado automáticamente por Traefik
- **Protocol:** `http`

### **Si usas Labels de Traefik:**

```yaml
traefik.enable=true
traefik.http.routers.taller-api.rule=Host(`edu-ai-api.automaginex-ai.lat`)
traefik.http.services.taller-api.loadbalancer.server.port=3010
```

---

## 🆘 SI PERSISTE EL ERROR

### **1. Verifica los logs después del redeploy:**

En Dokploy → Logs, busca:
```
🚀 Application is running on: http://0.0.0.0:3010
```

Si dice `3000` en vez de `3010` → La variable PORT no se aplicó

### **2. Verifica que la variable PORT esté en Dokploy:**

En Settings → Environment Variables, debe aparecer:
```
PORT = 3010
```

### **3. Prueba curl desde el servidor:**

SSH a tu servidor y ejecuta:
```bash
# Buscar el contenedor
docker ps | grep taller-api

# Probar desde dentro del contenedor
docker exec -it <container_id> sh
wget -O- http://localhost:3010/api/v1/docs

# Probar desde el host
curl -I http://localhost:3010/api/v1/docs
```

Debe retornar `HTTP/1.1 301` o `200 OK`

---

## 🎯 RESULTADO ESPERADO

Después de seguir estos pasos:

1. ✅ La aplicación escucha en el puerto 3010
2. ✅ Traefik puede conectarse a la aplicación
3. ✅ Cloudflare no da más error 502
4. ✅ El frontend puede hacer login correctamente
5. ✅ Swagger UI es accesible
6. ✅ WebSockets funcionan

---

## 📞 CONTACTO

Si después de seguir estos pasos el error persiste, envíame:

1. Screenshot de las variables de entorno en Dokploy
2. Los logs después del redeploy (especialmente la línea con `Application is running on`)
3. El resultado de `curl -I https://edu-ai-api.automaginex-ai.lat/api/v1/docs`

---

**¡Sigue estos 3 pasos y el error 502 desaparecerá! 🚀**
