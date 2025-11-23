import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient();

// Basit Hata Yakalayıcı
const ErrorFallback = ({ error }: { error: any }) => (
  <div style={{ padding: 20, color: 'red', border: '1px solid red', margin: 20 }}>
    <h2>Uygulama Çöktü (Runtime Error)</h2>
    <pre>{error?.message || JSON.stringify(error)}</pre>
    <pre>{error?.stack}</pre>
  </div>
);

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
} catch (error) {
  console.error("Render Hatası:", error);
  document.body.innerHTML = `<h1>Kritik Hata:</h1><pre>${String(error)}</pre>`;
}