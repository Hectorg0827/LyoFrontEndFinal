// App Store description generator
/**
 * This script generates the App Store description for Lyo in various lengths
 * and formats as needed for App Store submission
 */

// App Information
const appInfo = {
  name: "Lyo",
  tagline: "AI-powered learning companion",
  version: "1.0.0",

  // Basic description - limit of 4000 characters for App Store
  description: `
Lyo: Your AI-Powered Learning Companion

Lyo transforms how you learn with a personalized AI assistant that adapts to your unique learning style. Featuring AI-generated courses, an interactive avatar, and a vibrant social learning community, Lyo makes education engaging, effective, and tailored just for you.

KEY FEATURES:

• PERSONALIZED AI LEARNING
Lyo analyzes your learning preferences, strengths, and areas for improvement to create custom learning paths. The more you use Lyo, the smarter and more personalized it becomes.

• INTERACTIVE AI COMPANION
Meet your AI learning assistant that answers questions, provides explanations, offers encouragement, and helps you stay on track with your learning goals.

• DYNAMIC COURSE GENERATION
Access AI-generated courses on virtually any topic. Lyo can create lessons, quizzes, and practical exercises tailored to your knowledge level and learning goals.

• SOCIAL LEARNING EXPERIENCE
Connect with a community of learners who share your interests. Join study groups, participate in discussions, and collaborate on projects.

• PROGRESS TRACKING
Monitor your learning journey with detailed analytics and insights. See your strengths, areas for improvement, and track your progress over time.

• LEARNING REMINDERS
Set personalized study reminders to maintain consistent learning habits and achieve your educational goals.

• OFFLINE ACCESS
Download courses and materials for learning on the go, even without an internet connection.

• ACCESSIBLE DESIGN
Lyo is designed to be accessible for users of all abilities with customizable interfaces and support for various accessibility features.

Whether you're learning a new language, developing professional skills, exploring academic subjects, or pursuing a personal interest, Lyo adapts to your unique needs and helps you achieve your learning goals.

Download Lyo today and transform how you learn with the power of AI.
`,

  // Keywords - 100 character limit
  keywords:
    "AI learning, education app, personal tutor, learning assistant, courses, educational, study tools, AI companion",

  // Support URL
  supportUrl: "https://lyo.app/support",

  // Marketing URL
  marketingUrl: "https://lyo.app",

  // Privacy Policy URL
  privacyPolicyUrl: "https://lyo.app/privacy",

  // Categories
  primaryCategory: "Education",
  secondaryCategory: "Productivity",

  // Age Rating
  ageRating: "4+",

  // Promotional text (can be changed without app update) - 170 character limit
  promotionalText:
    "Discover our new AI Classroom feature! Get personalized learning experiences with our improved AI assistant that adapts to your unique learning style.",

  // App Store Connect information
  appStoreConnect: {
    appleID: "123456789",
    SKU: "com.lyo.app",
    appReviewInformation: {
      firstName: "App",
      lastName: "Reviewer",
      phone: "+1 (555) 123-4567",
      email: "app-review@lyo.app",
      notes: `
This app uses AI to generate learning content and features an AI assistant.

Login credentials:
Email: reviewer@example.com
Password: Test1234!

Demo mode can be accessed without login by tapping "Try Demo" on the login screen.
      `.trim(),
    },
  },
};

// Generate short description (30 characters)
const shortDescription = "AI-powered learning companion";

// Generate medium description (80 characters)
const mediumDescription =
  "Learn anything with your personalized AI assistant and interactive courses";

// Format the app store description
const formatAppStoreDescription = () => {
  console.log("===== FORMATTED APP STORE DESCRIPTION =====\n");
  console.log(`APP NAME: ${appInfo.name}`);
  console.log(`TAGLINE: ${appInfo.tagline}`);
  console.log("\nDESCRIPTION:");
  console.log(appInfo.description.trim());
  console.log(`\nCharacter count: ${appInfo.description.trim().length}/4000`);
  console.log("\nKEYWORDS:");
  console.log(appInfo.keywords);
  console.log(`Character count: ${appInfo.keywords.length}/100`);
  console.log("\nPROMOTIONAL TEXT:");
  console.log(appInfo.promotionalText);
  console.log(`Character count: ${appInfo.promotionalText.length}/170`);
  console.log("\nSHORT DESCRIPTION (30 chars):");
  console.log(shortDescription);
  console.log("\nMEDIUM DESCRIPTION (80 chars):");
  console.log(mediumDescription);
  console.log("\nSUPPORT URL:", appInfo.supportUrl);
  console.log("MARKETING URL:", appInfo.marketingUrl);
  console.log("PRIVACY POLICY URL:", appInfo.privacyPolicyUrl);
  console.log("\nPRIMARY CATEGORY:", appInfo.primaryCategory);
  console.log("SECONDARY CATEGORY:", appInfo.secondaryCategory);
  console.log("AGE RATING:", appInfo.ageRating);
  console.log("\n=== APP REVIEW INFORMATION ===");
  console.log(
    "CONTACT:",
    `${appInfo.appStoreConnect.appReviewInformation.firstName} ${appInfo.appStoreConnect.appReviewInformation.lastName}`,
  );
  console.log("EMAIL:", appInfo.appStoreConnect.appReviewInformation.email);
  console.log("PHONE:", appInfo.appStoreConnect.appReviewInformation.phone);
  console.log("\nREVIEW NOTES:");
  console.log(appInfo.appStoreConnect.appReviewInformation.notes);
};

// Output the formatted description
formatAppStoreDescription();

// Export the data for use in other scripts if needed
module.exports = {
  appInfo,
  shortDescription,
  mediumDescription,
};
