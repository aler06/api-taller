# 🌐 Solución de Problema CORS

## 🔍 Problema Identificado

Tu backend **solo permitía CORS desde localhost**, pero tu frontend de producción está en:
```
https://taller-frontend-bhaobk-607ebf-173-212-248-96.traefik.me
```

## ✅ Cambios Realizados

### 1. Actualizado `src/main.ts`
- ✅ Agregadas todas las variaciones de tu URL de frontend (HTTP/HTTPS, con/sin puerto)
- ✅ Agregado soporte para variable de entorno `CORS_ORIGINS`
- ✅ Agregados logs de debugging para ver qué origins se permiten/bloquean
- ✅ Mejorada la configuración de CORS para producción

### 2. Actualizado `docker-compose.yml`
- ✅ Agregada variable `CORS_ORIGINS` con las URLs de tu frontend

---

## 🚀 Pasos para Desplegar

### Paso 1: Reconstruir la Imagen Docker

```bash
# En el directorio del backend (api-taller)
docker build -t alerr04/quizify-api:0.9.0-dev .
```

### Paso 2: Subir la Imagen a Docker Hub

```bash
docker push alerr04/quizify-api:0.9.0-dev
```

### Paso 3: Redesplegar en Dokploy

**Opción A: Desde la interfaz de Dokploy**
1. Ve a tu aplicación en Dokploy
2. Click en "Redeploy" o "Rebuild"
3. Espera a que se descargue la nueva imagen

**Opción B: Desde el servidor**
```bash
# SSH a tu servidor
docker-compose pull
docker-compose up -d
```

### Paso 4: Verificar los Logs

```bash
# Ver logs del contenedor
docker logs -f [container_name]
```

Deberías ver al inicio:
```
🌐 CORS enabled for origins: [
  'http://localhost:3000',
  'http://localhost:3001',
  ...
  'https://taller-frontend-bhaobk-607ebf-173-212-248-96.traefik.me',
  ...
]
```

Y cuando hagas requests desde el frontend:
```
✅ CORS: Allowing origin: https://taller-frontend-bhaobk-607ebf-173-212-248-96.traefik.me
```

---

## 🧪 Pruebas

### Prueba 1: Verificar CORS con curl

```bash
curl -X OPTIONS \
  -H "Origin: https://taller-frontend-bhaobk-607ebf-173-212-248-96.traefik.me" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -I \
  http://taller-api-fw2kqq-703289-173-212-248-96.traefik.me:3010/api/v1/auth/login
```

**Respuesta esperada:**
```
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://taller-frontend-bhaobk-607ebf-173-212-248-96.traefik.me
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,Accept,Origin,X-Requested-With
Access-Control-Allow-Credentials: true
```

### Prueba 2: Desde el Frontend

Abre la consola del navegador en tu frontend y verifica:

**Si funciona:**
```
✅ No deberías ver errores de CORS
✅ Las peticiones al backend deberían funcionar
```

**Si sigue fallando:**
```
❌ Access to fetch at 'http://...' from origin 'https://...' has been blocked by CORS policy
```

---

## 🔧 Configuración Flexible con Variables de Entorno

Si necesitas agregar más URLs del frontend sin recompilar:

### En tu `.env` o `docker-compose.yml`:

```env
CORS_ORIGINS=https://mi-otro-frontend.com,https://otro-dominio.com
```

La aplicación automáticamente agregará estos orígenes a la lista permitida.

---

## ⚠️ Notas Importantes

### 1. Protocolo Mixto (HTTP Backend + HTTPS Frontend)

Tu configuración actual:
- **Frontend:** `https://...traefik.me` (HTTPS)
- **Backend:** `http://...traefik.me:3010` (HTTP)

**Esto puede causar problemas de seguridad en navegadores modernos.**

**Solución recomendada:**
- Configurar HTTPS también para el backend en Traefik
- O usar HTTP para ambos en desarrollo

### 2. WebSocket (Socket.io)

Tu frontend usa WebSocket. Asegúrate de que la URL de WebSocket también apunte correctamente:

```env
VITE_WS_URL=http://taller-api-fw2kqq-703289-173-212-248-96.traefik.me:3010
```

**Si el backend está en HTTPS:**
```env
VITE_WS_URL=https://taller-api-fw2kqq-703289-173-212-248-96.traefik.me
```

---

## 🐛 Troubleshooting

### Error: "Blocked by CORS policy"

**Verifica en los logs del backend:**
```bash
docker logs -f [backend_container]
```

Busca líneas como:
```
❌ CORS: Blocking origin: https://...
   Allowed origins: ...
```

**Si tu origin está bloqueado:**
1. Verifica que la URL en el log coincide exactamente con la URL de tu frontend
2. Agrega esa URL exacta a la lista en `main.ts`
3. O agrégala a la variable `CORS_ORIGINS` en docker-compose.yml

### La URL del Frontend cambia dinámicamente

Si usas diferentes URLs (dev/staging/prod), usa variables de entorno:

**En docker-compose.yml:**
```yaml
environment:
  CORS_ORIGINS: ${FRONTEND_URL}
```

**En tu `.env`:**
```env
FRONTEND_URL=https://taller-frontend-bhaobk-607ebf-173-212-248-96.traefik.me
```

### Opciones adicionales (solo para debugging)

Si necesitas permitir **TODOS** los orígenes temporalmente para debugging:

```typescript
app.enableCors({
  origin: true,  // ⚠️ SOLO PARA DEBUG, NO PARA PRODUCCIÓN
  credentials: true,
});
```

**⚠️ NUNCA uses `origin: true` en producción - es un riesgo de seguridad**

---

## 📋 Checklist de Despliegue

- [ ] ✅ Código actualizado en `main.ts`
- [ ] ✅ `docker-compose.yml` actualizado con CORS_ORIGINS
- [ ] ✅ Proyecto compilado (`npm run build`)
- [ ] ✅ Imagen Docker construida
- [ ] ✅ Imagen subida a Docker Hub
- [ ] ✅ Aplicación redesplegada en Dokploy
- [ ] ✅ Logs verificados (se muestran los origins permitidos)
- [ ] ✅ Prueba con curl exitosa
- [ ] ✅ Prueba desde el frontend exitosa

---

## 🎯 Resultado Esperado

Después de aplicar estos cambios:

1. ✅ El frontend puede hacer peticiones al backend sin errores de CORS
2. ✅ Los logs muestran: `✅ CORS: Allowing origin: https://...`
3. ✅ Login, registro y todas las funcionalidades funcionan correctamente
4. ✅ WebSocket se conecta correctamente

---

## 📞 Si Sigues Teniendo Problemas

Envíame:
1. Los logs del backend cuando intentas hacer una petición
2. El error exacto en la consola del navegador
3. La URL exacta desde donde haces la petición (copia del navegador)
4. El resultado del curl de prueba

