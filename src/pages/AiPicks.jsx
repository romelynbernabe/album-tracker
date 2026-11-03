import { useEffect, useState } from "react";
import AlbumCard from "../components/AlbumCard.jsx";
import TrackList from "../components/TrackList.jsx";
import { useCollection } from "../context/CollectionContext.jsx";
import { searchAlbums, searchSongs } from "../services/itunes.js";
import { getRecommendations } from "../services/ai.js";

const MIN_ALBUMS = 3;
const SONG_PICKS = ["Cruel Summer", "Blank Space", "Anti-Hero"];
const normalize = (value = "") => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export default function AiPicks({ openAlbum }) {
  const { albums } = useCollection();
  const [picks, setPicks] = useState(null);
  const [songs, setSongs] = useState([]);
  const [songError, setSongError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    Promise.all(
      SONG_PICKS.map(async (title) => {
        const results = await searchSongs(`${title} Taylor Swift`);
        return results.find(
          (track) =>
            normalize(track.trackName) === normalize(title) &&
            normalize(track.artistName).includes("taylorswift")
        );
      })
    )
      .then((results) => {
        if (cancelled) return;
        const found = results.filter(Boolean);
        setSongs(found);
        if (found.length !== SONG_PICKS.length) {
          setSongError("Some song picks could not be found in the iTunes catalog.");
        }
      })
      .catch((e) => {
        if (!cancelled) setSongError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const saved = Object.values(albums);
  const ratedCount = saved.filter((a) => a.rating > 0).length;

  const ask = async () => {
    setLoading(true);
    setError("");
    try {
      // Highest-rated albums first, so the AI sees what you love most
      const taste = [...saved]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 40)
        .map((a) => ({ title: a.name, artist: a.artist, rating: a.rating, status: a.status }));

      const { albums: suggestions } = await getRecommendations(taste);

      const found = await Promise.all(
        suggestions.map(async (s) => {
          const [match] = await searchAlbums(`${s.title} ${s.artist}`);
          return match ? { album: match, reason: s.reason } : null;
        })
      );

      // Drop misses, duplicates, and anything already in the collection
      const seen = new Set();
      setPicks(
        found.filter((f) => {
          if (!f || albums[f.album.collectionId] || seen.has(f.album.collectionId)) return false;
          seen.add(f.album.collectionId);
          return true;
        })
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page">
      <h2 className="page-title">Recommendations</h2>

      <section className="song-picks">
        <h3 className="section-title">Popular Taylor Swift songs</h3>
        <p className="notice">Play 30-second previews of three fan-favorite tracks.</p>
        {songError && <p className="notice error">{songError}</p>}
        {!songs.length && !songError && <p className="notice">Loading songs…</p>}
        {songs.length > 0 && <TrackList tracks={songs} />}
      </section>

      {saved.length < MIN_ALBUMS ? (
        <p className="notice">
          Save at least {MIN_ALBUMS} albums to your collection so there's a listening pattern to learn from. You have {saved.length}.
        </p>
      ) : (
        <>
          <p className="notice">
            Based on the {saved.length} albums in your collection
            {ratedCount > 0 ? `, ${ratedCount} of them rated` : ""}.
            {ratedCount === 0 && " Add star ratings on the album pages for better results."}
          </p>
          <div className="search">
            <button className="primary" onClick={ask} disabled={loading}>
              {loading ? "Analyzing your taste\u2026" : picks ? "Get new picks" : "Get recommendations"}
            </button>
          </div>
        </>
      )}

      {error && <p className="notice error">{error}</p>}
      {picks?.length === 0 && (
        <p className="notice">No new matching albums found. Try again for a different set.</p>
      )}

      <div className="grid">
        {picks?.map(({ album, reason }) => (
          <AlbumCard
            key={album.collectionId}
            title={album.collectionName}
            artist={album.artistName}
            art={album.artworkUrl100}
            meta={reason}
            onOpen={() => openAlbum(album.collectionId)}
          />
        ))}
      </div>
    </section>
  );
}
