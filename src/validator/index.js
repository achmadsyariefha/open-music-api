const InvariantError = require('../exceptions/InvariantError');
const { AlbumPayloadSchema } = require('./albums/schema');
const { SongsPayloadSchema } = require('./songs/schema');

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

const SongsValidator = {
  validateSongsPayload: (payload) => {
    const validationResult = SongsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = { AlbumsValidator, SongsValidator };
