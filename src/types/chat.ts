export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp?: Date;
  thinking?: string;
  responseTime?: number;
}; 