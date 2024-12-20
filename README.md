# Cyber Template

A modern web application template built with Deno Fresh, featuring real-time token-based transactions, Stripe integration, and Kinde authentication.

## Features

- 🦕 Built with Deno 2.0 and Fresh 1.7
- 🔐 Authentication via Kinde
- 💳 Stripe integration for payments
- 🔄 Real-time updates with Server-Sent Events and Broadcast Channel API
- 🎨 Beautiful UI with DaisyUI 4.12
- 📱 Fully responsive design
- 🔒 Secure token-based transactions
- 💾 Deno KV for data persistence
- ⚡ Real-time balance updates with animations

## Prerequisites

- [Deno](https://deno.com/) version 2.0 or higher
- A [Kinde](https://kinde.com/) account for authentication
- A [Stripe](https://stripe.com/) account for payments
- Access to [@juliangarnierorg/anime-beta](https://github.com/juliangarnier) (requires [GitHub sponsorship](https://github.com/sponsors/juliangarnier))
  - Note: The standard [anime.js](https://animejs.com/) version might work but is untested

## Setup

1. Clone the repository:
```bash
git clone https://github.com/tangledcircuit/cyber.git
cd cyber
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
```env
# Kinde Auth Configuration
KINDE_BACKEND_DOMAIN=your-domain.kinde.com
KINDE_BACKEND_CLIENT_ID=your_client_id
KINDE_BACKEND_CLIENT_SECRET=your_client_secret
KINDE_BACKEND_REDIRECT_URI=http://localhost:8000/api/auth/callback
KINDE_BACKEND_POST_LOGOUT_REDIRECT_URI=http://localhost:8000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
STRIPE_1_TOKENS_PRICE_ID=price_your_stripe_price_id
```

4. If you don't have access to anime-beta, you'll need to either:
   - Become a [GitHub sponsor](https://github.com/sponsors/juliangarnier) to get access
   - Or modify the animation code to use the standard anime.js version

5. Start the development server:
```bash
deno task start
```

The application will be available at `http://localhost:8000`

## Project Structure

```
cyber/
├── components/     # Shared UI components
├── islands/        # Interactive components with client-side logic
├── routes/         # Application routes and API endpoints
├── static/         # Static assets
├── utils/         # Utility functions and core logic
└── types/         # TypeScript type definitions
```

## Key Components

### Token System
- Real-time token balance updates via SSE
- Transaction history with live updates
- Secure token storage in Deno KV
- Animated balance updates with anime.js

### Authentication
- Secure login/signup via Kinde
- OAuth 2.0 compliant
- Session management with Deno KV
- Automatic token refresh

### Payment Processing
- Secure Stripe integration
- Webhook handling for payment events
- Automatic token crediting on successful payments
- Real-time balance updates after purchase

## Development

### Running Tests
```bash
deno test
```

### Linting
```bash
deno lint
```

### Type Checking
```bash
deno check **/*.ts
```

## Production Deployment

1. Set up your production environment variables
2. Configure your Stripe webhook endpoint
3. Deploy to your preferred hosting platform (e.g., Deno Deploy)
4. Ensure your Deno KV instance is properly configured

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Deno](https://deno.com/) for the runtime
- [Fresh](https://fresh.deno.dev/) for the web framework
- [DaisyUI](https://daisyui.com/) for the UI components
- [Kinde](https://kinde.com/) for authentication
- [Stripe](https://stripe.com/) for payment processing
- [anime.js](https://animejs.com/) for smooth animations
