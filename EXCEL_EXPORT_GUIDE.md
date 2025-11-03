# Guía de Exportación de Resultados a Excel

## 📋 Descripción

Esta funcionalidad permite exportar los resultados de una sesión finalizada a un archivo Excel (.xlsx) con formato profesional, incluyendo:

- **Posición** del estudiante en el ranking
- **Nombre** del estudiante
- **Correo electrónico**
- **Puntaje final** (sobre 20 puntos)
- **Tiempo total** invertido (formato MM:SS)
- **Respuestas** correctas/totales con porcentaje
- **Estado** (Completado/Incompleto)
- **Fecha** de resolución

Además, incluye un **resumen de la sesión** con estadísticas generales.

## 🎨 Características del Excel

- ✅ Encabezados con estilo profesional (fondo azul, texto blanco)
- ✅ Filas alternadas con colores para mejor lectura
- ✅ Top 3 destacado con colores (🥇 Oro, 🥈 Plata, 🥉 Bronce)
- ✅ Estados coloreados (verde para completado, rojo para incompleto)
- ✅ Bordes en todas las celdas
- ✅ Sección de resumen con estadísticas
- ✅ Nombre de archivo con timestamp único

---

## 🔧 Backend (Ya Implementado)

### Endpoint

```
GET /session-scores/session/:sessionId/export
```

**Autenticación:** Bearer Token (JWT)  
**Roles permitidos:** TEACHER, ADMIN

### Ejemplo de Request

```bash
curl -X GET \
  'http://localhost:3000/session-scores/session/507f1f77bcf86cd799439011/export' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --output resultados.xlsx
```

### Response

- **Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Content-Disposition:** `attachment; filename=resultados-sesion-{sessionId}-{timestamp}.xlsx`
- **Body:** Archivo Excel binario

---

## 💻 Integración en el Frontend

### Opción 1: Usando Fetch API (Vanilla JS / React)

```javascript
async function exportSessionResults(sessionId) {
  try {
    const token = localStorage.getItem('authToken'); // O de donde guardes el token
    
    const response = await fetch(
      `http://localhost:3000/session-scores/session/${sessionId}/export`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Error al exportar resultados');
    }

    // Convertir la respuesta a blob
    const blob = await response.blob();
    
    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resultados-sesion-${sessionId}-${Date.now()}.xlsx`;
    
    // Simular click para descargar
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Archivo descargado exitosamente');
  } catch (error) {
    console.error('❌ Error al exportar:', error);
    alert('Error al exportar los resultados. Por favor intenta de nuevo.');
  }
}
```

### Opción 2: Usando Axios (React / Vue / Angular)

```javascript
import axios from 'axios';

async function exportSessionResults(sessionId) {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get(
      `http://localhost:3000/session-scores/session/${sessionId}/export`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'blob', // IMPORTANTE: especificar que esperamos un blob
      }
    );

    // Crear enlace de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `resultados-sesion-${sessionId}-${Date.now()}.xlsx`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Archivo descargado exitosamente');
  } catch (error) {
    console.error('❌ Error al exportar:', error);
    alert('Error al exportar los resultados. Por favor intenta de nuevo.');
  }
}
```

### Opción 3: Componente React Completo

```jsx
import React, { useState } from 'react';
import axios from 'axios';

function ExportButton({ sessionId }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/session-scores/session/${sessionId}/export`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          responseType: 'blob',
        }
      );

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `resultados-sesion-${sessionId}-${Date.now()}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Mostrar mensaje de éxito (opcional)
      alert('✅ Resultados exportados exitosamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('❌ Error al exportar los resultados. Por favor intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="btn btn-success"
    >
      {isExporting ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" />
          Exportando...
        </>
      ) : (
        <>
          📊 Exportar a Excel
        </>
      )}
    </button>
  );
}

export default ExportButton;
```

### Opción 4: Componente Vue 3 (Composition API)

```vue
<template>
  <button 
    @click="handleExport" 
    :disabled="isExporting"
    class="btn btn-success"
  >
    <span v-if="isExporting">
      <span class="spinner-border spinner-border-sm me-2"></span>
      Exportando...
    </span>
    <span v-else>
      📊 Exportar a Excel
    </span>
  </button>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const props = defineProps({
  sessionId: {
    type: String,
    required: true
  }
});

