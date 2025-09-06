import "dotenv/config";
import { seedDiseases } from "./seed-comprehensive-diseases";

// Re-export the comprehensive seeding function
export { seedDiseases };

// Run the seeding function if this file is executed directly
if (require.main === module) {
  seedDiseases()
    .then(() => {
      console.log("✅ Seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}
