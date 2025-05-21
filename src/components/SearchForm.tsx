
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Search, Home } from "lucide-react";

interface SearchFormProps {
  onSearch: (artistName: string) => Promise<void>;
  onGoHome: () => void;
  isSearching: boolean;
}

const SearchForm = ({ onSearch, onGoHome, isSearching }: SearchFormProps) => {
  const [artistName, setArtistName] = useState("");
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!artistName.trim()) {
      toast({
        title: "Please enter an artist name",
        variant: "destructive",
      });
      return;
    }

    try {
      await onSearch(artistName);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Search for an Artist</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onGoHome} 
            className="flex items-center gap-1"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
          <Button variant="ghost" onClick={onGoHome}>Cancel</Button>
        </div>
      </div>
      
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-grow">
          <Input
            type="text"
            placeholder="Enter artist or band name..."
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            className="pr-10 bg-muted border-muted focus:border-music"
            disabled={isSearching}
            aria-label="Artist name"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isSearching} 
          className="bg-music hover:bg-music-hover min-w-[100px]"
        >
          {isSearching ? (
            <LoadingSpinner size={16} className="mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Search
        </Button>
      </form>
    </div>
  );
};

export default SearchForm;
