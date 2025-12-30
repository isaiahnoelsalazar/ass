
import React, { useState } from 'react';
import { ToolType } from './types';
import Layout from './components/Layout';
import Dashboard from './views/Dashboard';
import AssistantView from './views/AssistantView';
import ImageGenView from './views/ImageGenView';
import TextToolsView from './views/TextToolsView';
import UtilityBoxView from './views/UtilityBoxView';
import DocStudioView from './views/DocStudioView';

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType | 'DASHBOARD'>('DASHBOARD');

  const renderContent = () => {
    switch (activeTool) {
      case 'DASHBOARD':
        return <Dashboard onToolSelect={setActiveTool} />;
      case ToolType.ASSISTANT:
        return <AssistantView />;
      case ToolType.IMAGE_GEN:
        return <ImageGenView />;
      case ToolType.TEXT_ANALYSIS:
        return <TextToolsView />;
      case ToolType.QUICK_TOOLS:
        return <UtilityBoxView />;
      case ToolType.DOC_STUDIO:
        return <DocStudioView />;
      case ToolType.CODE_HELPER:
        // For Code Helper, we can pass a specific instruction if needed, 
        // but for now, it uses the base AssistantView.
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