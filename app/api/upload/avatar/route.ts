import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import { Dropbox } from 'dropbox';
import { getDropboxAccessToken } from "@/lib/dropbox";
import { Readable } from 'stream';
import fetch from 'node-fetch';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const accessToken = await getDropboxAccessToken();
    
    const dbx = new Dropbox({
      accessToken,
      fetch: fetch
    });

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const filename = `avatar-${uniqueSuffix}.${file.name.split('.').pop()}`;
    const path = `/avatars/${filename}`;

    // Upload to Dropbox
    const uploadResponse = await dbx.filesUpload({
      path,
      contents: await file.arrayBuffer(),
      mode: { '.tag': 'overwrite' }
    });

    // Get shared link
    const sharedLink = await dbx.sharingCreateSharedLinkWithSettings({
      path: uploadResponse.result.path_display!
    });

    // Convert to direct download link
    const directLink = sharedLink.result.url
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('?dl=0', '');

    return NextResponse.json({ url: directLink });
  } catch (error) {
    console.error("Avatar upload failed:", error);
    return new NextResponse("Upload failed", { status: 500 });
  }
} 