import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import type { WebStorage } from 'redux-persist/lib/types';
import gameReducer from './gameSlice';
import settingsReducer from './settingsSlice';
import { STORAGE_KEY } from '../constants';

// Create a custom storage object
const createNoopStorage = (): WebStorage => {
  return {
    getItem(_key: string): Promise<null> {
      return Promise.resolve(null);
    },
    setItem(_key: string, _value: string): Promise<void> {
      return Promise.resolve();
    },
    removeItem(_key: string): Promise<void> {
      return Promise.resolve();
    },
  };
};

// Use localStorage if available, otherwise use noop storage
const storage: WebStorage =
  typeof window !== 'undefined' && window.localStorage
    ? {
        getItem: (key: string): Promise<string | null> => {
          return Promise.resolve(window.localStorage.getItem(key));
        },
        setItem: (key: string, value: string): Promise<void> => {
          window.localStorage.setItem(key, value);
          return Promise.resolve();
        },
        removeItem: (key: string): Promise<void> => {
          window.localStorage.removeItem(key);
          return Promise.resolve();
        },
      }
    : createNoopStorage();

// Persist configuration
const persistConfig = {
  key: STORAGE_KEY,
  storage,
  whitelist: ['game', 'settings'], // Persist both slices
};

// Combine reducers
const rootReducer = combineReducers({
  game: gameReducer,
  settings: settingsReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions and paths
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
        ignoredActionPaths: ['register', 'rehydrate'],
        ignoredPaths: ['_persist'],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
