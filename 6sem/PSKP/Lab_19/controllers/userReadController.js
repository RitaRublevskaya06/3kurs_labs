const userModel = require('../models/userModel');

class userReadController {
    getAllUsers(req, res) {
        try {
            const users = userModel.getAllUsers();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'Ошибка сервера при получении пользователей' });
        }
    }

    getUserById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const user = userModel.getUserById(id);
            
            if (user) {
                res.json(user);
            } else {
                res.status(404).json({ message: `Пользователь с ID ${id} не найден` });
            }
        } catch (error) {
            res.status(500).json({ message: 'Ошибка сервера при получении пользователя' });
        }
    }
}

module.exports = new userReadController();