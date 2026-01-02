
import React from 'react';
import { Tool, ToolType } from './types';

export const TOOLS: Tool[] = [
  {
    id: ToolType.ASSISTANT,
    name: 'Smart Assistant',
    description: 'General purpose AI for answering any question, drafting emails, or brainstorming.',
    icon: '✨',
    color: 'bg-indigo-500',
  },
  {
    id: ToolType.SMART_NOTEPAD,
    name: 'Smart Notepad',
    description: 'A distraction-free writing space with AI tools to polish, expand, or summarize your notes.',
    icon: '📝',
    color: 'bg-orange-500',
  },
  {
    id: ToolType.TODO_LIST,
    name: 'AI Task Planner',
    description: 'Manage your tasks with AI-powered sub-task suggestions and breakdown logic.',
    icon: '✅',
    color: 'bg-blue-500',
  },
  {
    id: ToolType.RESEARCHER,
    name: 'Smart Researcher',
    description: 'Real-time web search for the latest news, events, and factual data with citations.',
    icon: '🔍',
    color: 'bg-teal-500',
  },
  {
    id: ToolType.CODE_PLAYGROUND,
    name: 'Code Playground',
    description: 'Live multi-language compiler and HTML/JS previewer with AI debugging support.',
    icon: '🚀',
    color: 'bg-slate-800',
  },
  {
    id: ToolType.VOICE_HUB,
    name: 'Voice Hub',
    description: 'Convert any text into natural, human-like speech with various AI voices.',
    icon: '🔊',
    color: 'bg-cyan-600',
  },
  {
    id: ToolType.DOC_STUDIO,
    name: 'Doc Studio',
    description: 'Convert text to PDF or extract content from PDF documents instantly.',
    icon: '📂',
    color: 'bg-purple-600',
  },
  {
    id: ToolType.IMAGE_GEN,
    name: 'Visual Creator',
    description: 'Transform text descriptions into stunning high-quality images instantly.',
    icon: '🎨',
    color: 'bg-rose-500',
  },
  {
    id: ToolType.TEXT_ANALYSIS,
    name: 'Text Engine',
    description: 'Summarize long documents, extract key insights, or translate content.',
    icon: '📄',
    color: 'bg-emerald-500',
  },
  {
    id: ToolType.QUICK_TOOLS,
    name: 'Utility Box',
    description: 'Unit conversion, password generation, and other essential daily tools.',
    icon: '🛠️',
    color: 'bg-amber-500',
  }
];
