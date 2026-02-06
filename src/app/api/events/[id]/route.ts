import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(event);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const event = await prisma.event.update({
    where: { id: params.id },
    data: {
      event: body.event,
      location: body.location,
      website: body.website,
      contact: body.contact ?? "",
      phone: body.phone ?? "",
      email: body.email ?? "",
      expectedPeopleKnown: body.expectedPeople === "unknown" ? false : true,
      expectedPeople: body.expectedPeople === "unknown" || body.expectedPeople === "" ? null : Number(body.expectedPeople)
    }
  });

  return NextResponse.json(event);
}
