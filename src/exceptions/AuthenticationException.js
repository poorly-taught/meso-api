export default function AuthenticationException() {
  this.message = 'auth_failure';
  this.status = 401;
}
