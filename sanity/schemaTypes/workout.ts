import { defineField, defineType, defineArrayMember } from 'sanity'

export default defineType({
  name: 'workout',
  title: 'Workout',
  description: 'A workout session with user, date, duration, and exercises performed.',
  icon: () => '💪',
  type: 'document',
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      description: 'Clerk user ID for the workout owner.',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      description: 'Date of the workout session.',
      type: 'datetime',
      validation: (Rule: any) => Rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      description: 'Total duration of the workout in seconds.',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(1),
    }),
    defineField({
      name: 'exercises',
      title: 'Exercises',
      description: 'Exercises performed in this workout, with reps, weight, and unit.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'exerciseInstance',
          title: 'Exercise Instance',
          preview: {
            select: {
              exercise: 'exercise.name',
            },
            prepare(selection) {
              return {
                title: selection.exercise || 'Exercise',
              }
            },
          },
          fields: [
            defineField({
              name: 'exercise',
              title: 'Exercise',
              description: 'Reference to the exercise performed.',
              type: 'reference',
              to: [{ type: 'exercise' }],
              validation: (Rule: any) => Rule.required(),
            }),
            defineField({
              name: 'sets',
              title: 'Sets',
              description: 'Add more sets for this exercise.',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'set',
                  title: 'Set',
                  fields: [
                    defineField({
                      name: 'reps',
                      title: 'Repetitions',
                      type: 'number',
                      validation: (Rule: any) => Rule.required().min(1),
                    }),
                    defineField({
                      name: 'weight',
                      title: 'Weight',
                      type: 'number',
                      validation: (Rule: any) => Rule.min(0),
                    }),
                    defineField({
                      name: 'weightUnit',
                      title: 'Weight Unit',
                      type: 'string',
                      options: {
                        list: [
                          { title: 'Kilograms', value: 'kg' },
                          { title: 'lbs', value: 'lbs' },
                        ],
                        layout: 'radio',
                      },
                    }),
                  ],
                }),
              ],
              validation: (Rule: any) => Rule.min(0),
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      date: 'date',
      duration: 'duration',
      exercises: 'exercises',
    },
    prepare(selection) {
      const { date, duration, exercises } = selection;
      // Format date as: Monday, 28 July 2025
      const workoutDate = date
        ? new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : 'No date';

      // Show duration in m.ss or h:mm:ss format for preview
      let durationStr = '';
      const totalSecs = duration || 0;
      if (totalSecs < 60) {
        durationStr = `0.${totalSecs.toString().padStart(2, '0')} secs`;
      } else if (totalSecs < 3600) {
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        durationStr = `${mins}.${secs.toString().padStart(2, '0')} min`;
      } else {
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        durationStr = `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} hr`;
      }

      // Show completed exercises summary
      let exerciseSummary = '';
      if (Array.isArray(exercises) && exercises.length > 0) {
        const names = exercises
          .map((ex) => {
            if (ex.exercise && typeof ex.exercise === 'object') {
              return ex.exercise.name || ex.exercise.title || '';
            }
            return '';
          })
          .filter(Boolean);
        if (names.length > 0) {
          exerciseSummary = `Exercises: ${names.join(', ')}`;
        } else {
          exerciseSummary = 'No exercises completed.';
        }
      } else {
        exerciseSummary = 'No exercises completed.';
      }

      return {
        title: workoutDate,
        subtitle: `${exerciseSummary} | Time: ${durationStr}`,
      };
    },
  },
})

