import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'

const prisma = new PrismaClient()

async function restoreData() {
  try {
    // Read the backup file
    const backupData = JSON.parse(
      fs.readFileSync('./data_backup_2025-03-19.json', 'utf-8')
    )

    // Clear existing data (optional - uncomment if needed)
    // await prisma.notificationPreference.deleteMany({})
    // await prisma.userSettings.deleteMany({})
    // await prisma.notification.deleteMany({})
    // await prisma.application.deleteMany({})
    // await prisma.user.deleteMany({})
    // await prisma.jobPosting.deleteMany({})

    console.log('Starting data restore...')

    // Restore Users first (they're referenced by other tables)
    console.log('Restoring users...')
    for (const user of backupData.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      })
    }

    // Restore Applications
    console.log('Restoring applications...')
    for (const application of backupData.applications) {
      await prisma.application.upsert({
        where: { id: application.id },
        update: application,
        create: application,
      })
    }

    // Restore Job Postings
    console.log('Restoring job postings...')
    for (const jobPosting of backupData.jobPostings) {
      await prisma.jobPosting.upsert({
        where: { id: jobPosting.id },
        update: jobPosting,
        create: jobPosting,
      })
    }

    // Restore Notifications
    console.log('Restoring notifications...')
    for (const notification of backupData.notifications) {
      await prisma.notification.upsert({
        where: { id: notification.id },
        update: notification,
        create: notification,
      })
    }

    // Restore User Settings
    console.log('Restoring user settings...')
    for (const settings of backupData.userSettings) {
      await prisma.userSettings.upsert({
        where: { id: settings.id },
        update: settings,
        create: settings,
      })
    }

    // Restore Notification Preferences
    console.log('Restoring notification preferences...')
    for (const pref of backupData.notificationPreferences) {
      await prisma.notificationPreference.upsert({
        where: { id: pref.id },
        update: pref,
        create: pref,
      })
    }

    console.log('Data restore completed successfully!')
  } catch (error) {
    console.error('Error restoring data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

restoreData() 