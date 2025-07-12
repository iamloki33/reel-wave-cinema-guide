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

interface SearchFilters {
  genre: string;
  year: string;
  rating: string;
  sortBy: string;
}

interface RecommendationType {
  id: string;
  title: string;
  description: string;
  movies: Movie[];
  algorithm: string;
}

interface MovieStore {
  // Movie data
  trendingMovies: Movie[];
  searchResults: Movie[];
  movieDetails: { [key: number]: MovieDetails };
  recommendations: RecommendationType[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  currentSearchQuery: string;
  currentFilters: SearchFilters;
  
  // User preferences
  userPreferences: UserPreferences;
  
  // Actions
  fetchTrendingMovies: () => Promise<void>;
  searchMovies: (query: string, filters?: SearchFilters) => Promise<void>;
  advancedSearch: (query: string, filters: SearchFilters) => Promise<void>;
  fetchMovieDetails: (id: number) => Promise<MovieDetails | null>;
  getAdvancedRecommendations: () => Promise<void>;
  
  // User actions
  likeMovie: (movieId: number, genreIds: number[]) => void;
  dislikeMovie: (movieId: number) => void;
  addToWatchlist: (movieId: number) => void;
  removeFromWatchlist: (movieId: number) => void;
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
}

const API_KEY = '4e44d9029b1270a757cddc766a1bcb63';
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
      currentSearchQuery: '',
      currentFilters: {
        genre: '',
        year: '',
        rating: '',
        sortBy: 'popularity.desc'
      },
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

      // Basic search
      searchMovies: async (query: string) => {
        try {
          set({ isLoading: true, error: null, currentSearchQuery: query });
          
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

      // Advanced search with filters
      advancedSearch: async (query: string, filters: SearchFilters) => {
        try {
          set({ isLoading: true, error: null, currentSearchQuery: query, currentFilters: filters });
          
          get().addToSearchHistory(query);
          
          let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=1`;
          
          if (query) {
            url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`;
          }
          
          // Add filters
          const params = new URLSearchParams();
          if (filters.genre) params.append('with_genres', filters.genre);
          if (filters.year) params.append('year', filters.year);
          if (filters.rating) params.append('vote_average.gte', filters.rating);
          if (filters.sortBy) params.append('sort_by', filters.sortBy);
          
          const filterParams = params.toString();
          if (filterParams && !query) {
            url += `&${filterParams}`;
          }
          
          const response = await fetch(url);
          
          if (!response.ok) {
            throw new Error('Failed to search movies');
          }
          
          const data = await response.json();
          let results = data.results;
          
          // Apply client-side filtering for search queries
          if (query && filterParams) {
            if (filters.genre) {
              results = results.filter((movie: Movie) => 
                movie.genre_ids.includes(parseInt(filters.genre))
              );
            }
            if (filters.year) {
              results = results.filter((movie: Movie) => 
                movie.release_date?.startsWith(filters.year)
              );
            }
            if (filters.rating) {
              results = results.filter((movie: Movie) => 
                movie.vote_average >= parseInt(filters.rating)
              );
            }
          }
          
          set({ searchResults: results, isLoading: false });
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

      // Enhanced recommendations with multiple algorithms
      getAdvancedRecommendations: async () => {
        try {
          set({ isLoading: true, error: null });
          const { userPreferences } = get();
          const recommendations: RecommendationType[] = [];
          
          // 1. Genre-based recommendations
          if (userPreferences.favoriteGenres.length > 0) {
            const genreIds = userPreferences.favoriteGenres.slice(0, 3).join(',');
            const genreResponse = await fetch(
              `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreIds}&sort_by=vote_average.desc&vote_count.gte=100&page=1`
            );
            
            if (genreResponse.ok) {
              const genreData = await genreResponse.json();
              recommendations.push({
                id: 'genre-based',
                title: 'Based on Your Favorite Genres',
                description: 'Movies from genres you love most',
                movies: genreData.results.slice(0, 10),
                algorithm: 'genre-matching'
              });
            }
          }
          
          // 2. Similar to liked movies
          if (userPreferences.likedMovies.length > 0) {
            const randomLikedMovie = userPreferences.likedMovies[
              Math.floor(Math.random() * userPreferences.likedMovies.length)
            ];
            
            const similarResponse = await fetch(
              `${BASE_URL}/movie/${randomLikedMovie}/recommendations?api_key=${API_KEY}&page=1`
            );
            
            if (similarResponse.ok) {
              const similarData = await similarResponse.json();
              recommendations.push({
                id: 'similar-movies',
                title: 'More Like Movies You Loved',
                description: 'Similar to movies in your liked list',
                movies: similarData.results.slice(0, 10),
                algorithm: 'collaborative-filtering'
              });
            }
          }
          
          // 3. Trending in your preferred genres
          if (userPreferences.favoriteGenres.length > 0) {
            const popularGenreIds = userPreferences.favoriteGenres.slice(0, 2).join(',');
            const trendingResponse = await fetch(
              `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${popularGenreIds}&sort_by=popularity.desc&page=1`
            );
            
            if (trendingResponse.ok) {
              const trendingData = await trendingResponse.json();
              recommendations.push({
                id: 'trending-genres',
                title: 'Trending in Your Favorite Genres',
                description: 'Popular movies in genres you enjoy',
                movies: trendingData.results.slice(0, 10),
                algorithm: 'trending-genre-based'
              });
            }
          }
          
          // 4. High-rated movies (fallback)
          const topRatedResponse = await fetch(
            `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=1`
          );
          
          if (topRatedResponse.ok) {
            const topRatedData = await topRatedResponse.json();
            recommendations.push({
              id: 'top-rated',
              title: 'Critically Acclaimed',
              description: 'Highest rated movies of all time',
              movies: topRatedData.results.slice(0, 10),
              algorithm: 'rating-based'
            });
          }
          
          set({ recommendations, isLoading: false });
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

      clearSearchHistory: () => {
        set(state => ({
          userPreferences: {
            ...state.userPreferences,
            searchHistory: []
          }
        }));
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
