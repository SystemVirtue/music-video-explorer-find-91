
import { useState } from "react";
import { generateCombinedDataJsonDownload, generateLegacyV2JsonDownload } from "@/services/fileManager";
import { useToast } from "@/components/ui/use-toast";
import TaskSelector, { Task } from "@/components/TaskSelector";
import SearchForm from "@/components/SearchForm";
import ProcessingStatus from "@/components/ProcessingStatus";
import ResultsDisplay from "@/components/ResultsDisplay";
import ErrorDisplay from "@/components/ErrorDisplay";
import CollectionInfo from "@/components/CollectionInfo";
import AppFooter from "@/components/AppFooter";
import { useVideoCollection } from "@/hooks/useVideoCollection";

// Task components
import PlaylistExtractor from "@/components/tasks/PlaylistExtractor";
import JsonImporter from "@/components/tasks/JsonImporter";
import TextFileUploader from "@/components/tasks/TextFileUploader";
import VisualAssetsDownloader from "@/components/tasks/VisualAssetsDownloader";
import ResetCollection from "@/components/tasks/ResetCollection";
import ViewEditCollection from "@/components/tasks/ViewEditCollection";
import AiArtistGenerator from "@/components/tasks/AiArtistGenerator";

const Index = () => {
  const [selectedTask, setSelectedTask] = useState<Task>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  
  const {
    artistData,
    videoData,
    currentArtist,
    videos,
    processingQueue,
    isProcessing,
    error,
    setError,
    setCurrentArtist,
    setVideos,
    searchAndProcessArtist,
    handleExtractArtists,
    handleReset,
    handleDeleteArtists,
    refreshCollectionData
  } = useVideoCollection();

  const handleSearch = async (artistName: string) => {
    setIsSearching(true);
    setError(null);
    setCurrentArtist(null);
    setVideos([]);
    
    try {
      await searchAndProcessArtist(artistName);
    } catch (error) {
      console.error("Search error:", error);
      let errorMessage = "An error occurred while searching. Please try again.";
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      setError(errorMessage);
      toast({
        title: "Search failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportComplete = () => {
    // Refresh video data
    refreshCollectionData();
    setSelectedTask(null);
    
    toast({
      title: "Import complete",
      description: "Data has been imported and combined with existing data",
    });
  };
  
  // Handle exporting collection
  const handleExportCollection = () => {
    try {
      const jsonUrl = generateCombinedDataJsonDownload();
      const { artistCount, videoCount } = getCollectionStats();
      const fileName = `Video_Collection_${artistCount}_Artists_${videoCount}_Videos.json`;
      const link = document.createElement('a');
      link.href = jsonUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      setTimeout(() => URL.revokeObjectURL(jsonUrl), 100);
      
      toast({
        title: "Export Complete",
        description: `Your file "${fileName}" has been exported`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "There was an error generating your export file",
        variant: "destructive",
      });
    }
  };

  // Handle exporting collection in legacy V2 format
  const handleExportLegacyV2 = () => {
    try {
      const jsonUrl = generateLegacyV2JsonDownload();
      const { artistCount, videoCount } = getCollectionStats();
      const fileName = `Legacy_V2_Export_${artistCount}_Artists_${videoCount}_Videos.json`;
      const link = document.createElement('a');
      link.href = jsonUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the object URL
      setTimeout(() => URL.revokeObjectURL(jsonUrl), 100);
      
      toast({
        title: "Legacy Export Complete",
        description: `Your file "${fileName}" has been exported in V2 format`,
      });
    } catch (error) {
      console.error("Legacy export error:", error);
      toast({
        title: "Legacy export failed",
        description: "There was an error generating your legacy export file",
        variant: "destructive",
      });
    }
  };
  
  const handleExportAndReset = () => {
    handleExportCollection();
    setTimeout(() => handleReset(), 500); // Small delay to ensure export completes
  };
  
  const handleGoHome = () => {
    refreshCollectionData();
    setSelectedTask(null);
    setError(null);
  };
  
  const renderTaskComponent = () => {
    switch (selectedTask) {
      case 'search':
        return (
          <SearchForm 
            onSearch={handleSearch} 
            onGoHome={handleGoHome} 
            isSearching={isSearching} 
          />
        );
      case 'playlist':
        return (
          <PlaylistExtractor 
            onExtract={handleExtractArtists} 
            onCancel={() => setSelectedTask(null)}
            onGoHome={handleGoHome} 
          />
        );
      case 'json':
        return (
          <JsonImporter 
            onImport={handleImportComplete} 
            onCancel={() => setSelectedTask(null)}
            onGoHome={handleGoHome} 
          />
        );
      case 'txt':
        return (
          <TextFileUploader 
            onUpload={handleExtractArtists} 
            onCancel={() => setSelectedTask(null)}
            onGoHome={handleGoHome} 
          />
        );
      case 'thumbnails':
        return (
          <VisualAssetsDownloader
            videos={videoData.videos}
            artists={artistData.artists}
            onCancel={() => setSelectedTask(null)}
            onGoHome={handleGoHome}
          />
        );
      case 'reset':
        return (
          <ResetCollection
            onReset={handleReset}
            onExportAndReset={handleExportAndReset}
            onCancel={() => setSelectedTask(null)}
            onGoHome={handleGoHome}
          />
        );
      case 'view-edit':
        return (
          <ViewEditCollection
            artists={artistData.artists}
            videos={videoData.videos}
            onDeleteArtists={handleDeleteArtists}
            onCancel={() => setSelectedTask(null)}
            onGoHome={handleGoHome}
          />
        );
      case 'ai-generate':
        return (
          <AiArtistGenerator
            onAddArtists={handleExtractArtists}
            onCancel={() => setSelectedTask(null)}
            onGoHome={handleGoHome}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero section */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-music-gradient">
            Music Video Finder
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Search for music videos by your favorite artists using MusicBrainz and AudioDB
          </p>
        </div>
        
        {/* Task selector or currently selected task */}
        {selectedTask === null ? (
          <>
            <CollectionInfo 
              onExportCollection={handleExportCollection} 
              onExportLegacyV2={handleExportLegacyV2} 
            />
            <TaskSelector 
              artistData={artistData}
              videoData={videoData}
              onTaskSelect={setSelectedTask}
              onGoHome={handleGoHome}
              onExportCollection={handleExportCollection}
              onExportLegacyV2={handleExportLegacyV2}
            />
          </>
        ) : (
          renderTaskComponent()
        )}
        
        {/* Display error if any */}
        <ErrorDisplay error={error} />
        
        {/* Display loading state */}
        <ProcessingStatus 
          isSearching={isSearching} 
          isProcessing={isProcessing} 
          processingQueue={processingQueue} 
        />
        
        {/* Display current results */}
        <ResultsDisplay 
          currentArtist={currentArtist} 
          videos={videos} 
          onGoHome={handleGoHome} 
          isSearching={isSearching} 
        />
        
        <AppFooter />
      </div>
    </div>
  );
};

export default Index;
