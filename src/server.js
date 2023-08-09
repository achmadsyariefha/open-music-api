const Hapi = require('@hapi/hapi');
const AlbumsService = require('./services/postgres/AlbumsService');
const { AlbumsValidator, SongsValidator } = require('./validator');
const albums = require('./api/albums');
const ClientError = require('./exceptions/ClientError');
const SongsService = require('./services/postgres/SongsService');
const songs = require('./api/songs');

require('dotenv').config();

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const server = Hapi.Server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.start();
  /* eslint-disable no-console */
  console.log(`Server berjalan pada ${server.info.uri}`);
  /* eslint-enable no-console */
};

init();
