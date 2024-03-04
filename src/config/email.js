import nodemail from 'nodemailer';

const transporter = nodemail.createTransport({
  host: '127.0.0.1',
  port: 8587,
  tls: {
    rejectUnauthorized: false
  }
});

export default {
  transporter
};
