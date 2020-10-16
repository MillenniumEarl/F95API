const { join } = require("path");
const {
  debug,
  login,
  getGameData,
  loadF95BaseData,
  getUserData,
  logout
} = require("../app/index.js");
const GameDownload = require("../app/scripts/classes/game-download.js");

debug(true);
main();
//downloadGameMEGA();

async function main() {
  const loginResult = await login("MillenniumEarl", "f9vTcRNuvxj4YpK");

  if (loginResult.success) {
    await loadF95BaseData();
    const gameData = await getGameData("queen's brothel", false);
    console.log(gameData);

    // let userData = await getUserData();
    // console.log(userData);
  }
  logout();
}

async function downloadGameMEGA() {
  const gd = new GameDownload();
  gd.hosting = "NOPY";
  gd.link =
    "https://f95zone.to/masked/mega.nz/2733/1470797/4O5LKwMx4ZSlw0QYTVMP0uDK660/hoobTb44f0IKx7Yio2SE2w/loX_px2vLRyNRQCnkNn5U7nnQe7jGmpEVERvH1tk7RjAFkQbs2kH_vCK6zVmRDuqiypPoIx358MNHHCd3QCdVvEsClSiAq4rwjK0r_ruXIs";
  const savepath = join(__dirname, "Kingdom_of_Deception-pc0.10.8.zip");
  const result = await gd.download(savepath);
  console.log(result);
}
