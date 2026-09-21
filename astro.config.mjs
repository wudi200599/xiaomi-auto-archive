// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

const isGitHubPages = process.env.GITHUB_PAGES === 'true';

// https://astro.build/config
export default defineConfig({
  site: isGitHubPages
    ? 'https://wudi200599.github.io'
    : 'https://xiaomi-auto-archive.lm10dzqgoat666.workers.dev',
  base: isGitHubPages ? '/xiaomi-auto-archive' : '/',
  integrations: [vue()],
  trailingSlash: 'ignore',
});
