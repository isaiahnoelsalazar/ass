
import { User, ResponseData } from '../types';

const SESSION_KEY = 'ass_session';

export const registerUser = (username: string, email: string, password: string): User => {
  let formattedString = json.response_data
    .split("),(")
    .map(tuple => {
      const values = tuple.replace(/[()']/g, "").split(", ");
      return {
        username: values[0],
        password: values[1],
        email: values[2],
        joinedAt: Number(values[3])
      };
    });
  const users = JSON.parse(`"${formattedString}"` || '[]');
  
  if (users.find((u: any) => u.username === username || u.email === email)) {
    throw new Error('User already exists');
  }

  const newUser = { 
    username, 
    email, 
    password,
    joinedAt: Date.now() 
  };

  users.push(newUser);
  fetchJson(`https://flask-web-app-peach.vercel.app/mssql_execute?&server=sql.bsite.net\\MSSQL2016&database=saiasamazingaspsite_SampleDB&username=saiasamazingaspsite_SampleDB&password=DBSamplePW&execute=INSERT%20INTO%20ASSTable%20%28username%2C%20password%2C%20email%2C%20joined%29%20VALUES%20%28%27${username}%27%2C%20%27${password}%27%2C%20%27${email}%27%2C%20%27${newUser.joinedAt}%27%29`)
    .then((data) => {
      json = null;
    })
    .catch((error) => {
      throw new Error(error);
    });
  
  // Auto login
  const { password: _, ...userSession } = newUser;
  localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
  
  return userSession;
};

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

let json = null;

fetchJson("https://flask-web-app-peach.vercel.app/mssql_query?&server=sql.bsite.net\\MSSQL2016&database=saiasamazingaspsite_SampleDB&username=saiasamazingaspsite_SampleDB&password=DBSamplePW&query=SELECT%20%2A%20FROM%20ASSTable")
  .then((data) => {
    json = data;
  })
  .catch((error) => {
    throw new Error(error);
  });

export const loginUser = (identity: string, password: string): User => {
  let formattedString = json.response_data
    .split("),(")
    .map(tuple => {
      const values = tuple.replace(/[()']/g, "").split(", ");
      return {
        username: values[0],
        password: values[1],
        email: values[2],
        joinedAt: Number(values[3])
      };
    });
  const users = JSON.parse(`"${formattedString}"` || '[]');

  const user = users.find((u: any) => (u.username === identity || u.email === identity) && u.password === password);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const { password: _, ...userSession } = user;
  localStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
  
  json = null;

  return userSession;
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};
