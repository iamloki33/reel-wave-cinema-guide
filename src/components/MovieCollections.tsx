
import { useState } from 'react';
import { Plus, Edit, Trash2, BookOpen, Heart, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useMovieStore } from '@/store/movieStore';

interface MovieCollection {
  id: string;
  name: string;
  description: string;
  movieIds: number[];
  createdAt: string;
  color: string;
}

export const MovieCollections = () => {
  const [collections, setCollections] = useState<MovieCollection[]>([
    {
      id: '1',
      name: 'Weekend Watchlist',
      description: 'Movies to watch this weekend',
      movieIds: [],
      createdAt: new Date().toISOString(),
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: 'Classic Cinema',
      description: 'Timeless masterpieces',
      movieIds: [],
      createdAt: new Date().toISOString(),
      color: 'bg-purple-500'
    }
  ]);
  
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { userPreferences, trendingMovies } = useMovieStore();

  const createCollection = () => {
    if (!newCollectionName.trim()) return;
    
    const newCollection: MovieCollection = {
      id: Date.now().toString(),
      name: newCollectionName,
      description: newCollectionDescription,
      movieIds: [],
      createdAt: new Date().toISOString(),
      color: `bg-${['red', 'blue', 'green', 'purple', 'yellow', 'pink'][Math.floor(Math.random() * 6)]}-500`
    };
    
    setCollections([...collections, newCollection]);
    setNewCollectionName('');
    setNewCollectionDescription('');
    setIsCreateDialogOpen(false);
  };

  const deleteCollection = (id: string) => {
    setCollections(collections.filter(c => c.id !== id));
  };

  const getCollectionMovieCount = (movieIds: number[]) => {
    return movieIds.length;
  };

  const getDefaultCollections = () => [
    {
      id: 'liked',
      name: 'Liked Movies',
      description: 'Movies you\'ve liked',
      count: userPreferences.likedMovies.length,
      icon: Heart,
      color: 'bg-red-500'
    },
    {
      id: 'watchlist',
      name: 'My Watchlist',
      description: 'Movies to watch later',
      count: userPreferences.watchlist.length,
      icon: Clock,
      color: 'bg-blue-500'
    },
    {
      id: 'trending',
      name: 'Trending Now',
      description: 'Popular movies right now',
      count: trendingMovies.length,
      icon: Star,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Collections</h2>
          <p className="text-muted-foreground">Organize your movies into custom lists</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Collection Name</label>
                <Input
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., Action Movies, Date Night"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description (optional)</label>
                <Input
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="What's this collection about?"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createCollection} disabled={!newCollectionName.trim()}>
                  Create Collection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Default Collections */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {getDefaultCollections().map((collection) => {
            const IconComponent = collection.icon;
            return (
              <Card key={collection.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${collection.color}`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{collection.name}</h4>
                      <p className="text-sm text-muted-foreground">{collection.description}</p>
                    </div>
                    <Badge variant="secondary">{collection.count}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Custom Collections */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Custom Collections</h3>
        {collections.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="font-medium mb-2">No custom collections yet</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Create collections to organize your movies by theme, mood, or any way you like
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Collection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map((collection) => (
              <Card key={collection.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${collection.color}`} />
                      <div>
                        <CardTitle className="text-base">{collection.name}</CardTitle>
                        {collection.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {collection.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => deleteCollection(collection.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {getCollectionMovieCount(collection.movieIds)} movies
                    </span>
                    <Button variant="outline" size="sm">
                      View Collection
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
