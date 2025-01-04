export interface Login {
  email: string;
  password: string;
}

export interface ResetPassword {
  token: string;
  password: string;
}
