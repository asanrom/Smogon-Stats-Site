/**
 * Crawler process
 * Smogon Stats Site - https://github.com/asanrom/Smogon-Stats-Site
 */

"use strict";

import { StatsCrawler } from "./crawler/stats-crawler";
import { Logger } from "./utils/logs";

StatsCrawler.start();
Logger.getInstance().info("Crawler process started.");
