export interface User {
  id: number;
  nombre: string;
  email: string;
  role: 'admin' | 'user';  
  created_at?: string;
  updated_at?: string;
}
