import { NextRequest, NextResponse } from "next/server";
import { createLinkToken, exchangePublicToken } from "@/lib/plaid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { publicToken } = await req.json();

  try {
    const response = await exchangePublicToken(publicToken);
    // Save access token to database (implementation depends on your DB)
    return NextResponse.json({ accessToken: response.access_token });
  } catch (error) {
    console.error("Error exchanging public token:", error);
    return NextResponse.json(
      { error: "Failed to exchange token" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const linkToken = await createLinkToken(session.user.id);
    return NextResponse.json({ linkToken });
  } catch (error) {
    console.error("Error creating link token:", error);
    return NextResponse.json(
      { error: "Failed to create link token" },
      { status: 500 }
    );
  }
}
