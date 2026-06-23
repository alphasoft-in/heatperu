// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['@uiw/react-md-editor', '@uiw/react-markdown-preview']
    }
  },

  integrations: [react()]
});