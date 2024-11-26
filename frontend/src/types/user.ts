export interface User {
    username: string;
    isAdmin: boolean;
  }
  
  export interface LoginForm {
    username: string;
    password: string;
  }
  
  export interface RegisterForm extends LoginForm {
    inviteCode?: string;
  }