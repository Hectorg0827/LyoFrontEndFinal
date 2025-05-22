// Script to generate App Store screenshots
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

import chalk from "chalk";

/**
 * This script helps generate App Store screenshots for the Lyo app
 *
 * To run this script:
 * node scripts/generate-screenshots.js
 */

// Configuration
const SIMULATOR_TYPES = [
  "iPhone 8 Plus", // 5.5-inch display
  "iPhone 11 Pro Max", // 6.5-inch display
  "iPhone 14 Pro", // 6.1-inch display
  "iPhone 14 Plus", // 6.7-inch display
  "iPad Pro (12.9-inch) (6th generation)", // iPad
];

const SCREENSHOT_SCREENS = [
  { name: "Onboarding", route: "" }, // Default route (onboarding)
  { name: "Home", route: "home" },
  { name: "Learn", route: "learn" },
  { name: "Community", route: "community" },
  { name: "AI Classroom", route: "ai-classroom" },
  { name: "Profile", route: "profile" },
];

// Create output directory
const screenshotDir = path.join(__dirname, "../appstore-screenshots");
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// Function to generate screenshots
async function generateScreenshots() {
  console.log(chalk.blue("Starting App Store screenshot generation...\n"));

  for (const device of SIMULATOR_TYPES) {
    // Create device-specific folder
    const deviceDir = path.join(
      screenshotDir,
      device.replace(/[()]/g, "").replace(/ /g, "-").toLowerCase(),
    );
    if (!fs.existsSync(deviceDir)) {
      fs.mkdirSync(deviceDir, { recursive: true });
    }

    console.log(chalk.yellow(`Generating screenshots for ${device}...\n`));

    // Boot the simulator if needed
    console.log(`Booting ${device} simulator...`);
    try {
      execSync(`xcrun simctl boot "${device}"`, { stdio: "inherit" });
    } catch (error) {
      console.log(chalk.red(`Error booting simulator: ${error.message}`));
    }

    // Wait for boot to complete
    console.log("Waiting for simulator to complete boot...");
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Generate screenshots for each screen
    for (const screen of SCREENSHOT_SCREENS) {
      console.log(`Taking screenshot of ${screen.name}...`);

      // Open to specific screen using deep linking
      if (screen.route) {
        try {
          execSync(`xcrun simctl openurl booted "lyoapp://${screen.route}"`, {
            stdio: "inherit",
          });
          // Wait for screen transition
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          console.log(
            chalk.red(`Error navigating to screen: ${error.message}`),
          );
        }
      }

      // Take screenshot
      try {
        const filename = `${screen.name.toLowerCase().replace(/ /g, "-")}.png`;
        execSync(
          `xcrun simctl io booted screenshot "${path.join(deviceDir, filename)}"`,
          { stdio: "inherit" },
        );
        console.log(chalk.green(`✓ Screenshot saved: ${filename}`));
      } catch (error) {
        console.log(chalk.red(`Error taking screenshot: ${error.message}`));
      }

      // Wait before next action
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Shut down the simulator
    console.log(`Shutting down ${device} simulator...`);
    try {
      execSync(`xcrun simctl shutdown booted`, { stdio: "inherit" });
    } catch (error) {
      console.log(chalk.red(`Error shutting down simulator: ${error.message}`));
    }

    console.log(chalk.green(`✓ Completed screenshots for ${device}\n`));
  }

  console.log(chalk.green.bold("All screenshots generated successfully!"));
  console.log(`Screenshots saved to: ${screenshotDir}\n`);
  console.log(chalk.blue("Next steps:"));
  console.log("1. Review the screenshots");
  console.log("2. Edit them if needed with marketing text");
  console.log("3. Upload them to App Store Connect");
}

// Run the main function
generateScreenshots().catch((error) => {
  console.error(chalk.red("\nError generating screenshots:", error));
  process.exit(1);
});
