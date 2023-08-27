const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapDBToModelSongs } = require('../../utils');

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addSong({
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    await this._cacheService.delete(`songs:${title}-${performer}`);
    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    try {
      const result = await this._cacheService.get(`songs:${title}-${performer}`);
      return JSON.parse(result);
    } catch (error) {
      if (title && performer) {
        const query = {
          text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2',
          values: [`%${title}%`, `%${performer}%`],
        };
        const result = await this._pool.query(query);
        await this._cacheService.set(`songs:${title}-${performer}`, JSON.stringify(result.rows));
        return result.rows;
      }

      if (title || performer) {
        const query = {
          text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1 OR performer ILIKE $2',
          values: [`%${title}%`, `%${performer}%`],
        };
        const result = await this._pool.query(query);
        await this._cacheService.set(`songs:${title}-${performer}`, JSON.stringify(result.rows));
        return result.rows;
      }
      const result = await this._pool.query('SELECT id, title, performer FROM songs');
      await this._cacheService.set(`songs:${title}-${performer}`, JSON.stringify(result.rows));
      return result.rows;
    }
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapDBToModelSongs)[0];
  }

  async editSongById(id, {
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui Lagu. Id tidak ditemukan');
    }

    await this._cacheService.delete(`songs:${title}-${performer}`);
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id, title, performer',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }

    const { title, performer } = result.rows[0];
    await this._cacheService.delete(`songs:${title}-${performer}`);
  }

  async getSongsByPlaylist(playlistId) {
    try {
      const result = await this._cacheService.get(`playlists:${playlistId}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: `SELECT songs.id, songs.title, songs.performer FROM songs
        LEFT JOIN playlist_songs ON playlist_songs."songId" = songs.id
        WHERE playlist_songs."playlistId" = $1`,
        values: [playlistId],
      };

      const result = await this._pool.query(query);
      const mappedResult = result.rows.map(mapDBToModelSongs);

      await this._cacheService.set(`playlists:${playlistId}`, JSON.stringify(mappedResult));

      return mappedResult;
    }
  }

  async getSongsByAlbum(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelSongs);
  }
}

module.exports = SongsService;
