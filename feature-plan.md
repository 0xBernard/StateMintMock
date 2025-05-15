# Feature Development Plan

This document outlines the plan for implementing the remaining features for the StateMint Mock Frontend.

## 1. Mock Authentication

**Goal:** Allow users to simulate logging in and out of the application.

**Tasks:**

*   **State Management:**
    *   Implement a simple global state (e.g., using Zustand or React Context) to manage the user's authentication status (`isAuthenticated`).
*   **Login/Logout UI:**
    *   Modify the `Header` component:
        *   Display a "Login" button if `isAuthenticated` is false.
        *   Display a "Logout" button and mock user information (e.g., "Welcome, User!") if `isAuthenticated` is true.
    *   Clicking "Login" sets `isAuthenticated` to true.
    *   Clicking "Logout" sets `isAuthenticated` to false and clears any mock user data.
*   **(Optional) Mock OAuth Popup:**
    *   Create a simple modal component (using Shadcn UI `Dialog`) that simulates an OAuth login flow.
    *   This modal could have a button like "Sign in with Google (Mock)" which, when clicked, closes the modal and sets `isAuthenticated` to true.

## 2. Portfolio Page

**Goal:** Provide a page where logged-in users can view their owned coin shares, total portfolio value, and simulate adding funds.

**Route:** `/portfolio`

**Tasks:**

*   **Page Structure (`app/portfolio/page.tsx`):**
    *   Create a new route and page component.
    *   Restrict access to authenticated users (redirect to login or show a message if not logged in).
*   **State Management for Owned Coins:**
    *   Extend the global state to store an array of owned coins (e.g., `ownedCoins: { coinId: string, shares: number, purchasePrice: number, desiredSellPrice: number }[]`).
*   **Display Portfolio:**
    *   Fetch coin data from `lib/data/coins.ts` to display details of owned coins.
    *   List each owned coin, showing:
        *   Coin Name & Image
        *   Number of Shares Owned
        *   Current Market Value of Owned Shares (shares * currentMarketPrice)
        *   Initial Investment (shares * purchasePrice)
        *   Desired Sell Price set by the user
    *   Calculate and display total portfolio value (sum of current market values of all owned shares).
    *   Display "Unrealized P/L" for each coin and the total portfolio.
*   **"Add Funds" Functionality:**
    *   Add an "Add Funds" button.
    *   Clicking this button opens a mock Coinbase Pay popup.
*   **Mock Coinbase Pay Popup:**
    *   Create a modal component (Shadcn UI `Dialog`).
    *   Simulate a payment interface (e.g., input for amount, "Confirm Deposit" button).
    *   On confirmation, show a success message (e.g., toast notification) and (optionally) update a mock "Available Balance" in the global state. This balance isn't strictly necessary for buying shares if we assume direct purchase.

## 3. Coin Detail & Purchase Page

**Goal:** Allow users to view detailed information about a specific coin, see its mock order book, and simulate purchasing shares.

**Route:** `/coin/[id]` (e.g., `/coin/1794-flowing-hair`)

**Tasks:**

*   **Page Structure (`app/coin/[id]/page.tsx`):**
    *   Create a new dynamic route and page component.
    *   Fetch details for the specific coin using the `id` parameter from `lib/data/coins.ts`.
*   **Display Coin Details:**
    *   Show all relevant information from the `CoinData` interface (name, description, image, grade, mintage, rarity, etc.).
    *   Display historical sales data if available.
*   **Display Order Book:**
    *   Use the `market.orderBook` data from the coin's details.
    *   Display "Asks" (shares available for sale at specific prices).
    *   Display "Bids" (offers to buy shares at specific prices).
    *   Clearly distinguish between original shares (from the platform) and secondary market shares (from other users, if applicable in the mock).
*   **Purchase Process (Client Component):**
    *   **Input:**
        *   Number of shares to purchase.
        *   Desired sell price (this will be added to the "asks" in the order book after purchase).
    *   **Price Calculation:**
        *   Iterate through the `asks` in the order book, starting from the lowest price.
        *   Calculate a blended price if the desired number of shares spans multiple ask levels.
        *   Display the total cost to the user.
    *   **Confirmation:**
        *   "Confirm Purchase" button.
    *   **Mock Blockchain Settlement:**
        *   On clicking "Confirm Purchase":
            *   Disable the button and show a loading state.
            *   Simulate a delay (random, e.g., 5-8 seconds) using `setTimeout`.
            *   After the delay, show a toast notification (Shadcn UI `Toast`) confirming the purchase (e.g., "Successfully purchased X shares of [Coin Name]").
    *   **State Updates:**
        *   Add the purchased shares to the user's `ownedCoins` in the global state.
        *   (Optionally, if simulating a more dynamic order book) Update the `soldShares` for the coin and potentially adjust the `asks` in the coin's market data if the purchased shares were from the initial offering. For a demo, simply adding to the user's portfolio might be sufficient.
        *   The newly set "desired sell price" by the user should ideally be reflected as a new "ask" in the order book for that coin (this might require updating the global coin data state or having a separate user-specific order book state).

## General Considerations

*   **Styling:** Use Tailwind CSS and Shadcn UI components for a consistent look and feel.
*   **Responsiveness:** Ensure all new pages and components are responsive.
*   **Error Handling:** Implement basic error handling and user feedback (e.g., toast notifications for success/failure).
*   **TypeScript:** Strictly use TypeScript for all new code.
*   **Component Structure:** Keep components small and focused. Use client components (`'use client'`) only where necessary (e.g., for interactivity and state hooks).

## Demo Flow (User Journey)

1.  User lands on the Marketplace page.
2.  User clicks "Login" in the header. (Mock login state is set).
3.  User navigates to the Marketplace and selects a coin.
4.  User is taken to the Coin Detail page (`/coin/[id]`).
5.  User reviews coin details and the order book.
6.  User enters the number of shares to buy and their desired sell price for those shares.
7.  User sees the blended purchase price and total cost.
8.  User clicks "Confirm Purchase."
9.  A loading indicator appears. After a 5-8 second simulated delay, a success toast notification appears.
10. User navigates to the Portfolio page (`/portfolio`).
11. The newly purchased coin and shares are visible in their portfolio, along with updated portfolio value.
12. (Optional) User clicks "Add Funds" on the portfolio page, sees a mock Coinbase Pay popup, and simulates adding funds. 