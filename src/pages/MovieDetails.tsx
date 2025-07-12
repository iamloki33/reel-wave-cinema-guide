
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Star, Heart, Bookmark, Calendar, Clock, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MovieDetails as MovieDetailsType, useMovieStore, getImageUrl } from '@/store/movieStore';

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [movieDetails, setMovieDetails] = useState<MovieDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { 
    fetchMovieDetails, 
    userPreferences, 
    likeMovie, 
    addToWatchlist, 
    removeFromWatchlist 
  } = useMovieStore();

  useEffect(() => {
    if (id) {
      const loadMovieDetails = async () => {
        setLoading(true);
        const details = await fetchMovieDetails(parseInt(id));
        setMovieDetails(details);
        setLoading(false);
      };
      loadMovieDetails();
    }
  }, [id, fetchMovieDetails]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-muted h-8 w-32 rounded mb-8"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-muted aspect-[2/3] rounded-lg"></div>
              <div className="md:col-span-2 space-y-4">
                <div className="bg-muted h-8 w-3/4 rounded"></div>
                <div className="bg-muted h-4 w-1/2 rounded"></div>
                <div className="bg-muted h-20 w-full rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movieDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Movie not found</h2>
          <Link to="/">
            <Button>Go back home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isLiked = userPreferences.likedMovies.includes(movieDetails.id);
  const isInWatchlist = userPreferences.watchlist.includes(movieDetails.id);

  const handleLike = () => {
    likeMovie(movieDetails.id, movieDetails.genres.map(g => g.id));
  };

  const handleWatchlist = () => {
    if (isInWatchlist) {
      removeFromWatchlist(movieDetails.id);
    } else {
      addToWatchlist(movieDetails.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div 
        className="relative h-96 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${getImageUrl(movieDetails.backdrop_path)})`
        }}
      >
        <div className="container mx-auto px-4 py-8 h-full flex flex-col justify-between">
          <Link to="/">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Movies
            </Button>
          </Link>
          
          <div className="text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-2">{movieDetails.title}</h1>
            {movieDetails.tagline && (
              <p className="text-xl md:text-2xl text-gray-200 italic">{movieDetails.tagline}</p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="flex justify-center md:justify-start">
            <img
              src={getImageUrl(movieDetails.poster_path)}
              alt={movieDetails.title}
              className="w-full max-w-sm rounded-lg shadow-lg"
            />
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button 
                onClick={handleLike}
                variant={isLiked ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button 
                onClick={handleWatchlist}
                variant={isInWatchlist ? "default" : "outline"}
                className="flex items-center gap-2"
              >
                <Bookmark className={`h-4 w-4 ${isInWatchlist ? 'fill-current' : ''}`} />
                {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </Button>
            </div>

            {/* Movie Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{movieDetails.vote_average.toFixed(1)}</span>
                <span>({movieDetails.vote_count.toLocaleString()} votes)</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(movieDetails.release_date).getFullYear()}
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {movieDetails.runtime} min
              </div>
              
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {movieDetails.original_language.toUpperCase()}
              </div>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {movieDetails.genres.map((genre) => (
                <Badge key={genre.id} variant="secondary">
                  {genre.name}
                </Badge>
              ))}
            </div>

            {/* Overview */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Overview</h3>
              <p className="text-muted-foreground leading-relaxed">
                {movieDetails.overview}
              </p>
            </div>

            {/* Production Details */}
            {movieDetails.production_companies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Production</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Companies</h4>
                      <div className="flex flex-wrap gap-2">
                        {movieDetails.production_companies.map((company) => (
                          <Badge key={company.id} variant="outline">
                            {company.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {movieDetails.production_countries.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Countries</h4>
                        <div className="flex flex-wrap gap-2">
                          {movieDetails.production_countries.map((country) => (
                            <Badge key={country.iso_3166_1} variant="outline">
                              {country.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
