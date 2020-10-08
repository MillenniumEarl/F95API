'use strict';

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
     * Download the game data in the indicated path
     * @param {string} path Save path
     */
    download(path){

    }
}
module.exports = GameDownload;

function downloadMEGA(url){

}

function downloadNOPY(url){

}