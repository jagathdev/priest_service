import express from 'express';
import { createUser, getUser, getUserQuery, readUser } from '../controllers/userController.js';

const router = express.Router();

router.post('/createUser', createUser)
router.get('/readUser', readUser)
router.get('/getUser/:id', getUser)
router.get('/getUserQuery', getUserQuery)

export default router;