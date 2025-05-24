import { clerkClient } from "@clerk/clerk-sdk-node";

export async function addAdmin(userId: string) {
  try {
    const updatedUser = await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        isAdmin: true
      }
    });
    return updatedUser;
  } catch (error) {
    console.error("Failed to add admin:", error);
    throw error;
  }
}

export async function removeAdmin(userId: string) {
  try {
    const updatedUser = await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        isAdmin: false
      }
    });
    return updatedUser;
  } catch (error) {
    console.error("Failed to remove admin:", error);
    throw error;
  }
} 