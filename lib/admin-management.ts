import { User } from "@/models/user";
import connectToDatabase from "@/lib/mongodb";

export async function addAdmin(userId: string) {
  try {
    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: "ADMIN" },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    console.error("Failed to add admin:", error);
    throw error;
  }
}

export async function removeAdmin(userId: string) {
  try {
    await connectToDatabase();
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role: "USER" },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    console.error("Failed to remove admin:", error);
    throw error;
  }
} 