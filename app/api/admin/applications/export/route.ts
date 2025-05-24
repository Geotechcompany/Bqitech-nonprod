import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Application } from "@/models/application";
import { auth } from "@clerk/nextjs/server";
import { utils, write } from "xlsx";

export async function GET(request: NextRequest) {
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const applications = await Application.find().lean();
    const flattened = applications.map(app => {
      if (app.answers) {
        return {
          ...app,
          ...Object.fromEntries(app.answers.map(a => [a.questionText, a.answer]))
        };
      }
      return app;
    });

    let response: NextResponse;
    switch(format) {
      case 'csv':
        const csv = convertToCSV(flattened);
        response = new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="applications.csv"'
          }
        });
        break;

      case 'xlsx':
        const worksheet = utils.json_to_sheet(flattened);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Applications");
        const buffer = write(workbook, { type: 'buffer', bookType: 'xlsx' });
        response = new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="applications.xlsx"'
          }
        });
        break;

      default:
        response = new NextResponse(JSON.stringify(flattened), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="applications.json"'
          }
        });
    }

    return response;

  } catch (error) {
    console.error("Export failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function convertToCSV(data: any[]) {
  const header = Object.keys(data[0]).join(',');
  const rows = data.map(obj => 
    Object.values(obj).map(v => 
      typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
    ).join(',')
  );
  return [header, ...rows].join('\n');
} 