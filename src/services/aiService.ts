
import { FoodItem } from '@/types';
import { analyzeFoodFromImage, scanBarcodeFromImage } from './foodRecognitionService';

// This service coordinates different AI/ML functions for food analysis
export async function analyzeFoodImage(imageFile: File): Promise<{
  detectedItems: FoodItem[];
  aiSummary: string;
}> {
  try {
    // First, try to analyze the food using our image recognition
    const result = await analyzeFoodFromImage(imageFile);
    
    // If no items detected, try scanning for a barcode
    if (result.detectedItems.length === 0) {
      const barcodeResult = await scanBarcodeFromImage(imageFile);
      
      // If barcode scan successful, add it to detected items
      if (barcodeResult) {
        result.detectedItems = [barcodeResult];
        result.aiSummary = `I detected a barcode for ${barcodeResult.name}. This item contains approximately ${barcodeResult.calories} calories.`;
      }
    }
    
    // Add health tip to the summary
    if (result.detectedItems.length > 0) {
      result.aiSummary += ' ' + getHealthTip(result.detectedItems);
    }
    
    return result;
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw new Error('Failed to analyze food image');
  }
}

// Generate a health tip based on the detected food items
function getHealthTip(items: FoodItem[]): string {
  const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = items.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = items.reduce((sum, item) => sum + item.fat, 0);
  
  // Check macronutrient distribution
  if (totalProtein < 15 && items.length > 1) {
    return "Consider adding a protein source to create a more balanced meal.";
  } else if (totalCarbs > 60 && totalFat < 10) {
    return "This meal is high in carbs. Consider adding healthy fats like avocado or nuts for better satiety.";
  } else if (totalFat > 30 && totalProtein < 15) {
    return "This meal is high in fat. Consider balancing it with more protein sources.";
  }
  
  // Default positive reinforcement
  const healthyFoods = items.filter(item => 
    item.name.toLowerCase().includes("vegetable") || 
    item.name.toLowerCase().includes("fruit") ||
    ["spinach", "kale", "broccoli", "avocado", "salmon", "chicken breast"].includes(item.name.toLowerCase())
  );
  
  if (healthyFoods.length > 0) {
    return "Great choice! This meal contains nutritious whole foods.";
  }
  
  return "Remember to aim for a balanced meal with protein, complex carbs, and healthy fats.";
}
