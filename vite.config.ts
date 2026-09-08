import { defineConfig, type PluginOption } from 'vite';

const banner = (): PluginOption => ({
  name: 'svg-studio-dev-banner',
  apply: 'serve',
  configureServer(server) {
    server.httpServer?.once('listening', () => {
      const port = server.config.server.port ?? 5173;
      // eslint-disable-next-line no-console
      console.log(
        [
          '',
          '  \x1b[36msvg-studio dev server ready\x1b[0m',
          `  \x1b[2mgallery\x1b[0m  http://localhost:${port}/gallery.html`,
          `  \x1b[2mscene  \x1b[0m  http://localhost:${port}/?scene=<id>   e.g. arrow-library, topology, icon-library`,
          '',
        ].join('\n'),
      );
    });
  },
});

export default defineConfig({
  plugins: [banner()],
});
