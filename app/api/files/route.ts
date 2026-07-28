import {
  deleteFile,
  getFilesListHeldByUserId,
  logFile,
} from "@/lib/data/database/repositories/UploadedFileRepository";
import { NextRequest, NextResponse } from "next/server";
import analyseFile from "@/lib/business/analyse-data/AnalyseFile";
import { withAuth } from "@/lib/auth/withAuth";

// get request which gets files from DB
export const GET = withAuth(async (req, session) => {
  const files = await getFilesListHeldByUserId(session.user.githubId);

  return NextResponse.json({ files: files });
});

// delete request
export const DELETE = withAuth(async (req: NextRequest, session) => {
  const { searchParams } = new URL(req.url);
  const uri = searchParams.get("uri");

  if (!uri) {
    return NextResponse.json({ error: "URI not detected" }, { status: 400 });
  }

  const deleteResult = await deleteFile(uri, session.user.githubId);

  // if belongs to user delete from S3, and delete reference in DB
  return NextResponse.json({ success: deleteResult.deletedCount > 0 });
});

// log request
export const POST = withAuth(async (req: NextRequest, session) => {
  const body = await req.json();

  if (!body.uri || typeof body.uri != "string") {
    return NextResponse.json({ error: "URI not detected or of wrong format" }, { status: 400 });
  }

  try {
    const uploadResult = await logFile(
      body.uri,
      session.user.githubId,
      body.fileName
    );

    await analyseFile(body.uri);

    return NextResponse.json(uploadResult, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
});
