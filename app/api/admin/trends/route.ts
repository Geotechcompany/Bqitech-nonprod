import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data - replace with real data source
  const trends = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [65, 59, 80, 81, 56, 55]
  };

  return NextResponse.json(trends);
} 