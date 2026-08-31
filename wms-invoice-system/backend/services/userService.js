class UserService {

    async getAll() {
        return [];
    }

    async getById(id) {
        return null;
    }

    async create(data) {
        return {
            id: 1,
            ...data
        };
    }

    async update(id, data) {
        return {
            id,
            ...data
        };
    }

    async remove(id) {
        return true;
    }

}

module.exports = new UserService();