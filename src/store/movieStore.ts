
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  video: boolean;
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string;
  production_companies: { id: number; name: string; logo_path: string | null }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { iso_639_1: string; name: string }[];
}

export interface UserPreferences {
  likedMovies: number[];
  dislikedMovies: number[];
  favoriteGenres: number[];
  searchHistory: string[];
  watchlist: number[];
}

interface MovieStore {
  // Movie data
  trendingMovies: Movie[];
  searchResults: Movie[];
  movieDetails: { [key: number]: MovieDetails };
  recommendations: Movie[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // User preferences
  userPreferences: UserPreferences;
  
  // Actions
  fetchTrendingMovies: () => Promise<void>;
  searchMovies: (query: string) => Promise<void>;
  fetchMovieDetails: (id: number) => Promise<MovieDetails | null>;
  getRecommendations: () => Promise<void>;
  
  // User actions
  likeMovie: (movieId: number, genreIds: number[]) => void;
  dislikeMovie: (movieId: number) => void;
  addToWatchlist: (movieId: number) => void;
  removeFromWatchlist: (movieId: number) => void;
  addToSearchHistory: (query: string) => void;
}

const API_KEY = '4e44d9029b1270a757cddc766a1bcb63'; // Demo API key - in production, use environment variables
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export const getImageUrl = (path: string | null) => {
  return path ? `${IMAGE_BASE_URL}${path}` : '/placeholder.svg';
};

export const useMovieStore = create<MovieStore>()(
  persist(
    (set, get) => ({
      // Initial state
      trendingMovies: [],
      searchResults: [],
      movieDetails: {},
      recommendations: [],
      isLoading: false,
      error: null,
      userPreferences: {
        likedMovies: [],
        dislikedMovies: [],
        favoriteGenres: [],
        searchHistory: [],
        watchlist: [],
      },

      // Fetch trending movies
      fetchTrendingMovies: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch movies');
          }
          
          const data = await response.json();
          set({ trendingMovies: data.results, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            isLoading: false 
          });
        }
      },

      // Search movies
      searchMovies: async (query: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Add to search history
          get().addToSearchHistory(query);
          
          const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`
          );
          
          if (!response.ok) {
            throw new Error('Failed to search movies');
          }
          
          const data = await response.json();
          set({ searchResults: data.results, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            isLoading: false 
          });
        }
      },

      // Fetch movie details
      fetchMovieDetails: async (id: number) => {
        try {
          const existingDetails = get().movieDetails[id];
          if (existingDetails) {
            return existingDetails;
          }

          const response = await fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch movie details');
          }
          
          const details = await response.json();
          
          set(state => ({
            movieDetails: {
              ...state.movieDetails,
              [id]: details
            }
          }));
          
          return details;
        } catch (error) {
          console.error('Error fetching movie details:', error);
          return null;
        }
      },

      // Get personalized recommendations
      getRecommendations: async () => {
        try {
          set({ isLoading: true, error: null });
          const { userPreferences } = get();
          
          // If user has liked movies, get recommendations based on them
          if (userPreferences.likedMovies.length > 0) {
            // Get recommendations from the first liked movie
            const movieId = userPreferences.likedMovies[0];
            const response = await fetch(
              `${BASE_URL}/movie/${movieId}/recommendations?api_key=${API_KEY}&page=1`
            );
            
            if (response.ok) {
              const data = await response.json();
              set({ recommendations: data.results, isLoading: false });
              return;
            }
          }
          
          // Fallback: get movies by favorite genres or top rated
          let url = `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=1`;
          
          if (userPreferences.favoriteGenres.length > 0) {
            const genreIds = userPreferences.favoriteGenres.join(',');
            url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreIds}&sort_by=vote_average.desc&page=1`;
          }
          
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error('Failed to fetch recommendations');
          }
          
          const data = await response.json();
          set({ recommendations: data.results, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'An error occurred',
            isLoading: false 
          });
        }
      },

      // User actions
      likeMovie: (movieId: number, genreIds: number[]) => {
        set(state => {
          const newLikedMovies = state.userPreferences.likedMovies.includes(movieId)
            ? state.userPreferences.likedMovies
            : [...state.userPreferences.likedMovies, movieId];
          
          const newFavoriteGenres = [...new Set([...state.userPreferences.favoriteGenres, ...genreIds])];
          
          return {
            userPreferences: {
              ...state.userPreferences,
              likedMovies: newLikedMovies,
              favoriteGenres: newFavoriteGenres,
              dislikedMovies: state.userPreferences.dislikedMovies.filter(id => id !== movieId)
            }
          };
        });
      },

      dislikeMovie: (movieId: number) => {
        set(state => ({
          userPreferences: {
            ...state.userPreferences,
            dislikedMovies: state.userPreferences.dislikedMovies.includes(movieId)
              ? state.userPreferences.dislikedMovies
              : [...state.userPreferences.dislikedMovies, movieId],
            likedMovies: state.userPreferences.likedMovies.filter(id => id !== movieId)
          }
        }));
      },

      addToWatchlist: (movieId: number) => {
        set(state => ({
          userPreferences: {
            ...state.userPreferences,
            watchlist: state.userPreferences.watchlist.includes(movieId)
              ? state.userPreferences.watchlist
              : [...state.userPreferences.watchlist, movieId]
          }
        }));
      },

      removeFromWatchlist: (movieId: number) => {
        set(state => ({
          userPreferences: {
            ...state.userPreferences,
            watchlist: state.userPreferences.watchlist.filter(id => id !== movieId)
          }
        }));
      },

      addToSearchHistory: (query: string) => {
        set(state => {
          const newHistory = [query, ...state.userPreferences.searchHistory.filter(q => q !== query)].slice(0, 10);
          return {
            userPreferences: {
              ...state.userPreferences,
              searchHistory: newHistory
            }
          };
        });
      },
    }),
    {
      name: 'movie-store',
      partialize: (state) => ({
        userPreferences: state.userPreferences,
        movieDetails: state.movieDetails,
      }),
    }
  )
);
