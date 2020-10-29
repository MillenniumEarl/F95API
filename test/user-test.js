const F95API = require("../app/index.js");

F95API.debug(true);
main();

async function main() {
    const loginResult = await F95API.login("MillenniumEarl", "f9vTcRNuvxj4YpK");

    if (loginResult.success) {
        await F95API.loadF95BaseData();
        const gameData = await F95API.getGameData("a struggle with sin", false);
        console.log(gameData);
    }
    F95API.logout();
}
