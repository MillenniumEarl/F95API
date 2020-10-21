const {
  debug,
  login,
  getGameData,
  loadF95BaseData,
  getUserData,
  logout,
} = require("../app/index.js");

debug(true);
main();

async function main() {
  const loginResult = await login("MillenniumEarl", "f9vTcRNuvxj4YpK");

  if (loginResult.success) {
    await loadF95BaseData();
    const gameData = await getGameData("kingdom of deception", false);
    console.log(gameData);

    // let userData = await getUserData();
    // console.log(userData);
  }
  logout();
}
