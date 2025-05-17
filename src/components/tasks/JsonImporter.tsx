
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { FileJson } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { importFromJson } from "@/services/fileManager";

interface JsonImporterProps {
  onImport: () => void;
  onCancel: () => void;
}

const JsonImporter = ({ onImport, onCancel }: JsonImporterProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/json" || file.name.endsWith('.json')) {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a JSON file",
          variant: "destructive",
        });
        e.target.value = '';
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a JSON file to import",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    
    try {
      await importFromJson(selectedFile);
      toast({
        title: "Import successful",
        description: "JSON data has been imported and combined with existing data",
      });
      onImport();
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import JSON data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Import JSON Data</h2>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
      
      <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center space-y-4">
        <FileJson className="h-12 w-12 mx-auto text-muted-foreground" />
        
        <div>
          <p className="text-lg font-medium">
            {selectedFile ? selectedFile.name : "Select a JSON file to import"}
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
            id="json-file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
          >
            Browse Files
          </Button>
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button
          onClick={handleImport}
          disabled={!selectedFile || isImporting}
          className="bg-music hover:bg-music-hover flex-1"
        >
          {isImporting ? (
            <>
              <LoadingSpinner size={16} className="mr-2" />
              Importing...
            </>
          ) : (
            <>
              <FileJson className="h-4 w-4 mr-2" />
              Import JSON
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default JsonImporter;