const isExporting = ref(false);

const handleExport = async () => {
  isExporting.value = true;
  
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/session-scores/session/${props.sessionId}/export`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        responseType: 'blob',
      }
    );

    // Crear enlace de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `resultados-sesion-${props.sessionId}-${Date.now()}.xlsx`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    alert('✅ Resultados exportados exitosamente');
  } catch (error) {
    console.error('Error al exportar:', error);
    alert('❌ Error al exportar los resultados.');
  } finally {
    isExporting.value = false;
  }
};
</script>
```

---

## 🎯 Dónde Colocar el Botón

Según tu descripción, el botón debe aparecer en el **dashboard del profesor** cuando finaliza una sesión y se muestra la lista de notas. Ejemplo:

```jsx
// En tu componente de resultados de sesión
<div className="session-results-header">
  <h2>Resultados de la Sesión</h2>
  <div className="actions">
    <ExportButton sessionId={sessionId} />
  </div>
</div>

<table className="results-table">
  {/* Tu tabla de resultados existente */}
</table>
```

---

## 🎨 Estilos Sugeridos para el Botón

```css
.export-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.export-button:hover:not(:disabled) {
  background-color: #218838;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.export-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.export-button:active:not(:disabled) {
  transform: translateY(0);
}
```

---

## 🧪 Testing

### Probar el Endpoint con cURL

```bash
# Reemplaza YOUR_JWT_TOKEN y SESSION_ID
curl -X GET \
  'http://localhost:3000/session-scores/session/YOUR_SESSION_ID/export' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --output test-export.xlsx
```

### Probar desde el Navegador (Console)

```javascript
// Pega esto en la consola del navegador (con la sesión iniciada)
const sessionId = 'TU_SESSION_ID_AQUI';
const token = localStorage.getItem('authToken');

fetch(`http://localhost:3000/session-scores/session/${sessionId}/export`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(res => res.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test.xlsx';
    a.click();
  });
```

---

## 📝 Notas Importantes

1. **Autenticación Requerida:** El usuario debe estar autenticado como TEACHER o ADMIN
2. **CORS:** Asegúrate de que tu backend tenga CORS configurado correctamente
3. **Tamaño del Archivo:** El archivo Excel es ligero (típicamente < 100KB para 50 estudiantes)
4. **Compatibilidad:** El archivo es compatible con Excel, Google Sheets, LibreOffice, etc.
5. **Formato de Fecha:** Las fechas se muestran en formato español (es-ES)

---

## 🐛 Troubleshooting

### Error: "Failed to fetch" o CORS
```javascript
// Verifica que tu backend tenga CORS habilitado
// En main.ts de NestJS:
app.enableCors({
  origin: 'http://localhost:3001', // Tu frontend
  credentials: true,
});
```

### Error: "Unauthorized" (401)
```javascript
// Verifica que el token esté presente y sea válido
const token = localStorage.getItem('authToken');
console.log('Token:', token);
```

### El archivo se descarga pero está corrupto
```javascript
// Asegúrate de usar responseType: 'blob' en axios
// o await response.blob() en fetch
```

---

## 🚀 Próximos Pasos

1. Copia el código del componente que mejor se adapte a tu stack (React/Vue/Angular)
2. Ajusta la URL del API según tu configuración
3. Coloca el botón en tu interfaz de resultados de sesión
4. Prueba la funcionalidad con una sesión finalizada
5. (Opcional) Personaliza los estilos según tu diseño

---

## 📞 Soporte

Si tienes problemas con la implementación:
1. Verifica que el endpoint esté disponible: `GET /session-scores/session/:sessionId/export`
2. Revisa los logs del backend para errores
3. Verifica que el usuario tenga el rol correcto (TEACHER o ADMIN)
4. Asegúrate de que la sesión tenga participantes con resultados

---

¡Listo! 🎉 Ahora puedes exportar los resultados de tus sesiones a Excel.
