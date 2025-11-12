import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    // Fetch social links
    const { data: socialLinks, error: socialLinksError } = await supabase
      .from("social_links")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (socialLinksError) {
      console.error("Error fetching social links:", socialLinksError);
    }

    // Fetch web preferences (includes privacy settings)
    const { data: webPreferences, error: prefsError } = await supabase
      .from("user_web_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (prefsError && prefsError.code !== "PGRST116") {
      // PGRST116 = no rows returned (acceptable for new users)
      console.error("Error fetching web preferences:", prefsError);
    }

    // Return combined data
    return NextResponse.json({
      profile,
      socialLinks: socialLinks || [],
      privacySettings: webPreferences
        ? {
            show_phone: webPreferences.show_phone,
            show_email: webPreferences.show_email,
          }
        : {
            show_phone: true,
            show_email: true,
          },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// export async function PATCH(request: Request) {
//   try {
//     const supabase = await createClient();

//     // Get authenticated user
//     const {
//       data: { user },
//       error: authError,
//     } = await supabase.auth.getUser();

//     if (authError || !user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Parse request body
//     const body = await request.json();

//     // Allowed fields to update
//     const allowedFields = [
//       "name",
//       "phone",
//       "bio",
//       "title",
//       "profile_image_url",
//     ];
//     // const updateData: Record<string, any> = {}
//     type ProfileUpdate = Partial<{
//       name: string;
//       phone: string;
//       bio: string;
//       title: string;
//       profile_image_url: string;
//       updated_at: string;
//     }>;
//     const updateData: ProfileUpdate = {};

//     // Filter out non-allowed fields
//     for (const field of allowedFields) {
//       if (field in body) {
//         updateData[field] = body[field];
//       }
//     }

//     // Ensure at least one field is being updated
//     if (Object.keys(updateData).length === 0) {
//       return NextResponse.json(
//         { error: "No valid fields to update" },
//         { status: 400 }
//       );
//     }

//     // Add updated_at timestamp
//     updateData.updated_at = new Date().toISOString();

//     // Update profile
//     const { data: updatedProfile, error: updateError } = await supabase
//       .from("users")
//       .update(updateData)
//       .eq("id", user.id)
//       .select()
//       .single();

//     if (updateError) {
//       console.error("Error updating profile:", updateError);
//       return NextResponse.json(
//         { error: "Failed to update profile" },
//         { status: 500 }
//       );
//     }

//     return NextResponse.json({ profile: updatedProfile });
//   } catch (error) {
//     console.error("Unexpected error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1) Define the only keys we accept, and derive their union type
    const allowedKeys = [
      "name",
      "phone",
      "bio",
      "title",
      "profile_image_url",
    ] as const;
    type AllowedKey = typeof allowedKeys[number];

    // 2) Define the shape of an update payload (only those keys + updated_at)
    type ProfileUpdate = Partial<
      Record<AllowedKey, string> & { updated_at: string }
    >;

    // 3) Parse body and constrain to allowed keys
    const raw = (await request.json()) as Record<string, unknown>;
    const body = raw as Partial<Record<AllowedKey, unknown>>;

    // 4) Build updateData with proper key typing
    const updateData: ProfileUpdate = {};
    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        // You can add runtime validation here if you want (e.g., typeof body[key] === 'string')
        updateData[key] = body[key] as string;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    updateData.updated_at = new Date().toISOString();

    const { data: updatedProfile, error: updateError } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating profile:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
