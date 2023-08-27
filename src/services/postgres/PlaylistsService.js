const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const { mapDBToModelPlaylists, mapDBToModelPlaylistActivities } = require('../../utils');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService, cacheService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
    this._cacheService = cacheService;
  }

  async addPlaylist({ name, username }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, username],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    await this._cacheService.delete(`playlists:${username}`);
    return result.rows[0].id;
  }

  async getPlaylists(username) {
    try {
      const result = await this._cacheService.get(`playlists:${username}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: `SELECT playlists.id, playlists.name, users.username FROM playlists
        LEFT JOIN collaborations ON collaborations."playlistId" = playlists.id
        LEFT JOIN users ON users.id = playlists.username
        WHERE playlists.username = $1 OR collaborations."userId" = $1
        GROUP BY playlists.id, users.username`,
        values: [username],
      };

      const result = await this._pool.query(query);
      const mappedResult = result.rows.map(mapDBToModelPlaylists);

      await this._cacheService.set(`playlists:${username}`, JSON.stringify(mappedResult));

      return mappedResult;
    }
  }

  async verifyPlaylistOwner(id, username) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.username !== username) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON users.id = playlists.username
      LEFT JOIN collaborations ON collaborations."playlistId" = playlists.id
      WHERE playlists.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    return result.rows[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id, username',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus playlist. id tidak ditemukan');
    }

    const { username } = result.rows[0];
    await this._cacheService.delete(`playlists:${username}`);
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `song_playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    await this._cacheService.delete(`playlists:${playlistId}`);
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE "playlistId" = $1 AND "songId" = $2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Gagal menghapus Lagu dalam playlist. id tidak ditemukan');
    }

    await this._cacheService.delete(`playlists:${playlistId}`);
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async addPlaylistActivities(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`;
    const time = new Date().toISOString();
    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError('Aktivitas Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylistActivities(id) {
    const query = {
      text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
      FROM playlist_song_activities
      RIGHT JOIN users ON users.id = playlist_song_activities."userId"
      RIGHT JOIN songs ON songs.id = playlist_song_activities."songId"
      WHERE playlist_song_activities."playlistId" = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelPlaylistActivities);
  }
}

module.exports = PlaylistsService;
