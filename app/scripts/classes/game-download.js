/* istanbul ignore file */

"use strict";

// Core modules
const fs = require("fs");

// Public modules from npm
// const { File } = require('megajs');

// Modules from file
const { prepareBrowser, preparePage } = require("../puppeteer-helper.js");
const shared = require("../shared.js");

class GameDownload {
  constructor() {
    /**
     * @public
     * Platform that hosts game files
     * @type String
     */
    this.hosting = "";
    /**
     * @public
     * Link to game files
     * @type String
     */
    this.link = null;
    /**
     * @public
     * Operating systems supported by the game version indicated in this class.
     * Can be *WINDOWS/LINUX/MACOS*
     * @type String[]
     */
    this.supportedOS = [];
  }

  /**
   * @public
   * Download the game data in the indicated path.
   * Supported hosting platforms: MEGA, NOPY
   * @param {String} path Save path
   * @return {Promise<Boolean>} Result of the operation
   */
  async download(path) {
    if (this.link.includes("mega.nz"))
      return await downloadMEGA(this.link, path);
    else if (this.link.includes("nopy.to"))
      return await downloadNOPY(this.link, path);
  }
}
module.exports = GameDownload;

async function downloadMEGA(url, savepath) {
  // The URL is masked
  const browser = await prepareBrowser();
  const page = await preparePage(browser);
  await page.setCookie(...shared.cookies); // Set cookies to avoid login
  await page.goto(url);
  await page.waitForSelector("a.host_link");

  // Obtain the link for the unmasked page and click it
  const link = await page.$("a.host_link");
  await link.click();
  await page.goto(url, {
    waitUntil: shared.WAIT_STATEMENT,
  }); // Go to the game page and wait until it loads

  // Obtain the URL after the redirect
  const downloadURL = page.url();

  // Close browser and page
  await page.close();
  await browser.close();

  const stream = fs.createWriteStream(savepath);
  const file = File.fromURL(downloadURL);
  file.download().pipe(stream);
  return fs.existsSync(savepath);
}

async function downloadNOPY(url, savepath) {
  // Prepare browser
  const browser = await prepareBrowser();
  const page = await preparePage(browser);
  await page.goto(url);
  await page.waitForSelector("#download");

  // Set the save path
  await page._client.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: path.basename(path.dirname(savepath)), // It's a directory
  });

  // Obtain the download button and click it
  const downloadButton = await page.$("#download");
  await downloadButton.click();

  // Await for all the connections to close
  await page.waitForNavigation({
    waitUntil: "networkidle0",
    timeout: 0, // Disable timeout
  });

  // Close browser and page
  await page.close();
  await browser.close();

  return fs.existsSync(savepath);
}
