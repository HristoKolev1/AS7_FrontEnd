// src/data/fetchUserWithAuth.ts
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import type { FullUser, JWTPayload } from '../types';

const userApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8083',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});
export function setAuthToken(token: string | null) {
  if (token) {
    userApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('jwtToken', token);
  } else {
    delete userApi.defaults.headers.common['Authorization'];
    localStorage.removeItem('jwtToken');
  }
}

export async function login(username: string, password: string): Promise<JWTPayload> {
  try {
    // clear any stale
    setAuthToken(null);

    // 1) authenticate
    console.log('🔐 login: calling POST /users/login');
    const { data: loginData } = await userApi.post<{
      accessToken: string;
      tokenType:   string;
      expiresIn:   number;
      userId?:     number;
    }>('/users/login', { username, password });
    console.log('🔐 login: got token', loginData.accessToken);

    // 2) store it
    const token = loginData.accessToken;
    setAuthToken(token);

    // 3) decode to find id
    const payload = jwtDecode<JWTPayload & { sub?: string; userId?: number }>(token);
    const user_id = payload.id;
    console.log('🔐 login: decoded user id =', user_id);

    if (!user_id) {
      throw new Error('Could not decode user ID from token');
    }
    return payload;

    // console.log(`👤 login: fetching GET /users/${user_id}`);
    // // Await the getUser call and directly get the full user
    // const fullUser = await getUser(user_id, token);
    // console.log('👤 login: got full user', fullUser);

    // return fullUser!;
  } catch (err: any) {
    console.error('❌ login error:', err.response?.data || err.message);
    throw err;
  }
}

export async function fetchCurrentUser(): Promise<FullUser> {
  const token = localStorage.getItem('jwtToken');
  if (!token) throw new Error('No token stored');
  setAuthToken(token);

  // 2) Decode for user ID
  const payload = jwtDecode<JWTPayload & { sub: string }>(token);
  const id = payload.id;

  // 3) Fetch and return the full user record
  const { data: fullUser } = await userApi.get<FullUser>(`/users/${id}`);
  return fullUser;
}

async function getUser(id: any, bearerToken: any): Promise<FullUser | void> {
    const url = `http://a3ad27d89d462415f88d95f321d52072-993907692.eu-central-1.elb.amazonaws.com/users/${id}`;

    try {
        const response = await axios.get(url, {
            method: "GET",
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/json"
            },
            withCredentials: false,
        });

        if (response.status >= 200 && response.status < 300) {
            const user: FullUser = response.data; // Axios already parses JSON
            return user; // Return the FullUser object
        } else {
            console.log("Error: " + response.status);
        }
    } catch (error) {
        console.error("Request failed", error);
    }
}



export const UserService = { login, fetchCurrentUser, setAuthToken };
