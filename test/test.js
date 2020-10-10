const {join} = require("path");
const {
  debug,
  login,
  getGameData,
  loadF95BaseData,
  getUserData,
  logout,
} = require("../app/index.js");
const GameDownload = require("../app/scripts/classes/game-download.js");

debug(true);
//main();
//downloadGameNOPY();
downloadGameMEGA();

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

async function downloadGameNOPY() {
  let gd = new GameDownload();
  gd.hosting = "NOPY";
  gd.link = "https://nopy.to/50jmNQbo/Kingdom_of_Deception-pc0.10.8.zip";
  let savepath = join(__dirname, "Kingdom_of_Deception-pc0.10.8.zip");
  let result = await gd.download(savepath);
  console.log(result);
}

async function downloadGameMEGA() {
  let gd = new GameDownload();
  gd.hosting = "NOPY";
  gd.link = "https://f95zone.to/masked/mega.nz/2733/1470797/4O5LKwMx4ZSlw0QYTVMP0uDK660/hoobTb44f0IKx7Yio2SE2w/loX_px2vLRyNRQCnkNn5U7nnQe7jGmpEVERvH1tk7RjAFkQbs2kH_vCK6zVmRDuqiypPoIx358MNHHCd3QCdVvEsClSiAq4rwjK0r_ruXIs";
  let savepath = join(__dirname, "Kingdom_of_Deception-pc0.10.8.zip");
  let result = await gd.download(savepath);
  console.log(result);
}