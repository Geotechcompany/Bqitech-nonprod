import { currentUser } from "@clerk/nextjs/server";

export async function isAdmin() {
  const user = await currentUser();
  return user?.publicMetadata?.isAdmin === true;
} 