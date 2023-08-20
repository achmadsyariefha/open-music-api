/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // memberikan constraint foreign key pada owner username terhadap kolom id dari tabel users
  pgm.addConstraint('playlists', 'fk_playlist.username_users.id', 'FOREIGN KEY(username) REFERENCES users(id) ON DELETE CASCADE');

  //  memberikan constraint foreign key pada playlist_songs terhadap kolom id dari tabel playlists
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlistId_playlists.id', 'FOREIGN KEY("playlistId") REFERENCES playlists(id) ON DELETE CASCADE');

  //  memberikan constraint foreign key pada playlist_songs terhadap kolom id dari tabel songs
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.songId_songs.id', 'FOREIGN KEY("songId") REFERENCES songs(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  // menghapus semua constraint
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.playlistId_playlists.id');
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.songId_songs.id');
  pgm.dropConstraint('playlists', 'fk_playlist.username_users.id');
};
