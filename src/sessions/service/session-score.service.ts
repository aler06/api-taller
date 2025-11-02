import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SessionScore, SessionScoreDocument } from '../model/session-score.model';
import { Session, SessionDocument } from '../model/session.model';
import { Exercise, ExerciseDocument } from '../../exercise-generator/model/exercise.model';
import { SubmitAnswerDTO } from '../dto/submit-answer.dto';
import { CompleteSessionDTO } from '../dto/complete-session.dto';
import { SessionScoreResponseDTO, SessionScoreSummaryDTO, AnswerDetailDTO } from '../dto/session-score-response.dto';
import { Game } from '../../exercise-generator/enum/game.enum';
import * as ExcelJS from 'exceljs';

@Injectable()
export class SessionScoreService {
  private readonly MAX_SCORE = 20;
  private readonly NON_SCORING_GAMES = [Game.ROULETTE, Game.FLIP_CARDS];

  constructor(
    @InjectModel(SessionScore.name) private sessionScoreModel: Model<SessionScoreDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Exercise.name) private exerciseModel: Model<ExerciseDocument>,
  ) {}

  /**
   * Initialize or get existing score record for a student in a session
   */
  async initializeScore(
    sessionId: string,
    userId?: string,
    nombre?: string,
    correo?: string,
  ): Promise<SessionScoreResponseDTO> {
    // Validate session exists
    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Check if score record already exists
    let scoreRecord: SessionScoreDocument | null = null;

    if (userId) {
      scoreRecord = await this.sessionScoreModel.findOne({
        sessionId: new Types.ObjectId(sessionId),
        userId: new Types.ObjectId(userId),
      });
    } else if (correo) {
      scoreRecord = await this.sessionScoreModel.findOne({
        sessionId: new Types.ObjectId(sessionId),
        correo: correo,
      });
    }

    // If record exists, return it
    if (scoreRecord) {
      return this.mapToScoreResponse(scoreRecord);
    }

    // Create new score record
    const newScore = new this.sessionScoreModel({
      sessionId: new Types.ObjectId(sessionId),
      userId: userId ? new Types.ObjectId(userId) : undefined,
      nombre: nombre,
      correo: correo,
      puntajeFinal: 0,
      tiempoTotal: 0,
      respuestas: new Map(),
      completado: false,
    });

    const savedScore = await newScore.save();
    return this.mapToScoreResponse(savedScore);
  }

  /**
   * Submit an answer and update the score
   */
  async submitAnswer(
    submitAnswerDto: SubmitAnswerDTO,
    userId?: string,
  ): Promise<{ 
    scoreRecord: SessionScoreResponseDTO; 
    isCorrect: boolean; 
    points: number; 
    correctAnswer?: string;
    explanation?: string;
  }> {
    const { sessionId, exerciseId, questionId, answer, timeSpent, nombre, correo } = submitAnswerDto;

    // 🟢 LOG: Inicio de submit answer
    console.log('📝 Submit Answer:', {
      sessionId,
      exerciseId,
      questionId,
      userId: userId || 'guest',
      nombre,
      correo,
      answerLength: answer?.length || 0,
      timeSpent,
    });

    // Validate session
    const session = await this.sessionModel.findById(sessionId).populate('exerciseIds');
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Validate exercise belongs to session
    const exercise = await this.exerciseModel.findById(exerciseId);
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    console.log('🎮 Exercise type:', exercise.game);

    const exerciseInSession = (session.exerciseIds as any[]).find(
      ex => ex._id.toString() === exerciseId
    );
    if (!exerciseInSession) {
      throw new BadRequestException('Exercise does not belong to this session');
    }

    // Check if exercise type should be scored
    if (this.NON_SCORING_GAMES.includes(exercise.game)) {
      throw new BadRequestException(`Exercise type ${exercise.game} is not scored`);
    }

    // Find or create score record
    let scoreRecord = await this.findOrCreateScoreRecord(sessionId, userId, nombre, correo);

    console.log('📌 Score record BEFORE evaluation:', {
      id: scoreRecord._id,
      currentScore: scoreRecord.puntajeFinal,
      totalAnswers: scoreRecord.respuestas.size,
    });

    // Validate question and calculate score
    const { isCorrect, points, correctAnswer, explanation } = await this.evaluateAnswer(
      exercise,
      questionId,
      answer,
      timeSpent,
    );

    // 🟢 LOG: Resultado de evaluación
    console.log('✅ Answer evaluated:', {
      isCorrect,
      points,
      correctAnswer: correctAnswer?.substring(0, 50) || 'N/A',
      hasExplanation: !!explanation,
    });

    // Get total scoreable questions in session
    const totalScoreableQuestions = await this.getTotalScoreableQuestions(session);

    // Calculate points per question
    const pointsPerQuestion = totalScoreableQuestions > 0 
      ? this.MAX_SCORE / totalScoreableQuestions 
      : 0;

    // Adjust points to fit within max score
    // Para ejercicios con puntuación parcial (matching, drag-and-drop, quiz múltiple)
    // points puede ser un valor entre 0 y 1
    const adjustedPoints = points * pointsPerQuestion;

    console.log('📊 Score calculation:', {
      totalScoreableQuestions,
      pointsPerQuestion: pointsPerQuestion.toFixed(2),
      rawPoints: points,
      adjustedPoints: adjustedPoints.toFixed(2),
    });

    // Update score record
    const answerKey = `${exerciseId}_${questionId}`;
    const existingAnswer = scoreRecord.respuestas.get(answerKey);

    console.log('🔑 Answer key:', answerKey);
    console.log('📝 Existing answer:', existingAnswer ? { points: existingAnswer.points, isCorrect: existingAnswer.isCorrect } : 'NONE');
    console.log('💯 Current puntajeFinal BEFORE update:', scoreRecord.puntajeFinal);

    // Only add points if this is a new answer or better than previous
    if (!existingAnswer) {
      // Nueva respuesta - agregar puntos
      const previousScore = scoreRecord.puntajeFinal;
      scoreRecord.puntajeFinal = Math.min(
        scoreRecord.puntajeFinal + adjustedPoints,
        this.MAX_SCORE
      );
      console.log(`➕ New answer - added points: ${adjustedPoints.toFixed(2)} (${previousScore.toFixed(2)} → ${scoreRecord.puntajeFinal.toFixed(2)})`);
    } else if (adjustedPoints > existingAnswer.points) {
      // Respuesta mejorada - reemplazar puntos (soporta puntuación parcial)
      const pointsDifference = adjustedPoints - existingAnswer.points;
      const previousScore = scoreRecord.puntajeFinal;
      scoreRecord.puntajeFinal = Math.min(
        scoreRecord.puntajeFinal + pointsDifference,
        this.MAX_SCORE
      );
      console.log(`🔄 Improved answer - points difference: ${pointsDifference.toFixed(2)} (${previousScore.toFixed(2)} → ${scoreRecord.puntajeFinal.toFixed(2)})`);
    } else {
      console.log(`⏭️  Answer not improved - keeping previous score: ${scoreRecord.puntajeFinal.toFixed(2)}`);
    }

    console.log('💯 Current puntajeFinal AFTER update:', scoreRecord.puntajeFinal);

    // Store answer details
    scoreRecord.respuestas.set(answerKey, {
      exerciseId,
      questionId,
      answer,
      isCorrect,
      points: adjustedPoints,
      timeSpent,
      timestamp: new Date(),
    });

    // Update total time
    if (!existingAnswer) {
      scoreRecord.tiempoTotal += timeSpent;
    }

    // Round to 2 decimal places
    scoreRecord.puntajeFinal = Math.round(scoreRecord.puntajeFinal * 100) / 100;

    // Save and reload to ensure we have the latest data
    const savedScore = await scoreRecord.save();

    console.log('💾 Score saved:', {
      finalScore: savedScore.puntajeFinal,
      totalTime: savedScore.tiempoTotal,
      totalAnswers: savedScore.respuestas.size,
      documentId: savedScore._id,
    });

    // Reload from database to ensure we have the most recent state
    const reloadedScore = await this.sessionScoreModel.findById(savedScore._id);
    
    if (!reloadedScore) {
      throw new NotFoundException('Score record not found after save');
    }

    console.log('🔄 Reloaded score from DB:', {
      finalScore: reloadedScore.puntajeFinal,
      totalTime: reloadedScore.tiempoTotal,
      totalAnswers: reloadedScore.respuestas.size,
    });

    return {
      scoreRecord: this.mapToScoreResponse(reloadedScore),
      isCorrect,
      points: adjustedPoints,
      correctAnswer,
      explanation,
    };
  }

  /**
   * Mark session as completed for a student
   * Now accepts all session results in a single request
   */
  async completeSession(
    completeSessionDto: CompleteSessionDTO,
    userId?: string,
  ): Promise<SessionScoreResponseDTO> {
    const { sessionId, nombre, correo, puntajeFinal, tiempoTotal, respuestas } = completeSessionDto;

    console.log('📝 Complete Session Request:', {
      sessionId,
      nombre,
      correo,
      puntajeFinal,
      tiempoTotal,
      respuestasCount: respuestas?.length || 0,
    });

    // Find or create score record
    let scoreRecord = await this.findOrCreateScoreRecord(sessionId, userId, nombre, correo);

    // If final results are provided, use them directly
    if (puntajeFinal !== undefined && tiempoTotal !== undefined && respuestas && respuestas.length > 0) {
      console.log('✅ Using final results from frontend');
      
      // Set final score and time
      scoreRecord.puntajeFinal = Math.min(puntajeFinal, this.MAX_SCORE);
      scoreRecord.tiempoTotal = tiempoTotal;
      
      // Convert array to Map for respuestas
      const respuestasMap = new Map();
      
      respuestas.forEach(resp => {
        const key = `${resp.exerciseId}_${resp.questionId}`;
        
        // Calculate points per answer (distribute MAX_SCORE across all answers)
        const pointsPerAnswer = this.MAX_SCORE / respuestas.length;
        const points = resp.isCorrect ? pointsPerAnswer : 0;
        
        respuestasMap.set(key, {
          exerciseId: resp.exerciseId,
          questionId: resp.questionId,
          answer: resp.answer,
          isCorrect: resp.isCorrect,
          points: Math.round(points * 100) / 100,
          timeSpent: resp.timeSpent,
          timestamp: new Date(),
        });
      });
      
      scoreRecord.respuestas = respuestasMap;
      
      console.log('💾 Saving score record:', {
        puntajeFinal: scoreRecord.puntajeFinal,
        tiempoTotal: scoreRecord.tiempoTotal,
        respuestasCount: scoreRecord.respuestas.size,
      });
    } else {
      console.log('⚠️  No final results provided - using existing score');
    }

    // Mark as completed
    scoreRecord.completado = true;
    scoreRecord.fechaResolucion = new Date();

    const savedScore = await scoreRecord.save();
    
    console.log('✅ Session completed successfully:', {
      id: savedScore._id,
      puntajeFinal: savedScore.puntajeFinal,
      completado: savedScore.completado,
    });

    return this.mapToScoreResponse(savedScore);
  }

  /**
   * Get score for a specific student in a session
   */
  async getStudentScore(
    sessionId: string,
    userId?: string,
    correo?: string,
  ): Promise<SessionScoreResponseDTO> {
    let scoreRecord: SessionScoreDocument | null = null;

    if (userId) {
      scoreRecord = await this.sessionScoreModel.findOne({
        sessionId: new Types.ObjectId(sessionId),
        userId: new Types.ObjectId(userId),
      });
    } else if (correo) {
      scoreRecord = await this.sessionScoreModel.findOne({
        sessionId: new Types.ObjectId(sessionId),
        correo: correo,
      });
    }

    if (!scoreRecord) {
      throw new NotFoundException('Score record not found');
    }

    return this.mapToScoreResponse(scoreRecord);
  }

  /**
   * Get all scores for a session (for teachers)
   */
  async getSessionScores(sessionId: string): Promise<SessionScoreSummaryDTO> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const scores = await this.sessionScoreModel
      .find({ sessionId: new Types.ObjectId(sessionId) })
      .sort({ puntajeFinal: -1, tiempoTotal: 1 });

    const scoreResponses = scores.map(score => this.mapToScoreResponse(score));

    const completedScores = scores.filter(s => s.completado);
    const totalScore = completedScores.reduce((sum, s) => sum + s.puntajeFinal, 0);
    const averageScore = completedScores.length > 0 ? totalScore / completedScores.length : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores.map(s => s.puntajeFinal)) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores.map(s => s.puntajeFinal)) : 0;

    return {
      sessionId: session._id.toString(),
      sessionName: session.name,
      totalParticipants: scores.length,
      completedCount: completedScores.length,
      averageScore: Math.round(averageScore * 100) / 100,
      highestScore: Math.round(highestScore * 100) / 100,
      lowestScore: Math.round(lowestScore * 100) / 100,
      scores: scoreResponses,
    };
  }

  /**
   * Get all scores for a specific user across all sessions
   */
  async getUserScores(userId: string): Promise<SessionScoreResponseDTO[]> {
    const scores = await this.sessionScoreModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });

    return scores.map(score => this.mapToScoreResponse(score));
  }

  /**
   * Delete a score record (admin only)
   */
  async deleteScore(scoreId: string): Promise<void> {
    const result = await this.sessionScoreModel.findByIdAndDelete(scoreId);
    if (!result) {
      throw new NotFoundException('Score record not found');
    }
  }

  // ========== PRIVATE HELPER METHODS ==========

  private async findOrCreateScoreRecord(
    sessionId: string,
    userId?: string,
    nombre?: string,
    correo?: string,
  ): Promise<SessionScoreDocument> {
    let scoreRecord: SessionScoreDocument | null = null;

    console.log('🔍 Finding score record:', { sessionId, userId, nombre, correo });

    if (userId) {
      scoreRecord = await this.sessionScoreModel.findOne({
        sessionId: new Types.ObjectId(sessionId),
        userId: new Types.ObjectId(userId),
      });
      console.log('📋 Found by userId:', scoreRecord ? `ID: ${scoreRecord._id}, Score: ${scoreRecord.puntajeFinal}` : 'NOT FOUND');
    } else if (correo) {
      scoreRecord = await this.sessionScoreModel.findOne({
        sessionId: new Types.ObjectId(sessionId),
        correo: correo,
      });
      console.log('📋 Found by correo:', scoreRecord ? `ID: ${scoreRecord._id}, Score: ${scoreRecord.puntajeFinal}` : 'NOT FOUND');
    } else {
      console.log('⚠️  WARNING: No userId or correo provided - will create new record each time!');
    }

    if (!scoreRecord) {
      console.log('🆕 Creating new score record');
      scoreRecord = await this.initializeScoreRecord(sessionId, userId, nombre, correo);
      console.log('✅ New record created:', { id: scoreRecord._id, initialScore: scoreRecord.puntajeFinal });
    } else {
      console.log('♻️  Using existing record:', { id: scoreRecord._id, currentScore: scoreRecord.puntajeFinal });
    }

    return scoreRecord;
  }

  private async initializeScoreRecord(
    sessionId: string,
    userId?: string,
    nombre?: string,
    correo?: string,
  ): Promise<SessionScoreDocument> {
    const newScore = new this.sessionScoreModel({
      sessionId: new Types.ObjectId(sessionId),
      userId: userId ? new Types.ObjectId(userId) : undefined,
      nombre: nombre,
      correo: correo,
      puntajeFinal: 0,
      tiempoTotal: 0,
      respuestas: new Map(),
      completado: false,
    });

    return await newScore.save();
  }

  private async evaluateAnswer(
    exercise: ExerciseDocument,
    questionId: string,
    answer: string,
    timeSpent: number,
  ): Promise<{ 
    isCorrect: boolean; 
    points: number; 
    correctAnswer?: string;
    explanation?: string;
  }> {
    let isCorrect = false;
    let points = 0;
    let correctAnswer: string | undefined;
    let explanation: string | undefined;

    switch (exercise.game) {
      case Game.QUIZ:
        const quizQuestion = exercise.questions?.find((q: any) => q._id?.toString() === questionId);
        if (quizQuestion) {
          const isMultipleChoice = Array.isArray(quizQuestion.correct_answer);
          
          if (isMultipleChoice) {
            // Opción múltiple con varias respuestas correctas
            try {
              const selectedAnswers = JSON.parse(answer);
              const correctAnswers = quizQuestion.correct_answer;
              
              if (!Array.isArray(selectedAnswers)) {
                isCorrect = false;
                points = 0;
              } else {
                const correctlyMarked = selectedAnswers.filter((ans: string) => correctAnswers.includes(ans)).length;
                const incorrectlyMarked = selectedAnswers.filter((ans: string) => !correctAnswers.includes(ans)).length;
                
                // Fórmula: (correctas - incorrectas) / total correctas
                const score = Math.max(0, (correctlyMarked - incorrectlyMarked) / correctAnswers.length);
                isCorrect = score === 1.0;
                points = score; // Puntuación parcial 0.0 a 1.0
              }
              
              correctAnswer = JSON.stringify(correctAnswers);
              explanation = quizQuestion.explanation;
            } catch (e) {
              isCorrect = false;
              points = 0;
            }
          } else {
            // Opción única (comportamiento actual)
            isCorrect = quizQuestion.correct_answer.toLowerCase().trim() === answer.toLowerCase().trim();
            correctAnswer = quizQuestion.correct_answer;
            explanation = quizQuestion.explanation;
            points = isCorrect ? 1 : 0;
          }
        }
        break;

      case Game.TRUE_OR_FALSE:
        const tfQuestion = exercise.trueFalseQuestions?.find((q: any) => q._id?.toString() === questionId);
        if (tfQuestion) {
          const correctAnswerBool = tfQuestion.correct_answer;
          const answerBool = answer.toLowerCase() === 'true' || answer === '1';
          isCorrect = correctAnswerBool === answerBool;
          correctAnswer = correctAnswerBool.toString();
          explanation = tfQuestion.explanation;
          points = isCorrect ? 1 : 0;
        }
        break;

      case Game.FILL_IN_THE_BLANK:
        // 🔴 CORREGIDO: Usar exercise.questions en lugar de exercise.phrases
        const fibQuestion = exercise.questions?.find((q: any) => q._id?.toString() === questionId);
        if (fibQuestion) {
          isCorrect = fibQuestion.correct_answer.toLowerCase().trim() === answer.toLowerCase().trim();
          correctAnswer = fibQuestion.correct_answer;
          explanation = fibQuestion.explanation;
          points = isCorrect ? 1 : 0;
        }
        break;

      case Game.HANGMAN:
        if (exercise.word) {
          isCorrect = exercise.word.toLowerCase().trim() === answer.toLowerCase().trim();
          correctAnswer = exercise.word;
          points = isCorrect ? 1 : 0;
        }
        break;

      case Game.DRAG_AND_DROP:
        // 🟡 MEJORADO: Puntuación parcial dinámica basada en elementos correctos
        try {
          const studentOrder = JSON.parse(answer);
          const correctOrder = exercise.correctOrder || [];
          
          if (!Array.isArray(studentOrder) || studentOrder.length === 0) {
            isCorrect = false;
            points = 0;
          } else {
            // Contar cuántos elementos están en la posición correcta
            let correctPositions = 0;
            const minLength = Math.min(studentOrder.length, correctOrder.length);
            
            for (let i = 0; i < minLength; i++) {
              if (studentOrder[i] === correctOrder[i]) {
                correctPositions++;
              }
            }
            
            // Puntuación proporcional: elementos correctos / total de elementos
            points = correctOrder.length > 0 ? correctPositions / correctOrder.length : 0;
            isCorrect = points === 1.0;
          }
          
          correctAnswer = JSON.stringify(correctOrder);
          explanation = exercise.explanation;
        } catch (e) {
          isCorrect = false;
          points = 0;
        }
        break;

      case Game.MATCHING:
        // 🔴 CORREGIDO: Validación real con puntuación parcial dinámica
        try {
          const studentPairs = JSON.parse(answer);
          const correctPairs = exercise.pairs || [];
          
          if (!Array.isArray(studentPairs) || studentPairs.length === 0) {
            isCorrect = false;
            points = 0;
          } else {
            // Contar cuántos pares son correctos
            let correctMatches = 0;
            
            studentPairs.forEach((studentPair: any) => {
              const correctPair = correctPairs.find((cp: any) => cp.term === studentPair.term);
              if (correctPair && correctPair.match === studentPair.match) {
                correctMatches++;
              }
            });
            
            // Puntuación proporcional: pares correctos / total de pares
            points = correctPairs.length > 0 ? correctMatches / correctPairs.length : 0;
            isCorrect = points === 1.0 && studentPairs.length === correctPairs.length;
          }
          
          correctAnswer = JSON.stringify(correctPairs);
          explanation = exercise.explanation;
        } catch (e) {
          isCorrect = false;
          points = 0;
        }
        break;

      default:
        throw new BadRequestException(`Unsupported exercise type: ${exercise.game}`);
    }

    return { isCorrect, points, correctAnswer, explanation };
  }

  private async getTotalScoreableQuestions(session: SessionDocument): Promise<number> {
    let totalQuestions = 0;

    const exercises = await this.exerciseModel.find({
      _id: { $in: session.exerciseIds }
    });

    for (const exercise of exercises) {
      // Skip non-scoring games
      if (this.NON_SCORING_GAMES.includes(exercise.game)) {
        continue;
      }

      switch (exercise.game) {
        case Game.QUIZ:
          totalQuestions += exercise.questions?.length || 0;
          break;
        case Game.TRUE_OR_FALSE:
          totalQuestions += exercise.trueFalseQuestions?.length || 0;
          break;
        case Game.FILL_IN_THE_BLANK:
          totalQuestions += exercise.phrases?.length || 0;
          break;
        case Game.HANGMAN:
          totalQuestions += 1; // One word to guess
          break;
        case Game.DRAG_AND_DROP:
          totalQuestions += 1; // One ordering task
          break;
        case Game.MATCHING:
          totalQuestions += 1; // One matching task
          break;
      }
    }

    return totalQuestions;
  }

  private mapToScoreResponse(score: SessionScoreDocument): SessionScoreResponseDTO {
    const respuestas: AnswerDetailDTO[] = [];
    
    if (score.respuestas) {
      score.respuestas.forEach((value: any) => {
        respuestas.push({
          exerciseId: value.exerciseId,
          questionId: value.questionId,
          answer: value.answer,
          isCorrect: value.isCorrect,
          points: value.points,
          timeSpent: value.timeSpent,
          timestamp: value.timestamp,
        });
      });
    }

    return {
      id: score._id.toString(),
      sessionId: score.sessionId.toString(),
      userId: score.userId?.toString(),
      nombre: score.nombre,
      correo: score.correo,
      puntajeFinal: score.puntajeFinal,
      tiempoTotal: score.tiempoTotal,
      fechaResolucion: score.fechaResolucion,
      completado: score.completado,
      respuestas: respuestas,
      createdAt: score.createdAt,
      updatedAt: score.updatedAt,
    };
  }

  /**
   * Export session scores to Excel
   */
  async exportSessionScoresToExcel(sessionId: string): Promise<Buffer> {
    const session = await this.sessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const scores = await this.sessionScoreModel
      .find({ sessionId: new Types.ObjectId(sessionId) })
      .sort({ puntajeFinal: -1, tiempoTotal: 1 });

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Resultados de Sesión');

    // Set column widths
    worksheet.columns = [
      { header: 'Posición', key: 'position', width: 12 },
      { header: 'Estudiante', key: 'student', width: 25 },
      { header: 'Correo', key: 'email', width: 35 },
      { header: 'Puntaje Final', key: 'score', width: 15 },
      { header: 'Tiempo Total', key: 'time', width: 15 },
      { header: 'Respuestas', key: 'answers', width: 15 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Fecha', key: 'date', width: 20 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 25;

    // Add data rows
    scores.forEach((score, index) => {
      const totalAnswers = score.respuestas.size;
      const correctAnswers = Array.from(score.respuestas.values()).filter(
        (r: any) => r.isCorrect
      ).length;
      const percentage = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

      // Format time (seconds to MM:SS)
      const minutes = Math.floor(score.tiempoTotal / 60);
      const seconds = score.tiempoTotal % 60;
      const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      // Format date
      const dateFormatted = score.fechaResolucion
        ? new Date(score.fechaResolucion).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'N/A';

      const row = worksheet.addRow({
        position: `#${index + 1}`,
        student: score.nombre || 'Usuario Anónimo',
        email: score.correo || 'N/A',
        score: `${score.puntajeFinal.toFixed(1)} puntos`,
        time: timeFormatted,
        answers: `${correctAnswers}/${totalAnswers} (${percentage}%)`,
        status: score.completado ? 'Completado' : 'Incompleto',
        date: dateFormatted,
      });

      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' },
        };
      }

      // Center align all cells
      row.alignment = { vertical: 'middle', horizontal: 'center' };

      // Color code status
      const statusCell = row.getCell('status');
      if (score.completado) {
        statusCell.font = { color: { argb: 'FF00B050' }, bold: true };
      } else {
        statusCell.font = { color: { argb: 'FFFF0000' }, bold: true };
      }

      // Highlight top 3 positions
      if (index < 3) {
        const positionCell = row.getCell('position');
        positionCell.font = { bold: true, size: 12 };
        if (index === 0) {
          positionCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFD700' }, // Gold
          };
        } else if (index === 1) {
          positionCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFC0C0C0' }, // Silver
          };
        } else if (index === 2) {
          positionCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFCD7F32' }, // Bronze
          };
        }
      }
    });

    // Add summary section
    const summaryStartRow = scores.length + 3;
    worksheet.mergeCells(`A${summaryStartRow}:H${summaryStartRow}`);
    const summaryTitleCell = worksheet.getCell(`A${summaryStartRow}`);
    summaryTitleCell.value = 'RESUMEN DE LA SESIÓN';
    summaryTitleCell.font = { bold: true, size: 14 };
    summaryTitleCell.alignment = { horizontal: 'center' };
    summaryTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };

    const completedScores = scores.filter(s => s.completado);
    const totalScore = completedScores.reduce((sum, s) => sum + s.puntajeFinal, 0);
    const averageScore = completedScores.length > 0 ? totalScore / completedScores.length : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores.map(s => s.puntajeFinal)) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores.map(s => s.puntajeFinal)) : 0;

    const summaryData = [
      ['Nombre de la Sesión:', session.name],
      ['Total de Participantes:', scores.length],
      ['Completaron:', completedScores.length],
      ['Puntaje Promedio:', `${averageScore.toFixed(2)} puntos`],
      ['Puntaje Más Alto:', `${highestScore.toFixed(2)} puntos`],
      ['Puntaje Más Bajo:', `${lowestScore.toFixed(2)} puntos`],
    ];

    summaryData.forEach((data, index) => {
      const row = worksheet.addRow([data[0], data[1]]);
      row.getCell(1).font = { bold: true };
      row.getCell(1).alignment = { horizontal: 'right' };
      row.getCell(2).alignment = { horizontal: 'left' };
    });

    // Add borders to all cells with data
    worksheet.eachRow({ includeEmpty: false }, (row) => {
      row.eachCell({ includeEmpty: false }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
