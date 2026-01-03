
import { User } from '../types';

const USERS_KEY = 'ass_users';
const SESSION_KEY = 'ass_session';

function fetchURL(url: string): Promise<any> {
	return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(
        `Fetch failed. Dog doesn't wanna play fetch right now.`
      );
    }
    return response.json();
  }).then((data) => alert(data))
  .catch((error) => alert('Error: ' + error));
}

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

  const fetchedData = fetchURL("https://flask-web-app-peach.vercel.app/mssql_query?server=sql.bsite.net\MSSQL2016&database=saiasamazingaspsite_SampleDB&username=saiasamazingaspsite_SampleDB&password=DBSamplePW&query=SELECT%20%2A%20FROM%20INFORMATION_SCHEMA.TABLES%20WHERE%20TABLE_TYPE%3D%27BASE%20TABLE%27");

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
