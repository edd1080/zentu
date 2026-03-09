import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

interface RegisterBody {
  email: string;
  password: string;
  fullName: string;
  phonePersonal?: string;
}

/**
 * POST /auth/register
 * Creates a Supabase Auth user, then atomically creates
 * Owner + Business + Agent + OnboardingProgress via RPC.
 * If the RPC fails, the auth user is deleted (rollback).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;

    // --- Validate input ---
    if (!body.email || !body.password || !body.fullName) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 },
      );
    }

    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // --- Step 1: Create auth user ---
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email: body.email,
        password: body.password,
        options: {
          data: {
            full_name: body.fullName,
          },
        },
      });

    if (signUpError) {
      const message =
        signUpError.message === "User already registered"
          ? "Ya existe una cuenta con este correo"
          : "Error al crear la cuenta";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (!signUpData.user) {
      return NextResponse.json(
        { error: "Error inesperado al crear usuario" },
        { status: 500 },
      );
    }

    const userId = signUpData.user.id;

    // --- Step 2: Create Owner+Business+Agent+Onboarding atomically ---
    const { error: rpcError } = await supabase.rpc(
      "create_owner_with_business",
      {
        p_auth_id: userId,
        p_email: body.email,
        p_full_name: body.fullName,
        p_phone_personal: body.phonePersonal ?? undefined,
      },
    );

    if (rpcError) {
      console.error("RPC create_owner_with_business failed:", rpcError.message);

      // Rollback: delete the auth user using admin client
      try {
        const adminClient = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
        );
        await adminClient.auth.admin.deleteUser(userId);
      } catch (deleteError) {
        console.error("Failed to rollback auth user:", deleteError);
      }

      return NextResponse.json(
        { error: "Error al configurar la cuenta. Intenta de nuevo." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, userId });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
