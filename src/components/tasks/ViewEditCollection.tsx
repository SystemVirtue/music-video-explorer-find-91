
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Home, Edit, Trash, Check } from "lucide-react";
import { Artist, MusicVideo } from "@/services/musicApi";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface ViewEditCollectionProps {
  artists: Artist[];
  videos: MusicVideo[];
  onDeleteArtists: (artistIds: string[]) => void;
  onCancel: () => void;
  onGoHome?: () => void;
}

interface ArtistWithVideoCount extends Artist {
  videoCount: number;
  selected: boolean;
}

const ViewEditCollection = ({ artists, videos, onDeleteArtists, onCancel, onGoHome }: ViewEditCollectionProps) => {
  const [artistList, setArtistList] = useState<ArtistWithVideoCount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { toast } = useToast();
  
  // Initialize artist list with video counts
  useEffect(() => {
    const artistsWithCounts = artists.map(artist => {
      const count = videos.filter(video => video.idArtist === artist.id).length;
      return {
        ...artist,
        videoCount: count,
        selected: false
      };
    });
    setArtistList(artistsWithCounts);
  }, [artists, videos]);
  
  // Filter artists based on search term
  const filteredArtists = artistList.filter(artist => 
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedCount = artistList.filter(artist => artist.selected).length;
  
  // Toggle selection for a single artist
  const toggleSelect = (id: string) => {
    setArtistList(prev => 
      prev.map(artist => 
        artist.id === id ? { ...artist, selected: !artist.selected } : artist
      )
    );
  };
  
  // Toggle all selections
  const toggleSelectAll = () => {
    const allSelected = filteredArtists.every(artist => artist.selected);
    setArtistList(prev => 
      prev.map(artist => {
        if (filteredArtists.some(a => a.id === artist.id)) {
          return { ...artist, selected: !allSelected };
        }
        return artist;
      })
    );
  };
  
  // Handle deletion of selected artists
  const handleDelete = () => {
    const selectedIds = artistList
      .filter(artist => artist.selected)
      .map(artist => artist.id);
    
    onDeleteArtists(selectedIds);
    setConfirmDelete(false);
    
    toast({
      title: "Artists Deleted",
      description: `${selectedIds.length} artists have been removed from the collection.`
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">View & Edit Collection</h2>
        <div className="flex gap-2">
          {onGoHome && (
            <Button 
              variant="outline" 
              onClick={onGoHome} 
              className="flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          )}
          <Button variant="ghost" onClick={onCancel}>Done</Button>
        </div>
      </div>
      
      <div className="border rounded-lg">
        {/* Header - Fixed position */}
        <div className="sticky top-0 bg-background p-4 border-b flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={toggleSelectAll}
          >
            <Check className="h-4 w-4" />
            {filteredArtists.every(artist => artist.selected) ? "Deselect All" : "Select All"}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {selectedCount} Artists selected
          </div>
          
          <div className="flex-grow">
            <Input
              placeholder="Search artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
        
        {/* Scrollable artist list */}
        <div className="max-h-[50vh] overflow-y-auto p-4">
          {filteredArtists.length > 0 ? (
            <div className="space-y-2">
              {filteredArtists.map((artist) => (
                <div 
                  key={artist.id} 
                  className={`flex items-center p-2 rounded hover:bg-muted ${
                    artist.selected ? 'bg-muted' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={artist.selected}
                    onChange={() => toggleSelect(artist.id)}
                    className="mr-3 h-4 w-4"
                  />
                  <span className="flex-grow">{artist.name}</span>
                  <span className="text-muted-foreground">({artist.videoCount})</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No artists match your search
            </div>
          )}
        </div>
        
        {/* Footer - Fixed position */}
        <div className="sticky bottom-0 bg-background p-4 border-t flex justify-between items-center">
          <Button onClick={onCancel}>Done</Button>
          
          <Button 
            variant="destructive"
            disabled={selectedCount === 0}
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1"
          >
            <Trash className="h-4 w-4" />
            Delete Selected Artists
          </Button>
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} Artists from Current Collection?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all selected artists and their associated videos from the collection.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              No
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ViewEditCollection;
