const Exportshandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { producerService, playlistsService, validator }) => {
    const exportsHandler = new Exportshandler(producerService, playlistsService, validator);
    server.route(routes(exportsHandler));
  },
};
