const mongoose = require("mongoose");
const Payout = require("./models/Payout");
const Claim = require("./models/Claim.js");
require("dotenv").config();
const moment = require("moment-timezone");

const migrate = async () => {

    const startOfDay = moment().tz("Asia/Kolkata").startOf("day").toDate();
    const endOfDay = moment().tz("Asia/Kolkata").endOf("day").utc().toDate();
    console.log(startOfDay, endOfDay);
    const localTime = moment().tz('Asia/Kolkata');
console.log(localTime.format());
    // return
    await mongoose.connect(process.env.MONGO_URI_PROD);
    console.log("🚀 Fetching claims...");

    const claims = await Claim.find().lean();
    console.log(`⚡ Migrating ${claims.length} claims...`);

    await Promise.all(
        claims.map(async (claim) => {
            try {
                const paymentBy = claim.Payment_By?.[0];
                if (!paymentBy) {
                    console.warn(`⚠️ Claim ${claim._id} has no Payment_By`);
                    return;
                }
// return
                const findspayout = await Payout.findOne({
                    "Payment_By.email": paymentBy.email,
                    "Payment_By.role": paymentBy.role,
                    Amount: 1000,
                    "Beneficiary Account No": "920010061687066",
                     Bank_Utr: '525210269505'
                });

                if (!findspayout) {
                    // console.warn(`⚠️ No payout found for claim ${claim._id}`);
                    return;
                }
                console.log(findspayout, "findspayout");
                console.log(`🔍 Found payout ${findspayout._id} for claim ${claim._id}`);
// return
                await Claim.findByIdAndUpdate("68cac0d8f0732fb9adbb99d1", {
                    payoutdate: findspayout.createdAt, // ✅ correct field
                });

                console.log(`✅ Updated claim ${claim._id} with payout ${findspayout._id}`);
            } catch (err) {
                console.error(`❌ Error migrating claim ${claim._id}`, err.message);
            }
        })
    );

    console.log("🎉 Migration finished!");
    process.exit();
};

migrate();
