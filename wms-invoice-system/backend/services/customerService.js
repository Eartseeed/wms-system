class CustomerService {

    async getAll() {
        return [];
    }

    async getById(id) {
        return null;
    }

    async create(data) {
        return data;
    }

    async update(id, data) {
        return data;
    }

    async remove(id) {
        return true;
    }

}

module.exports = new CustomerService();