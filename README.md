# StateMint Mock Frontend

A modern cryptocurrency marketplace frontend built with Next.js 13+ App Router, TypeScript, Tailwind CSS, and Shadcn UI.

## Features

- 🎨 Modern UI with Shadcn UI components and Tailwind CSS
- 🔒 Secure authentication system
- 💰 Real-time market data and trading
- 📊 Interactive order book
- 📱 Fully responsive design
- 🚀 Server-side rendering with Next.js App Router
- 💻 Type-safe development with TypeScript

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Shadcn UI
- Radix UI
- React Server Components
- React Context for state management

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/0xBernard/StateMintMock.git
cd StateMintMock
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Production Notes

- Asset cache versioning:
  - Public coin image URLs are cache-busted using `NEXT_PUBLIC_ASSET_VERSION`.
  - If you do not set it, the build falls back to a build-time timestamp.
  - Recommended: set `NEXT_PUBLIC_ASSET_VERSION` to your git commit SHA in CI/CD.

- Nginx reverse proxy + static serving:
  - Use `scripts/nginx-statemint.conf.template` to serve `/_next/static` and `/images` directly from disk.
  - `deploy.sh` now installs and configures Nginx automatically using that template.
  - Brotli directives are included as comments in the template; enable them only if your Nginx build supports Brotli modules.

## Project Structure

```
├── app/                 # Next.js App Router pages
├── components/         # React components
│   ├── shared/        # Shared components
│   └── ui/            # UI components (Shadcn)
├── lib/               # Utilities and helpers
│   ├── context/      # React Context providers
│   ├── data/         # Data models and mock data
│   ├── store/        # Client-side storage
│   └── utils/        # Utility functions
└── public/           # Static assets
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
