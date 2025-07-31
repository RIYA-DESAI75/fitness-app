import { urlFor } from "@/lib/sanity/client";
import { Exercise } from '@/lib/sanity/types';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, Image } from "react-native";

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": 
        return "bg-green-500";   //green for beginner
      case "intermediate":
        return "bg-blue-500";   //blue for intermediate
      case "advanced":
        return "bg-red-500";    //red for advanced  

    }
};

const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
        case "beginner":
          return "Beginner";
        case "intermediate":
          return "Intermediate";
        case "advanced":
          return "Advanced";
           
    }
};


interface ExerciseCardProps {
    item: Exercise;
    onPress: () => void;
    showChevron?: boolean;
}

export default function ExerciseCard({
    item,
    onPress,
    showChevron = false,
}:    ExerciseCardProps) {
    return (
        <TouchableOpacity
           className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100"
           onPress={onPress}
        >
              <View className="flex-row p-6">
              <View className="w-20 h-20 bg-white rounded-xl mr-4 overflow-hidden">
           {item.image ? (
              <Image 
                source={{ uri: urlFor(item.image?.asset?._ref).url() }}
                className="w-full h-full"
                resizeMode="contain"
              />
            ) : (
              <View className="w-full h-full bg-gradient-to-br from blue-400
             to-purple-500 items-center justify-center">
                <Ionicons name="fitness" size={24} color="white" />
              </View>
            )}
            </View>
            <View className="flex-1 justify-between">
              <View>
                <Text className="text-lg font-bold text-gray-900 mb-1">
                  {item.name}
                </Text>
                <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
                  {item.description || "No description available"}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <View
                  className={`px-3 py-1 rounded-full ${getDifficultyColor(
                    item.difficulty 
                  )}`}
                >
                  <Text className="text-xs font-semibold text-white">
                    {getDifficultyText(item.difficulty)}
                  </Text>
                </View>

                {showChevron && (
                  <TouchableOpacity className="p-2">
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
  
        </TouchableOpacity>
   
  );

} 

