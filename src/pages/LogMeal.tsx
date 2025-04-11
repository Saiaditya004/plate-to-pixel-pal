
import React, { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, Upload, ArrowLeft, Trash2, Plus, Info, Scan } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { analyzeFoodImage } from '@/services/aiService';
import { FoodItem, MealEntry } from '@/types';
import FoodItemCard from '@/components/FoodItemCard';
import { Progress } from '@/components/ui/progress';

const LogMeal: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultMealType = searchParams.get('type') as 'breakfast' | 'lunch' | 'dinner' | 'snack' || 'breakfast';
  
  const navigate = useNavigate();
  const { user, addMeal } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(defaultMealType);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [detectedItems, setDetectedItems] = useState<FoodItem[]>([]);
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset previous analysis
      setDetectedItems([]);
      setAiSummary("");
    }
  };
  
  const handleBarcodeCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset previous analysis
      setDetectedItems([]);
      setAiSummary("");
      
      // Automatically start barcode scanning
      toast.info("Scanning for barcode...");
      handleAnalyzeImage(true);
    }
  };
  
  const handleAnalyzeImage = async (isBarcodeMode = false) => {
    if (!imageFile) {
      toast.error('Please select an image first');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 300);
    
    try {
      if (isBarcodeMode) {
        toast.info("Looking for barcodes in the image...");
      }
      
      const result = await analyzeFoodImage(imageFile);
      setDetectedItems(result.detectedItems);
      setAiSummary(result.aiSummary);
      
      if (result.detectedItems.length > 0) {
        toast.success('Analysis complete!');
      } else {
        toast.warning('No food items detected. Try another image or add items manually.');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      
      // Delay hiding the progress bar to show completion
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 500);
    }
  };
  
  const handleRemoveItem = (itemId: string) => {
    setDetectedItems(detectedItems.filter(item => item.id !== itemId));
  };
  
  const handleAddItem = () => {
    // In a real app, this would open a food search dialog
    toast.info('Food search functionality would be here in the full app!');
  };
  
  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to log a meal');
      return;
    }
    
    if (detectedItems.length === 0) {
      toast.error('Please add at least one food item');
      return;
    }
    
    setIsSubmitting(true);
    
    const totalCalories = detectedItems.reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = detectedItems.reduce((sum, item) => sum + item.protein, 0);
    const totalCarbs = detectedItems.reduce((sum, item) => sum + item.carbs, 0);
    const totalFat = detectedItems.reduce((sum, item) => sum + item.fat, 0);
    
    try {
      const newMeal: Omit<MealEntry, 'id'> = {
        userId: user.id,
        date: new Date().toISOString().split('T')[0],
        mealType,
        items: detectedItems,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        image: selectedImage || undefined
      };
      
      await addMeal(newMeal);
      navigate('/');
    } catch (error) {
      console.error('Error logging meal:', error);
      toast.error('Failed to log meal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="p-0 mr-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold gradient-heading">Log a Meal</h1>
      </div>
      
      <Card className="shadow-md mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Step 1: Meal Details</CardTitle>
          <CardDescription>Select meal type and upload a photo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Meal Type</label>
            <Select value={mealType} onValueChange={(val: any) => setMealType(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Breakfast</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
                <SelectItem value="dinner">Dinner</SelectItem>
                <SelectItem value="snack">Snack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Meal Photo</label>
            
            {selectedImage ? (
              <div className="relative mb-4">
                <img 
                  src={selectedImage} 
                  alt="Selected meal" 
                  className="w-full h-60 object-cover rounded-md"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 w-8 h-8 rounded-full"
                  onClick={() => {
                    setSelectedImage(null);
                    setImageFile(null);
                    setDetectedItems([]);
                    setAiSummary("");
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col justify-center items-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={24} className="mb-2" />
                  <span className="text-sm">Take Photo</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col justify-center items-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={24} className="mb-2" />
                  <span className="text-sm">Upload Image</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-24 flex flex-col justify-center items-center"
                  onClick={() => barcodeInputRef.current?.click()}
                >
                  <Scan size={24} className="mb-2" />
                  <span className="text-sm">Scan Barcode</span>
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleImageCapture}
                />
                <input
                  type="file"
                  ref={barcodeInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleBarcodeCapture}
                />
              </div>
            )}
            
            {isAnalyzing && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Analyzing image...</p>
                <Progress value={analysisProgress} className="h-2" />
              </div>
            )}
            
            {selectedImage && !isAnalyzing && (
              <Button
                className="w-full"
                onClick={() => handleAnalyzeImage()}
              >
                Analyze Image with AI
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {aiSummary && (
        <Alert className="mb-6 border-app-secondary/50 bg-app-secondary/10">
          <Info className="h-4 w-4 text-app-secondary" />
          <AlertTitle>AI Analysis</AlertTitle>
          <AlertDescription>{aiSummary}</AlertDescription>
        </Alert>
      )}
      
      <Card className="shadow-md mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Step 2: Detected Foods</CardTitle>
              <CardDescription>Confirm or edit detected items</CardDescription>
            </div>
            <Button
              variant="outline" 
              size="sm"
              onClick={handleAddItem}
              className="flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {detectedItems.length > 0 ? (
            <div className="space-y-3">
              {detectedItems.map((item) => (
                <FoodItemCard 
                  key={item.id} 
                  item={item} 
                  onRemove={() => handleRemoveItem(item.id)}
                  showConfidence
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No food items detected yet</p>
              <p className="text-sm text-gray-400">Upload an image and analyze it, or add items manually</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="w-full">
            {detectedItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-gray-50 p-3 rounded-md">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Calories</p>
                  <p className="font-medium text-app-primary">
                    {detectedItems.reduce((sum, item) => sum + item.calories, 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Protein</p>
                  <p className="font-medium text-app-secondary">
                    {detectedItems.reduce((sum, item) => sum + item.protein, 0).toFixed(1)}g
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Carbs</p>
                  <p className="font-medium text-app-accent">
                    {detectedItems.reduce((sum, item) => sum + item.carbs, 0).toFixed(1)}g
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Fat</p>
                  <p className="font-medium text-orange-500">
                    {detectedItems.reduce((sum, item) => sum + item.fat, 0).toFixed(1)}g
                  </p>
                </div>
              </div>
            )}
            
            <Button
              className="w-full"
              disabled={detectedItems.length === 0 || isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                'Log This Meal'
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LogMeal;
