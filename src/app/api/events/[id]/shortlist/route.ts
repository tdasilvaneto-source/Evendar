import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json()) as { shortlist: boolean };
  const event = await prisma.event.update({ where: { id: params.id }, data: { shortlist: body.shortlist } });
  return NextResponse.json(event);
}
