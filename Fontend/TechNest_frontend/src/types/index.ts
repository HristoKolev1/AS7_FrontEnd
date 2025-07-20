// src/types/index.ts
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    quantity: number;
  }
  

  export interface FullUser {
  id:        number;
  username:  string;
  name:      string;
  email:     string;
  address:   string;
  city:      string;
  role:      'Admin' | 'Customer';
}


export interface JWTPayload {
  sub:  string;            // username
  id:   number;            // numeric user-id
  role: 'Customer'|'Admin';// same casing you used in the token
  iat:  number;
  exp:  number;
}