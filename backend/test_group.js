const { prisma } = require('./src/config/db');

async function test() {
    const chitgroupController = require('./src/controllers/chitgroup.controller');
    const req = {
        params: { id: 'c604e575-e779-49df-8d79-1df922cb7cca' },
        user: { id: '9866f0be-6feb-4b1a-8731-25262f81dc2f' }
    };
    const res = {
        status: (code) => {
            console.log('Status:', code);
            return {
                json: (data) => console.log('JSON:', JSON.stringify(data, null, 2))
            };
        }
    };
    const next = (err) => console.error('Next Error:', err);

    console.log('Testing getChitGroupDetails...');
    await chitgroupController.getChitGroupDetails(req, res, next);
}

test().catch(console.error).finally(() => prisma.$disconnect());
