import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // We use || to ensure we pick up variables directly from the process env if loadEnv misses them in production
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY),
        'process.env.FINNHUB_API_KEY': JSON.stringify(env.FINNHUB_API_KEY || process.env.FINNHUB_API_KEY),
        'process.env.ALPHAVANTAGE_API_KEY': JSON.stringify(env.ALPHAVANTAGE_API_KEY || process.env.ALPHAVANTAGE_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});