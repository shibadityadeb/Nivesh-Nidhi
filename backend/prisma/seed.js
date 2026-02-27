const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding realistic Indian Chit Funds...');

    // 1. Create realistic organizers
    const organizersData = [
        {
            name: "Rahul Sharma",
            email: "rahul.sharma@shriramchits.example.com",
            phone: "9876543210",
            orgName: "Shriram Chits",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400001",
            licenseNumber: "MH-CHIT-123",
            gstNumber: "27AAAAA1234A1Z5",
            groups: [
                {
                    name: "Shriram Platinum Chit - 5L",
                    chit_value: 500000,
                    duration_months: 50,
                    member_capacity: 50,
                    chit_city: "Mumbai",
                    chit_state: "Maharashtra",
                    min_amount: 10000,
                    max_amount: 10000
                },
                {
                    name: "Shriram Golden Chit - 1L",
                    chit_value: 100000,
                    duration_months: 20,
                    member_capacity: 20,
                    chit_city: "Pune",
                    chit_state: "Maharashtra",
                    min_amount: 5000,
                    max_amount: 5000
                }
            ]
        },
        {
            name: "Ramakrishna Rao",
            email: "rk.rao@margadarsichits.example.com",
            phone: "9123456780",
            orgName: "Margadarsi Chit Funds",
            city: "Hyderabad",
            state: "Telangana",
            pincode: "500001",
            licenseNumber: "TG-CHIT-987",
            gstNumber: "36BBBBB1234B1Z6",
            groups: [
                {
                    name: "Margadarsi Mega Chit - 10L",
                    chit_value: 1000000,
                    duration_months: 40,
                    member_capacity: 40,
                    chit_city: "Hyderabad",
                    chit_state: "Telangana",
                    min_amount: 25000,
                    max_amount: 25000
                }
            ]
        },
        {
            name: "Anand Kumar",
            email: "anand.k@kapilchits.example.com",
            phone: "9001122334",
            orgName: "Kapil Chits",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560001",
            licenseNumber: "KA-CHIT-456",
            gstNumber: "29CCCCC1234C1Z7",
            groups: [
                {
                    name: "Kapil Daily Saver - 50K",
                    chit_value: 50000,
                    duration_months: 25,
                    member_capacity: 25,
                    chit_city: "Bengaluru",
                    chit_state: "Karnataka",
                    min_amount: 2000,
                    max_amount: 2000
                },
                {
                    name: "Kapil Business Elite - 20L",
                    chit_value: 2000000,
                    duration_months: 50,
                    member_capacity: 50,
                    chit_city: "Mysuru",
                    chit_state: "Karnataka",
                    min_amount: 40000,
                    max_amount: 40000
                }
            ]
        }
    ];

    const passwordHash = await bcrypt.hash('password123', 10);

    for (const orgData of organizersData) {
        // 1. Create User
        let user = await prisma.user.findUnique({ where: { email: orgData.email } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: orgData.name,
                    email: orgData.email,
                    phone: orgData.phone,
                    password: passwordHash,
                    role: 'ORGANIZER',
                    isKycVerified: true,
                    aadhaarNumber: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
                    reputation_score: Math.floor(85 + Math.random() * 15) // 85-100 score
                }
            });
            console.log(`Created user: ${user.name}`);
        }

        // 2. Create Organizer Profile
        let profile = await prisma.organizerProfile.findUnique({ where: { user_id: user.id } });
        if (!profile) {
            profile = await prisma.organizerProfile.create({
                data: {
                    user_id: user.id,
                    experience_years: Math.floor(5 + Math.random() * 15),
                    approval_status: 'APPROVED',
                    escrow_enabled: true,
                    security_deposit_status: 'PAID'
                }
            });
            console.log(`Created OrganizerProfile for: ${user.name}`);
        }

        // 3. Create Organization
        let organization = await prisma.organization.findFirst({ where: { organizer_profile_id: profile.id, name: orgData.orgName } });
        if (!organization) {
            organization = await prisma.organization.create({
                data: {
                    organizer_profile_id: profile.id,
                    name: orgData.orgName,
                    license_number: orgData.licenseNumber,
                    gst_number: orgData.gstNumber,
                    city: orgData.city,
                    state: orgData.state,
                    pincode: orgData.pincode,
                    is_verified: true,
                    trust_tier: 'TIER_1',
                    reputation_score: Math.floor(90 + Math.random() * 10),
                    total_groups_managed: orgData.groups.length
                }
            });
            console.log(`Created Organization: ${organization.name}`);
        }

        // 4. Create Chit Groups
        for (const grp of orgData.groups) {
            let chitGroup = await prisma.chitGroup.findFirst({ where: { organization_id: organization.id, name: grp.name } });
            if (!chitGroup) {
                chitGroup = await prisma.chitGroup.create({
                    data: {
                        organization_id: organization.id,
                        name: grp.name,
                        state: grp.chit_state,
                        city: grp.chit_city,
                        chit_value: grp.chit_value,
                        duration_months: grp.duration_months,
                        member_capacity: grp.member_capacity,
                        current_members: Math.floor(Math.random() * (grp.member_capacity / 2)), // some random members
                        status: 'OPEN',
                        min_amount: grp.min_amount,
                        max_amount: grp.max_amount,
                        default_rate: 0,
                        calculation_type: 'simple',
                        allowed_time_period_min: 1,
                        allowed_time_period_max: grp.duration_months
                    }
                });

                // Add basic rules
                await prisma.chitGroupRule.create({
                    data: {
                        chit_group_id: chitGroup.id,
                        monthly_amount: grp.min_amount,
                        duration_months: grp.duration_months,
                        commission_pct: 5.0,
                        min_bid_pct: 5.0,
                        max_bid_pct: 40.0
                    }
                });

                console.log(`Created Chit Group: ${chitGroup.name}`);
            }
        }
    }

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
