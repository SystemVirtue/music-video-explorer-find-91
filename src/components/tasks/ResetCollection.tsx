
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Home, Download, RefreshCcw } from "lucide-react";

interface ResetCollectionProps {
  onReset: () => void;
  onExportAndReset: () => void;
  onCancel: () => void;
  onGoHome?: () => void;
}

const ResetCollection = ({ onReset, onExportAndReset, onCancel, onGoHome }: ResetCollectionProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const { toast } = useToast();
  
  const handleCancel = () => {
    setIsDialogOpen(false);
    onCancel();
  };
  
  const handleExportAndReset = () => {
    setIsDialogOpen(false);
    onExportAndReset();
  };
  
  const handleReset = () => {
    setIsDialogOpen(false);
    onReset();
    toast({
      title: "Collection Reset",
      description: "All data has been cleared."
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Reset Collection</h2>
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
        </div>
      </div>
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>!! All Current Collection Data will be removed !!</AlertDialogTitle>
            <AlertDialogDescription>
              To keep a copy, select 'Export Current Collection' before 'Delete Collection'.
              <br /><br />
              Are you sure you want to do this?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              className="bg-music hover:bg-music-hover"
              onClick={handleExportAndReset}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Collection JSON & Reset
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReset}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Delete without Exporting & Reset
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ResetCollection;
