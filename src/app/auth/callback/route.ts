import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth callback handler.
 * Handles OAuth redirects and email confirmations.
 * After exchanging the code for a session, creates the
 * Owner+Business+Agent+OnboardingProgress atomically if
 * the owner doesn't exist yet (first-time OAuth login).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();

  const { data: sessionData, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError || !sessionData.user) {
    console.error("Auth callback exchange error:", exchangeError?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const user = sessionData.user;

  // Check if Owner record already exists (returning user)
  const { data: ownerExists } = await supabase.rpc("check_owner_exists", {
    p_auth_id: user.id,
  });

  if (!ownerExists) {
    // First-time login — create atomic structure
    const fullName =
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "Usuario";

    const { error: rpcError } = await supabase.rpc(
      "create_owner_with_business",
      {
        p_auth_id: user.id,
        p_email: user.email ?? "",
        p_full_name: fullName,
      },
    );

    if (rpcError) {
      console.error("RPC create_owner_with_business failed:", rpcError.message);
      // Rollback: delete the auth user to avoid orphan
      // This requires admin client — for now log the error
      // The user can retry registration
      return NextResponse.redirect(`${origin}/login?error=setup_failed`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
