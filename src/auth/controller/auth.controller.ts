import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
    Get,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
} from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { LocalAuthGuard } from '../guard/local-auth.guard';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Iniciar sesión',
        description: 'Permite a un usuario autenticarse con email y contraseña',
    })
    @ApiBody({
        type: LoginRequestDto,
        description: 'Credenciales de acceso del usuario',
    })
    @ApiResponse({
        status: 200,
        description: 'Login exitoso',
        type: LoginResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Credenciales inválidas',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Credenciales inválidas' },
                error: { type: 'string', example: 'Unauthorized' },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 400 },
                message: { type: 'array', items: { type: 'string' } },
                error: { type: 'string', example: 'Bad Request' },
            },
        },
    })
    async login(@Body() loginDto: LoginRequestDto): Promise<LoginResponseDto> {
        return this.authService.login(loginDto);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Obtener perfil del usuario',
        description: 'Obtiene la información del usuario autenticado',
    })
    @ApiResponse({
        status: 200,
        description: 'Perfil del usuario obtenido exitosamente',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '66c1a2b3d4e5f6g7h8i9j0k1' },
                firstName: { type: 'string', example: 'Juan' },
                lastName: { type: 'string', example: 'Pérez' },
                email: { type: 'string', example: 'juan.perez@ejemplo.com' },
                role: { type: 'string', example: 'student' },
                isActive: { type: 'boolean', example: true },
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Token inválido o expirado',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Token inválido' },
                error: { type: 'string', example: 'Unauthorized' },
            },
        },
    })
    async getProfile(@Request() req: any) {
        const user = await this.authService.getUserFromToken(req.user.sub);
        return {
            id: (user as any)._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
        };
    }

    @Post('refresh')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Renovar token de acceso',
        description: 'Genera un nuevo token de acceso para el usuario autenticado',
    })
    @ApiResponse({
        status: 200,
        description: 'Token renovado exitosamente',
        schema: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                expiresIn: { type: 'number', example: 3600 },
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Token inválido o expirado',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Token inválido' },
                error: { type: 'string', example: 'Unauthorized' },
            },
        },
    })
    async refreshToken(@Request() req: any) {
        return this.authService.refreshToken(req.user.sub);
    }

    @Get('validate-token')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Validar token',
        description: 'Valida si el token de acceso es válido y no ha expirado',
    })
    @ApiResponse({
        status: 200,
        description: 'Token válido',
        schema: {
            type: 'object',
            properties: {
                valid: { type: 'boolean', example: true },
                user: {
                    type: 'object',
                    properties: {
                        sub: { type: 'string', example: '66c1a2b3d4e5f6g7h8i9j0k1' },
                        email: { type: 'string', example: 'juan.perez@ejemplo.com' },
                        role: { type: 'string', example: 'student' },
                        firstName: { type: 'string', example: 'Juan' },
                        lastName: { type: 'string', example: 'Pérez' },
                    },
                },
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Token inválido o expirado',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Token inválido' },
                error: { type: 'string', example: 'Unauthorized' },
            },
        },
    })
    async validateToken(@Request() req: any) {
        return {
            valid: true,
            user: req.user,
        };
    }
}
