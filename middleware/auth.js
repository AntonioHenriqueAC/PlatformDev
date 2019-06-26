const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
    // get the token from header
    const token = req.header('x-auth-token');

    // check if not token
    if (!token) {
        return res.status(401).json({
            msg: 'Nenhum token, falha na autorização !'
        })
    }

    // verificar token
    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({
            msg: 'Token não é valido!'
        });

    }
}