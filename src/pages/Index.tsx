
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Film, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MovieGrid } from '@/components/MovieGrid';
import { useMovieStore } from '@/store/movieStore';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    trendingMovies, 
    searchResults, 
    isLoading, 
    fetchTrendingMovies, 
    searchMovies,
    userPreferences 
  } = useMovieStore();

  useEffect(() => {
    fetchTrendingMovies();
  }, [fetchTrendingMovies]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMovies(searchQuery);
    }
  };

  const moviesToShow = searchQuery ? searchResults : trendingMovies;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Film className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">ReelWave</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/recommendations" className="text-foreground hover:text-primary transition-colors">
                Recommendations
              </Link>
              <Link to="/watchlist" className="text-foreground hover:text-primary transition-colors">
                Watchlist
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Discover Amazing Movies</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get personalized recommendations based on your taste
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search for movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" />
                  Liked Genres
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{userPreferences.favoriteGenres.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5" />
                  Liked Movies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{userPreferences.likedMovies.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Film className="h-5 w-5" />
                  Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{userPreferences.searchHistory.length}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Movies Section */}
        <section>
          <h3 className="text-2xl font-bold mb-6">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Trending Movies'}
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
          ) : (
            <MovieGrid movies={moviesToShow} />
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
