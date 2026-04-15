import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * This guard tries to authenticate the user via JWT.
 * Unlike the standard JwtAuthGuard, it does NOT throw 401 if no token is provided.
 * It just sets req.user = null for unauthenticated requests.
 * Used on routes that work for both guests and logged-in users (e.g. cart).
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    // If no user found (guest), return null instead of throwing
    return user || null;
  }
}
