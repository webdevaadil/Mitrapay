const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction.js');

async function scrapeAndStore() {
    await mongoose.connect('mongodb+srv://sonamkumari63928:tCwcEP3qmkW5cwOI@cluster0.fr5mimc.mongodb.net/payout')

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // TODO: Login process
    await page.goto('http://62.72.59.34:5000/#/login');

    // Simulate login manually or automate if simple
    await page.type('#email', 'aadilkhany@gmail.com');
    await page.type('#Password', '123456s');
    // await page.click('#login');
    // await page.waitForNavigation();

    // Navigate to transactions page
    await page.goto('http://62.72.59.34:5000/#/view_user');

    await page.waitForSelector('table'); // adjust selector

    const transactions = await page.evaluate(() => {
        const rows = document.querySelectorAll('table tr');
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].querySelectorAll('td');
            if (cols.length >= 3) {
                data.push({
                    date: cols[0].innerText.trim(),
                    description: cols[1].innerText.trim(),
                    amount: parseFloat(cols[2].innerText.replace(/,/g, '').trim()),
                });
            }
        }
        return data;
    });

    for (const tx of transactions) {
        try {
            await Transaction.create(tx);
            console.log('New transaction added:', tx);
        } catch (e) {
            if (e.code === 11000) {
                // Duplicate — already exists
                continue;
            } else {
                console.error('Insert error:', e.message);
            }
        }
    }

    await browser.close();
    await mongoose.disconnect();
}
