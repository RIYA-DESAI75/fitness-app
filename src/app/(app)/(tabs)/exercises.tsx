import { Text, SafeAreaView, View, TextInput, TouchableOpacity, FlatList, RefreshControl} from "react-native";
import React, { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { defineQuery } from "groq";
import { client } from "@/lib/sanity/client";
import { Exercise } from "sanity/sanity.types";
import ExerciseCard from "@/app/(components)/ExerciseCard";
import exercise from "sanity/schemaTypes/exercise";

// Define the query outside the component for proper type generation
export const exercisesQuery = defineQuery(`*[_type == "exercise"] {
  ...
 }`);

export default function Exercises() {
  const [searchQuery, setSearchQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const fetchExercises = async () => {
    try {
      //Fetch exercises from sanity
      const exercises = await client.fetch(exercisesQuery);
      setExercises(exercises);
      setFilteredExercises(exercises);
    } catch (error) {
      console.error("Error fetching exercises:",error);
    }
  };

   useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    const filtered = exercises.filter((exercise: Exercise) =>
     exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredExercises(filtered);

  }, [searchQuery, exercises]);


  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExercises();
    setRefreshing(false);
  };


  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      { /* header */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
      <Text className="text-2xl font-bold text-gray-900">
        Exercise Library
      </Text>
      <Text className="text-gray-600 mt-1">
        Discover and master new exercises
      </Text>

      { /* Search Bar */}
      <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mt-4">
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          className="flex-1 ml-3 text-gray-800"
          placeholder="Search exercises..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
      </View>
     </View>

     { /* Exercise List */}
     <FlatList 
        data={filteredExercises}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24 }}
        renderItem={({ item }) => (
          <ExerciseCard
            item={ item }
            onPress={() => router.push (`/exercise-detail?id=${item._id}`)}
          />
        )}

        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]} // Android
            tintColor="#3B82F6"  // iOS
            title="Pull to refresh exercises "  //iOS
            titleColor="#3B82F6"  //iOS
          />

        }

        ListEmptyComponent={
          <View className="bg-white rounded-2xl p-8 items-center">
            <Ionicons name="fitness-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4">
              {searchQuery ? "No exercises found" : "Loading exercises..."}
            </Text>
            <Text className="text-gray-600 text-center mt-2">
              {searchQuery
                ? "Try adjusting your search"
                : "Your exercises will appear here"
              }
            </Text>
          </View> 
        }
      />
    </SafeAreaView>
  );
}