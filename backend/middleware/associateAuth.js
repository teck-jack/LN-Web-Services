const { protect, authorize } = require('./auth');

exports.associateAuth = (req, res, next) => {
    protect(req, res, () => {
        authorize('associate')(req, res, next);
    });
};
