import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { Lead } from '@/lib/data';

export async function GET() {
  try {
    // TODO: Define the actual SQL query and table name
    const sql = `SELECT * FROM LEADS_TABLE`; 
    
    // Execute the query using the DB utility
    const leads = await executeQuery<Lead>(sql);
    
    return NextResponse.json(leads, { status: 200 });
  } catch (error) {
    console.error('API Error (Leads):', error);
    return NextResponse.json({ message: 'Error retrieving leads data' }, { status: 500 });
  }
}
