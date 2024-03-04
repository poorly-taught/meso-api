/* eslint-disable no-unused-vars */
export default function (error, request, response, _next) {
  if (error.validation) {
    return response.status(400).send({ validationErrors: error.validation });
  }

  if (error.status && error.message) {
    return response.status(error.status).send({ message: error.message });
  }

  return response.status(500).send();
}
