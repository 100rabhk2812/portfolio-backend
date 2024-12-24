import mongoose from "mongoose";

// Define the user schema
const ContactSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true
   },
   email: {
      type: String,
      required: true,
      unique: true
   },
   subject: {
      type: String,
      required: true
   },
   phone: {
      type: String,
      required: true
   },
   message: {
      type: String,
   }
});

const Contact = mongoose.model("Contact", ContactSchema);

export default Contact;