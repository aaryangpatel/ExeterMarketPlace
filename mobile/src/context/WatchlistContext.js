/**
 * WatchlistContext - Favorites/watchlist state.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as watchlistService from '../services/watchlist';

const WatchlistContext = createContext(null);

export function WatchlistProvider({ children }) {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    watchlistService.getWatchlist().then(setIds);
  }, []);

  const add = (itemId) => {
    watchlistService.addToWatchlist(itemId).then(setIds);
  };

  const remove = (itemId) => {
    watchlistService.removeFromWatchlist(itemId).then(setIds);
  };

  const toggle = (itemId) => {
    watchlistService.toggleWatchlist(itemId).then(setIds);
  };

  const has = (itemId) => ids.includes(itemId);

  return (
    <WatchlistContext.Provider value={{ ids, add, remove, toggle, has }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  return ctx ?? { ids: [], add: () => {}, remove: () => {}, toggle: () => {}, has: () => false };
}
