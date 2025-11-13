# 📊 Documentación de Métodos de Guardado en Base de Datos MongoDB

Esta documentación describe todos los métodos que se utilizan para guardar, actualizar y eliminar datos en la base de datos MongoDB de tu aplicación API TALLER.

## 🏗️ Arquitectura de Base de Datos

La aplicación utiliza **MongoDB** como base de datos NoSQL con **Mongoose** como ODM (Object Document Mapper) para facilitar las operaciones.

### 📋 Colecciones Principales:

1. **Users** - Usuarios del sistema (profesores y estudiantes)
2. **Exercises** - Ejercicios creados por profesores
3. **Sessions** - Sesiones interactivas
4. **SessionScores** - Puntajes de estudiantes en sesiones

---

## 👤 USUARIOS - Registro y Autenticación

### 📍 Ubicación: `src/auth/service/auth.service.ts`

### ✅ Método: `register()` - Crear nuevo usuario
```typescript
/**
 * 👤 MÉTODO DE GUARDADO EN BD: Registrar nuevo usuario
 * 
 * OPERACIÓN: CREATE (new this.userModel() + save())
 * TABLA: User (MongoDB Collection)
 */
```

**Campos guardados:**
- `firstName`: Nombre del usuario
- `lastName`: Apellido del usuario  
- `email`: Email (debe ser único)
- `role`: Rol (TEACHER o STUDENT)
- `password`: Contraseña hasheada con bcrypt
- `isActive`: true (activo por defecto)
- `createdAt/updatedAt`: Timestamps automáticos

**Método Mongoose utilizado:** `new this.userModel() + save()`

---

## 🎮 EJERCICIOS - Creación y Gestión

### 📍 Ubicación: `src/exercise-generator/service/exercise-generator.service.ts`

### ✅ Método: `generateExercise()` - Crear nuevo ejercicio
```typescript
/**
 * 🔥 GUARDADO EN BD: Crear nuevo ejercicio
 * MÉTODO MONGOOSE: new Model() + save()
 * TABLA: Exercise (MongoDB Collection)
 * OPERACIÓN: CREATE - Guarda ejercicio generado por IA
 */
```

**Campos guardados:**
- `userId`: ID del profesor creador
- `game`: Tipo de juego/ejercicio
- `questions`: Preguntas generadas por IA
- `topic`: Tema del ejercicio
- `difficulty`: Nivel de dificultad
- `targetAudience`: Audiencia objetivo
- `createdAt/updatedAt`: Timestamps automáticos

### 📝 Método: `updateExercise()` - Actualizar ejercicio existente
```typescript
/**
 * 📝 MÉTODO DE GUARDADO EN BD: Actualizar ejercicio existente
 * OPERACIÓN: UPDATE (findOneAndUpdate)
 * TABLA: Exercise (MongoDB Collection)
 */
```

**Método Mongoose utilizado:** `findOneAndUpdate()`

### 🗑️ Método: `deleteExercise()` - Eliminar ejercicio
```typescript
/**
 * 🗑️ MÉTODO DE ELIMINACIÓN EN BD: Borrar ejercicio
 * OPERACIÓN: DELETE (deleteOne)
 * TABLA: Exercise (MongoDB Collection)
 */
```

**Método Mongoose utilizado:** `deleteOne()`

---

## 🎯 SESIONES - Creación y Gestión

### 📍 Ubicación: `src/sessions/service/session.service.ts`

### ✅ Método: `createSession()` - Crear nueva sesión
```typescript
/**
 * 🎯 MÉTODO DE GUARDADO EN BD: Crear nueva sesión
 * OPERACIÓN: CREATE (new this.sessionModel() + save())
 * TABLA: Session (MongoDB Collection)
 */
```

**Campos guardados:**
- `teacherId`: ID del profesor creador
- `exerciseIds`: Array de IDs de ejercicios
- `name`: Nombre de la sesión
- `description`: Descripción
- `accessCode`: Código de acceso único
- `duration`: Duración en minutos
- `maxParticipants`: Máximo de participantes
- `status`: WAITING (inicial)
- `participants`: Array vacío

### 🔄 Métodos de actualización de estado:

#### `startSession()` - Iniciar sesión
- **Operación:** UPDATE - Cambiar estado a ACTIVE
- **Método:** Modificación directa + save()

#### `endSession()` - Finalizar sesión  
- **Operación:** UPDATE - Cambiar estado a FINISHED
- **Método:** Modificación directa + save()

#### `cancelSession()` - Cancelar sesión
- **Operación:** UPDATE - Cambiar estado a CANCELLED
- **Método:** Modificación directa + save()

#### `joinSession()` - Agregar participante
- **Operación:** UPDATE - Agregar participante al array
- **Método:** Modificación directa + save()

### 🗑️ Método: `deleteSession()` - Eliminar sesión
**Método Mongoose utilizado:** `findByIdAndDelete()`

---

## 📊 PUNTAJES DE SESIONES - Tracking de Resultados

### 📍 Ubicación: `src/sessions/service/session-score.service.ts`

### ✅ Método: `initializeScore()` - Inicializar registro de puntaje
```typescript
/**
 * 📊 MÉTODO DE GUARDADO EN BD: Inicializar registro de puntaje
 * OPERACIÓN: CREATE (new this.sessionScoreModel() + save())
 * TABLA: SessionScore (MongoDB Collection)
 */
```

