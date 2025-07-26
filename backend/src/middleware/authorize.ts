import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

// Authorization middleware for role-based access control
export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admin has access to everything
      if (user.role === 'admin') {
        return next();
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions for this action',
          requiredRoles: allowedRoles,
          userRole: user.role
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};

// Specific role checkers
export const requireAdmin = authorize(['admin']);
export const requireManager = authorize(['admin', 'manager']);
export const requireStaff = authorize(['admin', 'manager', 'staff']);

// Check if user has specific permissions
export const hasPermission = (userRole: string, requiredRoles: string[]): boolean => {
  // Admin always has permission
  if (userRole === 'admin') {
    return true;
  }
  
  return requiredRoles.includes(userRole);
};

// Middleware to check if user can access attendance management features
export const canAccessAttendanceManagement = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Admin and Manager can access attendance management
  if (user.role === 'admin' || user.role === 'manager') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Manager or Admin role required.',
    userRole: user.role
  });
};

// Middleware to check if user can access inventory management features
export const canAccessInventoryManagement = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Admin has full access, Manager has read/write access, Staff has read-only access
  if (user.role === 'admin' || user.role === 'manager' || user.role === 'staff') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Insufficient permissions.',
    userRole: user.role
  });
};

// Middleware for write operations (create, update, delete)
export const canModifyData = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Only Admin and Manager can modify data
  if (user.role === 'admin' || user.role === 'manager') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin or Manager role required for data modification.',
    userRole: user.role
  });
};
