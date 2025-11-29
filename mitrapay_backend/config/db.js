const mongoose = require("mongoose");
const connectDB = () => {
 
 const mongoURI =
    process.env.NODE_ENV === "production"
      ? process.env.MONGO_URI_PROD
      : process.env.MONGO_URI_DEV;

    mongoose
    .connect(mongoURI, {
      useNewUrlParser: "true",
      useUnifiedTopology: "true",
    })
    .then(() => {
      console.log("connected online");
    })
    .catch((error) => {
      console.log(error);
    });

 
 };

module.exports = connectDB;

//tCwcEP3qmkW5cwOI