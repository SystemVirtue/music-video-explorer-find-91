import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Home, File } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

// This is a mock AI response generator - in a real app, this would call an AI API
const mockGenerateArtistList = async (prompt: string): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock responses based on keywords in prompt
  const rockArtists = [
    "Led Zeppelin", "Pink Floyd", "The Rolling Stones", "AC/DC", 
    "Queen", "Aerosmith", "Guns N' Roses", "Metallica"
  ];
  
  const popArtists = [
    "Michael Jackson", "Madonna", "Prince", "Whitney Houston", 
    "Beyoncé", "Taylor Swift", "Ariana Grande", "Ed Sheeran"
  ];
  
  const jazzArtists = [
    "Miles Davis", "John Coltrane", "Duke Ellington", "Louis Armstrong",
    "Charlie Parker", "Thelonious Monk", "Billie Holiday", "Ella Fitzgerald"
  ];
  
  // Select artists based on prompt
  const lowerPrompt = prompt.toLowerCase();
  let artists: string[] = [];
  
  if (lowerPrompt.includes("rock")) {
    artists = rockArtists;
  } else if (lowerPrompt.includes("pop")) {
    artists = popArtists;
  } else if (lowerPrompt.includes("jazz")) {
    artists = jazzArtists;
  } else {
    // Mix of all if no specific genre mentioned
    artists = [...rockArtists.slice(0, 3), ...popArtists.slice(0, 3), ...jazzArtists.slice(0, 2)];
  }
  
  // Random shuffle
  return artists.sort(() => Math.random() - 0.5);
};

interface AiArtistGeneratorProps {
  onAddArtists: (artists: string[]) => void;
  onCancel: () => void;
  onGoHome?: () => void;
}

const AiArtistGenerator = ({ onAddArtists, onCancel, onGoHome }: AiArtistGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [artists, setArtists] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe the type of artists you want to generate",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call an AI API
      const generatedArtists = await mockGenerateArtistList(prompt);
      setArtists(generatedArtists);
      
      toast({
        title: "Artists Generated",
        description: `Generated ${generatedArtists.length} artists based on your prompt`,
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: "Failed to generate artist recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleAddToCollection = () => {
    if (artists.length === 0) return;
    onAddArtists(artists);
  };
  
  const handleEditPrompt = () => {
    // Keep the current prompt for editing, just clear the results
    setArtists([]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Artist Generator</h2>
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
      
      {artists.length === 0 ? (
        <div className="space-y-4">
          <div className="p-6 border rounded-lg space-y-4">
            <p>Describe what you'd like, e.g. style / genre / mood, or similar artist search, etc...</p>
            
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Rock bands from the 70s similar to Led Zeppelin"
              className="min-h-[100px]"
              disabled={isGenerating}
            />
            
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt.trim()}
              className="bg-music hover:bg-music-hover w-full"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size={16} className="mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <File className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-6 border rounded-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Generated Artist Recommendations</h3>
              <p className="text-sm text-muted-foreground">Based on: "{prompt}"</p>
            </div>
            
            <div className="p-4 bg-muted/30 rounded-lg max-h-[300px] overflow-y-auto">
              {artists.map((artist, index) => (
                <div key={index} className="py-1">
                  {artist}
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleEditPrompt}>
                Edit Prompt
              </Button>
              <Button onClick={handleAddToCollection} className="bg-music hover:bg-music-hover">
                Add to Current Collection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiArtistGenerator;
