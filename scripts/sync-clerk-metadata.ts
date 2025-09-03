#!/usr/bin/env tsx

/**
 * Script to sync Clerk metadata with database for existing users
 * Run this script to fix users who don't have proper metadata set
 */

import { db } from "../src/db";
import { users } from "../src/db/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

async function syncMetadata() {
  console.log("🔄 Starting metadata sync...");

  try {
    // Get all users from database
    const allUsers = await db
      .select({
        id: users.id,
        clerkId: users.clerkId,
        email: users.email,
        role: users.role,
        onboardingComplete: users.onboardingComplete,
      })
      .from(users);

    console.log(`📊 Found ${allUsers.length} users in database`);

    const clerk = await clerkClient();
    let syncedCount = 0;
    let errorCount = 0;

    for (const user of allUsers) {
      try {
        // Update Clerk metadata to match database
        await clerk.users.updateUser(user.clerkId, {
          publicMetadata: {
            onboardingComplete: user.onboardingComplete,
            role: user.role,
          },
        });

        console.log(
          `✅ Synced metadata for user: ${user.email} (${user.role})`
        );
        syncedCount++;
      } catch (error) {
        console.error(
          `❌ Failed to sync metadata for user ${user.email}:`,
          error
        );
        errorCount++;
      }
    }

    console.log(`\n📈 Sync Summary:`);
    console.log(`   ✅ Successfully synced: ${syncedCount} users`);
    console.log(`   ❌ Failed to sync: ${errorCount} users`);
    console.log(`   📊 Total users: ${allUsers.length}`);
  } catch (error) {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }
}

// Run the sync
syncMetadata()
  .then(() => {
    console.log("🎉 Metadata sync completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script crashed:", error);
    process.exit(1);
  });
