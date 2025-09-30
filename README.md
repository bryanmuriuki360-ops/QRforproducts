# QR Code Generator for Shopify Products

A Shopify app that generates QR codes for products in your store. This app allows you to create QR codes that link directly to your product pages, making it easy for customers to access product information by scanning the code.

## Features

- **🔍 Product Search**: Search and filter products by name or handle
- **📱 QR Code Generation**: Generate QR codes for individual products
- **💾 Persistent Storage**: QR codes are saved in localStorage and persist after page reload
- **⬇️ Download QR Codes**: Download generated QR codes as PNG images
- **🗑️ Clear QR Codes**: Remove individual QR codes when no longer needed
- **📊 Product Table**: Clean table interface showing product details, status, and price
- **⚡ Real-time Updates**: Live filtering and instant QR code generation

## Screenshots

The app provides a clean interface where you can:
- View all your products in a searchable table
- Generate QR codes for any product with a single click
- Download QR codes as PNG files
- Clear QR codes when no longer needed
- Search products by name or handle

## Technology Stack

- **Framework**: React Router
- **UI Components**: Polaris Web Components
- **Backend**: Node.js with Shopify Admin API
- **Database**: Prisma with SQLite
- **QR Code Generation**: qrcode library
- **Authentication**: Shopify App Bridge

## Installation

### Prerequisites

1. **Node.js**: [Download and install](https://nodejs.org/en/download/) it if you haven't already.
2. **Shopify Partner Account**: [Create an account](https://partners.shopify.com/signup) if you don't have one.
3. **Test Store**: Set up either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store) for testing your app.
4. **Shopify CLI**: [Download and install](https://shopify.dev/docs/apps/tools/cli/getting-started) it if you haven't already.

```shell
npm install -g @shopify/cli@latest
```

### Setup

1. Clone this repository:
```shell
git clone https://github.com/your-username/qr-for-products-v2.git
cd qr-for-products-v2
```

2. Install dependencies:
```shell
npm install
```

3. Start the development server:
```shell
npm run dev
```

4. Press `P` to open the URL to your app. Once you click install, you can start development.

## Usage

1. **Access the App**: Open the app from your Shopify admin
2. **View Products**: See all your products in a searchable table
3. **Search Products**: Use the search field to filter products by name or handle
4. **Generate QR Codes**: Click "Generate QR" for any product to create a QR code
5. **Download QR Codes**: Click "Download" to save the QR code as a PNG file
6. **Clear QR Codes**: Click "Clear" to remove a QR code when no longer needed

## QR Code Features

- **Direct Product Links**: QR codes link directly to your product pages
- **Store URL Detection**: Automatically uses your actual Shopify store URL
- **High Quality**: Generated QR codes are high-resolution PNG images
- **Persistent Storage**: QR codes are saved locally and persist after page reload

## Development

### Local Development

```shell
npm run dev
```

### Building for Production

```shell
npm run build
```

### Deploying

```shell
npm run deploy
```

## Project Structure

```
├── app/
│   ├── routes/
│   │   ├── app._index.jsx          # Main QR code generator page
│   │   └── app.jsx                 # App layout
│   ├── utils/
│   │   └── qrCode.server.js       # Server-side QR code generation
│   └── shopify.server.js          # Shopify authentication
├── prisma/
│   └── schema.prisma              # Database schema
├── package.json                   # Dependencies and scripts
└── shopify.app.toml              # Shopify app configuration
```

## API Endpoints

- `GET /app` - Main QR code generator interface
- `POST /app` - Generate QR codes for products
- `GET /auth/login` - Authentication endpoint
- `POST /webhooks/app/uninstalled` - Handle app uninstallation

## Configuration

The app is configured in `shopify.app.toml`:

```toml
client_id = "your-client-id"
name = "QR for products V2"
application_url = "https://your-store.myshopify.com"
embedded = true

[access_scopes]
scopes = "write_products"
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Changelog

### v1.0.0
- Initial release
- QR code generation for Shopify products
- Product search and filtering
- Download and clear QR code functionality
- Persistent storage with localStorage
- Clean table interface