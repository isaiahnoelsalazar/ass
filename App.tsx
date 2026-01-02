
import React, { useState } from 'react';
import { ToolType } from './types';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import AssistantView from './views/AssistantView';
import ImageGenView from './views/ImageGenView';
import TextToolsView from './views/TextToolsView';
import ConverterStudioView from './views/ConverterStudioView';
import PasswordGenView from './views/PasswordGenView';
import DocStudioView from './views/DocStudioView';
import VoiceHubView from './views/VoiceHubView';
import ResearchView from './views/ResearchView';
import CodePlaygroundView from './views/CodePlaygroundView';
import TodoListView from './views/TodoListView';
import SmartNotepadView from './views/SmartNotepadView';
import QRGeneratorView from './views/QRGeneratorView';
import CounterView from './views/CounterView';
import ShoppingListView from './views/ShoppingListView';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType | 'DASHBOARD'>('DASHBOARD');

  const renderContent = () => {
    switch (activeTool) {
      case 'DASHBOARD':
        return <Dashboard onToolSelect={setActiveTool} />;
      case ToolType.ASSISTANT:
        return <AssistantView />;
      case ToolType.RESEARCHER:
        return <ResearchView />;
      case ToolType.VOICE_HUB:
        return <VoiceHubView />;
      case ToolType.IMAGE_GEN:
        return <ImageGenView />;
      case ToolType.TEXT_ANALYSIS:
        return <TextToolsView />;
      case ToolType.CONVERTER:
        return <ConverterStudioView />;
      case ToolType.PASSWORD_GEN:
        return <PasswordGenView />;
      case ToolType.DOC_STUDIO:
        return <DocStudioView />;
      case ToolType.CODE_PLAYGROUND:
        return <CodePlaygroundView />;
      case ToolType.TODO_LIST:
        return <TodoListView />;
      case ToolType.SMART_NOTEPAD:
        return <SmartNotepadView />;
      case ToolType.QR_GENERATOR:
        return <QRGeneratorView />;
      case ToolType.SIMPLE_COUNTER:
        return <CounterView />;
      case ToolType.SHOPPING_LIST:
        return <ShoppingListView />;
      case ToolType.CODE_HELPER:
        return <AssistantView />;
      default:
        return <Dashboard onToolSelect={setActiveTool} />;
    }
  };

  return (
    <Layout activeTool={activeTool} onToolSelect={setActiveTool}>
      {renderContent()}
    </Layout>
  );
};

export default App;
