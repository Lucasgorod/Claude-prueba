import React from 'react';

function App() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      backgroundColor: '#000',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1>Firebase Test App</h1>
      <p>Si puedes ver esto, React está funcionando.</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Enlaces de prueba:</h2>
        <ul>
          <li><a href="/test" style={{ color: '#007AFF' }}>Prueba Firebase (/test)</a></li>
          <li><a href="/login" style={{ color: '#007AFF' }}>Login (/login)</a></li>
          <li><a href="/admin" style={{ color: '#007AFF' }}>Admin (/admin)</a></li>
          <li><a href="/student" style={{ color: '#007AFF' }}>Student (/student)</a></li>
        </ul>
      </div>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '10px', 
        backgroundColor: '#1C1C1E', 
        borderRadius: '8px' 
      }}>
        <h3>Estado de Firebase:</h3>
        <p>API Key: {import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Configurado' : '❌ Falta'}</p>
        <p>Project ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Configurado' : '❌ Falta'}</p>
      </div>
    </div>
  );
}

export default App;