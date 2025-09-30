# Environment Variables for Production

## Required Environment Variables

Set these in your Vercel dashboard under Settings > Environment Variables:

### Shopify App Configuration
```
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SCOPES=write_products
HOST=https://your-app-name.vercel.app
```

### Database Configuration
```
DATABASE_URL=your_production_database_url
```

### App Configuration
```
NODE_ENV=production
```

## Database Setup

For production, you'll need to set up a production database. Recommended options:

1. **PlanetScale** (MySQL) - Free tier available
2. **Neon** (PostgreSQL) - Free tier available
3. **Railway** (PostgreSQL) - Free tier available
4. **Supabase** (PostgreSQL) - Free tier available

## Shopify App Configuration

After deployment, update your Shopify app settings:

1. Go to your Shopify Partner Dashboard
2. Navigate to your app
3. Update the App URL to: `https://your-app-name.vercel.app`
4. Update the Allowed redirection URL(s) to: `https://your-app-name.vercel.app/api/auth`
