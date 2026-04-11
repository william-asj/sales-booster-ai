import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { LifeEvent } from '@/lib/data';

export async function GET() {
  try {
    // TODO: Define the actual SQL query and table name
    const sql = `SELECT * FROM EVENTS_TABLE`; 
    
    // Execute the query using the DB utility
    const events = await executeQuery<LifeEvent>(sql);
    
    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error('API Error (Events):', error);
    return NextResponse.json({ message: 'Error retrieving events data' }, { status: 500 });
  }
}
