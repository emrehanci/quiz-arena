import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ConfigProvider } from 'antd';
import { store, persistor } from './store';
import './i18n';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1890ff',
              borderRadius: 8,
            },
          }}
        >
          <App />
        </ConfigProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
);

