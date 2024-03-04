import Emaill from '../../config/email';

const sendAccountActivation = async (email, token) => {
  await Emaill.transporter.sendMail({
    from: 'My app',
    to: email,
    subject: 'Account Activation',
    html: `Token is ${token}`
  });
};

export default {
  sendAccountActivation
};
