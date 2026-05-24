const userModel = require('../models/userModel');

class userWriteController {
    createUser(req, res) {
        try {
            if (!req.body.name || typeof req.body.name !== 'string' || req.body.name.trim() === '') {
                return res.status(400).json({ 
                    message: 'Имя пользователя обязательно и должно быть непустой строкой' 
                });
            }

            const userData = {
                name: req.body.name.trim()
            };

            const newUser = userModel.createUser(userData);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(500).json({ message: 'Ошибка сервера при создании пользователя' });
        }
    }

    updateUser(req, res) {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({ message: 'Некорректный ID пользователя' });
            }

            if (!req.body.name || typeof req.body.name !== 'string' || req.body.name.trim() === '') {
                return res.status(400).json({ 
                    message: 'Имя пользователя обязательно и должно быть непустой строкой' 
                });
            }

            const userData = {
                name: req.body.name.trim()
            };

            const updatedUser = userModel.updateUser(id, userData);

            if (updatedUser) {
                res.json(updatedUser);
            } else {
                res.status(404).json({ message: `Пользователь с ID ${id} не найден` });
            }
        } catch (error) {
            res.status(500).json({ message: 'Ошибка сервера при обновлении пользователя' });
        }
    }

    deleteUser(req, res) {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({ message: 'Некорректный ID пользователя' });
            }

            const deleted = userModel.deleteUser(id);

            if (deleted) {
                res.json({ 
                    message: 'Пользователь удалён',
                    deletedId: id 
                });
            } else {
                res.status(404).json({ message: `Пользователь с ID ${id} не найден` });
            }
        } catch (error) {
            res.status(500).json({ message: 'Ошибка сервера при удалении пользователя' });
        }
    }
}

module.exports = new userWriteController();