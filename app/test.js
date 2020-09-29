const { debug, login, close, getGameData, loadF95BaseData } = require("../app/index");

debug(true);
main();

async function main() {
    let loginResult = await login("MillenniumEarl", "f9vTcRNuvxj4YpK");

    if (loginResult.success) {
        await loadF95BaseData();
        let data = await getGameData("kingdom of deception", false);
        console.log(data);
    }
    await close();
}
