// app/api/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// THIS IS THE FINAL, CORRECTED LINE WITH THE STABLE MODEL
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  try {
    const { businessType, targetAudience, style } = await req.json();

    if (!businessType || !targetAudience || !style) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const prompt = `
      You are a world-class business and branding expert. Your task is to generate a complete "Micro Business Kit" based on the user's input.
      The user wants to start a business of type: "${businessType}".
      The target audience is: "${targetAudience}".
      The desired style or vibe is: "${style}".
      Please generate the following assets and provide them ONLY in a valid JSON format. Do not include any explanatory text, markdown formatting like \`\`\`json, or anything outside of the JSON structure itself.
      The JSON object should have the following keys: "name", "tagline", "description", "colorPalette" (an array of 4 objects with "hex" and "name"), "logoIdea", "websiteText" (an object with "about", "services", "contact"), and "socialMediaBio".
      Ensure the entire output is a single, well-formed JSON object.
    `;
    
    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("Google API Error:", errorBody);
        throw new Error(`Google API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    const text = data.candidates[0].content.parts[0].text;

    const cleanedText = text.replace(/^```json\s*|```\s*$/g, '');
    const kitData = JSON.parse(cleanedText);

    await supabase.from("generated_kits").insert([
      {
        business_type: businessType,
        target_audience: targetAudience,
        style: style,
        kit_data: kitData,
      },
    ]);

    return NextResponse.json(kitData);

  } catch (error) {
    console.error("Error in /api/generate:", error);
    return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
  }
}