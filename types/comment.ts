export interface CommentCardProps {
  id: string;
  postId: string;
  author: {
    username: string;
    name: string;
    surname: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}
