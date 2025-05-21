
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

interface CollectionActionsProps {
  hasData: boolean;
  onExportCollection: () => void;
  onExportLegacyV2?: () => void;
}

const CollectionActions = ({ hasData, onExportCollection, onExportLegacyV2 }: CollectionActionsProps) => {
  if (!hasData) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button 
        onClick={onExportCollection}
        className="bg-music hover:bg-music-hover"
      >
        <Download className="mr-2 h-4 w-4" />
        Export Current Collection as JSON
      </Button>
      
      {onExportLegacyV2 && (
        <Button 
          onClick={onExportLegacyV2}
          variant="outline"
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          LEGACY (V2) EXPORT - compatible
        </Button>
      )}
    </div>
  );
};

export default CollectionActions;
