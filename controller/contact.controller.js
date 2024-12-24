import Contact from "../model/contact.model.js";

export const ContactSignup = async (req, res) => {
   try {
      const { name, email, subject, phone, message } = await req.body;
      // Check if email already exists in database
      const userFind = await Contact.findOne({ email });
      if (userFind) {
         return res.status(400).json({ message: 'Email already exists' });
      } else {

         // Create new user object and save it to database
         const createdUser = new Contact(
            {
               name,
               email,
               subject,
               phone,
               message
            }
         );
         // Save user to database
         const savedUser = await createdUser.save();
         res.status(201).json({ message: 'User created successfully', user: savedUser.name });
      }
   } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error' });
   }
}

export const ContactGet = async (req, res) => {
   try {
      const users = await Contact.find();
      res.status(200).json({ message: 'Users fetched successfully', users });
   } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error' });
   }
}