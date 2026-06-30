import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    const conn = await connectDB();
    const db = conn.connection.db;

    const dbName = db?.databaseName;
    const collections = await db?.listCollections().toArray();
    const users = await db?.collection("users").find({}).limit(5).toArray();

    return NextResponse.json({
      status: "connected",
      connectedToDatabase: dbName,
      collectionsFound: collections?.map((c) => c.name),
      usersInCollection: users?.length ?? 0,
      sampleData: users,
    });
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: (error as Error).message },
      { status: 500 }
    );
  }
}