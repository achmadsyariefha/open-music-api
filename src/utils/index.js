/* eslint-disable camelcase */

const mapDBToModelAlbum = ({
  id,
  name,
  year,
}) => ({
  id,
  name,
  year,
});

const mapDBToModelSongs = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  album_id,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId: album_id,
});

const mapDBToModelPlaylists = ({
  id,
  name,
  username,
}) => ({
  id,
  name,
  username,
});

const mapDBToModelPlaylistActivities = ({
  username,
  title,
  action,
  time,
}) => ({
  username,
  title,
  action,
  time,
});

module.exports = {
  mapDBToModelAlbum,
  mapDBToModelSongs,
  mapDBToModelPlaylists,
  mapDBToModelPlaylistActivities,
};
