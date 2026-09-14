declare global {
  namespace Express {
    interface User {
      _id: string;
      id: string;
      role: string;
      email: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
