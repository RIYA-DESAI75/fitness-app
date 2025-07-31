import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


export async function POST(request: Request) {
    const { exerciseName } = await request.json();

    if (!exerciseName) {
        return Response.json(
            { error: "Exercise name is required" },
            { status: 400 }
        );
    }

    const prompt = `
    You are a fitness coach.
    You are given an exercise, provide clear instructions on how to perform the exercise. Include if any equipment is required.
    Explain the benefits of the exercise and any tips for beginners.
    
    The exercise name is: ${exerciseName}
    
    Keep it short and concise, the markdown formatting.
    
    Use the following format:

    ##Equipment required
    
    ##Instructions
    
    ##Benefits
    
    ###Tips
    
    ###Variations
    
    ###Safety
    
    keep spacing between the headings and the content.
    
Always use headings and subheadings.
    `;

    console.log(prompt)

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],

    });
    console.log(response);
    return Response.json({ message: response.choices[0].message.content });
    } catch (error) {
        console.error("Error generating AI response:", error);
        return Response.json(
            { error: "Failed to generate AI response" },
            { status: 500 }
        );
    }

}

