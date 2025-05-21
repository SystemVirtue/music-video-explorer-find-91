
import React from "react";
import CollectionActions from "@/components/CollectionActions";
import { getCollectionStats } from "@/services/fileManager";

interface CollectionInfoProps {
  onExportCollection: () => void;
  onExportLegacyV2?: () => void;
}

const CollectionInfo = ({ onExportCollection, onExportLegacyV2 }: CollectionInfoProps) => {
  const { artistCount, videoCount } = getCollectionStats();
  const hasData = artistCount > 0 || videoCount > 0;
  
  return (
    <div className="border rounded-lg p-4 flex flex-col items-center">
      <h3 className="text-lg font-medium mb-2">Current Collection</h3>
      <div className="text-center mb-4">
        <p>
          Currently <span className="font-bold">{artistCount}</span> Artists &{" "}
          <span className="font-bold">{videoCount}</span> Videos in memory.
        </p>
      </div>
      
      <CollectionActions 
        hasData={hasData} 
        onExportCollection={onExportCollection} 
        onExportLegacyV2={onExportLegacyV2} 
      />
    </div>
  );
};

export default CollectionInfo;
