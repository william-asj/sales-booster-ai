import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { Product } from '@/lib/data';

export async function GET() {
  try {
    // TODO: Define the actual SQL query and table name
    const sql = `SELECT * FROM PRODUCTS_TABLE`; 
    
    // Execute the query using the DB utility
    const products = await executeQuery<Product>(sql);
    
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('API Error (Products):', error);
    return NextResponse.json({ message: 'Error retrieving products data' }, { status: 500 });
  }
}
