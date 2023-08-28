const autoBind = require('auto-bind');

class AlbumHandler {
  constructor(albumService, songsService, validator) {
    this._albumsService = albumService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const albumId = await this._albumsService.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });

    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params;
    const album = await this._albumsService.getAlbumById(id);
    const songs = await this._songsService.getSongsByAlbum(id);
    album.songs = songs;

    return {
      status: 'success',
      data: {
        album,
      },
    };
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._albumsService.editAlbumById(id, request.payload);
    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;

    await this._albumsService.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    };
  }

  async postAlbumLikesHandler(request, h) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumsService.getAlbumById(id);

    await this._albumsService.addAlbumLikes(userId, id);
    const response = h.response({
      status: 'success',
      message: 'Like Album berhasil didaftarkan',
    });

    response.code(201);
    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;
    const data = await this._albumsService.getAlbumLikes(albumId);
    const likes = data.count;

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    response.code(200);
    response.header('X-Data-Source', data.source);
    return response;
  }

  async deleteAlbumLikesHandler(request) {
    const { id } = request.params;
    const { id: userId } = request.auth.credentials;

    await this._albumsService.deleteAlbumLikes(userId, id);
    return {
      status: 'success',
      message: 'Batal menyukai album',
    };
  }
}

module.exports = AlbumHandler;
