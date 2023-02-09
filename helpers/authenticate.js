const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET;

const authenticate = (req, res, next) => {
    const { authorization } = req.headers;
    if (authorization) {
        const arr = authorization.split(" ");
        if (arr[0] === 'Bearer') {
            const token = arr[1];
            return jwt.verify(token, SECRET, (err, decoded) => {
                if (err) {
                    console.log(err);
                    return res.status(401).json({
                        message: 'Unauthenticated'
                    });
                }

                req.userId = decoded.id;
                return next();
            });
        }
    }

    return res.status(401).json({
        message: 'Unauthenticated'
    });
}

module.exports = authenticate;