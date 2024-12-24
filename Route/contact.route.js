import express from 'express';
import { ContactSignup, ContactGet } from '../controller/contact.controller.js';

const userRouter = express.Router();
// Route to create a new user
userRouter.post('/ContactSignup', ContactSignup)
userRouter.get('/ContactGet', ContactGet)

export default userRouter