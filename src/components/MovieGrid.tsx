
import { Link } from 'react-router-dom';
import { Star, Heart, Bookmark, Calendar } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Movie, useMovieStore, getImageUrl } from '@/store/movieStore';

interface MovieGridProps {
  movies: Movie[];
}

export const MovieGrid = ({ movies }: MovieGridProps) => {
  const { userPreferences, likeMovie, addToWatchlist, removeFromWatchlist } = useMovieStore();

  const isLiked = (movieId: number) => userPreferences.likedMovies.includes(movieId);
  const isInWatchlist = (movieId: number) => userPreferences.watchlist.includes(movieId);

  const handleLike = (e: React.MouseEvent, movie: Movie) => {
    e.preventDefault();
    e.stopPropagation();
    likeMovie(movie.id, movie.genre_ids);
  };

  const handleWatchlist = (e: React.MouseEvent, movieId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWatchlist(movieId)) {
      removeFromWatchlist(movieId);
    } else {
      addToWatchlist(movieId);
    }
  };

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No movies found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {movies.map((movie) => (
        <Link key={movie.id} to={`/movie/${movie.id}`}>
          <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="relative overflow-hidden rounded-t-lg">
              <img
                src={getImageUrl(movie.poster_path)}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              
              {/* Action buttons overlay */}
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  variant={isLiked(movie.id) ? "default" : "secondary"}
                  className="h-8 w-8"
                  onClick={(e) => handleLike(e, movie)}
                >
                  <Heart className={`h-4 w-4 ${isLiked(movie.id) ? 'fill-current' : ''}`} />
                </Button>
                <Button
                  size="icon"
                  variant={isInWatchlist(movie.id) ? "default" : "secondary"}
                  className="h-8 w-8"
                  onClick={(e) => handleWatchlist(e, movie.id)}
                >
                  <Bookmark className={`h-4 w-4 ${isInWatchlist(movie.id) ? 'fill-current' : ''}`} />
                </Button>
              </div>
              
              {/* Rating badge */}
              <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {movie.vote_average.toFixed(1)}
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {movie.title}
              </h3>
              
              <div className="flex items-center text-xs text-muted-foreground mb-2">
                <Calendar className="h-3 w-3 mr-1" />
                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-3">
                {movie.overview}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};
