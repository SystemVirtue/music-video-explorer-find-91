
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Home, Edit, Trash, Check, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { ArtistDataEntry, VideoDataEntry } from "@/services/fileManager";
import LoadingSpinner from "@/components/LoadingSpinner";

interface ViewEditCollectionProps {
  artists: ArtistDataEntry[];
  videos: VideoDataEntry[];
  onDeleteArtists: (artistADIDs: string[]) => void;
  onCancel: () => void;
  onGoHome?: () => void;
}

interface ArtistWithSelection extends ArtistDataEntry {
  selected: boolean;
}

const ViewEditCollection = ({ artists, videos, onDeleteArtists, onCancel, onGoHome }: ViewEditCollectionProps) => {
  const [artistList, setArtistList] = useState<ArtistWithSelection[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);
  const { toast } = useToast();
  
  // Initialize artist list with video counts
  useEffect(() => {
    setIsProcessing(true);
    const processArtists = async () => {
      const totalArtists = artists.length;
      const artistsWithSelections: ArtistWithSelection[] = [];
      
      for (let i = 0; i < artists.length; i++) {
        const artist = artists[i];
        // Count videos for this artist
        const count = videos.filter(video => video.artistADID === artist.artistADID).length;
        
        artistsWithSelections.push({
          ...artist,
          artistVideoCount: count, // Update count based on actual videos
          selected: false
        });
        
        // Update progress
        const progress = Math.round(((i + 1) / totalArtists) * 100);
        setProcessProgress(progress);
        
        // Add a small delay to avoid UI freezing for large collections
        if (i % 20 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      setArtistList(artistsWithSelections);
      setIsProcessing(false);
    };
    
    processArtists();
  }, [artists, videos]);
  
  // Filter artists based on search term
  const filteredArtists = artistList.filter(artist => 
    (artist.artistName && artist.artistName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    artist.artistADID.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.artistMBID.toLowerCase().includes(searchTerm.toLowerCase())
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
  
  // Select all artists with no videos
  const selectArtistsWithNoVideos = () => {
    setArtistList(prev => 
      prev.map(artist => {
        if (artist.artistVideoCount === 0) {
          return { ...artist, selected: true };
        }
        return artist;
      })
    );
    
    // Count how many artists have no videos
    const noVideoCount = artistList.filter(artist => artist.artistVideoCount === 0).length;
    
    toast({
      title: `Selected ${noVideoCount} artists without videos`,
      description: "You can now delete these artists from your collection."
    });
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

  if (isProcessing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Processing Collection Data</h2>
        </div>
        
        <div className="space-y-4 text-center py-12">
          <LoadingSpinner size={48} className="mx-auto" />
          <Progress value={processProgress} className="w-full max-w-md mx-auto" />
          <p className="text-muted-foreground">{processProgress}% complete</p>
        </div>
      </div>
    );
  }

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
        <div className="sticky top-0 bg-background p-4 border-b flex flex-wrap items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={toggleSelectAll}
          >
            <Check className="h-4 w-4" />
            {filteredArtists.every(artist => artist.selected) ? "Deselect All" : "Select All"}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={selectArtistsWithNoVideos}
          >
            <AlertCircle className="h-4 w-4" />
            Select Artists Without Videos
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
                  <span className="flex-grow">{artist.artistName || `Artist (ID: ${artist.artistADID.substring(0, 8)}...)`}</span>
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
