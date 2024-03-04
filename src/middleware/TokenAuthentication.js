import AuthenticationException from '../exceptions/AuthenticationException';
import TokenService from '../services/token/TokenService';

export default function (request, response, next) {
  const authorization = request.headers.authorization;

  if (!authorization) {
    throw new AuthenticationException();
  }

  if (authorization) {
    const token = authorization.substring(7);
    TokenService.verifyToken(token)
      .then(({ userPointer }) => {
        request.userPointer = userPointer;
        next();
      })
      .catch(() => {
        next(new AuthenticationException());
      });
  }
}
