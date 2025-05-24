import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function exportData() {
  const data = {
    users: await prisma.user.findMany(),
    applications: await prisma.application.findMany(),
    jobPostings: await prisma.jobPosting.findMany(),
    
    notifications: await prisma.notification.findMany(),
    userSettings: await prisma.userSettings.findMany(),
    notificationPreferences: await prisma.notificationPreference.findMany(),
  }

  // Write to a JSON file
  const fs = require('fs')
  fs.writeFileSync(
    `data_backup_${new Date().toISOString().split('T')[0]}.json`,
    JSON.stringify(data, null, 2)
  )
}

exportData()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 