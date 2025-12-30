
export enum ToolType {
  ASSISTANT = 'ASSISTANT',
  IMAGE_GEN = 'IMAGE_GEN',
  TEXT_ANALYSIS = 'TEXT_ANALYSIS',
  CODE_HELPER = 'CODE_HELPER',
  QUICK_TOOLS = 'QUICK_TOOLS',
  DOC_STUDIO = 'DOC_STUDIO',
  VOICE_HUB = 'VOICE_HUB',
  RESEARCHER = 'RESEARCHER',
  CODE_PLAYGROUND = 'CODE_PLAYGROUND',
  TODO_LIST = 'TODO_LIST'
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  groundingChunks?: any[];
}

export interface Tool {
  id: ToolType;
  name: string;
  description: string;
  icon: string;
  color: string;
}