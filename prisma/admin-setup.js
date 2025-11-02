const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting Admin Setup...')

  try {
    // Get admin credentials from command line args or environment
    const args = process.argv.slice(2)
    const force = args.includes('--force')
    
    let adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
    let adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!'
    let adminName = process.env.ADMIN_NAME || 'System Administrator'

    // Allow overrides from command line
    if (args.length >= 2) {
      adminEmail = args[0]
      adminPassword = args[1]
    }
    if (args.length >= 3) {
      adminName = args[2]
    }

    console.log(`📧 Using admin email: ${adminEmail}`)
    console.log(`👤 Using admin name: ${adminName}`)

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin && !force) {
      console.log(`❌ Admin user with email ${adminEmail} already exists. Use --force to recreate.`)
      return
    }

    // Delete existing admin if force flag is set
    if (existingAdmin && force) {
      console.log('🗑️  Deleting existing admin user...')
      await prisma.user.delete({
        where: { id: existingAdmin.id }
      })
    }

    // Hash the admin password
    console.log('🔐 Hashing admin password...')
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create admin user
    console.log('👑 Creating admin user...')
    const adminUser = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(), // Mark as verified for admin
      }
    })

    // Log the admin creation
    await prisma.activityLog.create({
      data: {
        userId: adminUser.id,
        action: 'ADMIN_USER_CREATED',
        description: `Admin user created: ${adminEmail}`,
        metadata: {
          email: adminEmail,
          name: adminName,
          createdBy: 'system'
        }
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log(`   ID: ${adminUser.id}`)
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Name: ${adminUser.name}`)
    console.log(`   Role: ${adminUser.role}`)

    console.log('\n🔑 Admin Credentials:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log('\n⚠️  Please change the admin password after first login!')

  } catch (error) {
    console.error('❌ Admin setup failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()