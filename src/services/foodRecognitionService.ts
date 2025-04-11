
import { FoodItem } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

// Mock database for food nutrition information (converted from nutrition_db.py)
const NUTRITION_DB = {
  "AlooGobi": {
    "calories": 172,
    "protein": 4.3,
    "carbohydrates": 18.5,
    "fats": 10.2,
    "weight": 150
  },
  "AlooMasala": {
    "calories": 195,
    "protein": 3.8,
    "carbohydrates": 25.6,
    "fats": 9.5,
    "weight": 175
  },
  "Bhatura": {
    "calories": 330,
    "protein": 7.5,
    "carbohydrates": 52.0,
    "fats": 12.5,
    "weight": 100
  },
  "BhindiMasala": {
    "calories": 158,
    "protein": 3.2,
    "carbohydrates": 14.8,
    "fats": 11.0,
    "weight": 150
  },
  "Biryani": {
    "calories": 350,
    "protein": 12.0,
    "carbohydrates": 45.0,
    "fats": 12.0,
    "weight": 250
  },
  "Chai": {
    "calories": 85,
    "protein": 2.5,
    "carbohydrates": 10.5,
    "fats": 3.8,
    "weight": 150
  },
  "Chole": {
    "calories": 210,
    "protein": 9.0,
    "carbohydrates": 30.5,
    "fats": 7.0,
    "weight": 175
  },
  "CoconutChutney": {
    "calories": 175,
    "protein": 2.0,
    "carbohydrates": 8.5,
    "fats": 16.0,
    "weight": 50
  },
  "Dal": {
    "calories": 116,
    "protein": 9.0,
    "carbohydrates": 20.0,
    "fats": 0.4,
    "weight": 175
  },
  "Dosa": {
    "calories": 133,
    "protein": 2.6,
    "carbohydrates": 25.0,
    "fats": 1.9,
    "weight": 90
  },
  "DumAloo": {
    "calories": 210,
    "protein": 4.0,
    "carbohydrates": 28.0,
    "fats": 10.0,
    "weight": 180
  },
  "FishCurry": {
    "calories": 195,
    "protein": 20.0,
    "carbohydrates": 12.0,
    "fats": 8.5,
    "weight": 200
  },
  "Ghevar": {
    "calories": 310,
    "protein": 5.0,
    "carbohydrates": 45.0,
    "fats": 12.0,
    "weight": 100
  },
  "GreenChutney": {
    "calories": 45,
    "protein": 2.0,
    "carbohydrates": 6.5,
    "fats": 1.5,
    "weight": 30
  },
  "GulabJamun": {
    "calories": 320,
    "protein": 4.0,
    "carbohydrates": 45.0,
    "fats": 14.0,
    "weight": 100
  },
  "Idli": {
    "calories": 39,
    "protein": 2.0,
    "carbohydrates": 7.0,
    "fats": 0.2,
    "weight": 40
  },
  "Jalebi": {
    "calories": 328,
    "protein": 3.0,
    "carbohydrates": 55.0,
    "fats": 12.0,
    "weight": 100
  },
  "Kebab": {
    "calories": 285,
    "protein": 22.0,
    "carbohydrates": 8.0,
    "fats": 18.5,
    "weight": 150
  },
  "Kheer": {
    "calories": 255,
    "protein": 7.0,
    "carbohydrates": 40.0,
    "fats": 8.0,
    "weight": 200
  },
  "Kulfi": {
    "calories": 220,
    "protein": 5.0,
    "carbohydrates": 25.0,
    "fats": 12.0,
    "weight": 90
  },
  "Lassi": {
    "calories": 150,
    "protein": 6.0,
    "carbohydrates": 28.0,
    "fats": 2.0,
    "weight": 250
  },
  "MuttonCurry": {
    "calories": 240,
    "protein": 25.0,
    "carbohydrates": 12.0,
    "fats": 12.0,
    "weight": 200
  },
  "OnionPakoda": {
    "calories": 230,
    "protein": 6.0,
    "carbohydrates": 22.0,
    "fats": 14.0,
    "weight": 100
  },
  "PalakPaneer": {
    "calories": 275,
    "protein": 16.0,
    "carbohydrates": 12.5,
    "fats": 18.0,
    "weight": 175
  },
  "Poha": {
    "calories": 180,
    "protein": 3.5,
    "carbohydrates": 35.0,
    "fats": 3.0,
    "weight": 150
  },
  "RajmaCurry": {
    "calories": 195,
    "protein": 10.0,
    "carbohydrates": 28.0,
    "fats": 5.0,
    "weight": 175
  },
  "RasMalai": {
    "calories": 230,
    "protein": 8.0,
    "carbohydrates": 28.0,
    "fats": 10.0,
    "weight": 120
  },
  "Samosa": {
    "calories": 262,
    "protein": 4.0,
    "carbohydrates": 30.0,
    "fats": 13.0,
    "weight": 80
  },
  "ShahiPaneer": {
    "calories": 310,
    "protein": 17.0,
    "carbohydrates": 15.0,
    "fats": 22.0,
    "weight": 175
  },
  "WhiteRice": {
    "calories": 130,
    "protein": 2.7,
    "carbohydrates": 28.0,
    "fats": 0.3,
    "weight": 150
  }
};

