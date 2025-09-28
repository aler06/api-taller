# 🎨 Frontend Structure for Sessions

## 📁 Estructura de Carpetas Recomendada

```
frontend/
├── src/
│   ├── components/
│   │   ├── session/
│   │   │   ├── SessionJoinPage.tsx
│   │   │   ├── SessionGameRoom.tsx
│   │   │   ├── ParticipantsList.tsx
│   │   │   └── GameComponents/
│   │   │       ├── HangmanGame.tsx
│   │   │       ├── QuizGame.tsx
│   │   │       ├── FillBlankGame.tsx
│   │   │       └── FlipCardsGame.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   └── common/
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorMessage.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── websocket.ts
│   │   └── auth.ts
│   ├── types/
│   │   ├── session.ts
│   │   ├── user.ts
│   │   └── exercise.ts
│   ├── hooks/
│   │   ├── useSession.ts
│   │   ├── useWebSocket.ts
│   │   └── useAuth.ts
│   └── utils/
│       └── constants.ts
```

## 🔗 API Endpoints que tu Frontend Necesita

### 📊 Obtener Información de Sesión
```typescript
GET /api/v1/session/join/{accessCode}
// Respuesta: SessionData completa
```

### 🔐 Autenticación
```typescript
POST /api/v1/auth/login
POST /api/v1/auth/register
GET /api/v1/auth/profile
```

### 🎮 Unirse a Sesión (con autenticación)
```typescript
POST /api/v1/sessions/join
// Body: { studentId: string, accessCode: string }
```

## 🔌 WebSocket Integration

### Conexión
```typescript
const socket = io('http://localhost:3000/sessions');
```

### Eventos Principales
```typescript
// Unirse a sesión
socket.emit('joinSession', {
  sessionId: string,
  userId: string,
  accessCode: string
});

// Escuchar eventos
socket.on('sessionJoined', (data) => { /* Usuario se unió */ });
socket.on('userJoined', (data) => { /* Nuevo participante */ });
socket.on('sessionStarted', (data) => { /* Sesión comenzó */ });
socket.on('answerResult', (data) => { /* Resultado de respuesta */ });
```

## 📱 Componentes Principales

### 1. SessionJoinPage.tsx
- Muestra información de la sesión
- Formularios de login/registro
- Validación de acceso

### 2. SessionGameRoom.tsx
- Interfaz principal del juego
- Lista de participantes
- Componente de juego específico

### 3. Game Components
- HangmanGame.tsx - Para juegos de ahorcado
- QuizGame.tsx - Para preguntas y respuestas
- FillBlankGame.tsx - Para llenar espacios
- FlipCardsGame.tsx - Para tarjetas

### 4. WebSocket Service
- Manejo de conexiones en tiempo real
- Estados de conexión
- Eventos de sesión

## 🎯 Flujo de Usuario

1. **Usuario accede al link** → `/session/join/LXQ7TM`
2. **Frontend obtiene datos** → `GET /api/v1/session/join/LXQ7TM`
3. **Muestra página de unión** → Información + Auth forms
4. **Usuario se autentica** → `POST /api/v1/auth/login`
5. **Se une a sesión** → `POST /api/v1/sessions/join`
6. **Conecta WebSocket** → `io('http://localhost:3000/sessions')`
7. **Entra al juego** → Interfaz interactiva en tiempo real

## 📊 TypeScript Types Necesarios

```typescript
interface SessionData {
  id: string;
  teacher: User;
  exercise: Exercise;
  name: string;
  description?: string;
  accessCode: string;
  status: 'waiting' | 'active' | 'finished' | 'cancelled';
  duration: number;
  participants: User[];
  maxParticipants: number;
  allowLateJoin: boolean;
  showLeaderboard: boolean;
}

interface Exercise {
  id: string;
  game: 'quiz' | 'hangman' | 'fill_in_the_blank' | 'flip_cards';
  questions?: Question[];
  word?: string;
  hint?: string;
  cards?: Card[];
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'teacher' | 'student';
}
```
