import Contact from "../model/contact.model.js";

export const ContactSignup = async (req, res) => {
   try {
      const { name, email, subject, phone, message } = req.body;
      
      // Add timeout to database query
      const userFind = await Promise.race([
         Contact.findOne({ email }),
         new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database query timeout')), 5000)
         )
      ]);

      if (userFind) {
         return res.status(400).json({ message: 'Email already exists' });
      }

      // Create new user object
      const createdUser = new Contact({
         name,
         email,
         subject,
         phone,
         message
      });

      // Save with timeout
      const savedUser = await Promise.race([
         createdUser.save(),
         new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Save operation timeout')), 5000)
         )
      ]);

      res.status(201).json({ message: 'User created successfully', user: savedUser.name });
   } catch (error) {
      console.error('ContactSignup error:', error.message);
      if (error.message.includes('timeout')) {
         res.status(504).json({ message: 'Request timeout' });
      } else {
         res.status(500).json({ message: 'Internal Server Error' });
      }
   }
}

export const ContactGet = async (req, res) => {
   try {
      // Add timeout to find operation
      const users = await Promise.race([
         Contact.find().lean().exec(),
         new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database query timeout')), 5000)
         )
      ]);

      res.status(200).json({ message: 'Users fetched successfully', users });
   } catch (error) {
      console.error('ContactGet error:', error.message);
      if (error.message.includes('timeout')) {
         res.status(504).json({ message: 'Request timeout' });
      } else {
         res.status(500).json({ message: 'Internal Server Error' });
      }
   }
}