import { defineConfig, type PluginOption } from 'vite';

const devServer = (): PluginOption => ({
  name: 'svg-studio-dev-server',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const url = new URL(req.url ?? '/', 'http://localhost');
      if (url.pathname === '/' && !url.searchParams.has('scene')) {
        req.url = `/gallery.html${url.search}`;
      }
      next();
    });

    server.httpServer?.once('listening', () => {
      const port = server.config.server.port ?? 5173;
      // eslint-disable-next-line no-console
      console.log(
        [
          '',
          '  \x1b[36msvg-studio dev server ready\x1b[0m',
          `  \x1b[2mgallery\x1b[0m  http://localhost:${port}/`,
          `  \x1b[2mscene  \x1b[0m  http://localhost:${port}/?scene=<id>   e.g. arrow-library, topology, icon-library`,
          '',
        ].join('\n'),
      );
    });
  },
});

export default defineConfig({
  plugins: [devServer()],
});
