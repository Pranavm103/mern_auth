exports.notFound = (req, res, next) => {
    res.status(404).json({
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

exports.errorHandler = (err, req, res, next) => {
    console.error(err);

    if (res.headersSent) {
        return next(err);
    }

    if (err.code === 11000) {
        return res.status(409).json({
            message: "A record with that value already exists"
        });
    }

    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: "Invalid data"
        });
    }

    res.status(err.status || 500).json({
        message: err.status && err.status < 500
            ? err.message
            : "Internal server error"
    });
};