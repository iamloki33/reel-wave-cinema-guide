
import { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, Clock, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMovieStore } from '@/store/movieStore';

interface SearchFilters {
  genre: string;
  year: string;
  rating: string;
  sortBy: string;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
}

const GENRES = [
  { id: '28', name: 'Action' },
  { id: '12', name: 'Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '18', name: 'Drama' },
  { id: '27', name: 'Horror' },
  { id: '10749', name: 'Romance' },
  { id: '878', name: 'Sci-Fi' },
  { id: '53', name: 'Thriller' }
];

const YEARS = Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() - i).toString());

export const AdvancedSearch = ({ onSearch }: AdvancedSearchProps) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    genre: '',
    year: '',
    rating: '',
    sortBy: 'popularity.desc'
  });
  
  const { userPreferences, searchMovies, clearSearchHistory } = useMovieStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      onSearch(finalQuery, filters);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearFilters = () => {
    setFilters({
      genre: '',
      year: '',
      rating: '',
      sortBy: 'popularity.desc'
    });
  };

  const hasActiveFilters = filters.genre || filters.year || filters.rating || filters.sortBy !== 'popularity.desc';

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search movies, actors, directors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            className="pl-10 pr-4"
          />
          
          {/* Search Suggestions */}
          {showSuggestions && userPreferences.searchHistory.length > 0 && (
            <Card className="absolute top-full left-0 right-0 z-50 mt-1">
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Recent searches</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearchHistory}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                {userPreferences.searchHistory.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(search)}
                    className="flex items-center gap-2 w-full p-2 text-left hover:bg-muted rounded-md"
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{search}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        
        <Button onClick={() => handleSearch()} disabled={!query.trim()}>
          Search
        </Button>
        
        {/* Filters Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  !
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Genre</label>
                  <Select value={filters.genre} onValueChange={(value) => setFilters({ ...filters, genre: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any genre</SelectItem>
                      {GENRES.map(genre => (
                        <SelectItem key={genre.id} value={genre.id}>
                          {genre.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Year</label>
                  <Select value={filters.year} onValueChange={(value) => setFilters({ ...filters, year: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any year</SelectItem>
                      {YEARS.map(year => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Min Rating</label>
                  <Select value={filters.rating} onValueChange={(value) => setFilters({ ...filters, rating: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any rating</SelectItem>
                      <SelectItem value="7">7+ Stars</SelectItem>
                      <SelectItem value="8">8+ Stars</SelectItem>
                      <SelectItem value="9">9+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Sort by</label>
                  <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity.desc">Most Popular</SelectItem>
                      <SelectItem value="vote_average.desc">Highest Rated</SelectItem>
                      <SelectItem value="release_date.desc">Newest</SelectItem>
                      <SelectItem value="release_date.asc">Oldest</SelectItem>
                      <SelectItem value="title.asc">A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.genre && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {GENRES.find(g => g.id === filters.genre)?.name}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, genre: '' })} />
            </Badge>
          )}
          {filters.year && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.year}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, year: '' })} />
            </Badge>
          )}
          {filters.rating && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {filters.rating}+ Stars
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, rating: '' })} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
