import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { use, useEffect, useState,  }  from 'react';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import { defineQuery } from 'groq';
import { client } from '@/lib/sanity/client';
import { formatDuration } from 'lib/utils';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';


// Define the type inline or import the correct type if available
type GetWorkoutRecordQueryResult = {
  _id: string;
  _type: string;
  _createdAt: string;
  date: string;
  duration: number;
  exercises: {
    exercise: {
      _id: string;
      name: string;
      description: string;
    };
    sets: {
      reps: number;
      weight: number;
      weightUnit: string;
      _type: string;
      _key: string;
    }[];
    _type: string;
    _key: string;
  }[];
};

const getWorkoutRecordQuery =
  defineQuery(`*[_type == "workout" && _id == $workoutId][0] {
  _id,
  _type,
  _createdAt,
  date,
  duration,
  exercises[] {
    exercise-> {
       _id,
       name,
       description,
    },
    sets[] {
      reps,
      weight,
      weightUnit,
      _type,
      _key
    },
    _type,
    _key
  }
}`);


export default function WorkoutRecord() {
    const { workoutId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [workout, setWorkout] = useState<GetWorkoutRecordQueryResult | null>();
    const router = useRouter();

    useEffect(() => {
        const fetchWorkoutRecord = async () => {
            if (!workoutId) return;

            try {
                const result = await client.fetch(getWorkoutRecordQuery, {
                    workoutId,
                });
                setWorkout(result)
            }   catch (error) {
                console.error("Error fetching workout record:", error);
            }   finally {
                setLoading(false);
            }
        };

        fetchWorkoutRecord();
    }, [workoutId]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "Unknown Date";

        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatWorkoutDuration = (seconds: number) => {
        if (!seconds) return "Duration not recorded";
        return formatDuration(seconds);
    };

    const getTotalSets = () => {
        return (
            workout?.exercises.reduce((total, exercise) => {
                return total + (exercise.sets?.length || 0);
            }, 0) || 0
        );
    };

    const getTotalVolume = () => {
        let unit = "lbs";
        const totalVolume = workout?.exercises.reduce((total, exercise) => {
            return (
                total +
                (exercise.sets?.reduce((setTotal, set) => {
                    if (set.weight && set.reps) {
                        unit = set.weightUnit || "lbs";
                        return setTotal + set.weight * set.reps;
                    }
                    return setTotal;
                }, 0) || 0)
            );
        }, 0) || 0;

        return { volume: totalVolume, unit };
    };

    const handleDeleteWorkout = () => {
        Alert.alert(
            "Delete Workout",
            "Are you sure you want to delete this workout record? This action cannot be undone.",

            [ 
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {   
                    text: "Delete",
                    style: "destructive",
                    onPress: deleteWorkout,
                },
            ]
        );
    };

    const deleteWorkout = async () => {
        if (!workoutId) return;

        setDeleting(true);

        try{
          await fetch("/api/delete-workout", {
            method: "POST",
            body: JSON.stringify({ workoutId }),
           });
              
          router.replace("/(app)/(tabs)/history?refresh=true");
        } catch (error) {
          console.error("Error deleting workout:", error);
          Alert.alert("Error", "Failed to delete workout record. Please try again.", [
            { text: "OK" },
         ]);
        } finally {
          setDeleting(false);
        }
   };

    if (loading) {
        return(
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text className="mt-4 text-gray-600">Loading workout record...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!workout) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 items-center justify-center">
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                    <Text className="text-xl font-semibold text-gray-900 mt-4">
                       Workout record not found
                    </Text>
                    <Text className="text-gray-600 text-center mt-2">
                        The workout record could not be found.
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.back()}
                      className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
                    >
                        <Text className="text-white font-bold">Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }


    const { volume, unit } = getTotalVolume();

    
    
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView className="lex-1">
                {/* Workout Header */}
                <View className="bg-white p-6 border-b border-gray-300">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-semibold text-gray-900">
                            Workout Summary
                        </Text>
                        <TouchableOpacity
                            onPress={handleDeleteWorkout}
                            disabled={deleting}
                            className="bg-red-600 px-4 py-2 rounded-lg flex-row items-center"
                        >
                            {deleting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                                    <Text className="text-white font-mediumml-2">Delete</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center mb-3">
                        <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                        <Text className="ml-2 text-gray-700">
                            {formatDate(workout.date)} at {formatTime(workout.date)}
                        </Text>
                    </View>

                    <View className="flex-row items-center mb-3">
                        <Ionicons name="time-outline" size={20} color="#6B7280" />
                        <Text className="ml-3 text-gray-700 font-medium">
                            {formatWorkoutDuration(workout.duration)}
                        </Text>
                    </View>

                    <View className="flex-row items-center mb-3">
                        <Ionicons name="fitness-outline" size={20} color="#6B7280" />
                        <Text className="ml-3 text-gray-700 font-medium">
                            {workout.exercises?.length || 0} exercises
                        </Text>
                    </View>

                    <View className="flex-row items-center mb-3">
                        <Ionicons name="bar-chart-outline" size={20} color="#6B7280" />
                        <Text className="ml-3 text-gray-700 font-medium">
                            {getTotalSets()} total sets
                        </Text>
                    </View>


                    {volume > 0 && (
                        <View className="flex-row items-center">
                            <Ionicons name="barbell-outline" size={20} color="#6B7280" />
                            <Text className="ml-3 text-gray-700 font-medium">
                                {volume.toLocaleString()} {unit} total volume
                            </Text>
                        </View>
                    )}
                </View>

                {/* Exercises List */}
                <View className="space-y-4 p-6 gap-4">
                    {workout.exercises?.map((exerciseData, index) => (
                        <View
                          key={exerciseData._key}
                          className="bg-white rounded-2xl p-4 shadow-sm border
                          border-gray-100"
                        > 
                          {/* Exercise Header */}
                          <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-900">
                                    {exerciseData.exercise?.name || "Unknown Exercise"}
                                </Text>
                                <Text className="text-gray-600 text-sm mt-1">
                                    {exerciseData.sets?.length || 0} sets completed
                                </Text>
                            </View>
                            <View className="bg-blue-100 rounded-full w-10 h-12
                            items-center justify-center">
                                <Text className="text-blue-600 font-bold ">{index + 1}</Text>
                            </View>
                         </View> 

                         {/* Sets */}
                         <View className="space-y-2">
                            <Text className="text-sm font-medium text-gray-700 mb-2">
                                Sets:
                            </Text>
                            {exerciseData.sets?.map((set, setIndex) => (
                                <View 
                                  key={set._key}
                                  className="bg-gray-50 rounded-lg p-3 items-center 
                                  justify-between"
                                >

                                    <View className="flex-row items-center">
                                        <View className="bg-gray-200 rounded-full w-6 h-6
                                        items-center justify-center mr-3">
                                          <Text className="text-gray-700 font-medium">
                                            {setIndex + 1}
                                          </Text>
                                        </View>
                                        <Text className="text-gray-800 font-medium">
                                           {set.reps} reps
                                        </Text>
                                    </View>

                                    {set.weight && (
                                        <View className="flex-row items-center">
                                            <Ionicons 
                                              name="barbell-outline" 
                                              size={16} 
                                              color="#6B7280"
                                            />
                                            <Text className="text-gray-700 font-medium ml-2">
                                                {set.weight} {set.weightUnit || "lbs"} 
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>

                        { /* Exercise Volume Summary */}
                        { exerciseData.sets && exerciseData.sets.length > 0 && (
                            <View className="mt-4 pt-4 border-t border-gray-100">
                                <View className="flex-row items-center justify-between">
                                    <Text className="text-sm text-gray-600">
                                        Total Volume:
                                    </Text>
                                    <Text className="text-sm font-medium text-gray-900">
                                        {exerciseData.sets
                                        .reduce((total, set) => {
                                            return total + (set.weight || 0) * (set.reps || 0);
                                        }, 0)
                                        .toLocaleString()}{" "}
                                        {exerciseData.sets[0].weightUnit || "lbs"}
                                    </Text>
                                </View>
                            </View>
                        )}
                     </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}