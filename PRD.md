# Product Requirements Document: StateMint Demo Frontend

## 1. Introduction

StateMint is a new marketplace, and this project aims to develop a demo frontend to showcase its potential user interface and key features. This frontend will be a mock site, meaning it will not connect to a live backend system but will simulate interactions and data display for demonstration purposes.

## 2. Goals

*   Provide a tangible and interactive preview of the StateMint marketplace concept.
*   Demonstrate core user flows and interface design.
*   Serve as a tool for gathering feedback and iterating on the StateMint product idea.
*   Showcase modern web development practices using Next.js, React, and Tailwind CSS.

## 3. Target Audience

*   Potential investors
*   Internal stakeholders
*   Early adopter user testers (for feedback gathering)

## 4. Proposed Features (High-Level)

*   **Marketplace Page**: Displays a gallery of sample fractionalized collectible assets (e.g., rare cards, coins).
    *   Users should be able to browse available assets.
    *   Basic filtering or sorting capabilities (mocked).
    *   *New*: Simulate display elements of an order book and/or auction mechanism for asset sales.
*   **Individual Asset Detail Page**: Provides detailed information for a specific collectible asset (e.g., a specific coin).
    *   Shows asset description, image(s), total fractions available, price per fraction (mocked).
    *   *New*: Display a simulated Time-Weighted Average Price (TWAP) based market rate for fractions.
    *   Mock "Buy Fraction" / "Sell Fraction" interaction points, simulating smart contract calls.
    *   *New*: Mock "Buyout" option allowing a user to attempt to buy all fractions at a 1.25x premium over the simulated TWAP. This interaction will include an explainer tooltip/modal.
*   **Mock User Account Page**:
    *   Displays a list of fractional assets currently "held" by the mock user.
    *   Shows quantity of fractions held for each asset.
    *   Mock transaction history or portfolio summary.
    *   *New*: Mock "Fund Account" button simulating a Coinbase Pay integration. Users will "deposit" mock USDC, but balances will be displayed in USD.
    *   *New*: Mock "Connect External Wallet" option (simulated "advanced mode") allowing users to conceptually link an external wallet, though transactions will still use mock USDC.
*   **(Placeholder) Mock User Authentication Flow**: Simple simulation of sign-in/sign-up to access the account page.
*   **General UI/UX**:
    *   *New*: Use toast notifications to confirm actions like "payments" and "fraction purchases," simulating L2 settlement times (e.g., a 5-8 second delay before confirmation).

## 5. Technical Architecture

This section outlines the technical foundation for the StateMint demo frontend.

### 5.1. Core Framework & Language
*   **Framework**: Next.js (version 14+ utilizing the App Router)
    *   *Rationale*: Next.js provides a robust framework for building server-rendered React applications, enabling fast page loads, SEO benefits (though less critical for a demo), and a great developer experience. The App Router will be used for its modern routing capabilities and support for React Server Components.
*   **Language**: TypeScript
    *   *Rationale*: TypeScript enhances code quality, maintainability, and developer productivity through static typing.

### 5.2. UI & Styling
*   **UI Library**: React
    *   *Rationale*: React's component-based architecture is ideal for building modular and reusable UI elements.
*   **Styling**: Tailwind CSS
    *   *Rationale*: Tailwind CSS offers a utility-first approach for rapid UI development and highly customizable designs directly within the markup.
*   **Component Library**: (To be decided - potentially Shadcn UI / Radix UI)
    *   *Rationale*: Utilizing a pre-built component library like Shadcn UI (which uses Radix UI) can accelerate development by providing accessible, unstyled or minimally styled primitives that can be easily customized with Tailwind CSS, aligning with modern best practices.
    *   *New*: Toast components (e.g., from Shadcn UI's `sonner` or similar) will be used for notifications and simulated transaction confirmations.

### 5.3. Frontend Structure
*   **Directory Structure**: Standard Next.js `app` directory structure. Components will be organized logically (e.g., `components/ui`, `components/features`, `components/layouts`).
*   **State Management**:
    *   Primarily leverage React Server Components (RSC) and server-side data fetching/mutation patterns where possible.
    *   For client-side URL state (e.g., filters, pagination), `nuqs` will be considered.
    *   Minimize client-side global state; use React Context or component state for localized needs.
*   **Data Handling**:
    *   No backend integration.
    *   Mock data will be used, likely stored in JSON files or hardcoded within the frontend for simplicity.
    *   Data fetching patterns will simulate API calls (e.g., using `async/await` functions that return mock data).
    *   *New Emphasis*: All complex interactions such as smart contract behaviors (asset minting, trading, swaps), order books, auction mechanisms, TWAP calculations, Coinbase Pay integration, and external wallet connections will be *simulated* within the frontend. The primary goal is to demonstrate the intended UI/UX flows, not to implement actual blockchain or financial operations.

### 5.4. Key Principles & Conventions
*   **Development Principles**: Adhere to functional and declarative programming, modularization, and descriptive naming.
*   **TypeScript Usage**: Strict TypeScript usage, prefer interfaces over types where appropriate.
*   **Performance**: Focus on minimizing client-side JavaScript, leveraging RSCs, dynamic loading for non-critical components, and image optimization (WebP, size attributes, lazy loading).
*   **Responsive Design**: Mobile-first approach using Tailwind CSS.

### 5.5. Build & Deployment
*   **Build Tool**: Next.js CLI
*   **Deployment Platform**: (To be decided - Vercel is a common and recommended choice for Next.js applications).

### 5.6. No Backend
*   This is a frontend-only demonstration. All "backend" interactions will be simulated with mock data and client-side logic.

## 6. Design System & Branding

*   **Primary Visual Reference**: The provided screenshot `image.png`and the `ClaudeMock.html` file will serve as the primary visual and structural guide for the initial UI development.
*   **Logo**: The logo provided (`33759.png`) will be used as the site branding.
*   **Color Palette**:
    *   Main/Gold: `#f2b418`
    *   Black: `#000000`
    *   White: `#FFFFFF`
    *   Silver Accent: `#c0c0c0`
    *   Additional shades (like the dark greys in `ClaudeMock.html`) will be derived or matched for consistency.
*   **Typography**: 
    *   Primary Font: Inter
*   **Iconography**: Icons will be implemented using a suitable React icon library (e.g., Lucide Icons, often used with Shadcn UI) or by importing SVGs, aiming to match the style seen in `ClaudeMock.html`.
*   **General Principles**: While the provided design mockups are the primary guide, Flexoki principles (readability, perceptual balance) can inform choices where the mockups are not specific, especially for text contrast and background/foreground relationships.

## 7. Success Metrics

*   Positive feedback from target audience on UI/UX.
*   Clear demonstration of proposed features.
*   Maintainable and well-structured codebase.
*   Smooth performance and responsiveness.

## 8. Out of Scope

*   Real backend integration.
*   User accounts with persistent data.
*   Payment processing.
*   Production-level security features beyond standard web practices for a demo.
*   Complex administrative functionalities.

## 9. Next Steps

*   Await design brief.
*   Set up Next.js project structure.
*   Begin developing core layout and shared components. 