const jwt = require('jsonwebtoken');

const check = (publicKey, needsToBeAdmin = false) => {
    return async (req, res, next) => {
        if (!req.headers.authorization) return res.status(401).json({ error: 'No authorization header' });
        const authorization = req.headers.authorization.replace('Bearer ', '');

        const tokenLookup = await new Promise((res) => {
            jwt.verify(authorization, publicKey, { algorithms: ['RS256'] }, function (err, decoded) {
                res({ err, decoded });
            });
        });
        if (tokenLookup.err) return res.status(403).json({ error: 'Invalid JWT signature' });

        if (tokenLookup.decoded.exp < Date.now() / 1000) return res.status(403).json({ error: 'JWT has expired' });

        if (!tokenLookup.decoded.isMod && needsToBeAdmin) return res.status(403).json({ error: 'You do not have the required level of privilege to use this endpoint' });

        req.user = tokenLookup.decoded;
        next();
    };
};

module.exports = check;