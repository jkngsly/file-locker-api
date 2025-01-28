import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'
import { AuthService } from 'src/auth/auth.service'
import { LoginDTO } from '@/auth/dto/login.dto'
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { ExtractJwt } from 'passport-jwt';
import { JwtRefreshGuard } from 'src/guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService
    ){}
 
    @Post('login')
    login(@Body() loginDto: LoginDTO) {
        return this.authService.login(loginDto.email, loginDto.password);
    }
    
    @UseGuards(JwtRefreshGuard)
    @Get('refresh')
    refreshTokens(@Req() req: Request) {
        // @ts-ignore (ノಠ益ಠ)ノ彡┻━┻ 
        const token = req.headers.authorization?.split(' ')[1]; 
        // @ts-ignore (ノಠ益ಠ)ノ彡┻━┻ 
        const userId = req.user['userId'];
        return this.authService.refreshTokens(userId, token); 
    }

    @UseGuards(JwtAuthGuard)
    @Get('verify')
    verify(@Req() req: Request) {
        // @ts-ignore (ノಠ益ಠ)ノ彡┻━┻ 
        const token = req.headers.authorization?.split(' ')[1]; 
        return this.authService.verify(token)
    }
}