**Campos guardados:**
- `sessionId`: ID de la sesión
- `userId`: ID del usuario (opcional para guests)
- `nombre`: Nombre del estudiante
- `correo`: Email del estudiante
- `puntajeFinal`: 0 (inicial)
- `tiempoTotal`: 0 (inicial)
- `respuestas`: Map vacío
- `completado`: false

### 📝 Método: `submitAnswer()` - Enviar respuesta y actualizar puntaje
```typescript
/**
 * 📝 MÉTODO DE GUARDADO EN BD: Enviar respuesta y actualizar puntaje
 * OPERACIÓN: UPDATE (modificación directa + save())
 * TABLA: SessionScore (MongoDB Collection)
 */
```

**Campos actualizados:**
- `puntajeFinal`: Se incrementa según respuesta correcta
- `tiempoTotal`: Se suma el tiempo gastado
- `respuestas`: Map con detalles de cada respuesta

**Lógica de puntaje:**
- Respuesta nueva: suma puntos
- Respuesta mejorada: reemplaza puntos
- Respuesta peor: mantiene puntos anteriores

### ✅ Método: `completeSession()` - Completar sesión (GUARDADO FINAL)
```typescript
/**
 * ✅ MÉTODO DE GUARDADO EN BD: Completar sesión (GUARDADO FINAL)
 * OPERACIÓN: UPDATE (modificación directa + save())
 * TABLA: SessionScore (MongoDB Collection)
 */
```

**Este es el MÉTODO PRINCIPAL donde se guarda el puntaje final cuando:**
- Un estudiante completa toda la sesión
- Se envían todos los resultados finales
- Se marca la sesión como completada

**Campos finales guardados:**
- `puntajeFinal`: Puntaje final (máximo 20 puntos)
- `tiempoTotal`: Tiempo total gastado en segundos
- `respuestas`: Map completo con todas las respuestas
- `completado`: true
- `fechaResolucion`: Timestamp de finalización

---

## 🔧 Métodos Mongoose Utilizados

### Operaciones CREATE:
- `new Model() + save()` - Crear nuevos documentos

### Operaciones READ:
- `findOne()` - Buscar un documento
- `findById()` - Buscar por ID
- `find()` - Buscar múltiples documentos

### Operaciones UPDATE:
- `Modificación directa + save()` - Actualizar propiedades y guardar
- `findOneAndUpdate()` - Buscar y actualizar en una operación

### Operaciones DELETE:
- `deleteOne()` - Eliminar un documento
- `findByIdAndDelete()` - Buscar y eliminar por ID

---

## 🚀 Flujo de Datos Completo

### 1. **Registro de Usuario**
```
Frontend → AuthController → AuthService → UserModel.save() → MongoDB
```

### 2. **Creación de Ejercicio**
```
Frontend → ExerciseController → ExerciseService → ExerciseModel.save() → MongoDB
```

### 3. **Creación de Sesión**
```
Frontend → SessionController → SessionService → SessionModel.save() → MongoDB
```

### 4. **Guardado de Puntajes**
```
Frontend → SessionScoreController → SessionScoreService → SessionScoreModel.save() → MongoDB
```

### 5. **Completar Sesión (Flujo Final)**
```
1. Estudiante responde preguntas → submitAnswer() → UPDATE SessionScore
2. Estudiante completa sesión → completeSession() → UPDATE SessionScore (final)
3. Profesor ve resultados → getSessionScores() → READ SessionScore
```

---

## 📈 Endpoints de API Relacionados

### Usuarios:
- `POST /auth/register` → Crear usuario
- `POST /auth/login` → Autenticar usuario

### Ejercicios:
- `POST /exercise-generator/generate` → Crear ejercicio
- `PUT /exercise-generator/update` → Actualizar ejercicio
- `DELETE /exercise-generator/:id` → Eliminar ejercicio

### Sesiones:
- `POST /sessions` → Crear sesión
- `POST /sessions/join` → Unirse a sesión
- `PUT /sessions/:id/start` → Iniciar sesión
- `PUT /sessions/:id/end` → Finalizar sesión

### Puntajes:
- `POST /session-scores/initialize` → Inicializar puntaje
- `POST /session-scores/submit-answer` → Enviar respuesta
- `POST /session-scores/complete` → **Completar sesión (GUARDADO FINAL)**

---

## 🔒 Consideraciones de Seguridad

1. **Contraseñas**: Se hashean con bcrypt antes de guardar
2. **Validaciones**: Se valida que usuarios existan y tengan permisos
3. **Autenticación**: JWT tokens para autenticar requests
4. **Autorización**: Guards para verificar roles (TEACHER/STUDENT)

---

## 💡 Notas Importantes

- **Mongoose** maneja automáticamente los timestamps `createdAt` y `updatedAt`
- Los **ObjectId** de MongoDB se convierten automáticamente
- Las **validaciones** se realizan antes de guardar en BD
- Los **índices** están configurados para optimizar consultas
- El **puntaje máximo** por sesión es 20 puntos
- Los **usuarios guest** pueden participar sin registro completo
