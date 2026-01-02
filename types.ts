
export enum ToolType {
  ASSISTANT = 'ASSISTANT',
  IMAGE_GEN = 'IMAGE_GEN',
  TEXT_ANALYSIS = 'TEXT_ANALYSIS',
  CODE_HELPER = 'CODE_HELPER',
  CONVERTER = 'CONVERTER',
  PASSWORD_GEN = 'PASSWORD_GEN',
  DOC_STUDIO = 'DOC_STUDIO',
  VOICE_HUB = 'VOICE_HUB',
  RESEARCHER = 'RESEARCHER',
  CODE_PLAYGROUND = 'CODE_PLAYGROUND',
  TODO_LIST = 'TODO_LIST',
  SMART_NOTEPAD = 'SMART_NOTEPAD',
  QR_GENERATOR = 'QR_GENERATOR',
  SIMPLE_COUNTER = 'SIMPLE_COUNTER',
  SHOPPING_LIST = 'SHOPPING_LIST',
  IMAGE_TO_PDF = 'IMAGE_TO_PDF'
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
