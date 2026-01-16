
import React, { useState } from 'react';
import Layout from './components/Layout';
import ColorConverter from './components/ColorConverter';
import VectorStudio from './components/VectorStudio';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('color');

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'color' ? (
        <ColorConverter />
      ) : (
        <VectorStudio />
      )}
    </Layout>
  );
};

export default App;
