export interface Author {
  name: string;
  image: string;
  bio: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: Author;
  content: string;
  featuredImage: string;
  tags: string[];
  readingTime: string;
}

export interface BlogMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: Author;
  featuredImage: string;
  tags: string[];
  readingTime: string;
}
