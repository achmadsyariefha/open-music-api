exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlistId: {
      type: 'VARCHAR(50)',
    },
    songId: {
      type: 'VARCHAR(50)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_songs');
};
