# Sessions Module

This module provides real-time interactive sessions where teachers can invite students to participate in educational activities using published exercises.

## Features

- **Teacher Session Management**: Teachers can create, start, end, and cancel sessions
- **Student Participation**: Students can join sessions using access codes or shareable links
- **Real-time Communication**: WebSocket-based real-time updates for all participants
- **Exercise Integration**: Sessions are based on published exercises from the exercise-generator module
- **Access Control**: Role-based permissions (teachers vs students)
- **Session States**: Proper session lifecycle management (waiting → active → finished/cancelled)

## Architecture

### Models

- **Session**: Main session entity with teacher, exercise, participants, and settings
- **SessionStatus**: Enum for session states (waiting, active, finished, cancelled)

### DTOs

- **CreateSessionRequestDTO**: For creating new sessions
- **JoinSessionRequestDTO**: For students joining sessions
- **SessionResponseDTO**: Complete session information
- **SessionControlRequestDTO**: For controlling session state

### Components

- **SessionService**: Business logic for session management
- **SessionController**: REST API endpoints
- **SessionGateway**: WebSocket gateway for real-time communication
- **SessionsModule**: Module configuration

## API Endpoints

### POST /sessions
Create a new session (Teachers only)
```json
{
  "teacherId": "string",
  "exerciseId": "string", 
  "name": "string",
  "description": "string",
  "duration": 30,
  "maxParticipants": 50,
  "allowLateJoin": true,
  "showLeaderboard": false
}
```

### POST /sessions/join
Join a session (Students only)
```json
{
  "studentId": "string",
  "accessCode": "ABC123"
}
```

### GET /sessions/my-sessions
Get user's sessions (teachers get created sessions, students get joined sessions)

### GET /sessions/:sessionId
Get session details by ID

### PUT /sessions/:sessionId/start
Start a session (Teachers only)

### PUT /sessions/:sessionId/end
End a session (Teachers only)

### PUT /sessions/:sessionId/cancel
Cancel a session (Teachers only)

### GET /sessions/access-code/:accessCode
Get session info by access code (for join preview)

## WebSocket Events

### Connection
Connect to `/sessions` namespace

### Client → Server Events

#### joinSession
```json
{
  "sessionId": "string",
  "userId": "string", 
  "accessCode": "string"
}
```

#### leaveSession
```json
{
  "sessionId": "string",
  "userId": "string"
}
```

#### startSession
```json
{
  "sessionId": "string",
  "teacherId": "string"
}
```

#### endSession
```json
{
  "sessionId": "string",
  "teacherId": "string"
}
```

#### submitAnswer
```json
{
  "sessionId": "string",
  "userId": "string",
  "questionId": "string",
  "answer": "string",
  "timeSpent": 30
}
```

#### getSessionStatus
```json
{
  "sessionId": "string"
}
```

### Server → Client Events

#### sessionJoined
Emitted when user successfully joins a session

#### userJoined
Emitted to all participants when someone joins

#### userLeft
Emitted to all participants when someone leaves

#### sessionStarted
Emitted to all participants when session starts

#### sessionEnded
Emitted to all participants when session ends

#### answerResult
Emitted to student after submitting an answer

#### studentProgress
Emitted to teacher when student submits answer

#### participantCountUpdate
Emitted when participant count changes

#### sessionStatus
Response to getSessionStatus request

## Usage Flow

### Teacher Workflow
1. Teacher creates a session linked to a published exercise
2. System generates unique access code and shareable link
3. Teacher shares access code/link with students
4. Teacher starts the session when ready
5. Teacher monitors student progress in real-time
6. Teacher ends the session when complete

### Student Workflow
1. Student receives access code or link from teacher
2. Student joins session using the code
3. Student participates in real-time activities
4. Student submits answers and receives immediate feedback
5. Student can see their progress (if leaderboard is enabled)

## Session States

- **WAITING**: Session created but not started yet
- **ACTIVE**: Session is running and accepting answers
- **FINISHED**: Session ended normally
- **CANCELLED**: Session cancelled by teacher

## Security & Validation

- JWT authentication required for all endpoints
- Role-based access control (teachers vs students)
- Session ownership validation for control operations
- Exercise publication status validation
- Maximum participant limits
- Late join restrictions based on session settings

## Integration

The sessions module integrates with:
- **Users Module**: For teacher/student authentication and roles
- **Exercise Generator Module**: For exercise content and questions
- **Auth Module**: For authentication guards and decorators

## Environment Variables

- `FRONTEND_URL`: Base URL for generating shareable links

## Example Usage

### Creating a Session
```typescript
const session = await sessionService.createSession({
  teacherId: "507f1f77bcf86cd799439011",
  exerciseId: "507f1f77bcf86cd799439012", 
  name: "Geography Quiz Session",
  description: "Interactive European geography quiz",
  duration: 30,
  maxParticipants: 25,
  allowLateJoin: true,
  showLeaderboard: true
});
```

### Joining a Session
```typescript
const joinedSession = await sessionService.joinSession({
  studentId: "507f1f77bcf86cd799439013",
  accessCode: "ABC123"
});
```

### WebSocket Connection
```javascript
const socket = io('/sessions');

socket.emit('joinSession', {
  sessionId: '507f1f77bcf86cd799439014',
  userId: '507f1f77bcf86cd799439013',
  accessCode: 'ABC123'
});

socket.on('sessionJoined', (data) => {
  console.log('Joined session:', data);
});
```
