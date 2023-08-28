const AlbumHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, {
    albumsService,
    songsService,
    storageService,
    validator,
  }) => {
    const albumHandler = new AlbumHandler(albumsService, songsService, storageService, validator);
    server.route(routes(albumHandler));
  },
};
