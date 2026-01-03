
import { User } from '../types';

const USERS_KEY = 'as_service_users';
const SESSION_KEY = 'as_service_session';

export const registerUser = (username: string, email: string, password: string): User => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  
  if (users.find((u: any) => u.username === username || u.email === email)) {
    throw new Error('User already exists');
  }

  const newUser = { 
    username, 
    email, 
    password, // In a real app, this would be hashed
    joinedAt: Date.now() 
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Auto login
  const { password: _, ...userSession } = newUser;
  localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
  
  return userSession;
};

export const loginUser = (identity: string, password: string): User => {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const user = users.find((u: any) => (u.username === identity || u.email === identity) && u.password === password);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const { password: _, ...userSession } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
  
  return userSession;
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};
