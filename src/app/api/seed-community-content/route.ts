import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { COMMUNITY_SEED_POSTS } from "@/lib/community-seed-data";
import { getSupabaseConfig } from "@/lib/supabase-config";

const SEED_SECRET = "nexhire-seed-2026";

export async function GET(request: Request) {
  const seedSecret = request.headers.get("x-seed-secret");
  if (seedSecret !== SEED_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { supabaseUrl, supabaseKey } = getSupabaseConfig();

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: existingPosts, error: postsError } = await supabase
      .from("posts")
      .select("id")
      .limit(1);

    if (postsError) {
      throw postsError;
    }

    if (existingPosts && existingPosts.length > 0) {
      return NextResponse.json({
        message: "Community posts already exist",
        seeded: false,
        insertedPosts: 0,
        insertedComments: 0,
        note: "Existing live content was left untouched.",
      });
    }

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, headline, current_role, role, avatar_url, location")
      .order("created_at", { ascending: true })
      .limit(8);

    if (profileError) {
      throw profileError;
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({
        message: "No profiles available to seed community content",
        seeded: false,
        insertedPosts: 0,
        insertedComments: 0,
      });
    }

    const { data: seededPosts, error: seedError } = await supabase.rpc("seed_community_from_payload", {
      post_payloads: COMMUNITY_SEED_POSTS,
    });

    if (seedError) {
      throw seedError;
    }

    return NextResponse.json({
      message: "Community content seeded",
      seeded: true,
      insertedPosts: seededPosts?.length || COMMUNITY_SEED_POSTS.length,
      insertedComments: seededPosts?.reduce((sum: number, row: any) => sum + (row.comments_inserted || 0), 0) || 0,
      posts: seededPosts ?? [],
      note: "Refresh the community page to see live database content.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to seed community content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}