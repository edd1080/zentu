import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * In-memory rate limiter for phone verification attempts.
 * Tracks failed attempts per user. After 3 failures,
 * blocks for 15 minutes.
 *
 * MVP-only: in production, move to Redis or Supabase cache.
 */
const attempts = new Map<
  string,
  { count: number; blockedUntil: number | null }
>();

const MAX_ATTEMPTS = 3;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function isBlocked(userId: string): boolean {
  const record = attempts.get(userId);
  if (!record?.blockedUntil) return false;
  if (Date.now() < record.blockedUntil) return true;
  // Block expired — reset
  attempts.delete(userId);
  return false;
}

function recordFailure(userId: string): boolean {
  const record = attempts.get(userId) ?? { count: 0, blockedUntil: null };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = Date.now() + BLOCK_DURATION_MS;
    attempts.set(userId, record);
    return true; // now blocked
  }
  attempts.set(userId, record);
  return false;
}

function clearAttempts(userId: string): void {
  attempts.delete(userId);
}

/**
 * POST /auth/verify-phone
 * Validates a 6-digit code sent to the owner's personal WhatsApp.
 *
 * NOTE: Actual code sending via WhatsApp is deferred to Fase 5
 * (requires AGENTI's Meta platform number). This endpoint
 * validates the structure and rate-limits, but the real
 * verification flow will be completed when WhatsApp is configured.
 *
 * For now, it accepts code "000000" in development mode.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 },
      );
    }

    // Check if blocked
    if (isBlocked(user.id)) {
      return NextResponse.json(
        {
          error:
            "Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.",
          blocked: true,
        },
        { status: 429 },
      );
    }

    const body = (await request.json()) as { code: string };

    if (!body.code || body.code.length !== 6) {
      return NextResponse.json(
        { error: "Código inválido. Debe ser de 6 dígitos." },
        { status: 400 },
      );
    }

    // TODO (Fase 5): Validate against real code sent via WhatsApp
    // For development, accept "000000" as valid code
    const isDev = process.env.NODE_ENV === "development";
    const isValidCode = isDev && body.code === "000000";

    if (!isValidCode) {
      const nowBlocked = recordFailure(user.id);
      const remaining = MAX_ATTEMPTS - (attempts.get(user.id)?.count ?? 0);

      return NextResponse.json(
        {
          error: nowBlocked
            ? "Demasiados intentos fallidos. Intenta de nuevo en 15 minutos."
            : `Código incorrecto. ${remaining > 0 ? `Te quedan ${remaining} intentos.` : ""}`,
          blocked: nowBlocked,
          remainingAttempts: Math.max(0, remaining),
        },
        { status: nowBlocked ? 429 : 400 },
      );
    }

    // Code is valid — mark phone as verified
    clearAttempts(user.id);

    const { error: rpcError } = await supabase.rpc("verify_owner_phone");

    if (rpcError) {
      console.error("verify_owner_phone failed:", rpcError.message);
      return NextResponse.json(
        { error: "Error al verificar el número" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, verified: true });
  } catch {
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}
