export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  per_page?: number;
  total?: number;
}

export interface NzolaUser {
  id: number;
  name: string;
  email?: string;
  bio?: string | null;
  profile_photo?: string | null;
  is_private?: boolean;
  is_active?: boolean;
  role?: string;
  created_at?: string;
}

export interface AuthPayload {
  user: NzolaUser;
  access_token: string;
  token_type: string;
}

export interface Post {
  id: number;
  user_id: number;
  content?: string | null;
  image?: string | null;
  video?: string | null;
  comments_count?: number;
  bazes_count?: number;
  created_at?: string;
  updated_at?: string;
  user?: NzolaUser;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at?: string;
  updated_at?: string;
  user?: NzolaUser;
}
