import React from 'react';
import MainTable from './MainTable.tsx';

const App: React.FC = () => {
  return (
    <div className="App">

      <header className="App-header">
        <h1>ML Engineer Salaries</h1>
      </header>

      <main>
        <MainTable />
      </main>
      
    </div>
  );
};

export default App;
