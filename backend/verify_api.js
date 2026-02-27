const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/api';

async function runTests() {
    console.log('--- Starting API Verification ---');
    let userToken;
    let adminToken;
    let applicationId;
    let organizationId;
    const timestamp = Date.now();
    const userEmail = `user_${timestamp}@example.com`;
    const adminEmail = `admin_${timestamp}@example.com`;

    try {
        // 1. Signup a normal User
        console.log(`1. Signing up normal user ${userEmail}...`);
        await axios.post(`${API_URL}/auth/signup`, {
            name: 'Test Organizer User',
            email: userEmail,
            phone: '9876543210',
            password: 'SecurePass123'
        });

        // Login Normal User
        const userLogin = await axios.post(`${API_URL}/auth/login`, {
            email: userEmail,
            password: 'SecurePass123'
        });
        userToken = userLogin.data.data.token;
        console.log('✔ User registered and logged in.');

        // 2. Submit Organizer Application
        console.log('2. Applying for Organizer (MIGRATING)...');
        const applicationRes = await axios.post(`${API_URL}/organizers/apply`, {
            type: 'MIGRATING',
            company_name: `Superb Chit Funds ${timestamp}`,
            city: 'Pune',
            state: 'Maharashtra',
            years_of_operation: 5,
            chit_license_number: `CHIT-${timestamp}`,
            proposed_chit_size: 5000000,
            past_3_yr_turnover: 15000000,
            personalInfo: {
                dateOfBirth: '1990-01-01',
                age: 35
            },
            professionalInfo: {
                occupation: 'Business Owner',
                companyOrBusinessName: 'Superb Chit Funds',
                yearsOfExperience: 5
            },
            incomeInfo: {
                monthlyIncomeRange: '> ₹1L',
                primaryIncomeSource: 'Business Revenue'
            },
            purposeInfo: {
                reasonForOpeningFund: 'We have been operating successfully as a traditional chit fund business for 5 years and now wish to strictly transition into the verified digital platform space for modernization.',
                expectedMembersCount: 50,
                targetMonthlyContribution: 10000
            }
        }, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        applicationId = applicationRes.data.data.application_id;
        console.log(`✔ Application submitted. ID: ${applicationId}`);

        // 3. Create Admin User
        console.log('3. Setting up Admin User...');
        await axios.post(`${API_URL}/auth/signup`, {
            name: 'System Admin',
            email: adminEmail,
            phone: '9999999999',
            password: 'AdminSuperPass1'
        });
        // Manually promote to ADMIN via Prisma directly
        await prisma.user.update({
            where: { email: adminEmail },
            data: { role: 'ADMIN' }
        });

        // Login Admin
        const adminLogin = await axios.post(`${API_URL}/auth/login`, {
            email: adminEmail,
            password: 'AdminSuperPass1'
        });
        adminToken = adminLogin.data.data.token;
        console.log('✔ Admin registered and logged in.');

        // 4. Admin fetch Migrating Applications
        console.log('4. Fetching Migrating Applications...');
        const migratingRes = await axios.get(`${API_URL}/admin/applications/migrating`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log(`✔ Found ${migratingRes.data.data.length} migrating applications.`);

        // 5. Admin Approves Application
        console.log('5. Admin Approving Application...');
        const approveRes = await axios.post(`${API_URL}/admin/applications/${applicationId}/approve`, {
            isLimited: false
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        organizationId = approveRes.data.data.org.id;
        console.log(`✔ Organization created automatically. Trust Tier: ${approveRes.data.data.org.trust_tier}`);

        // 6. Discover Organizations
        console.log('6. Testing Organization Discovery Logic...');
        const discoverRes = await axios.get(`${API_URL}/organizations/discover?city=Pune&state=Maharashtra`, {
            headers: { Authorization: `Bearer ${userToken}` }
        });
        console.log(`✔ Discovery API returned ${discoverRes.data.data.length} organizations.`);
        if (discoverRes.data.data.length > 0) {
            console.log(`   Top Result: ${discoverRes.data.data[0].name} (City: ${discoverRes.data.data[0].city})`);
        }

        console.log('--- ALL APIS VERIFIED AND WORKING SUCCESSFULLY! ---');

    } catch (err) {
        console.error('API Test Failed:');
        if (err.response) {
            console.error(err.response.data);
        } else {
            console.error(err);
        }
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

runTests();