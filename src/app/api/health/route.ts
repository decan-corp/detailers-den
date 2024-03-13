import { resetPasswordTokensTable } from 'src/schema';
import { db } from 'src/utils/db';

export async function GET() {
  const results = await db.select().from(resetPasswordTokensTable).limit(1);
  return Response.json({ message: 'DB OK!', sampleResults: results.length });
}
