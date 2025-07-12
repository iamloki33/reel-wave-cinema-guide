
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MovieGrid } from '@/components/MovieGrid';
import { useMovieStore } from '@/store/movieStore';

const Recommendations = () => {
  const { 
    recommendations, 
    isLoading, 
    getRecommendations, 
    userPreferences 
  } = useMovieStore();

  useEffect(() => {
    getRecommendations();
  }, [getRecommendations]);

  const hasPreferences = 
    userPreferences.likedMovies.length > 0 || 
    userPreferences.favoriteGenres.length > 0 ||
    userPreferences.searchHistory.length > 0;

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
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold">Your Recommendations</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Intro Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Personalized for You</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Based on your viewing preferences and liked movies
          </p>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Favorite Genres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userPreferences.favoriteGenres.length}</div>
                <p className="text-xs text-muted-foreground">genres you love</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Liked Movies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userPreferences.likedMovies.length}</div>
                <p className="text-xs text-muted-foreground">movies you enjoyed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userPreferences.watchlist.length}</div>
                <p className="text-xs text-muted-foreground">movies to watch</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendations */}
        {!hasPreferences ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Sparkles className="h-6 w-6" />
                Start Building Your Profile
              </CardTitle>
              <CardDescription className="text-base">
                Like some movies and search for genres you enjoy to get personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/">
                <Button className="mt-4">
                  Explore Movies
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <section>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Recommended for You
            </h3>
            
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-muted rounded-lg aspect-[2/3] mb-2"></div>
                    <div className="bg-muted h-4 rounded mb-1"></div>
                    <div className="bg-muted h-3 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <MovieGrid movies={recommendations} />
            ) : (
              <Card className="text-center py-8">
                <CardContent>
                  <p className="text-muted-foreground">
                    No recommendations available at the moment. Try liking more movies!
                  </p>
                  <Link to="/">
                    <Button className="mt-4">
                      Discover Movies
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Recommendations;
