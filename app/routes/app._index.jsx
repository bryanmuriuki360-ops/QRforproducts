import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Fetch products from the store
  const response = await admin.graphql(
    `#graphql
      query getProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              status
              featuredMedia {
                preview {
                  image {
                    url
                    altText
                  }
                }
              }
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                    barcode
                    sku
                  }
                }
              }
            }
          }
        }
      }`,
    {
      variables: { first: 50 }
    }
  );

  const responseJson = await response.json();
  const products = responseJson.data.products.edges.map(edge => edge.node);

  return { products };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");
  const productId = formData.get("productId");

  if (action === "generateQR") {
    try {
      // Import QR code utilities server-side
      const { generateProductQRCode } = await import("../utils/qrCode.server");

      // Fetch product details
      const productResponse = await admin.graphql(
        `#graphql
          query getProduct($id: ID!) {
            product(id: $id) {
              id
              title
              handle
              onlineStoreUrl
            }
          }`,
        { variables: { id: productId } }
      );

      const productData = await productResponse.json();
      const product = productData.data.product;

      if (product) {
        // Generate QR code for product
        let baseUrl;
        if (product.onlineStoreUrl) {
          baseUrl = product.onlineStoreUrl.replace(`/products/${product.handle}`, '');
        } else {
          // Get the store URL from the admin context
          const shopResponse = await admin.graphql(
            `#graphql
              query getShop {
                shop {
                  myshopifyDomain
                }
              }`
          );
          const shopData = await shopResponse.json();
          baseUrl = `https://${shopData.data.shop.myshopifyDomain}`;
        }
        const qrCodeDataUrl = await generateProductQRCode(product, baseUrl);
        return { success: true, qrCodeDataUrl, productId };
      }

      return { success: false, error: "Product not found" };
    } catch (error) {
      console.error('Error generating QR code:', error);
      return { success: false, error: error.message };
    }
  }

  // Original product creation logic
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($product: ProductCreateInput!) {
        productCreate(product: $product) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        product: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const product = responseJson.data.productCreate.product;
  const variantId = product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
    mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          price
          barcode
          createdAt
        }
      }
    }`,
    {
      variables: {
        productId: product.id,
        variants: [{ id: variantId, price: "100.00" }],
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return {
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
  };
};

export default function Index() {
  const { products } = useLoaderData();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const [productQRCodes, setProductQRCodes] = useState(() => {
    // Load QR codes from localStorage on component mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('productQRCodes');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [loadingProducts, setLoadingProducts] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');



  useEffect(() => {
    if (fetcher.data?.success && fetcher.data.qrCodeDataUrl) {
      const newQRCodes = {
        ...productQRCodes,
        [fetcher.data.productId]: fetcher.data.qrCodeDataUrl
      };
      setProductQRCodes(newQRCodes);
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('productQRCodes', JSON.stringify(newQRCodes));
      }
      setLoadingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(fetcher.data.productId);
        return newSet;
      });
      shopify.toast.show("QR code generated successfully!");
    } else if (fetcher.data?.success === false) {
      setLoadingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(fetcher.data.productId);
        return newSet;
      });
      shopify.toast.show(fetcher.data.error || "Failed to generate QR code", { isError: true });
    }
  }, [fetcher.data, shopify, productQRCodes]);


  const generateQRCode = (productId) => {
    setLoadingProducts(prev => new Set(prev).add(productId));
    const formData = new FormData();
    formData.append("action", "generateQR");
    formData.append("productId", productId);
    fetcher.submit(formData, { method: "POST" });
  };

  const downloadQRCode = (productId, productTitle) => {
    const qrCodeDataUrl = productQRCodes[productId];
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.href = qrCodeDataUrl;
      link.download = `qr-code-${productTitle.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearQRCode = (productId) => {
    const newQRCodes = { ...productQRCodes };
    delete newQRCodes[productId];
    setProductQRCodes(newQRCodes);
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('productQRCodes', JSON.stringify(newQRCodes));
    }
  };


  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <s-page>
      <ui-title-bar title="QR Code Generator">
      </ui-title-bar>

      <s-section heading="Your Products">
        <s-paragraph>
          Generate QR codes for your products. Click the "Generate QR" button to create a QR code for any product.
        </s-paragraph>

        <s-stack direction="block" gap="base">
          <s-text variant="strong" size="small">
            Search Products
          </s-text>
          <input
            type="text"
            placeholder="Search by product name or handle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              marginBottom: '8px'
            }}
          />
          {searchTerm && (
            <s-text variant="subdued" size="small">
              Showing {filteredProducts.length} of {products.length} products
            </s-text>
          )}
        </s-stack>

        {filteredProducts.length === 0 ? (
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
            style={{ textAlign: 'center' }}
          >
            <s-text variant="subdued">
              {searchTerm ? 'No products found matching your search.' : 'No products available.'}
            </s-text>
          </s-box>
        ) : (
          <s-table>
            <s-table-head>
              <s-table-row>
                <s-table-header>Product Name</s-table-header>
                <s-table-header>Status</s-table-header>
                <s-table-header>Price</s-table-header>
                <s-table-header>Action</s-table-header>
              </s-table-row>
            </s-table-head>
            <s-table-body>
              {filteredProducts.map((product) => {
                const firstVariant = product.variants.edges[0]?.node;
                const productPrice = firstVariant?.price || 'N/A';
                const qrCodeDataUrl = productQRCodes[product.id];

                return (
                  <s-table-row key={product.id}>
                    <s-table-cell>
                      <s-stack direction="block" gap="tight">
                        <s-text variant="strong">{product.title}</s-text>
                        <s-text variant="subdued" size="small">Handle: {product.handle}</s-text>
                      </s-stack>
                    </s-table-cell>
                    <s-table-cell>
                      <s-text variant={product.status === 'ACTIVE' ? 'success' : 'subdued'}>
                        {product.status}
                      </s-text>
                    </s-table-cell>
                    <s-table-cell>
                      <s-text>${productPrice}</s-text>
                    </s-table-cell>
                    <s-table-cell>
                      <s-stack direction="block" gap="base">
                        <s-button
                          variant="primary"
                          size="small"
                          onClick={() => generateQRCode(product.id)}
                          disabled={loadingProducts.has(product.id)}
                          loading={loadingProducts.has(product.id)}
                        >
                          {loadingProducts.has(product.id) ? "Generating..." : "Generate QR"}
                        </s-button>

                        {qrCodeDataUrl && (
                          <s-stack direction="block" gap="tight">
                            <s-box
                              padding="tight"
                              borderWidth="base"
                              borderRadius="base"
                              background="subdued"
                              style={{ textAlign: 'center' }}
                            >
                              <img
                                src={qrCodeDataUrl}
                                alt={`QR Code for ${product.title}`}
                                style={{
                                  maxWidth: '120px',
                                  height: 'auto',
                                  border: '1px solid #e1e3e5',
                                  borderRadius: '4px'
                                }}
                              />
                            </s-box>

                            <s-stack direction="inline" gap="tight">
                              <s-button
                                variant="secondary"
                                size="small"
                                onClick={() => downloadQRCode(product.id, product.title)}
                              >
                                Download
                              </s-button>
                              <s-button
                                variant="tertiary"
                                size="small"
                                onClick={() => clearQRCode(product.id)}
                              >
                                Clear
                              </s-button>
                            </s-stack>
                          </s-stack>
                        )}
                      </s-stack>
                    </s-table-cell>
                  </s-table-row>
                );
              })}
            </s-table-body>
          </s-table>
        )}
      </s-section>


    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
