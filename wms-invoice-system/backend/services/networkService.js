const os = require("os");

class NetworkService {

    async getNetworkInfo() {

        const interfaces = os.networkInterfaces();

        const ipList = [];

        Object.keys(interfaces).forEach(name => {

            interfaces[name].forEach(network => {

                if (

                    network.family === "IPv4" &&

                    !network.internal

                ) {

                    ipList.push({

                        interface: name,

                        ip: network.address,

                        netmask: network.netmask,

                        mac: network.mac

                    });

                }

            });

        });

        return {

            hostname: os.hostname(),

            platform: os.platform(),

            arch: os.arch(),

            release: os.release(),

            cpus: os.cpus().length,

            totalMemory: os.totalmem(),

            freeMemory: os.freemem(),

            uptime: os.uptime(),

            interfaces: ipList

        };

    }

    async getServerStatus() {

        return {

            status: "ONLINE",

            timestamp: new Date(),

            nodeVersion: process.version,

            pid: process.pid,

            memory: process.memoryUsage(),

            uptime: process.uptime()

        };

    }

    async ping() {

        return {

            success: true,

            message: "CWMS Server Online",

            time: new Date()

        };

    }

}

module.exports = new NetworkService();