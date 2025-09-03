import "dotenv/config";
import { db } from "../src/db";
import { diseases } from "../src/db/schema";
import { mockDiseases } from "../src/lib/ml-prediction-service";

async function seedDiseases() {
  console.log("🌱 Seeding diseases...");

  try {
    // Insert mock diseases into the database
    const diseaseInserts = mockDiseases.map((disease) => ({
      name: disease.name,
      description: disease.description,
      icdCode: disease.icdCode,
      severityLevel: disease.severityLevel as
        | "mild"
        | "moderate"
        | "severe"
        | "critical",
      treatmentInfo: disease.treatmentInfo,
      preventionInfo: disease.preventionInfo,
    }));

    await db.insert(diseases).values(diseaseInserts);

    console.log(`✅ Successfully seeded ${diseaseInserts.length} diseases`);
  } catch (error) {
    console.error("❌ Error seeding diseases:", error);
    throw error;
  }
}

// Run the seed function
seedDiseases()
  .then(() => {
    console.log("🎉 Database seeding completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Database seeding failed:", error);
    process.exit(1);
  });
