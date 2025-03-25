import { BrowserRouter as Router } from 'react-router-dom';
import { AppRouter } from './router/AppRouter';
import { AuthProvider } from './context/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;