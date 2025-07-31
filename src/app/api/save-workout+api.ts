import { adminClient } from "@/lib/sanity/client";
import workout from "sanity/schemaTypes/workout";

export interface WorkoutData {
  _type: 'workout';
  userId: string;
  date: string;
  duration: number;
  exercises: {
    // This should match the inline object structure in the schema
    exercise: {
      _type: 'reference';
      _ref: string;
    };
    sets: {
      reps: number;
      weight: number;
      weightUnit: 'lbs' | 'kg';
    }[];
  }[];
}

export async function POST(request: Request) {
  const { workoutData }: { workoutData: WorkoutData } = await request.json();

  // Remove any legacy _type/_key fields from exercises/sets to match schema
  const sanitizedExercises = workoutData.exercises.map((ex) => ({
    exercise: {
      _type: 'reference',
      _ref: ex.exercise._ref,
    },
    sets: ex.sets.map((set) => ({
      reps: set.reps,
      weight: set.weight,
      weightUnit: set.weightUnit,
    })),
  }));

  const doc = {
    _type: 'workout',
    userId: workoutData.userId,
    date: workoutData.date,
    duration: workoutData.duration,
    exercises: sanitizedExercises,
  };

  try {
    // Save to Sanity using admin client
    const result = await adminClient.create(doc);
    console.log('Workout saved successfully:', result);
    return Response.json({
      success: true,
      workoutId: result._id,
      message: 'Workout saved successfully',
    });
  } catch (error) {
    console.error('Error saving workout:', error);
    return Response.json({ error: 'Failed to save workout' }, { status: 500 });
  }
}