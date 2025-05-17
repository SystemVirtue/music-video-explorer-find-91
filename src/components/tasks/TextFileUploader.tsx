
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Upload, Home } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { parseArtistTextFile } from "@/services/fileManager";

interface TextFileUploaderProps {
  onUpload: (artists: string[]) => void;
  onCancel: () => void;
  onGoHome?: () => void;
}

const TextFileUploader = ({ onUpload, onCancel, onGoHome }: TextFileUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "text/plain" || file.name.endsWith('.txt')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a text (.txt) file",
          variant: "destructive",
        });
        e.target.value = '';
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a text file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const artistNames = await parseArtistTextFile(selectedFile);
      
      if (artistNames.length === 0) {
        toast({
          title: "No artists found",
          description: "The text file does not contain any artist names",
          variant: "destructive",
        });
      } else {
        toast({
          title: "File processed",
          description: `Found ${artistNames.length} artists in the text file`,
        });
        onUpload(artistNames);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process text file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Upload Artist List</h2>
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
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
      
      <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center space-y-4">
        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
        
        <div>
          <p className="text-lg font-medium">
            {selectedFile ? selectedFile.name : "Select a text file with artist names"}
          </p>
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          )}
        </div>
        
        <div className="flex justify-center">
          <input
            type="file"
            id="text-file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,text/plain"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            Browse Files
          </Button>
        </div>
      </div>
      
      <div className="p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Format:</strong> Each line in the text file should contain one artist name
        </p>
      </div>
      
      <div className="flex gap-4">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="bg-music hover:bg-music-hover flex-1"
        >
          {isUploading ? (
            <>
              <LoadingSpinner size={16} className="mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Process File
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default TextFileUploader;
