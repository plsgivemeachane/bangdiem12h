const { PrismaClient } = require('../src/generated/prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminEmail = 'admin@group-scoring.com'
  const adminPassword = 'AdminPass123!' // Change this after first login
  
  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'System Administrator',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Admin user created:')
  console.log(`   Email: ${adminEmail}`)
  console.log(`   Password: ${adminPassword}`)
  console.log(`   Role: ${adminUser.role}`)
  console.log('')
  console.log('⚠️  IMPORTANT: Change the password after first login!')

  // Create a sample group for testing
  const sampleGroup = await prisma.group.create({
    data: {
      name: 'Sample Group',
      description: 'A sample group for testing the scoring system',
      createdById: adminUser.id,
    },
  })

  console.log('✅ Sample group created:', sampleGroup.name)

  // Create admin membership in the sample group
  await prisma.groupMember.create({
    data: {
      userId: adminUser.id,
      groupId: sampleGroup.id,
      role: 'OWNER',
    },
  })

  console.log('✅ Admin added to sample group as Owner')

  console.log('\n🎉 Database seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })