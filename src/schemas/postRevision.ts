export interface PostRevision {
  [key: string]: unknown;
  _id: string;
  userId: string;
  postId: string;
  createdAt: Date;
  updatedAt: Date;
  src: string;
}
