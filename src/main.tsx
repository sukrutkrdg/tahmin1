import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WalletProvider } from './context/WalletContext'; // EKLENDİ
import App from './App';
import './index.css';



const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <WalletProvider> {/* EKLENDİ: Artık cüzdan verisi tüm uygulamada ortak */}
      <App />
    </WalletProvider>
  </QueryClientProvider>
);