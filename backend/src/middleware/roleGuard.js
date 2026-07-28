// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};

// Check if user is approved (for cooks and drivers)
const requireApproval = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }

  if (
    (req.user.role === 'cook' || req.user.role === 'driver') &&
    !req.user.isApproved
  ) {
    return res.status(403).json({
      success: false,
      message: 'Your account is pending admin approval',
    });
  }

  next();
};

module.exports = { authorize, requireApproval };
