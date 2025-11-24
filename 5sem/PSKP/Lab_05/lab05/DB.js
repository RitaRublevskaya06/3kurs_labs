const EventEmitter = require('events');

class DB extends EventEmitter {
    db_data = [
        {id: 1, name: 'Иванов И.И.', bday: '12-08-2006'},
        {id: 2, name: 'Петров П.П.', bday: '13-11-2006'},
        {id: 3, name: 'Сидоров С.С.', bday: '22-09-2006'},
        {id: 4, name: 'Васильев В.В.', bday: '27-01-2006'},
    ]

    stats = {
        requests: 0,
        commits: 0
    }

    setStatsCollection(statsCollection) {
        this.statsCollection = statsCollection;
    }

    constructor() {
        super();
    }

    async commit() {
        return new Promise((resolve) => {
            console.log('COMMIT: Фиксация состояния БД');
            if (this.statsCollection && this.statsCollection.active) {
                this.stats.commits++;
            }
            this.emit('COMMIT');
            resolve();
        });
    }

    getStats() {
        return {...this.stats};
    }

    resetStats() {
        this.stats.requests = 0;
        this.stats.commits = 0;
    }

    async select() {
        if (this.statsCollection && this.statsCollection.active) {
            this.stats.requests++;
        }
        return new Promise((resolve) => {
            resolve(this.db_data);
        });
    }

    async insert(person) {
        if (this.statsCollection && this.statsCollection.active) {
            this.stats.requests++;
        }
        return new Promise((resolve, reject) => {
            let personIndex = this.db_data.findIndex(el => el.id == person.id);
            if (personIndex === -1) {
                this.db_data.push(person);
                resolve(person);
            } else {
                reject(this.createError("Найден человек с id " + person.id));
            }
        })
    }

    async update(person) {
        if (this.statsCollection && this.statsCollection.active) {
            this.stats.requests++;
        }
        return new Promise((resolve, reject) => {
            let personIndex = this.db_data.findIndex(el => el.id == person.id);
            if (personIndex !== -1) {
                this.db_data[personIndex] = person;
                resolve(person);
            } else {
                reject(this.createError("Нет человека с id " + person.id));
            }
        });
    }

    async delete(id) {
        if (this.statsCollection && this.statsCollection.active) {
            this.stats.requests++;
        }
        return new Promise((resolve, reject) => {
            let personIndex = this.db_data.findIndex(el => el.id == id);
            if (personIndex !== -1) {
                this.db_data.splice(personIndex, 1);
                resolve(id);
            } else {
                reject(this.createError("Нет человека с id " + id));
            }
        });
    }

    createError(message) {
        return {
            error: message
        }
    }
}

module.exports.DB = DB;