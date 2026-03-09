import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: "Valid URL required" }, { status: 400 });
        }

        // Basic server-side fetch to scrape HTML text
        // This satisfies DoD #5 with a non-blocking error if it fails
        // In a prod environment, we would use Apify or a real headless browser.
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; AgentiBot/1.0)",
                "Accept": "text/html,application/xhtml+xml"
            },
            // Short timeout to avoid blocking the user
            signal: AbortSignal.timeout(5000)
        });

        if (!res.ok) {
            throw new Error(`Scraping failed with status: ${res.status}`);
        }

        const html = await res.text();

        // Very rudimentary text extraction, stripping out script/style and picking text
        // We send this crude text to Gemini to summarize properly later, or directly store it.
        const cleanScript = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ");
        const cleanStyle = cleanScript.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
        const textOnly = cleanStyle.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

        // Limit to reasonable size (e.g., first 5000 chars) to prevent massive blobs
        const truncatedText = textOnly.slice(0, 5000);

        return NextResponse.json({ text: truncatedText });
    } catch (err) {
        console.error("POST /api/onboarding/link scraping error:", err);
        // Return a structured error to the client so UI can handle it gracefully (DoD #5)
        return NextResponse.json({ error: "Failed to scrape link" }, { status: 422 });
    }
}
