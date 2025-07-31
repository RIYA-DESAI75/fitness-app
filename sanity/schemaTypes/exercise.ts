import {defineField, defineType} from 'sanity'


export default defineType({
  name: 'exercise',
  title: 'Exercise',
  description: 'Schema for an exercise, including name, description, difficulty, image, video, and active status.',
  icon: () => '🏋️',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'The name of the exercise.',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'A brief description of the exercise.',
      type: 'text',
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      description: 'Select the difficulty level: beginner, intermediate, or advanced.',
      type: 'string',
      options: {
        list: [
          {title: 'Beginner', value: 'beginner'},
          {title: 'Intermediate', value: 'intermediate'},
          {title: 'Advanced', value: 'advanced'},
        ],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'image',
      title: 'Image',
      description: 'Upload an image representing the exercise.',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: "Describe the image for accessibility and SEO.",
        }),
      ],
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      description: 'A link to a video demonstrating the exercise.',
      type: 'url',
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      description: 'Toggle to mark if the exercise is currently active.',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
