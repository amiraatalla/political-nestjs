import {
  Controller,
  Post,
  Req,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { RequestWithUser } from '../core/interfaces';
import { AuthService } from './auth.service';
import { SignUpDto, SigninDto, ForgetPasswordDto, ResetPasswordDto } from './dto';
import { ReaderSignUpDto } from './dto/reader-sign-up.dto';
import { LocalAuthGuard, JwtAuthGuard, JwtRefreshGuard } from './guards';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  @Post('/signup-newspaper')
  @ApiOperation({ summary: 'Create  newspaper account - MNG' })
  async signUp(@Req() req: RequestWithUser, @Res() res: Response, @Body() signUpDto: SignUpDto) {
    return await this.authService.signUp(req, res, signUpDto);
  }

  @Post('/signup-reader')
  @ApiOperation({ summary: 'Create reader - rdr' })
  async ReaderSignUp(@Req() req: RequestWithUser, @Res() res: Response, @Body() signUpDto: ReaderSignUpDto) {
    return await this.authService.readerSignUp(req, res, signUpDto);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/signin')
  @ApiOperation({ summary: 'Login user with email and password - any' })
  @ApiBody({ type: SigninDto })
  public signIn(@Req() req: RequestWithUser, @Res() res: Response) {
   return this.authService.signIn(req,res)
  }
  

  @Get('/logout')
  @ApiOperation({ summary: 'Logout user from current device - any' })
  public logOut(@Req() req: RequestWithUser) {
    req.cookies.session = null;
    return true;
  }


  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Refresh accessToken with a new one' })
  @Get('/refresh')
  refresh(@Req() req: RequestWithUser) {
    this.authService.addJwtToCookie(req);
    return { accessToken: req.cookies.session.jwt, user: req.user };
  }

  @Post('/send-reverify-email')
  @ApiOperation({ summary: 'Send reverify email' })
  async resendVerifyEmail(@Body() dto: ForgetPasswordDto) {
    return await this.authService.sendVerifyEmail(dto);
  }

  @Get('/verify-email/:code')
  @ApiOperation({ summary: 'Verify email' })
  async verifyEmail(@Param('code') code: string) {
    return await this.authService.verifyEmail(code);
  }


  @Post('/forgot-password')
  @ApiOperation({ summary: 'Forgot password' })
  async forgotPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return await this.authService.forgotPassword(forgetPasswordDto.email);
  }

  @Post('/reset-password')
  @ApiOperation({ summary: 'Reset password' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return await this.authService.resetPassword(resetPasswordDto);
  }


  @UseGuards(JwtAuthGuard)
  @Get('/protected')
  @ApiOperation({ summary: 'Test JWT is working' })
  getProtected(): string {
    return `JWT is working`;
  }
}
