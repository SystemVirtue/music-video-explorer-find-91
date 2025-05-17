
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, List, FileJson, Upload, Home, Download, RefreshCcw, Edit, File } from "lucide-react";
import { VideoDataFile } from "@/services/fileManager";

export type Task = 'search' | 'playlist' | 'json' | 'txt' | 'thumbnails' | 'reset' | 'view-edit' | 'ai-generate' | null;

interface TaskSelectorProps {
  videoData: VideoDataFile;
  onTaskSelect: (task: Task) => void;
  onGoHome?: () => void;
  onExportCollection: () => void;
}

const TaskSelector = ({ videoData, onTaskSelect, onGoHome, onExportCollection }: TaskSelectorProps) => {
  const { artistCount, videoCount } = videoData;
  
  const hasData = artistCount > 0 || videoCount > 0;
  
  return (
    <div className="space-y-6">
      {/* Collection Info Box */}
      <div className="border rounded-lg p-4 flex flex-col items-center">
        <h3 className="text-lg font-medium mb-2">Current Collection</h3>
        <div className="text-center mb-4">
          <p>
            Currently <span className="font-bold">{artistCount}</span> Artists &{" "}
            <span className="font-bold">{videoCount}</span> Videos in memory.
          </p>
        </div>
        
        {hasData && (
          <Button 
            onClick={onExportCollection}
            className="bg-music hover:bg-music-hover"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Current Collection as JSON
          </Button>
        )}
      </div>
      
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4">
          <h2 className="text-2xl font-bold">Select a Task</h2>
          {onGoHome && (
            <Button 
              onClick={onGoHome} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
        <Button 
          onClick={() => onTaskSelect('search')} 
          className="h-auto py-6 flex flex-col items-center bg-music hover:bg-music-hover"
        >
          <Search className="h-8 w-8 mb-2" />
          <span className="text-lg font-medium">Search for an Artist</span>
          <span className="text-xs mt-1 text-muted">Search for music videos by artist name</span>
        </Button>
        
        <Button 
          onClick={() => onTaskSelect('playlist')}
          className="h-auto py-6 flex flex-col items-center"
        >
          <List className="h-8 w-8 mb-2" />
          <span className="text-lg font-medium">Extract from Playlist</span>
          <span className="text-xs mt-1 text-muted">Extract artists from YouTube playlist</span>
        </Button>
        
        <Button 
          onClick={() => onTaskSelect('json')}
          className="h-auto py-6 flex flex-col items-center"
        >
          <FileJson className="h-8 w-8 mb-2" />
          <span className="text-lg font-medium">Import JSON Data</span>
          <span className="text-xs mt-1 text-muted">Combine with existing data</span>
        </Button>
        
        <Button 
          onClick={() => onTaskSelect('txt')}
          className="h-auto py-6 flex flex-col items-center"
        >
          <Upload className="h-8 w-8 mb-2" />
          <span className="text-lg font-medium">Upload Artist List</span>
          <span className="text-xs mt-1 text-muted">Process artists from text file</span>
        </Button>
        
        <Button 
          onClick={() => onTaskSelect('thumbnails')}
          className="h-auto py-6 flex flex-col items-center"
        >
          <Download className="h-8 w-8 mb-2" />
          <span className="text-lg font-medium">Download Video Thumbnails</span>
          <span className="text-xs mt-1 text-muted">Save thumbnail images to disk</span>
        </Button>
        
        <Button 
          onClick={() => onTaskSelect('view-edit')}
          className="h-auto py-6 flex flex-col items-center"
        >
          <Edit className="h-8 w-8 mb-2" />
          <span className="text-lg font-medium">View & Edit Collection</span>
          <span className="text-xs mt-1 text-muted">Manage artists in collection</span>
        </Button>
        
        <Button 
          onClick={() => onTaskSelect('ai-generate')}
          className="h-auto py-6 flex flex-col items-center"
        >
          <File className="h-8 w-8 mb-2" />
          <span className="text-lg font-medium">Use AI to Generate Artist Lists</span>
          <span className="text-xs mt-1 text-muted">Generate recommendations</span>
        </Button>
        
        <Button 
          onClick={() => onTaskSelect('reset')}
          className="h-auto py-6 flex flex-col items-center"
          variant="destructive"
        >
          <RefreshCcw className="h-8 w-8 mb-2" />
          <span className="text-lg font-medium">Reset / Fresh Start</span>
          <span className="text-xs mt-1 text-muted">Clear current collection</span>
        </Button>
      </div>
    </div>
  );
};

export default TaskSelector;
