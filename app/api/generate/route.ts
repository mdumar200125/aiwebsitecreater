// // app/api/generate/route.ts

// import { NextRequest, NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";

// // Initialize Supabase client
// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// // THIS IS THE FINAL, CORRECTED LINE WITH THE STABLE MODEL
// const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// export async function POST(req: NextRequest) {
//   try {
//     const { businessType, targetAudience, style } = await req.json();

//     if (!businessType || !targetAudience || !style) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     const prompt = `
//       You are a world-class business and branding expert. Your task is to generate a complete "Micro Business Kit" based on the user's input.
//       The user wants to start a business of type: "${businessType}".
//       The target audience is: "${targetAudience}".
//       The desired style or vibe is: "${style}".
//       Please generate the following assets and provide them ONLY in a valid JSON format. Do not include any explanatory text, markdown formatting like \`\`\`json, or anything outside of the JSON structure itself.
//       The JSON object should have the following keys: "name", "tagline", "description", "colorPalette" (an array of 4 objects with "hex" and "name"), "logoIdea", "websiteText" (an object with "about", "services", "contact"), and "socialMediaBio".
//       Ensure the entire output is a single, well-formed JSON object.
//     `;
    
//     const payload = {
//       contents: [{
//         parts: [{
//           text: prompt
//         }]
//       }]
//     };

//     const response = await fetch(API_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//         const errorBody = await response.json();
//         console.error("Google API Error:", errorBody);
//         throw new Error(`Google API responded with status: ${response.status}`);
//     }

//     const data = await response.json();
    
//     const text = data.candidates[0].content.parts[0].text;

//     const cleanedText = text.replace(/^```json\s*|```\s*$/g, '');
//     const kitData = JSON.parse(cleanedText);

//     await supabase.from("generated_kits").insert([
//       {
//         business_type: businessType,
//         target_audience: targetAudience,
//         style: style,
//         kit_data: kitData,
//       },
//     ]);

//     return NextResponse.json(kitData);

//   } catch (error) {
//     console.error("Error in /api/generate:", error);
//     return NextResponse.json({ error: "An internal server error occurred." }, { status: 500 });
//   }
// }



// app/api/generate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function POST(req: NextRequest) {
  try {
    // ✅ Validate body
    const { businessType, targetAudience, style } = await req.json();

    if (!businessType || !targetAudience || !style) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Stronger prompt (Gemini obeys this better)
    const prompt = `
You are a world-class business and branding expert.

Generate a complete "Micro Business Kit".

Business type: "${businessType}"
Target audience: "${targetAudience}"
Style: "${style}"

Return ONLY STRICT VALID JSON.

Rules:
- Use DOUBLE QUOTES for ALL keys
- No markdown
- No explanations
- No trailing commas
- Output must be ONE JSON object only

JSON schema:
{
"name": "",
"tagline": "",
"description": "",
"colorPalette": [{"hex": "", "name": ""}],
"logoIdea": "",
"websiteText": {
  "about": "",
  "services": "",
  "contact": ""
},
"socialMediaBio": ""
}
`;

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    // ✅ Call Gemini
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Google API Error:", errorBody);

      return NextResponse.json(
        { error: "AI generation failed" },
        { status: 500 }
      );
    }

    const data = await response.json();

    // ✅ Safe optional chaining (prevents crashes)
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;

    if (!text) {
      console.error("Empty Gemini response:", data);
      return NextResponse.json(
        { error: "AI returned empty response" },
        { status: 500 }
      );
    }

    // ✅ Clean possible markdown
    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    console.log("Gemini CLEANED TEXT:\n", cleanedText);

    // ✅ Safe JSON parsing
    let kitData;
    try {
      kitData = JSON.parse(cleanedText);
    } catch (err) {
      console.error("Invalid JSON from Gemini:", cleanedText);

      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 500 }
      );
    }

    // ✅ Insert into Supabase
    const { error: dbError } = await supabase
      .from("generated_kits")
      .insert([
        {
          business_type: businessType,
          target_audience: targetAudience,
          style: style,
          kit_data: kitData,
        },
      ]);

    if (dbError) {
      console.error("Supabase insert error:", dbError);
    }

    // ✅ Success
    return NextResponse.json(kitData);
  } catch (error) {
    console.error("Error in /api/generate:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
