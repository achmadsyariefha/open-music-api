const AlbumHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { albumsService, songsService, validator }) => {
    const albumHandler = new AlbumHandler(albumsService, songsService, validator);
    server.route(routes(albumHandler));
  },
};
