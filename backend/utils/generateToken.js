const jwt = require('jsonwebtoken');

const generateToken = (id, expiresIn) => {
  const tokenExpiresIn = expiresIn || process.env.JWT_EXPIRE || '1d';

  return jwt.sign({ id }, 'some_secret', {
    expiresIn: tokenExpiresIn,
  });
};

module.exports = generateToken;

