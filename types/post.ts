export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  tags?: string[] | null;
  status: string;
  readTime?: number | null;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  authorId: string;
  author: {
    username: string;
    avatar: string;
    name: string;
    surname: string;
  };
  _count: {
    comments: number;
  };
}

export interface BlogCardProps {
  id: string;
  title: string;
  excerpt: string;
  author: {
    username: string;
  };
  createdAt: string;
  category: string;
  tags: string[];
  status: string;
  coverImage?: string;
  readTime: string;
  viewCount?: number;
  _count: {
    comments: number;
  };
}
