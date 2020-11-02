"use strict";

// Modules from file
const { getF95Token } = require("../network-helper.js");

class Credentials {
    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.token = null;
    }

    async fetchToken() {
        this.token = await getF95Token();
    }
}

module.exports = Credentials;