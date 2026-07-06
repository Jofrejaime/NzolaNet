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
  is_following?: boolean;
  is_follow_pending?: boolean;
  role?: string;
  created_at?: string;
}

export interface AuthPayload {
  user: NzolaUser;
  access_token: string;
  token_type: string;
}

export interface PostMedia {
  type: 'image' | 'video';
  path: string;
}

export interface Post {
  id: number;
  user_id: number;
  content?: string | null;
  image?: string | null;
  video?: string | null;
  media?: PostMedia[] | null;
  comments_count?: number;
  bazes_count?: number;
  has_bazed?: boolean;
  created_at?: string;
  updated_at?: string;
  user?: NzolaUser;
}

export interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalPosts: number;
  totalComments: number;
  totalBazes: number;
  totalAdmins: number;
  recentUsers: NzolaUser[];
  recentPosts: Post[];
  usersByMonth: Record<string, number>;
  postsByMonth: Record<string, number>;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id?: number | null;
  content: string;
  created_at?: string;
  updated_at?: string;
  user?: NzolaUser;
  post?: Post;
  replies?: Comment[];
}

export interface Report {
  id: number;
  reporter_id: number;
  reportable_type: 'post' | 'comment';
  reportable_id: number;
  reason: string;
  description?: string | null;
  status: 'pending' | 'dismissed' | 'removed';
  reviewed_by?: number | null;
  reviewed_at?: string | null;
  created_at?: string;
  reporter?: NzolaUser;
  content?: Post | Comment | null;
}

export interface NzolaNotification {
  id: number;
  user_id: number;
  type: 'baze' | 'comment' | 'reply' | 'follow' | 'follow_request' | 'content_removed' | 'new_report' | 'report_dismissed';
  follow_request_status?: 'pending' | 'accepted' | 'rejected' | null;
  from_user_id: number;
  post_id?: number | null;
  comment_id?: number | null;
  is_read: boolean;
  created_at?: string;
  from_user?: NzolaUser;
  post?: Post | null;
  comment?: Comment | null;
}
