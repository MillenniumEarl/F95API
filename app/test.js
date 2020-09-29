const { debug, login, getGameData, loadF95BaseData, getUserData } = require("../app/index");

debug(true);
main();

async function main() {
    let loginResult = await login("MillenniumEarl", "f9vTcRNuvxj4YpK");

    if (loginResult.success) {
        // await loadF95BaseData();
        // let data = await getGameData("kingdom of deception", false);
        // console.log(data.pop());
        let data = await getUserData();
        console.log(data);
    }
}