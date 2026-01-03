
import { User } from '../types';
import { betterFetch } from '@better-fetch/fetch';

const USERS_KEY = 'ass_users';
const SESSION_KEY = 'ass_session';

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

interface ResponseData {
  response_data: string;
}

async function fetchJson(url: string): Promise<ResponseData> {
  const response = await fetch(url, {
    headers: {
      'x-vercel-protection-bypass': 'g4c8DzaBrLw0RcLwj7j6k7134xkTM7B5',
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error("Fetch failed. Dog doesn't wanna play fetch right now.");
  }
  const jsonData: ResponseData = await response.json();
  return jsonData;
}

fetchJson("https://flask-web-app-peach.vercel.app/test-json")
  .then(data => {
    alert(data.response_data);
  })
  .catch(error => {
    alert(error);
  });

// fetchJson("https://flask-web-app-peach.vercel.app/mssql_query?&server=sql.bsite.net\\MSSQL2016&database=saiasamazingaspsite_SampleDB&username=saiasamazingaspsite_SampleDB&password=DBSamplePW&query=SELECT%20%2A%20FROM%20INFORMATION_SCHEMA.TABLES%20WHERE%20TABLE_TYPE%3D%27BASE%20TABLE%27")
//   .then(data => {
//     alert(data.response_data);
//   })
//   .catch(error => {
//     alert(error);
//   });

// export const fetchTest = async () => {
//   alert("starting");
//   try {
//     const { data } = await betterFetch<{
//       response_data: string;
//     }>("https://flask-web-app-peach.vercel.app/mssql_query?&server=sql.bsite.net\MSSQL2016&database=saiasamazingaspsite_SampleDB&username=saiasamazingaspsite_SampleDB&password=DBSamplePW&query=SELECT%20%2A%20FROM%20INFORMATION_SCHEMA.TABLES%20WHERE%20TABLE_TYPE%3D%27BASE%20TABLE%27");

//     alert(data.response_data);
//   } catch(e){
//     alert(e);
//   }
// };

// fetchTest();

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
