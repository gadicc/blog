export interface Post {
  [key: string]: unknown;
  _id: string;
  incrId?: number;
  slug?: string;
  revisionId?: string;
  title: string;
  src: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  tags?: string[];
}
