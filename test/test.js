const {
  debug,
  login,
  getGameData,
  loadF95BaseData,
  getUserData,
  logout,
} = require("../app/index");

//debug(true);
main();

async function main() {
  let loginResult = await login("MillenniumEarl", "f9vTcRNuvxj4YpK");

  if (loginResult.success) {
    await loadF95BaseData();
    let gameData = await getGameData("kingdom of deception", false);
    console.log(gameData.pop());

    // let userData = await getUserData();
    // console.log(userData);
  }
  logout();
}
