const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/users.json');

const readUsersFromFile = () => {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeUsersToFile = (users) => {
    fs.writeFileSync(dataPath, JSON.stringify(users, null, 2), 'utf8');
};

class UserModel {
    getAllUsers() {
        return readUsersFromFile();
    }

    getUserById(id) {
        const users = readUsersFromFile();
        return users.find(user => user.id === id);
    }

    createUser(userData) {
        const users = readUsersFromFile();
        
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        
        const newUser = {
            id: newId,
            name: userData.name,
            createdAt: new Date().toISOString() // добавим дату создания
        };
        
        users.push(newUser);
        writeUsersToFile(users);
        
        return newUser;
    }

    updateUser(id, userData) {
        const users = readUsersFromFile();
        const index = users.findIndex(user => user.id === id);
        
        if (index !== -1) {
            users[index] = { 
                ...users[index], 
                ...userData,
                updatedAt: new Date().toISOString()
            };
            writeUsersToFile(users);
            return users[index];
        }
        
        return null;
    }

    deleteUser(id) {
        const users = readUsersFromFile();
        const filteredUsers = users.filter(user => user.id !== id);
        
        if (filteredUsers.length < users.length) {
            writeUsersToFile(filteredUsers);
            return true;
        }
        
        return false;
    }
}

module.exports = new UserModel();