
export enum ToolType {
  ASSISTANT = 'ASSISTANT',
  IMAGE_GEN = 'IMAGE_GEN',
  TEXT_ANALYSIS = 'TEXT_ANALYSIS',
  CODE_HELPER = 'CODE_HELPER',
  QUICK_TOOLS = 'QUICK_TOOLS',
  DOC_STUDIO = 'DOC_STUDIO'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Tool {
  id: ToolType;
  name: string;
  description: string;
  icon: string;
  color: string;
}
