const jwt = require('jsonwebtoken');

const verifyAccessToken = (req, res, next) => {
  const accessToken = req.headers.authorization?.split(' ')[1];

  if (!accessToken) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    const secretKey = process.env.SECRET_KEY || 'default_secret_key';
    const decodedToken = jwt.verify(accessToken, secretKey);

    req.user = decodedToken;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
};

module.exports = {
  verifyAccessToken,
};
