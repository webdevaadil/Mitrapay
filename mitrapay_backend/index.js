const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv"); // if using CommonJS

dotenv.config();
connectDB();
app.use(cookieParser());

app.use(
  cors({
    origin: "https://diamondlegalservices.in,https://api.staging.trustpays24.com/",
    optionsSuccessStatus: 200,
    credentials: true,
  })
);


// use error handler after all routes
const errorHandler = require("./middleware/error");
const { default: axios } = require("axios");
const Payout = require("./models/Payout");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://diamondlegalservices.in",
    credentials: true,
  },

});

// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

io.on("connection", (socket) => {

  socket.on("joinRoleRoom", (role) => {
    if (role) {
      socket.join(role);
      console.log(`Socket ${socket.id} joined room: ${role}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

app.set("io", io);

app.use("/api/auth", require("./routes/auth"));
app.use(errorHandler);
const show = "pro";
app.post("/trexoedge/webhook", async (req, res) => {
  try {
    const { transaction_id } = res.req.body;

    if (!transaction_id) {
      return res.status(400).json({ error: "transaction_id required" });
    }

    // Respond immediately to webhook
    res.status(200).json({ success: true });

    // Now process webhook asynchronously
    const trexoResponse = await axios.get(
      `https://reseller.api.payout.trexoedge.com/api/v1/check_status/${transaction_id}`,
      {
        headers: {
          "x-trexo-key": process.env["x-trexo-key"],
          "x-trexo-secret": process.env["x-trexo-secret"],
          "x-trexo-id": process.env["x-trexo-id"],
          Accept: "application/json",
        },
      }
    );

    const data = trexoResponse.data.data;

    await Payout.findOneAndUpdate(
      { transaction_id: data.transaction_id },
      { status: data.status, utr: data.utr }
    );
    const io = req.app.get("io");
    const notification = {
      message: `Payout of ₹${data.amount} to "${ data.name}" has been initiated at ${data.timestamp}.`,
      type: "success",
      createdAt: new Date(),
    };
    io.to("Super_Admin").emit("notification", notification);
    io.to("Sub_Admin").emit("notification", notification);

   

  } catch (err) {
    console.error("Webhook error:", err.response?.data || err.message);
  }
});
if (show === "pro") {
  app.use(express.static(path.join(__dirname, "./client/build")));
  console.log("sa");
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

server.listen(4000, () => {
  console.log(`server is running on 4000`);
});
