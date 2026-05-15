export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'professor';
  subject?: string;
}

export interface Planning {
  id?: string;
  professorId: string;
  professorName: string;
  subject: string;
  date: string;
  className: string;
  content: string;
  methodology: string;
  resources: string;
  evaluation: string;
  observations: string;
  projectId?: string;
  createdAt: any;
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  pdfUrl?: string;
  createdAt: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}
