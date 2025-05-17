
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, List, FileJson, Upload, Home } from "lucide-react";
import { VideoDataFile } from "@/services/fileManager";

export type Task = 'search' | 'playlist' | 'json' | 'txt' | null;

interface TaskSelectorProps {
  videoData: VideoDataFile;
  onTaskSelect: (task: Task) => void;
  onGoHome?: () => void;
}

const TaskSelector = ({ videoData, onTaskSelect, onGoHome }: TaskSelectorProps) => {
  const { artistCount, videoCount } = videoData;
  
  const hasData = artistCount > 0 || videoCount > 0;
  
  return (
    <div className="space-y-8">
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
        
        {hasData && (
          <div className="p-4 bg-muted/30 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-muted-foreground">
              Current data contains <span className="font-bold">{artistCount}</span> artists
              and <span className="font-bold">{videoCount}</span> music videos
            </p>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
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
      </div>
    </div>
  );
};

export default TaskSelector;
