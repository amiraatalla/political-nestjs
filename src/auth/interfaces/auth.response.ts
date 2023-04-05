import { User } from '../../users/entities/user.entity';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
