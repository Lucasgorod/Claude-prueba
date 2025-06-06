import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export const SimpleTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Iniciando...');
  const [logs, setLogs] = useState<string[]>([]);
  const [testEmail, setTestEmail] = useState('testuser@gmail.com');
  const [testPassword, setTestPassword] = useState('password123');

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('Probando conexión...');
      addLog('🔄 Iniciando pruebas...');

      // Test 1: Supabase client
      if (supabase) {
        addLog('✅ Cliente Supabase inicializado');
      } else {
        addLog('❌ Error en cliente Supabase');
        return;
      }

      // Test 2: Database connection
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);
        
        if (error && !error.message.includes('does not exist')) {
          throw error;
        }
        addLog('✅ Conexión a base de datos exitosa');
      } catch (dbError: any) {
        addLog(`❌ Error de base de datos: ${dbError.message}`);
      }

      setStatus('Listo para probar autenticación');
      
    } catch (error: any) {
      addLog(`❌ Error general: ${error.message}`);
      setStatus('Error en conexión');
    }
  };

  const testAuth = async () => {
    try {
      setStatus('Probando autenticación...');
      addLog('🔄 Probando autenticación...');

      // Use the state values

      // Try sign in first
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (signInError && signInError.message.includes('Invalid')) {
        addLog('ℹ️ Usuario no existe, creando...');
        
        // Create user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        });

        if (signUpError) throw signUpError;
        addLog(`✅ Usuario creado: ${signUpData.user?.email}`);
      } else if (signInError) {
        throw signInError;
      } else {
        addLog(`✅ Usuario autenticado: ${signInData.user?.email}`);
      }

      setStatus('✅ Todas las pruebas exitosas');
      
    } catch (error: any) {
      addLog(`❌ Error de autenticación: ${error.message}`);
      setStatus('❌ Error en autenticación');
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#000',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1>Prueba Simple de Supabase</h1>
      
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#1C1C1E', 
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <h3>Estado: {status}</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email de prueba:</label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #333',
              backgroundColor: '#2C2C2E',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #333',
              backgroundColor: '#2C2C2E',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>
        
        <button 
          onClick={testAuth}
          style={{
            backgroundColor: '#007AFF',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            marginTop: '10px'
          }}
        >
          Probar Autenticación
        </button>
      </div>

      <div style={{ 
        padding: '20px', 
        backgroundColor: '#1C1C1E', 
        borderRadius: '12px'
      }}>
        <h3>Logs:</h3>
        <div style={{ 
          backgroundColor: '#2C2C2E',
          padding: '10px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
        
        <button 
          onClick={() => setLogs([])}
          style={{
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Limpiar Logs
        </button>
      </div>
    </div>
  );
};