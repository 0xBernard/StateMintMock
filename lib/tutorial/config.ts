import { type Route } from 'next';
import { TutorialStep } from './types';

// Update the default configuration for all steps to never show previous buttons
const defaultStepConfig = {
  showPreviousButton: false,
};

export const tutorialSteps: TutorialStep[] = [
  {
    ...defaultStepConfig,
    id: 'welcome-on-marketplace',
    title: 'Welcome to StateMint!',
    content: 'Welcome to StateMint! This is where you can browse and invest in fractionalized collectibles.',
    targetElementSelector: 'body',
    promptPlacement: 'center',
    isModal: true,
    showNextButton: true,
    highlightPadding: 0,
    action: {
      type: 'click',
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true,
    },
    onBeforeStep: async () => new Promise((resolve) => setTimeout(resolve, 500)),
  },
  {
    ...defaultStepConfig,
    id: 'login-prompt',
    title: 'Login Required',
    content: "Click the 'Login' button in the header to open the login dialog.",
    mobileContent: "Click the 'Login' button in the portfolio card above to sign in.",
    targetElementSelector: '[data-tutorial-id="header-login-button"]',
    mobileTargetSelector: '[data-tutorial-id="marketplace-portfolio-login-button"]',
    promptPlacement: 'bottom-end',
    mobilePromptPlacement: 'bottom',
    isModal: true,
    highlightPadding: 12,
    showNextButton: false,
    waitForElement: true,
    action: {
      type: 'click',
      autoAdvance: true,
      preventBubbling: false,
    },
    onBeforeStep: async () => {
      console.log('Setting up login step');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return new Promise(resolve => {
        // Check for the appropriate login button based on viewport
        const isMobile = window.innerWidth < 1024;
        const selector = isMobile 
          ? '[data-tutorial-id="marketplace-portfolio-login-button"]'
          : '[data-tutorial-id="header-login-button"]';
        
        const checkElement = () => {
          const loginButton = document.querySelector(selector);
          if (loginButton) {
            console.log(`Login button found (${isMobile ? 'mobile' : 'desktop'}), proceeding with tutorial`);
            resolve();
          } else {
            console.log(`Login button not found (${isMobile ? 'mobile' : 'desktop'}), waiting...`);
            setTimeout(checkElement, 300);
          }
        };
        checkElement();
      });
    },
    onAfterStep: async () => {
      console.log('Login step completed');
      return new Promise(resolve => setTimeout(resolve, 300));
    }
  },
  {
    ...defaultStepConfig,
    id: 'login-completion',
    title: "Successfully Logged In",
    content: "Great! You're now logged in as Nathan. You can see your profile in the top right.",
    targetElementSelector: 'body',
    promptPlacement: 'center',
    isModal: true,
    useTransparentOverlay: true,
    showNextButton: true,
    highlightPadding: 0,
    action: {
      type: 'click',
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: false
    },
    onBeforeStep: async () => {
      console.log('Login completion step');
      return new Promise(resolve => setTimeout(resolve, 500));
    }
  },
  {
    ...defaultStepConfig,
    id: 'portfolio-navigation',
    title: "Portfolio Next",
    content: "Let's check out your portfolio. Click on 'My Portfolio' in the sidebar.",
    targetElementSelector: '[data-tutorial-id="portfolio-link"]',
    promptPlacement: 'right',
    isModal: true,
    useTransparentOverlay: false,
    showNextButton: false,
    waitForElement: true,
    action: {
      type: 'navigation',
      navigationPath: '/portfolio',
      autoAdvance: true,
    },
    onAfterStep: async () => new Promise((resolve) => setTimeout(resolve, 500)),
  },
  {
    ...defaultStepConfig,
    id: 'portfolio-overview',
    title: "Your Portfolio",
    content: "This is your portfolio. Here you can see the assets you own and manage your funds. We've started you out with a few coins for this tutorial.",
    targetElementSelector: '[data-tutorial-id="portfolio-coin-list-section"]',
    promptPlacement: 'left',
    isModal: false,
    useTransparentOverlay: false,
    showNextButton: true,
    highlightPadding: 20,
    waitForElement: true,
    action: { 
      type: 'click', 
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true,
    },
    onBeforeStep: async () => new Promise((resolve) => setTimeout(resolve, 300)),
  },
  {
    ...defaultStepConfig,
    id: 'portfolio-stats-summary-highlight',
    title: "Portfolio Snapshot",
    content: "At the top of the page, you can see your total portfolio value, unrealized profit/loss, and the number of unique coins you hold.",
    targetElementSelector: '[data-tutorial-id="portfolio-stats-summary"]',
    promptPlacement: 'left',
    isModal: true,
    useTransparentOverlay: true,
    showNextButton: true,
    highlightPadding: 10,
    waitForElement: true,
    action: { 
      type: 'click', 
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true,
    },
    onBeforeStep: async () => new Promise((resolve) => setTimeout(resolve, 300)),
  },
  {
    ...defaultStepConfig,
    id: 'add-funds-button',
    title: "Adding Funds",
    content: "We're about to open the 'Add Funds' dialog. Click Next to proceed.",
    targetElementSelector: '[data-tutorial-id="add-funds-button"]', 
    promptPlacement: 'right',
    isModal: false,
    useTransparentOverlay: false,
    showNextButton: true, 
    highlightPadding: 8,
    waitForElement: true,
    action: {
      type: 'click', 
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true,
    },
    onAfterStep: async () => {
      console.log('[Tutorial Config] add-funds-button: onAfterStep triggered.');
      const addFundsButtonInUI = document.querySelector('[data-tutorial-id="add-funds-button"]') as HTMLElement;
      if (addFundsButtonInUI) {
        console.log('[Tutorial Config] add-funds-button: Programmatically clicking UI add-funds-button.');
        addFundsButtonInUI.click();
      } else {
        console.error('[Tutorial Config] add-funds-button: Could not find UI add-funds-button to click.');
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    },
  },
  {
    ...defaultStepConfig,
    id: 'add-funds-dialog-opened',
    title: "Fund Your Account",
    content: "The Add Funds dialog is open. For this tutorial, we've pre-filled $5000 and selected a payment method. Please click the 'Deposit $5000.00' button in the dialog to continue.", 
    targetElementSelector: '[data-tutorial-id="portfolio-main-content-area"]',
    promptPlacement: 'left',
    isModal: true,
    useTransparentOverlay: false,
    highlightPadding: 0,
    showNextButton: false,
    waitForElement: true, 
    action: {
      type: 'click',
      selector: '[data-tutorial-id="confirm-deposit"]',
      autoAdvance: true, 
      preventBubbling: false
    },
    onBeforeStep: async () => {
      console.log('[Tutorial Config] add-funds-dialog-opened: onBeforeStep, waiting for auto-fill and dialog to settle.');
      await new Promise(resolve => setTimeout(resolve, 400));
    },
  },
  {
    ...defaultStepConfig,
    id: 'deposit-confirmation',
    title: "Deposit Successful! ✅",
    content: "Great! Your funds have been added successfully. Notice your balance has increased by $5000. Click Next to continue.",
    targetElementSelector: 'body',
    promptPlacement: 'center',
    isModal: true,
    showNextButton: true,
    highlightPadding: 0,
    action: {
      type: 'click',
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true
    },
    onBeforeStep: async () => {
      console.log("Showing deposit confirmation dialog with increased delay");
      return new Promise(resolve => setTimeout(resolve, 2000));
    },
  },
  {
    ...defaultStepConfig,
    id: 'post-deposit-marketplace-prompt',
    title: 'To the Marketplace!',
    content: "Now that you have more funds in your account, let's head to the marketplace and buy some new shares. Click the 'Marketplace' link in the sidebar.",
    targetElementSelector: '[data-tutorial-id="marketplace-link"]',
    promptPlacement: 'right',
    isModal: true,
    showNextButton: false,
    highlightPadding: 8,
    waitForElement: true,
    action: {
      type: 'navigation',
      navigationPath: '/marketplace',
      autoAdvance: true,
    },
    onBeforeStep: async () => new Promise((resolve) => setTimeout(resolve, 500)),
  },
  {
    ...defaultStepConfig,
    id: 'marketplace-pick-coin',
    title: 'Explore the Marketplace',
    content: 'Welcome to the marketplace! Click on any coin to see its details.',
    targetElementSelector: '[data-tutorial-id="marketplace-coin-list-container"]',
    promptPlacement: 'center',
    isModal: true,
    useTransparentOverlay: true,
    highlightPadding: 0,
    showNextButton: false,
    waitForElement: true,
    action: {
      type: 'click',
      autoAdvance: true,
    },
    onBeforeStep: async () => {
      if (typeof window !== 'undefined' && window.location.pathname !== '/marketplace') {
        window.location.href = '/marketplace' as Route;
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      return new Promise(resolve => {
        const checkElements = () => {
          if (document.querySelector('[data-tutorial-id="marketplace-coin-list-container"]')) {
            resolve();
          } else {
            setTimeout(checkElements, 300);
          }
        };
        checkElements();
      });
    },
    onAfterStep: async () => new Promise((resolve) => setTimeout(resolve, 1000)),
  },
  {
    ...defaultStepConfig,
    id: 'coin-detail-overview',
    title: 'Coin Details',
    content: 'This is the coin detail page. First, let\'s look at the Order Book. Click Next.',
    targetElementSelector: '[data-tutorial-id="coin-detail-page-container"]',
    promptPlacement: 'top',
    isModal: true,
    useTransparentOverlay: true,
    showNextButton: true,
    highlightPadding: 10,
    waitForElement: true,
    action: {
      type: 'click',
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true,
    },
    onBeforeStep: async () => new Promise((resolve) => setTimeout(resolve, 500)),
    onAfterStep: async () => {
      const tabButton = document.querySelector<HTMLElement>('[data-tutorial-id="order-book-tab-button"]');
      if (tabButton) {
        console.log('[Tutorial] coin-detail-overview: Clicking Order Book tab.');
        tabButton.click();
      } else {
        console.error('[Tutorial] coin-detail-overview: Order Book tab button not found.');
      }
      return new Promise((resolve) => setTimeout(resolve, 700)); // Allow time for tab switch and next step
    }
  },
  {
    ...defaultStepConfig,
    id: 'coin-detail-order-book-explanation',
    title: 'Order Book Content',
    content: 'This is the Order Book. Review the available shares and prices. Click Next to learn about the coin\'s specific details.',
    targetElementSelector: '[data-tutorial-id="order-book-content-area"]',
    promptPlacement: 'right',
    isModal: true,
    useTransparentOverlay: true,
    showNextButton: true,
    highlightPadding: 10,
    waitForElement: true,
    action: {
      type: 'click',
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true,
    },
    onBeforeStep: async () => {
      const tabButton = document.querySelector<HTMLElement>('[data-tutorial-id="order-book-tab-button"]');
      if (tabButton && tabButton.dataset.state !== 'active') {
        console.warn('[Tutorial] coin-detail-order-book-explanation: Order Book tab was not active. Clicking it.');
        tabButton.click();
        await new Promise((resolve) => setTimeout(resolve, 300));
      } else if (!tabButton) {
         console.error('[Tutorial] coin-detail-order-book-explanation: Order Book tab button not found.');
      }
      console.log('[Tutorial] coin-detail-order-book-explanation: onBeforeStep complete.');
      return new Promise((resolve) => setTimeout(resolve, 300));
    },
    onAfterStep: async () => {
      const tabButton = document.querySelector<HTMLElement>('[data-tutorial-id="details-tab-button"]');
      if (tabButton) {
        console.log('[Tutorial] coin-detail-order-book-explanation: Clicking Details tab.');
        tabButton.click();
      } else {
        console.error('[Tutorial] coin-detail-order-book-explanation: Details tab button not found.');
      }
      return new Promise((resolve) => setTimeout(resolve, 700));
    }
  },
  {
    ...defaultStepConfig,
    id: 'coin-detail-details-explanation',
    title: 'Coin Specifics',
    content: 'This section provides specific details about the coin. Click Next to view its sale history.',
    targetElementSelector: '[data-tutorial-id="details-content-area"]',
    promptPlacement: 'right',
    isModal: true,
    useTransparentOverlay: true,
    showNextButton: true,
    highlightPadding: 10,
    waitForElement: true,
    action: {
      type: 'click',
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true,
    },
    onBeforeStep: async () => {
      const tabButton = document.querySelector<HTMLElement>('[data-tutorial-id="details-tab-button"]');
      if (tabButton && tabButton.dataset.state !== 'active') {
        console.warn('[Tutorial] coin-detail-details-explanation: Details tab was not active. Clicking it.');
        tabButton.click();
        await new Promise((resolve) => setTimeout(resolve, 300));
      } else if (!tabButton) {
         console.error('[Tutorial] coin-detail-details-explanation: Details tab button not found.');
      }
      console.log('[Tutorial] coin-detail-details-explanation: onBeforeStep complete.');
      return new Promise((resolve) => setTimeout(resolve, 300));
    },
    onAfterStep: async () => {
      const tabButton = document.querySelector<HTMLElement>('[data-tutorial-id="history-tab-button"]');
      if (tabButton) {
        console.log('[Tutorial] coin-detail-details-explanation: Clicking History tab.');
        tabButton.click();
      } else {
        console.error('[Tutorial] coin-detail-details-explanation: History tab button not found.');
      }
      return new Promise((resolve) => setTimeout(resolve, 700));
    }
  },
  {
    ...defaultStepConfig,
    id: 'coin-detail-sale-history-explanation',
    title: 'Sale History',
    content: 'Here you can see the coin\'s past sales. Click Next to continue making your purchase.',
    targetElementSelector: '[data-tutorial-id="history-content-area"]',
    promptPlacement: 'right',
    isModal: true,
    useTransparentOverlay: true,
    showNextButton: true,
    highlightPadding: 10,
    waitForElement: true,
    action: {
      type: 'click',
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true,
    },
    onBeforeStep: async () => {
      const tabButton = document.querySelector<HTMLElement>('[data-tutorial-id="history-tab-button"]');
      if (tabButton && tabButton.dataset.state !== 'active') {
        console.warn('[Tutorial] coin-detail-sale-history-explanation: History tab was not active. Clicking it.');
        tabButton.click();
        await new Promise((resolve) => setTimeout(resolve, 300));
      } else if (!tabButton) {
         console.error('[Tutorial] coin-detail-sale-history-explanation: History tab button not found.');
      }
      console.log('[Tutorial] coin-detail-sale-history-explanation: onBeforeStep complete.');
      return new Promise((resolve) => setTimeout(resolve, 300));
    },
    onAfterStep: async () => {
      console.log('[Tutorial] coin-detail-sale-history-explanation: onAfterStep complete.');
      return new Promise((resolve) => setTimeout(resolve, 500)); // Proceed to next step in array (purchase-prompt)
    }
  },
  {
    ...defaultStepConfig,
    id: 'purchase-prompt',
    title: 'Make a Purchase',
    content: 'Now, let\'s buy some shares. Also set your target sale price. Placeholder for purchase prompt content.',
    targetElementSelector: '[data-tutorial-id="buy-widget-container"]',
    promptPlacement: 'top',
    isModal: true,
    useTransparentOverlay: true,
    showNextButton: false,
    highlightPadding: 10,
    waitForElement: true,
    action: {
      type: 'click',
      selector: '[data-tutorial-id="confirm-purchase-button"]',
      autoAdvance: true,
    },
    onBeforeStep: async () => new Promise((resolve) => setTimeout(resolve, 500)),
    onAfterStep: async () => new Promise((resolve) => setTimeout(resolve, 1000)),
  },
  {
    ...defaultStepConfig,
    id: 'purchase-complete-prompt',
    title: 'Purchase Successful!',
    content: 'Great! You\'ve successfully purchased shares. Click Next to go back to your portfolio.',
    targetElementSelector: 'body',
    promptPlacement: 'center',
    isModal: true,
    showNextButton: true,
    highlightPadding: 0,
    action: {
      type: 'click',
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true, 
    },
     onBeforeStep: async () => new Promise((resolve) => setTimeout(resolve, 500)),
    onAfterStep: async () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/portfolio' as Route;
      }
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
  },
  {
    ...defaultStepConfig,
    id: 'final-portfolio-return',
    title: 'Back to Your Portfolio',
    content: 'You are now back in your portfolio. You can see your new investment here. This concludes the tutorial!',
    targetElementSelector: '[data-tutorial-id="portfolio-overview-section"]',
    promptPlacement: 'center',
    isModal: true,
    showNextButton: true,
    highlightPadding: 0,
    waitForElement: true,
    action: {
      type: 'click',
      selector: '[data-tutorial-id="prompt-next-button"]',
      autoAdvance: true,
    },
    onBeforeStep: async () => {
      if (typeof window !== 'undefined' && window.location.pathname !== '/portfolio') {
        window.location.href = '/portfolio' as Route;
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      return new Promise((resolve) => setTimeout(resolve, 500));
    },
    onAfterStep: async () => {
      // Tutorial will automatically complete when this step finishes
      // No need to manually call stopTutorial in the new system
      return new Promise((resolve) => setTimeout(resolve, 500));
    }
  },
]; 