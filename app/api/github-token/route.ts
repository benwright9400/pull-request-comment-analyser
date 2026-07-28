import {
  deleteFile,
  getFilesListHeldByUserId,
  logFile,
} from "@/lib/data/database/repositories/UploadedFileRepository";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import analyseFile from "@/lib/business/analyse-data/AnalyseFile";
import { authOptions } from "@/auth";

// get request which gets files from DB
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user.googleSub || typeof session.user.googleSub != "string") {
    return NextResponse.json({ error: "Unauthorised" });
  }

  console.log(session.user);

  const files = await getFilesListHeldByUserId(session.user.googleSub);

  return NextResponse.json({ files: files });
}

// delete request
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uri = searchParams.get("uri");

  if (!uri) {
    return NextResponse.json({ error: "URI not detected" });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user.googleSub || typeof session.user.googleSub != "string") {
    return NextResponse.json({ error: "Unauthorised" });
  }

  const deleteResult = await deleteFile(uri, session.user.googleSub);

  // if belongs to user delete from S3, and delete reference in DB
  return NextResponse.json({ success: deleteResult.deletedCount > 0 });
}

// log request
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.uri || typeof body.uri != "string") {
    return NextResponse.json({ error: "URI not detected or of wrong format" });
  }

  const session = await getServerSession(authOptions);
  console.log(session?.user);
  console.log(session);
  if (!session?.user.googleSub || typeof session.user.googleSub != "string") {
    return NextResponse.json({ error: "Unauthorised" });
  }

  console.log(body);

  console.log("saving:", body.uri, session.user.googleSub, body.fileName);

  try {
    console.log("saving:", body.uri, session.user.googleSub, body.fileName);

    const uploadResult = await logFile(
      body.uri,
      session.user.googleSub,
      body.fileName
    );

    console.log(body.uri);

    await analyseFile(body.uri);

    return NextResponse.json(uploadResult, { status: 201 });
  } catch (error: any) {
    console.log("saving:", body.uri, session.user.googleSub, body.fileName);

    console.log(error);
    console.log(error.errors);

    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
