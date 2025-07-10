import { type Route } from 'next';
import { TutorialStep, ZIndexOverride } from './types';
import { Work_Sans } from 'next/font/google';

// Enhanced tutorial steps with z-index management
export const enhancedTutorialSteps: TutorialStep[] = [
  {
    id: 'welcome-on-marketplace',
    title: 'Welcome to StateMint!',
    content: 'Welcome to StateMint! We are going to walk you through the site, and purchasing a coin.',
    targetElementSelector: 'body',
    promptPlacement: 'center',
    isModal: true,
    overlayType: 'dark',
    showNextButton: true,
    showPreviousButton: false,
    onBeforeShow: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  },
  {
    id: 'login-prompt',
    title: 'Login Required',
    content: "Click the 'Login' button in the header to open the login dialog.",
    mobileContent: "Tap the 'Login' button in the portfolio card below to get started.",
    targetElementSelector: '[data-tutorial-id="header-login-button"]',
    mobileTargetSelector: '[data-tutorial-id="marketplace-portfolio-login-button"]',
    promptPlacement: 'bottom-end',
    mobilePromptPlacement: 'bottom',
    isModal: false,
    overlayType: 'spotlight',
    spotlightPadding: 12,
    mobileSpotlightPadding: 16,
    showNextButton: false,
    showPreviousButton: false,
    waitForElement: true,
    zIndexOverrides: [
      {
        selector: '[data-tutorial-id="header-login-button"]',
        zIndex: 10000,
        createStackingContext: true
      },
      {
        selector: '[data-tutorial-id="marketplace-portfolio-login-button"]',
        zIndex: 10000,
        createStackingContext: true
      },
      {
        selector: 'header, nav',
        zIndex: 9999,
        createStackingContext: true
      }
    ],
    action: {
      type: 'click',
      selector: '[data-tutorial-id="header-login-button"]',
      mobileSelector: '[data-tutorial-id="marketplace-portfolio-login-button"]',
      autoAdvance: true,
      preventBubbling: false,
    },
    onBeforeStep: async () => {
      console.log('Setting up login step');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return new Promise<void>(resolve => {
        const checkElement = () => {
          const loginButton = document.querySelector('[data-tutorial-id="header-login-button"]');
          const mobileLoginButton = document.querySelector('[data-tutorial-id="marketplace-portfolio-login-button"]');
          if (loginButton || mobileLoginButton) {
            console.log('Login button found (desktop or mobile), proceeding with tutorial');
            resolve();
          } else {
            console.log('Login button not found, waiting...');
            setTimeout(checkElement, 300);
          }
        };
        checkElement();
      });
    },
    onAfterStep: async () => {
      console.log('Login step completed, advancement handled by login dialog');
      // The login dialog will advance the step directly when login completes
      // This is just a fallback in case the dialog doesn't advance for some reason
      return new Promise<void>(resolve => {
        setTimeout(() => {
          console.log('Login step onAfterStep fallback completed');
          resolve();
        }, 100);
      });
    }
  },
  {
    id: 'google-login-button',
    title: "Sign In with Google",
    content: "Perfect! The login dialog is now open. Click the 'Continue with Google' button to sign in and start trading.",
    targetElementSelector: '[data-tutorial-id="google-oauth-button"]',
    promptPlacement: 'bottom',
    mobilePromptPlacement: 'bottom',
    isModal: false,
    overlayType: 'spotlight',
    spotlightPadding: 8,
    mobileSpotlightPadding: 8,
    showNextButton: false,
    showPreviousButton: false,
    waitForElement: true,
    action: {
      type: 'click',
      selector: '[data-tutorial-id="google-oauth-button"]',
      autoAdvance: true,
      preventBubbling: false,
    },
    onBeforeStep: async () => {
      console.log('Setting up Google login button step, waiting for dialog to be ready');
      // No initial delay - immediately check for elements
      return new Promise<void>(resolve => {
        const checkElement = () => {
          const googleButton = document.querySelector('[data-tutorial-id="google-oauth-button"]');
          const loginDialog = document.querySelector('[data-tutorial-id="login-dialog"]');
          if (googleButton && loginDialog) {
            console.log('Google login button and dialog found, proceeding with tutorial');
            resolve();
          } else {
            console.log('Google login button or dialog not found, waiting...', { googleButton: !!googleButton, loginDialog: !!loginDialog });
            setTimeout(checkElement, 50); // Faster polling - check every 50ms
          }
        };
        checkElement();
      });
    },
    onAfterStep: async () => {
      console.log('Google login button clicked, login process should begin');
      // The login dialog will handle the actual login and advancement
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  },
  {
    id: 'login-completion',
    title: "Successfully Logged In!",
    content: "We use account abstraction to hide away the complexity of wallets. If you have your own wallet, you'll be able to connect it instead.",
    targetElementSelector: 'body',
    promptPlacement: 'center',
    isModal: true,
    overlayType: 'transparent',
    showNextButton: true,
    showPreviousButton: false,
    onBeforeStep: async () => {
      console.log('Showing login completion step');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  },
  {
    id: 'portfolio-navigation',
    title: "Visit Your Portfolio",
    content: "Perfect! You're now logged in. Let's check out your portfolio. Click on 'My Portfolio' in the sidebar.",
    targetElementSelector: '[data-tutorial-id="portfolio-link"]',
    mobileTargetSelector: '[data-tutorial-id="mobile-portfolio-widget"]',
    mobileContent: "Perfect! You're now logged in. Let's check out your portfolio. Tap on your portfolio card below to view your investments.",
    promptPlacement: 'right',
    mobilePromptPlacement: 'bottom',
    isModal: false,
    overlayType: 'spotlight',
    spotlightPadding: 8,
    mobileSpotlightPadding: 16,
    showNextButton: false,
    showPreviousButton: false,
    waitForElement: true,
    zIndexOverrides: [
      {
        selector: '[data-tutorial-id="portfolio-link"]',
        zIndex: 3002, // Above tutorial prompts (3001) to ensure it's highlighted properly
        createStackingContext: true
      },
      {
        selector: '[data-tutorial-id="mobile-portfolio-widget"]',
        zIndex: 3002, // Above tutorial prompts (3001) to ensure it's highlighted properly
        createStackingContext: true
      }
    ],
    action: {
      type: 'navigation',
      navigationPath: '/portfolio',
      autoAdvance: true,
    },
    onBeforeStep: async () => {
      console.log('Setting up portfolio navigation step');
      await new Promise(resolve => setTimeout(resolve, 500));
      return new Promise<void>(resolve => {
        const checkElement = () => {
          const portfolioLink = document.querySelector('[data-tutorial-id="portfolio-link"]');
          const mobilePortfolioWidget = document.querySelector('[data-tutorial-id="mobile-portfolio-widget"]');
          
          if (portfolioLink || mobilePortfolioWidget) {
            console.log('Portfolio element found (desktop or mobile), proceeding with tutorial');
            resolve();
          } else {
            console.log('Portfolio element not found, waiting...');
            setTimeout(checkElement, 300);
          }
        };
        checkElement();
      });
    },
    onAfterStep: async () => {
      // Simple approach like the old config - just wait and let navigation happen naturally
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  },
  {
    id: 'portfolio-overview',
    title: "Your Portfolio",
    content: "This is your portfolio. Here you can see the assets you own and manage your funds. We've started you out with a few coins for this tutorial.",
    mobileContent: "Your portfolio shows your coin investments. Click Next to continue.",
    targetElementSelector: '[data-tutorial-id="portfolio-coin-list-section"]',
    promptPlacement: 'top',
    mobilePromptPlacement: 'bottom',
    isModal: false,
    overlayType: 'spotlight',
    showNextButton: true,
    showPreviousButton: false,
    spotlightPadding: 12,
    mobileSpotlightPadding: 8,
    waitForElement: true,
    zIndexOverrides: [
      {
        selector: '[data-tutorial-id="portfolio-coin-list-section"]',
        zIndex: 3002, // Above tutorial prompts (3001) to ensure it's highlighted properly
        createStackingContext: false
      }
    ],
    action: { 
      type: 'click', 
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true,
    },
    onBeforeStep: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    },
  },
  {
    id: 'portfolio-stats-summary-highlight',
    title: "Portfolio Snapshot",
    content: "At the top of the page, you can see your total portfolio value, unrealized profit/loss, and the number of unique coins you hold.",
    targetElementSelector: '[data-tutorial-id="portfolio-stats-summary"]',
    promptPlacement: 'bottom',
    mobilePromptPlacement: 'bottom',
    isModal: false,
    overlayType: 'spotlight',
    showNextButton: true,
    showPreviousButton: false,
    spotlightPadding: 10,
    mobileSpotlightPadding: 14,
    waitForElement: true,
    zIndexOverrides: [
      {
        selector: '[data-tutorial-id="portfolio-stats-summary"]',
        zIndex: 3002, // Above tutorial prompts (3001) to ensure it's highlighted properly
        createStackingContext: true
      }
    ],
    action: { 
      type: 'click', 
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true,
    },
    onBeforeStep: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
    },
  },
  {
    id: 'add-funds-button',
    title: "Adding Funds",
    content: "Click the 'Add Funds' button in the sidebar to open the funding dialog and add money to your account.",
    mobileContent: "Tap the 'Add Funds' button in the top right to add money to your portfolio.",
    targetElementSelector: '[data-tutorial-id="add-funds-button"]',
    mobileTargetSelector: '[data-tutorial-id="mobile-add-funds-button"]',
    promptPlacement: 'right',
    mobilePromptPlacement: 'bottom',
    isModal: false,
    overlayType: 'spotlight',
    showNextButton: false,
    showPreviousButton: false,
    spotlightPadding: 12,
    mobileSpotlightPadding: 12,
    waitForElement: true,
    zIndexOverrides: [
      {
        selector: '[data-tutorial-id="add-funds-button"]',
        zIndex: 2001, // Above backdrop (1000) and dialogs (2000), below prompts (3000)
        createStackingContext: true
      },
      {
        selector: '[data-tutorial-id="mobile-add-funds-button"]',
        zIndex: 2001, // Above backdrop (1000) and dialogs (2000), below prompts (3000)
        createStackingContext: true
      },
      {
        selector: '.sidebar, aside',
        zIndex: 1001, // Slightly above backdrop to ensure sidebar is visible
        createStackingContext: true
      }
    ],
    // No action - let the user click the button naturally
    onBeforeStep: async () => {
      console.log('[Tutorial Config] add-funds-button: onBeforeStep - waiting for button to be ready.');
      await new Promise(resolve => setTimeout(resolve, 500));
    },
  },
  {
    id: 'select-payment-method',
    title: "Choose Payment Method",
    content: "Great! Now select a payment method from the options above. Credit card is fastest for this tutorial.",
    mobileContent: "Great! Select a payment method below. Credit card is fastest for this tutorial.",
    targetElementSelector: '[data-tutorial-id="add-funds-dialog"]',
    promptPlacement: 'bottom-start',
    mobilePromptPlacement: 'top',
    isModal: false,
    overlayType: 'spotlight',
    showNextButton: false,
    showPreviousButton: false,
    spotlightPadding: 16,
    mobileSpotlightPadding: 8,
    waitForElement: true,
    zIndexOverrides: [
      {
        selector: '[data-tutorial-id="add-funds-dialog"]',
        zIndex: 2500, // Above backdrop (1000) and dialogs (2000), below prompts (3000)
        createStackingContext: true
      },

      {
        selector: '[data-slot="dialog-content"]',
        zIndex: 2500, // Above backdrop (1000) and dialogs (2000), below prompts (3000)
        createStackingContext: true
      },
      {
        selector: '[data-slot="dialog-overlay"]',
        zIndex: 2499, // Just below the dialog content
        createStackingContext: true
      }
    ],
    onBeforeStep: async () => {
      console.log('[Tutorial Config] select-payment-method: onBeforeStep - waiting for dialog to be ready.');
      await new Promise(resolve => setTimeout(resolve, 300));
    },
  },
  {
    id: 'add-funds-dialog-opened',
    title: "Enter Amount & Deposit",
    content: "Perfect! Now enter your deposit amount (try $1000 or use a quick amount button) and click the 'Deposit' button to continue.",
    mobileContent: "Perfect! Enter your deposit amount (try $1000 or tap a quick amount) and tap 'Deposit' to continue.",
    targetElementSelector: '[data-tutorial-id="add-funds-dialog"]',
    promptPlacement: 'right',
    mobilePromptPlacement: 'top',
    isModal: false,
    overlayType: 'spotlight',
    showNextButton: false,
    showPreviousButton: false,
    spotlightPadding: 12,
    mobileSpotlightPadding: 8,
    waitForElement: true,
    zIndexOverrides: [
      {
        selector: '[data-tutorial-id="add-funds-dialog"]',
        zIndex: 2500, // Above backdrop (1000) and dialogs (2000), below prompts (3000)
        createStackingContext: true
      },
      {
        selector: '[data-slot="dialog-content"]',
        zIndex: 2500, // Above backdrop (1000) and dialogs (2000), below prompts (3000)
        createStackingContext: true
      },
      {
        selector: '[data-slot="dialog-overlay"]',
        zIndex: 2499, // Just below the dialog content
        createStackingContext: true
      },
      {
        selector: '[data-tutorial-id="deposit-button"]',
        zIndex: 2501, // Slightly above dialog to ensure button is clickable
        createStackingContext: true
      }
    ],
    // No action - let the user interact with the dialog naturally
    onBeforeStep: async () => {
      console.log('[Tutorial Config] add-funds-dialog-opened: onBeforeStep, waiting for dialog to settle.');
      await new Promise(resolve => setTimeout(resolve, 400));
    },
  },
  {
    id: 'deposit-confirmation',
    title: "Deposit Successful! ✅",
    content: "We use Coinbase Pay to handle deposits and withdrawals to your bank. You'll be able to send USDC to your wallet as well if you'd prefer.",
    targetElementSelector: 'body',
    promptPlacement: 'center',
    isModal: true,
    overlayType: 'transparent',
    showNextButton: true,
    showPreviousButton: false,
    onBeforeStep: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  },
  {
    id: 'marketplace-navigation',
    title: "Navigate to Marketplace",
    content: "Now let's go back to the marketplace to see what collectibles are available for investment.",
    targetElementSelector: 'body',
    promptPlacement: 'center',
    isModal: true,
    overlayType: 'transparent',
    showNextButton: true,
    showPreviousButton: false,
    waitForElement: false,
    action: {
      type: 'navigation',
      navigationPath: '/marketplace',
      autoAdvance: false, // Don't auto-advance, we'll handle it manually
    },
    onBeforeStep: async () => {
      console.log('[Tutorial Config] marketplace-navigation: onBeforeStep - preparing navigation');
      await new Promise(resolve => setTimeout(resolve, 200));
    },
  },
  {
    id: 'coin-selection-prompt',
    title: "Choose a Coin to Invest In",
    content: "Great! Now you're back at the marketplace. Click on any coin card to view its details and make an investment.",
    targetElementSelector: '[data-tutorial-id="marketplace-coin-list-container"]',
    promptPlacement: 'top',
    mobilePromptPlacement: 'bottom',
    isModal: false,
    overlayType: 'spotlight',
    showNextButton: false,
    showPreviousButton: false,
    spotlightPadding: 20,
    mobileSpotlightPadding: 24,
    waitForElement: true,
    zIndexOverrides: [
      {
        selector: '[data-tutorial-id="marketplace-coin-list-container"]',
        zIndex: 999,
        createStackingContext: true
      },
      {
        selector: '[data-tutorial-id="marketplace-coin-list-container"] .coin-card',
        zIndex: 999,
        createStackingContext: true
      }
    ],
    action: {
      type: 'navigation',
      navigationPath: '/coin/', // This will match any coin detail page
      autoAdvance: true,
    },
    onBeforeStep: async () => {
      console.log('[Tutorial Config] coin-selection-prompt: onBeforeStep - waiting for marketplace to be ready.');
      // Wait longer to ensure marketplace page is fully loaded and rendered
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
  {
    id: 'coin-detail-overview',
    title: "Coin Details Page",
    content: "Perfect! This is the coin detail page. Here you can analyze the investment opportunity. Let's start by examining the Order Book.",
    targetElementSelector: '[data-tutorial-id="order-book-content-area"]',
    promptPlacement: 'right',
    mobilePromptPlacement: 'top',
    isModal: false,
    overlayType: 'spotlight',
    showNextButton: true,
    showPreviousButton: false,
    spotlightPadding: 12,
    mobileSpotlightPadding: 16,
    waitForElement: true,
    zIndexOverrides: [
      {
        selector: '[data-tutorial-id="order-book-content-area"]',
        zIndex: 10000,
        createStackingContext: true
      }
    ],
    action: { 
      type: 'click', 
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true,
    },
    onBeforeStep: async () => {
      console.log('[Tutorial Config] coin-detail-overview: onBeforeStep - switching to order book tab.');
      
      // Click the order book tab to ensure it's active
      const orderBookTabButton = document.querySelector('[data-tutorial-id="order-book-tab-button"]');
      if (orderBookTabButton) {
        (orderBookTabButton as HTMLElement).click();
        console.log('[Tutorial Config] Clicked order book tab button');
      }
      
      // Wait for tab content to be visible and bounds to be calculated
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
  {
    id: 'coin-history-tab-highlight',
    title: "Trade History",
    content: "Here you can see the coin's previous sales history, which helps you understand its price trends and market performance.",
    targetElementSelector: '[data-tutorial-id="history-content-area"]',
    promptPlacement: 'right',
    mobilePromptPlacement: 'top',
    isModal: false,
    overlayType: 'spotlight',
    showNextButton: true,
    showPreviousButton: false,
    spotlightPadding: 12,
    mobileSpotlightPadding: 16,
    waitForElement: true,
    zIndexOverrides: [
      {
        selector: '[data-tutorial-id="history-content-area"]',
        zIndex: 10000,
        createStackingContext: true
      }
    ],
    action: { 
      type: 'click', 
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true,
    },
    onBeforeStep: async () => {
      console.log('[Tutorial Config] coin-history-tab-highlight: onBeforeStep - switching to history tab.');
      
      // Click the history tab to make content visible
      const historyTabButton = document.querySelector('[data-tutorial-id="history-tab-button"]');
      if (historyTabButton) {
        (historyTabButton as HTMLElement).click();
        console.log('[Tutorial Config] Clicked history tab button');
      }
      
      // Wait for tab content to be visible and bounds to be calculated
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
  {
    id: 'coin-details-tab-highlight',
    title: "Coin Specifications",
    content: "This section shows detailed information about the coin including its grade, rarity, and historical performance metrics.",
    targetElementSelector: '[data-tutorial-id="details-content-area"]',
    promptPlacement: 'right',
    mobilePromptPlacement: 'top',
    isModal: false,
    overlayType: 'spotlight',
    showNextButton: true,
    showPreviousButton: false,
    spotlightPadding: 12,
    mobileSpotlightPadding: 16,
    waitForElement: true,
    zIndexOverrides: [
      {
        selector: '[data-tutorial-id="details-content-area"]',
        zIndex: 10000,
        createStackingContext: true
      }
    ],
    action: { 
      type: 'click', 
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true,
    },
    onBeforeStep: async () => {
      console.log('[Tutorial Config] coin-details-tab-highlight: onBeforeStep - switching to details tab.');
      
      // Click the details tab to make content visible
      const detailsTabButton = document.querySelector('[data-tutorial-id="details-tab-button"]');
      if (detailsTabButton) {
        (detailsTabButton as HTMLElement).click();
        console.log('[Tutorial Config] Clicked details tab button');
      }
      
      // Wait for tab content to be visible and bounds to be calculated
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
  },
  {
    id: 'purchase-widget-highlight',
    title: "Make Your Investment",
    content: "Now let's make your first investment! Use this trading widget to buy some shares. Enter the number of shares you want and optionally set a future sell price, then click the buy button.",
    targetElementSelector: '[data-tutorial-id="buy-widget-container"]',
    promptPlacement: 'left',
    mobilePromptPlacement: 'top',
    isModal: false,
    overlayType: 'spotlight',
    showNextButton: false,
    showPreviousButton: false,
    spotlightPadding: 12,
    mobileSpotlightPadding: 16,
    waitForElement: true,
    zIndexOverrides: [
      {
        selector: '[data-tutorial-id="buy-widget-container"]',
        zIndex: 10000,
        createStackingContext: true
      }
    ],
    // No action - let the user interact with the purchase widget naturally
    onBeforeStep: async () => {
      console.log('[Tutorial Config] purchase-widget-highlight: onBeforeStep - waiting for purchase widget to be ready.');
      await new Promise(resolve => setTimeout(resolve, 500));
    },
  },
  {
    id: 'purchase-completion',
    title: "Investment Complete!",
    content: "Excellent! You've successfully made an investment in fractionalized collectibles. You can now see your shares in your portfolio.",
    targetElementSelector: 'body',
    promptPlacement: 'center',
    isModal: true,
    overlayType: 'transparent',
    showNextButton: true,
    showPreviousButton: false,
    onBeforeStep: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  },
  {
    id: 'tutorial-complete',
    title: "Tutorial Complete! 🎉",
    content: "Congratulations! You've completed the StateMint tutorial. You're now ready to explore and invest in fractionalized collectibles on your own.",
    targetElementSelector: 'body',
    promptPlacement: 'center',
    isModal: true,
    overlayType: 'dark',
    showNextButton: false,
    showPreviousButton: false,
    showSkipButton: true,
    onBeforeStep: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
];

// Helper function to get tutorial steps for different modes
export function getTutorialSteps(mode: 'full' | 'demo' = 'full'): TutorialStep[] {
  switch (mode) {
    case 'demo':
      // Demo mode - no actual navigation
      return enhancedTutorialSteps.map(step => ({
        ...step,
        action: step.action?.type === 'navigation' 
          ? { ...step.action, type: 'click' as const, autoAdvance: true }
          : step.action
      }));
    case 'full':
    default:
      return enhancedTutorialSteps;
  }
} 