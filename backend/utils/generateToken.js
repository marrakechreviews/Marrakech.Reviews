const jwt = require('jsonwebtoken');

const generateToken = (id, expiresIn) => {
  const tokenExpiresIn = expiresIn || process.env.JWT_EXPIRE || '1d';

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: tokenExpiresIn,
  });
};

module.exports = generateToken;

