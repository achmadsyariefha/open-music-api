exports.up = (pgm) => {
  pgm.addColumn('playlists', {
    username: {
      type: 'VARCHAR(50)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('playlists', 'username');
};
