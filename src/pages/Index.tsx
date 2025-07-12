
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Film, TrendingUp, Star, Layers } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MovieGrid } from '@/components/MovieGrid';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { MovieCollections } from '@/components/MovieCollections';
import { LoginDialog } from '@/components/LoginDialog';
import { UserProfile } from '@/components/UserProfile';
import { useMovieStore } from '@/store/movieStore';
import { useAuthStore } from '@/store/authStore';

const Index = () => {
  const [activeTab, setActiveTab] = useState('discover');
  const { 
    trendingMovies, 
    searchResults, 
    isLoading, 
    fetchTrendingMovies, 
    advancedSearch,
    userPreferences,
    currentSearchQuery
  } = useMovieStore();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    fetchTrendingMovies();
  }, [fetchTrendingMovies]);

  const handleAdvancedSearch = (query: string, filters: any) => {
    advancedSearch(query, filters);
    setActiveTab('discover');
  };

  const moviesToShow = currentSearchQuery ? searchResults : trendingMovies;

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
              {isLoggedIn ? (
                <UserProfile />
              ) : (
                <LoginDialog>
                  <Button variant="default">Login</Button>
                </LoginDialog>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Discover Amazing Movies</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Advanced search, personalized recommendations, and custom collections
          </p>
          
          {/* Advanced Search Bar */}
          <AdvancedSearch onSearch={handleAdvancedSearch} />

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

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="discover" className="flex items-center gap-2">
              <Film className="h-4 w-4" />
              Discover
            </TabsTrigger>
            <TabsTrigger value="collections" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Collections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="space-y-8">
            {/* Movies Section */}
            <section>
              <h3 className="text-2xl font-bold mb-6">
                {currentSearchQuery ? `Search Results for "${currentSearchQuery}"` : 'Trending Movies'}
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
          </TabsContent>

          <TabsContent value="collections">
            <MovieCollections />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
