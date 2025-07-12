
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, TrendingUp, Brain, Star, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MovieGrid } from '@/components/MovieGrid';
import { useMovieStore } from '@/store/movieStore';

const algorithmIcons = {
  'genre-matching': Brain,
  'collaborative-filtering': Sparkles,
  'trending-genre-based': TrendingUp,
  'rating-based': Star
};

const algorithmColors = {
  'genre-matching': 'bg-blue-500',
  'collaborative-filtering': 'bg-purple-500',
  'trending-genre-based': 'bg-green-500',
  'rating-based': 'bg-yellow-500'
};

const Recommendations = () => {
  const { 
    recommendations, 
    isLoading, 
    getAdvancedRecommendations, 
    userPreferences 
  } = useMovieStore();

  useEffect(() => {
    getAdvancedRecommendations();
  }, [getAdvancedRecommendations]);

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
                <h1 className="text-2xl font-bold">AI-Powered Recommendations</h1>
              </div>
            </div>
            <Button onClick={getAdvancedRecommendations} disabled={isLoading}>
              <Zap className="h-4 w-4 mr-2" />
              Refresh Recommendations
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Intro Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">Personalized Just for You</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Our advanced recommendation engine uses multiple algorithms to find your perfect next watch
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
                <p className="text-xs text-muted-foreground">genres analyzed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Learning Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userPreferences.likedMovies.length}</div>
                <p className="text-xs text-muted-foreground">movies you've liked</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recommendation Sets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recommendations.length}</div>
                <p className="text-xs text-muted-foreground">different algorithms</p>
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
                Build Your AI Profile
              </CardTitle>
              <CardDescription className="text-base">
                Like movies and explore genres to unlock personalized AI recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/">
                <Button className="mt-4">
                  Start Discovering Movies
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-8 rounded w-1/3 mb-4"></div>
                <div className="bg-muted h-4 rounded w-1/2 mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, j) => (
                    <div key={j}>
                      <div className="bg-muted rounded-lg aspect-[2/3] mb-2"></div>
                      <div className="bg-muted h-4 rounded mb-1"></div>
                      <div className="bg-muted h-3 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-12">
            {recommendations.map((recommendationType) => {
              const IconComponent = algorithmIcons[recommendationType.algorithm as keyof typeof algorithmIcons] || Sparkles;
              const algorithmColor = algorithmColors[recommendationType.algorithm as keyof typeof algorithmColors] || 'bg-primary';
              
              return (
                <section key={recommendationType.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-lg ${algorithmColor}`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{recommendationType.title}</h3>
                      <p className="text-muted-foreground">{recommendationType.description}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {recommendationType.algorithm}
                    </Badge>
                  </div>
                  
                  {recommendationType.movies.length > 0 ? (
                    <MovieGrid movies={recommendationType.movies} />
                  ) : (
                    <Card className="text-center py-8">
                      <CardContent>
                        <p className="text-muted-foreground">
                          No movies found for this recommendation type.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-muted-foreground mb-4">
                No recommendations available. Try liking more movies to improve our suggestions!
              </p>
              <Link to="/">
                <Button>
                  Discover Movies
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Recommendations;
