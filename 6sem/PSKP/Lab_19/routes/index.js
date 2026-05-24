const express = require('express');
const router = express.Router();

const userReadController = require('../controllers/userReadController');
const userWriteController = require('../controllers/userWriteController');

router.get('/users', userReadController.getAllUsers);
router.get('/users/:id', userReadController.getUserById);

router.post('/users', userWriteController.createUser);
router.put('/users/:id', userWriteController.updateUser);
router.delete('/users/:id', userWriteController.deleteUser);

module.exports = router;