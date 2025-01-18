export interface Post {
  [key: string]: unknown;
  _id: string;
  revisionId?: string;
  title: string;
  src: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
}
