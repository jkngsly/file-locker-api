import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from 'src/auth/auth.service'
import { LoginDTO } from '@/auth/dto/login.dto'

@Controller('auth')
export class AuthController {

    constructor(
        private authService: AuthService
    ){}
 
    @Post('login')
    login(@Body() loginDto: LoginDTO) {
        return this.authService.login(loginDto.email, loginDto.password);
    }
} 