// Convert object keys to lowercase for case-insensitive lookups
const CASE_INSENSITIVE_DB = Object.entries(NUTRITION_DB).reduce(
  (acc, [key, value]) => {
    acc[key.toLowerCase()] = value;
    return acc;
  },
  {} as Record<string, typeof NUTRITION_DB[keyof typeof NUTRITION_DB]>
);

/**
 * Get nutritional information for a given food item.
 * Returns null if the food item is not found in the database.
 */
function getNutritionInfo(foodItem: string) {
  return CASE_INSENSITIVE_DB[foodItem.toLowerCase()] || null;
}

// Backend API endpoints
const API_BASE_URL = 'http://localhost:5000'; // Update this if your Flask server runs on a different port
const PREDICT_ENDPOINT = `${API_BASE_URL}/predict`;
const BARCODE_ENDPOINT = `${API_BASE_URL}/upload`;

/**
 * Analyze food from an image using the backend API
 */
export async function analyzeFoodFromImage(imageFile: File): Promise<{
  detectedItems: FoodItem[];
  aiSummary: string;
}> {
  try {
    // Create a FormData instance to send the image
    const formData = new FormData();
    formData.append('image', imageFile);

    toast.info("Analyzing image with AI...");

    try {
      // Send the image to our backend API
      const response = await fetch(PREDICT_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      
      // Transform predictions into FoodItem objects
      const detectedItems: FoodItem[] = [];
      
      if (result.predictions && result.predictions.length > 0) {
        // Process predictions from the IndianFoodNet model
        const prediction = result.predictions[0]; // Get the top prediction
        const foodClass = prediction.class;
        const confidence = prediction.confidence;
        const nutritionInfo = result.nutrition || getNutritionInfo(foodClass);
        
        if (nutritionInfo) {
          detectedItems.push({
            id: uuidv4(),
            name: foodClass,
            portion: `${nutritionInfo.weight || 100}g`,
            calories: nutritionInfo.calories || 100,
            protein: nutritionInfo.protein || 2,
            carbs: nutritionInfo.carbohydrates || 15,
            fat: nutritionInfo.fats || 5,
            confidence: confidence,
            image: undefined
          });
        }
      }

      // Generate a summary
      const itemNames = detectedItems.map(item => item.name).join(', ');
      const totalCalories = detectedItems.reduce((sum, item) => sum + item.calories, 0);
      
      const aiSummary = detectedItems.length > 0
        ? `I detected ${detectedItems.length} item${detectedItems.length > 1 ? 's' : ''}: ${itemNames}. This meal contains approximately ${totalCalories} calories.`
        : "I couldn't identify any food items in this image. Please try again with a clearer photo.";

      return { detectedItems, aiSummary };
    } catch (error) {
      console.error('Backend API error:', error);
      
      // Fallback to mock implementation if the server is not available
      toast.error("Couldn't connect to the backend server. Using fallback mode.");
      return fallbackAnalyzeFoodFromImage(imageFile);
    }
  } catch (error) {
    console.error('Error analyzing food image:', error);
    throw new Error('Failed to analyze food image');
  }
}

/**
 * Scan barcode from image and get product information using the backend API
 */
export async function scanBarcodeFromImage(imageFile: File): Promise<FoodItem | null> {
  try {
    // Create a FormData instance to send the image
    const formData = new FormData();
    formData.append('image', imageFile);

    toast.info("Scanning for barcode...");

    try {
      // Send the image to our backend API for barcode scanning
      const response = await fetch(BARCODE_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 400) {
          toast.error("No barcode found in the image");
          return null;
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Barcode API result:", result);
      
      // Create nutritional values (either from API or defaults)
      const nutrition = result.nutrition_facts || {
        calories: 100,
        protein: 0,
        carbohydrates: 0,
        fat: 0
      };
      
      // Process the barcode result from the Open Food Facts API
      return {
        id: uuidv4(),
        name: result.product_name || "Unknown Product",
        portion: "100g",
        calories: nutrition.calories || 100,
        protein: nutrition.protein || 0,
        carbs: nutrition.carbohydrates || 0,
        fat: nutrition.fat || 0,
        image: undefined
      };
    } catch (error) {
      console.error('Backend API error:', error);
      
      // Fallback to mock implementation if the server is not available
      toast.error("Couldn't connect to the backend server. Using fallback mode.");
      return fallbackScanBarcodeFromImage(imageFile);
    }
  } catch (error) {
    console.error('Error scanning barcode:', error);
    throw new Error('Failed to scan barcode');
  }
}

// Fallback implementations for when the backend is not available

function fallbackAnalyzeFoodFromImage(imageFile: File): Promise<{
  detectedItems: FoodItem[];
  aiSummary: string;
}> {
  return new Promise((resolve) => {
    // Mock the AI prediction response
    const mockPredictions = simulateAIPrediction();
    
    // Transform predictions into FoodItem objects
    const detectedItems: FoodItem[] = mockPredictions.map(prediction => {
      const nutritionInfo = getNutritionInfo(prediction.className);
      
      return {
        id: uuidv4(),
        name: prediction.className,
        portion: `${nutritionInfo?.weight || 100}g`,
        calories: nutritionInfo?.calories || 100,
        protein: nutritionInfo?.protein || 2,
        carbs: nutritionInfo?.carbohydrates || 15,
        fat: nutritionInfo?.fats || 5,
        confidence: prediction.confidence,
        image: undefined
      };
    });

    // Generate a summary
    const itemNames = detectedItems.map(item => item.name).join(', ');
    const totalCalories = detectedItems.reduce((sum, item) => sum + item.calories, 0);
    
    const aiSummary = detectedItems.length > 0
      ? `I detected ${detectedItems.length} item${detectedItems.length > 1 ? 's' : ''}: ${itemNames}. This meal contains approximately ${totalCalories} calories.`
      : "I couldn't identify any food items in this image. Please try again with a clearer photo.";

    resolve({ detectedItems, aiSummary });
  });
}

function fallbackScanBarcodeFromImage(imageFile: File): Promise<FoodItem | null> {
  return new Promise((resolve) => {
    // In 70% of cases, successfully detect a barcode
    if (Math.random() > 0.3) {
      // Mock barcode data from Open Food Facts API
      const mockProduct = {
        product_name: "Organic Greek Yogurt",
        nutrition_facts: {
          calories: 120,
          protein: 15,
          carbohydrates: 8,
          fat: 3
        },
        barcode: "5901234123457"
      };
      
      resolve({
        id: uuidv4(),
        name: mockProduct.product_name,
        portion: "150g",
        calories: mockProduct.nutrition_facts.calories,
        protein: mockProduct.nutrition_facts.protein,
        carbs: mockProduct.nutrition_facts.carbohydrates,
        fat: mockProduct.nutrition_facts.fat,
        image: undefined
      });
    } else {
      // No barcode detected
      toast.error("No barcode found in the image");
      resolve(null);
    }
  });
}

// Helper function to simulate AI prediction (used in fallback mode)
function simulateAIPrediction() {
  // List of possible foods from our database
  const possibleFoods = Object.keys(NUTRITION_DB);
  
  // Randomly select 1-3 food items
  const numDetections = Math.floor(Math.random() * 3) + 1;
  const detections = [];
  
  for (let i = 0; i < numDetections; i++) {
    const randomIndex = Math.floor(Math.random() * possibleFoods.length);
    const foodName = possibleFoods[randomIndex];
    
    detections.push({
      className: foodName,
      confidence: 0.7 + (Math.random() * 0.3) // Random confidence between 0.7 and 1.0
    });
  }
  
  return detections;
}
