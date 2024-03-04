export default function InvalidTokenException() {
  this.message = 'invalid_token';
  this.status = 400;
}
