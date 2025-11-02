const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function wipeDatabase() {
  console.log('🧹 Starting Database Wipe...')
  
  try {
    // Check if we really want to do this
    const args = process.argv.slice(2)
    if (!args.includes('--confirm')) {
      console.log('❌ This will delete ALL data from the database!')
      console.log('Use --confirm flag to proceed: node prisma/database-wipe.js --confirm')
      process.exit(1)
    }

    console.log('⚠️  WARNING: This will delete ALL users, groups, and data!')
    console.log('Continuing in 3 seconds...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Delete in correct order due to foreign key constraints
    console.log('🗑️  Deleting ScoreRecords...')
    await prisma.scoreRecord.deleteMany()
    
    console.log('🗑️  Deleting ScoringRules...')
    await prisma.scoringRule.deleteMany()
    
    console.log('🗑️  Deleting GroupMembers...')
    await prisma.groupMember.deleteMany()
    
    console.log('🗑️  Deleting Groups...')
    await prisma.group.deleteMany()
    
    console.log('🗑️  Deleting ActivityLogs...')
    await prisma.activityLog.deleteMany()
    
    console.log('🗑️  Deleting Sessions...')
    await prisma.session.deleteMany()
    
    console.log('🗑️  Deleting Accounts...')
    await prisma.account.deleteMany()
    
    console.log('🗑️  Deleting Users...')
    await prisma.user.deleteMany()
    
    console.log('🗑️  Deleting VerificationTokens...')
    await prisma.verificationToken.deleteMany()

    console.log('✅ Database wiped successfully!')
    console.log('💡 You can now run: npm run seed:admin')

  } catch (error) {
    console.error('❌ Database wipe failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

wipeDatabase()