
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MovieGrid } from '@/components/MovieGrid';
import { Movie, useMovieStore } from '@/store/movieStore';

const Watchlist = () => {
  const { userPreferences, trendingMovies, searchResults } = useMovieStore();
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);

  // Get movies from watchlist IDs
  useEffect(() => {
    const allMovies = [...trendingMovies, ...searchResults];
    const moviesInWatchlist = allMovies.filter(movie => 
      userPreferences.watchlist.includes(movie.id)
    );
    setWatchlistMovies(moviesInWatchlist);
  }, [userPreferences.watchlist, trendingMovies, searchResults]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Bookmark className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">My Watchlist</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Intro Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Movies to Watch</h2>
          <p className="text-lg text-muted-foreground mb-6">
            {userPreferences.watchlist.length} movies saved for later
          </p>
        </div>

        {/* Watchlist */}
        {userPreferences.watchlist.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Bookmark className="h-6 w-6" />
                Your Watchlist is Empty
              </CardTitle>
              <CardDescription className="text-base">
                Start adding movies you want to watch later by clicking the bookmark icon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/">
                <Button className="mt-4">
                  Discover Movies
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : watchlistMovies.length > 0 ? (
          <section>
            <MovieGrid movies={watchlistMovies} />
          </section>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your watchlist movies aren't loaded yet. Try browsing some movies first!
              </p>
              <Link to="/">
                <Button>
                  Browse Movies
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Watchlist;
