
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Home, Edit, Trash, Check } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { ArtistDataEntry, VideoDataEntry } from "@/services/fileManager";

interface ViewEditCollectionProps {
  artists: ArtistDataEntry[];
  videos: VideoDataEntry[];
  onDeleteArtists: (artistADIDs: string[]) => void;
  onCancel: () => void;
  onGoHome?: () => void;
}

interface ArtistWithSelection extends ArtistDataEntry {
  selected: boolean;
  name?: string; // Optional name field in case we have it
}

const ViewEditCollection = ({ artists, videos, onDeleteArtists, onCancel, onGoHome }: ViewEditCollectionProps) => {
  const [artistList, setArtistList] = useState<ArtistWithSelection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { toast } = useToast();
  
  // Initialize artist list with video counts
  useEffect(() => {
    // Group videos by artistADID to get artist names
    const artistNamesMap = new Map<string, string>();
    videos.forEach(video => {
      if (!artistNamesMap.has(video.artistADID)) {
        // Extract artist name from song title or use placeholder
        const artistName = getArtistNameFromVideo(video);
        artistNamesMap.set(video.artistADID, artistName);
      }
    });
    
    const artistsWithSelections = artists.map(artist => {
      // Count videos for this artist
      const count = videos.filter(video => video.artistADID === artist.artistADID).length;
      
      return {
        ...artist,
        videoCount: count,
        selected: false,
        name: artistNamesMap.get(artist.artistADID) || `Artist (ID: ${artist.artistADID.substring(0, 8)}...)`
      };
    });
    
    setArtistList(artistsWithSelections);
  }, [artists, videos]);
  
  // Helper function to attempt to extract artist name from video data
  const getArtistNameFromVideo = (video: VideoDataEntry): string => {
    // Try to extract from song title if it follows "Artist - Song Title" format
    const titleParts = video.songTitle.split(' - ');
    if (titleParts.length > 1) {
      return titleParts[0].trim();
    }
    
    // Use part of the artistADID as fallback
    return `Artist (ID: ${video.artistADID.substring(0, 8)}...)`;
  };
  
  // Filter artists based on search term
  const filteredArtists = artistList.filter(artist => 
    (artist.name && artist.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    artist.artistADID.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectedCount = artistList.filter(artist => artist.selected).length;
  
  // Toggle selection for a single artist
  const toggleSelect = (id: string) => {
    setArtistList(prev => 
      prev.map(artist => 
        artist.artistADID === id ? { ...artist, selected: !artist.selected } : artist
      )
    );
  };
  
  // Toggle all selections
  const toggleSelectAll = () => {
    const allSelected = filteredArtists.every(artist => artist.selected);
    setArtistList(prev => 
      prev.map(artist => {
        if (filteredArtists.some(a => a.artistADID === artist.artistADID)) {
          return { ...artist, selected: !allSelected };
        }
        return artist;
      })
    );
  };
  
  // Handle deletion of selected artists
  const handleDelete = () => {
    const selectedADIDs = artistList
      .filter(artist => artist.selected)
      .map(artist => artist.artistADID);
    
    onDeleteArtists(selectedADIDs);
    setConfirmDelete(false);
    
    toast({
      title: "Artists Deleted",
      description: `${selectedADIDs.length} artists have been removed from the collection.`
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
                  key={artist.artistADID} 
                  className={`flex items-center p-2 rounded hover:bg-muted ${
                    artist.selected ? 'bg-muted' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={artist.selected}
                    onChange={() => toggleSelect(artist.artistADID)}
                    className="mr-3 h-4 w-4"
                  />
                  <span className="flex-grow">{artist.name}</span>
                  <span className="text-muted-foreground">({artist.artistVideoCount})</span>
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
