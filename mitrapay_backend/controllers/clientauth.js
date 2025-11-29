const ApiClient = require("../models/ApiClient.js");
const Payout = require("../models/Payout");
const Transaction = require("../models/Transaction");
const BeneficiaryAccount = require("../models/BenificheryAccount");
const SuperAdmin = require("../models/Admin_User.js");
const Subadmin = require("../models/subadmin.js");
const User = require("../models/User.js");

exports.Create_payout_withClientAuth = async (req, res) => {
    const {

        beneficiaryCode,
        beneficiaryName,
        beneficiaryAddress,
        beneficiaryaccountNumber,
        ifsc,
        bankName,
        paymentMethod,
        Amount,
        remark,
    } = req.body;
    const requiredFields = [
        'beneficiaryCode',
        'beneficiaryName',
        'beneficiaryAddress',
        'beneficiaryaccountNumber',
        'ifsc',
        'bankName',
        'paymentMethod',
        'Amount',
        'remark'
    ];



    const [superAdmin, subAdmin, normalUser] = await Promise.all([
        SuperAdmin.findOne({ email: req.user.email }),
        Subadmin.findOne({ email: req.user.email }),
        User.findOne({ email: req.user.email }),
    ]);
    const matchedUser = superAdmin || subAdmin || normalUser;
    if (!matchedUser) {
        return res.status(404).json({
            success: false,
            message: "User making the payment not found.",
        });
    }
    try {

        // (Optional) ✅ Verify domain restriction
        // if (client.domain) {
        //     const requestOrigin = req.headers.origin;

        //     // // If no origin (Postman, curl, server-to-server calls) → block
        //     if (!requestOrigin) {
        //         return res.status(403).json({
        //             success: false,
        //             message: "❌ Unauthorized: Requests",
        //         });
        //     }

        //     // If origin doesn’t match client’s domain → block
        //     if (client.domain !== requestOrigin) {
        //         return res.status(403).json({
        //             success: false,
        //             message: "❌ Unauthorized: Request not allowed from this domain",
        //         });
        //     }
        // }
        // return
        if (req.user.credit < Amount) {
            return res.status(400).json({
                success: false,
                message: "Insufficient credit to process this payout.",
            });
        }
        // ✅ Step 2: Check if beneficiary exists
        let beneficiary = await BeneficiaryAccount.findOne({
            "Beneficiary Code": beneficiaryCode,
            "Beneficiary Account No": beneficiaryaccountNumber,
            "BIC / SWIFT / IFSC Code": ifsc,
            "Beneficiary Bank Name": bankName,
        });

        // ✅ Step 2a: If not found → create new beneficiary
        if (!beneficiary) {
            beneficiary = await BeneficiaryAccount.create({
                ["Beneficiary Code"]: beneficiaryCode,
                ["Beneficiary Name"]: beneficiaryName,
                ["Beneficiary Address 1"]: beneficiaryAddress || ".",
                ["Beneficiary Account No"]: beneficiaryaccountNumber,
                ["BIC / SWIFT / IFSC Code"]: ifsc,
                ["Beneficiary Bank Name"]: bankName,
                ["Payment Method Name"]: paymentMethod,
                ["Effective From"]: new Date(),
                status: "approved", // directly approved for API clients
                                    Credit_status: "Pending",

                createdBy: [
                    {
                        email: req.user.email,
                        name: req.user.Name,
                        role: req.user.role,
                    },
                ],
            });
        }

        // ✅ Step 3: Send Money record
        const payout = await Payout.create({
            ["Beneficiary Code"]: beneficiary["Beneficiary Code"],
            ["Beneficiary Name"]: beneficiary["Beneficiary Name"],
            ["Beneficiary Address 1"]: beneficiary["Beneficiary Address 1"],
            ["Beneficiary Account No"]: beneficiary["Beneficiary Account No"],
            ["BIC / SWIFT / IFSC Code"]: beneficiary["BIC / SWIFT / IFSC Code"],
            ["Beneficiary Bank Name"]: beneficiary["Beneficiary Bank Name"],
            ["Payment Method Name"]: paymentMethod,
            Amount,
            Payment_By: [
                {
                    email: req.user.email,
                    name: req.user.Name,
                    role: req.user.role,
                },
            ],
            status: "processing",
            utr: "",
            Bank_Utr: "",
            remark,
            Availble_balance: matchedUser.credit - Amount,
        });
        matchedUser.credit -= Amount;
        await matchedUser.save();

        // ✅ Step 4: Save transaction entry
        await Transaction.create({
            userId: matchedUser._id,
            type: "debit",
            'Beneficiary Name': payout['Beneficiary Name'],
            'Beneficiary Account No': payout['Beneficiary Account No'],
            'BIC / SWIFT / IFSC Code': payout['BIC / SWIFT / IFSC Code'],
            'Beneficiary Bank Name': payout['Beneficiary Bank Name'],
            utr: payout.utr,
            amount: Amount,
            description: `Payout initiated by client ${beneficiary["Beneficiary Name"]})`,
        });

        // ✅ Step 5: Auto status flow (processing → pending → approved)
        setTimeout(async () => {
            try {
                const pending = await Payout.findOneAndUpdate(
                    { _id: payout._id, status: "processing" },
                    { $set: { status: "pending" } },
                    { new: true }
                );
                if (pending) {
                    console.log(`✅ Payout ${payout._id} moved to pending`);
                    setTimeout(async () => {
                        try {
                            const approved = await Payout.findOneAndUpdate(
                                { _id: payout._id, status: "pending" },
                                { $set: { status: "approved" } },
                                { new: true }
                            );

                            if (approved) {
                                console.log(`✅ Payout ${payout._id} approved`);

                                // ✅ Callback Trigger
                                const callbackPayload = {
                                    payoutId: approved._id,
                                    beneficiaryId: beneficiary._id,
                                    status: approved.status,
                                    amount: approved.Amount,
                                    bankUtr: approved.Bank_Utr || "",
                                    payout: payout._id
                                };

                                const callbackUrls = [
                                    "https://api.trustpays24.com/v1/payout/tatapay-callback",
                                    "https://api.staging.trustpays24.com/v1/payout/tatapay-callback",
                                ];

                                for (const url of callbackUrls) {
                                    try {
                                        await axios.post(url, callbackPayload, {
                                            headers: { "Content-Type": "application/json" },
                                        });
                                        console.log(`📩 Callback sent to ${url}`);
                                    } catch (err) {
                                        console.error(`❌ Callback failed to ${url}:`, err.message);
                                    }
                                }
                            }
                        } catch (err) {
                            console.error("❌ Approve error:", err.message);
                        }
                    }, 30000); // after 30s move to approved
                }
            } catch (err) {
                console.error("❌ Pending error:", err.message);
            }


            setTimeout(async () => {
                const Bank_Utr = await Payout.find({
                    Bank_Utr: { $regex: /\S/, $exists: true }  // must contain at least one non-space char
                })
                    .sort({ createdAt: -1 })
                    .limit(1);

                // console.log(Bank_Utr)
                const now = new Date();
                // return
                // Creating object of given date and time
                const date1 = Bank_Utr[0].createdAt;
                // Subtracting the both dates
                // by using date.subtract() method
                const diffMs = now - date1;

                const diffSec = Math.floor(diffMs / 1000);
                const diffMin = Math.floor(diffMs / (1000 * 60));
                const diffHr = Math.floor(diffMs / (1000 * 60 * 60));
                const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                // // console.log("Milliseconds:", diffMs);

                // console.log("Hours:", diffHr);
                // console.log("Days:", diffDay);
                let newbankutr = (diffMin < 3 ? diffSec : diffMin)
                try {
                    const approved = await Payout.findOneAndUpdate(
                        { _id: payout._id, Bank_Utr: "" },
                        { $set: { Bank_Utr: (Number(Bank_Utr[0].Bank_Utr)) + Number(newbankutr) } },
                        { new: true }
                    );
                    // if (approved) console.log("✅ Approved");
                } catch (err) {
                    console.error("❌ Approve error:", err);
                }
            }, 40000);
        }, 5000); // after 5s move to pending

        return res.status(200).json({
            success: true,
            message: "✅ Payment initiated successfully",
            payoutId: payout._id,
            beneficiaryId: beneficiary._id,
        });
    } catch (error) {
        console.error("❌ Payout Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Payout failed",
            error: error.message,
        });
    }
};




exports.createApiClient = async (req, res) => {
    try {
        const { name, domain } = req.body;

        const client = new ApiClient({
            name,
            domain,
        });

        await client.save();

        return res.status(201).json({
            success: true,
            message: "✅ API Client created successfully",
            clientId: client.clientId,
            clientSecret: client.clientSecret,
            domain: client.domain,
        });
    } catch (error) {
        console.error("❌ API Client Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to create API client",
            error: error.message,
        });
    }
};
