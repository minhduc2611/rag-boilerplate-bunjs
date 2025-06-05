import { type ChatMessage, type ChatOptions } from '../libs/claude';

export interface UploadDocumentsRequest {
  files: File[];
  description?: string;
}

export interface AskRequest {
  messages: ChatMessage[];
  options?: ChatOptions;
}
