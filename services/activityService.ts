
import { ToolType } from '../types';
import { TOOLS } from '../constants';

export interface Activity {
  id: string;
  toolId: ToolType | 'SYSTEM';
  title: string;
  description: string;
  timestamp: number;
}

const STORAGE_KEY = 'as_service_activities';

export const getActivities = (): Activity[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

export const logActivity = (toolId: ToolType | 'SYSTEM', title: string, description: string) => {
  const activities = getActivities();
  const newActivity: Activity = {
    id: Date.now().toString(),
    toolId,
    title,
    description,
    timestamp: Date.now(),
  };
  
  // Keep only the last 20 activities
  const updated = [newActivity, ...activities].slice(0, 20);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  
  // Dispatch a custom event so the dashboard can refresh if it's mounted
  window.dispatchEvent(new Event('activity_updated'));
};

export const clearActivities = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('activity_updated'));
};

export const getToolInfo = (toolId: ToolType | 'SYSTEM') => {
  if (toolId === 'SYSTEM') return { icon: '⚙️', color: 'bg-slate-500' };
  const tool = TOOLS.find(t => t.id === toolId);
  return tool ? { icon: tool.icon, color: tool.color } : { icon: '🛠️', color: 'bg-slate-500' };
};
