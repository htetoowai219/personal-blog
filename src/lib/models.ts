import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  username: string;
  password: string;
  displayName?: string | null;
  bio?: string | null;
  location?: string | null;
  createdAt: Date;
}

export interface Blog {
  _id?: ObjectId;
  userId: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  pinned?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
