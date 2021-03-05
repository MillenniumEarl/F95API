import Thread from "../classes/mapping/thread.js";
import { IBasic } from "../interfaces.js";
export declare function getHandiworkInformation<T extends IBasic>(url: string): Promise<T>;
export declare function getHandiworkInformation<T extends IBasic>(url: string): Promise<T>;
/**
 * Gets information of a particular handiwork from its thread.
 *
 * If you don't want to specify the object type, use `HandiWork`.
 *
 * @todo It does not currently support assets.
 */
export default function getHandiworkInformation<T extends IBasic>(arg: string | Thread): Promise<T>;
