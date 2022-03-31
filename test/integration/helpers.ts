// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Public modules from npm
import dotenv from "dotenv";
import inquirer from "inquirer";

// Modulee from files
import { login } from "../../src/index";
import LoginResult from "../../src/scripts/classes/login-result";

// Configure the .env reader
dotenv.config();

export async function auth(): Promise<LoginResult> {
  return login(
    process.env.F95_USERNAME,
    process.env.F95_PASSWORD,
    insertCaptchaToken,
    insert2faCode
  );
}

//#region Private methods

/**
 * Ask the user to enter the OTP code
 * necessary to authenticate on the server.
 */
async function insert2faCode(): Promise<number> {
  const questions = [
    {
      type: "input",
      name: "code",
      message: "Insert 2FA code:"
    }
  ];

  // Prompt the user to insert the code
  const answers = await inquirer.prompt(questions);
  return answers.code as number;
}

async function insertCaptchaToken(): Promise<string> {
  return "";
}

//#endregion Private methods
