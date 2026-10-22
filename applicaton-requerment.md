MOFHAF E-Commerce Application — Professional Requirements & API Documentation
For your MOFHAF e-commerce application, using Node.js, Express.js, TypeScript, Prisma ORM, and PostgreSQL, I recommend organizing the project like a production-ready e-commerce platform, with clear role permissions, product approval workflows, order management, payments, and admin dashboards.

Your current requirements are a good starting point. The main improvements are to separate authentication, user management, categories, products, carts, orders, payments, reviews, and administration into dedicated modules.
1. Application overview

Authentication & authorization

Customer registration, role-based login, Google login, JWT access/refresh tokens, account status, and permission checks.




Category & product management

Category CRUD, product variants, images, stock, discounts, search, filtering, and provider-submitted products requiring approval.




Shopping & order management

Shopping cart, checkout, order creation, shipping addresses, order tracking, cancellation, and refunds.




Payment management

Payment initiation, gateway verification, payment history, webhook handling, refunds, and transaction auditing.



Recommended technology stack
Layer	Technology
Backend	Node.js + Express.js + TypeScript
Database	PostgreSQL
ORM & migrations	Prisma ORM
Validation	Zod
Authentication	JWT access/refresh tokens, Google OAuth
Password security	Argon2id or bcrypt
Images	Cloudinary or compatible object storage
Email & OTP	Nodemailer + Redis
Payments	bKash, SSLCommerz, or another supported gateway
API documentation	Swagger / OpenAPI
Testing	Vitest or Jest + Supertest
Logging	Pino or Winston


2. User roles and permissions
Use a single UserRole enum and enforce permissions in Express middleware. Never rely on frontend role checks alone.
Feature	Customer	Provider	Admin	Super Admin
Register own account	Yes	Application only	No	No
Google login	Yes	No	No	No
View published products	Yes	Yes	Yes	Yes
Manage own profile	Yes	Yes	Yes	Yes
Create products	No	Yes	Yes	Yes
Edit own pending/rejected products	No	Yes	Yes	Yes
Approve/reject published submissions	No	No	Yes	Yes
Manage categories	No	No	Yes	Yes
Manage users	No	No	Yes, limited	Yes
Manage admin accounts	No	No	No	Yes
Create orders	Yes	No	No	No
Pay for orders	Yes	No	No	No
View own order/payment history	Yes	No	Yes	Yes
View all orders/payments	No	No	Yes	Yes
Delete payment records	No	No	No	No

Important design decisions:
- A provider should apply for a provider account. An admin or super admin approves the application before the provider can publish products.
- Public registration must never accept ADMIN or SUPER_ADMIN as a user-supplied role.
- Admin-created accounts should use a separate protected workflow.
- A provider may edit their own products only when allowed by the product's status and ownership rules.
- Customers and providers should not be able to delete real payment transactions.
- Published products should be archived or unpublished rather than permanently deleted when they have order history.
3. Professional REST API structure
Use a consistent base URL:

/api/v1

Use plural resource names where practical, HTTP methods consistently, and one standard response format.
A. Authentication & user management
Base path: /api/v1/auth and /api/v1/users
Method	Endpoint	Access	Purpose
POST	/auth/register	Public, customer only	Register customer
POST	/auth/login	Public	Login any existing role
POST	/auth/google	Public, customer only	Google customer login
POST	/auth/refresh-token	Valid refresh token	Issue new access token
POST	/auth/logout	Authenticated	Revoke session / clear cookies
POST	/auth/forgot-password	Public	Request password reset
POST	/auth/reset-password	Valid reset token	Change password
POST	/auth/verify-email	Public, valid OTP	Verify email
POST	/auth/resend-otp	Public	Resend verification OTP
GET	/users/me	All authenticated roles	Get current profile
PATCH	/users/me	All authenticated roles	Update own profile
PATCH	/users/me/password	Authenticated	Change password
GET	/users	Admin, super admin	List users with pagination
GET	/users/:id	Admin, super admin; optionally self	Get user details
PATCH	/users/:id/status	Admin, super admin	Block/unblock account
PATCH	/users/:id/role	Super admin	Change permitted role
POST	/admin/users	Admin or super admin, with role restrictions	Create an authorized staff account
GET	/admin/users	Admin, super admin	Filter and manage accounts

Improvements to your original endpoints:
- Replace GET /auth/getAllUser with GET /users.
- Replace PATCH /user/updated with PATCH /users/me.
- Do not expose unrestricted role changes through profile updates.
- Keep account status separate from the role.
- Protect login against brute-force attacks and never return password hashes or OTPs.
For Google login, verify the Google ID token on the server and only allow customer accounts. Do not trust a client-supplied email as proof of identity.
B. Category management
Base path: /api/v1/categories
Method	Endpoint	Access	Purpose
POST	/categories	Admin, super admin	Create category
GET	/categories	Public	List active categories
GET	/categories/:id	Public	Get category details
PATCH	/categories/:id	Admin, super admin	Update category
DELETE	/categories/:id	Admin, super admin	Archive/delete if safe
PATCH	/categories/:id/status	Admin, super admin	Activate/deactivate
GET	/categories/:id/products	Public	Get category products

Recommended category fields:
- id, name, slug, description
- imageUrl, parentId (for nested categories)
- isActive, createdAt, updatedAt
Requirements:
- Category names and slugs must be unique.
- Support parent/child categories when needed.
- Prevent deleting categories that still have associated products unless the products are reassigned.
- Inactive categories should not be available for new public product browsing or product creation.
C. Product management
Base path: /api/v1/products
Method	Endpoint	Access	Purpose
POST	/products	Provider, admin, super admin	Create product
GET	/products	Public	List published products
GET	/products/:id	Public, with owner/admin access to restricted statuses	Product details
PATCH	/products/:id	Owner provider, admin, super admin	Update product under workflow rules
DELETE	/products/:id	Owner provider for permitted statuses; admin for permitted statuses	Archive product
GET	/products/my	Provider	List own products
GET	/products/pending	Admin, super admin	Review queue
PATCH	/products/:id/approve	Admin, super admin	Approve product
PATCH	/products/:id/reject	Admin, super admin	Reject with reason
PATCH	/products/:id/status	Admin, super admin	Publish, unpublish, or archive
POST	/products/:id/images	Product owner, admin, super admin	Upload images
DELETE	/products/:id/images/:imageId	Product owner, admin, super admin	Remove image
GET	/products/search	Public	Search products

Recommended query parameters for GET /products:
GET /api/v1/products?page=1&limit=12
GET /api/v1/products?categoryId=category-id
GET /api/v1/products?search=headphones
GET /api/v1/products?minPrice=500&maxPrice=5000
GET /api/v1/products?sortBy=price&sortOrder=asc
GET /api/v1/products?brand=example&inStock=true


Recommended product fields:
id, name, slug, description, sku
categoryId, providerId, brand
price, compareAtPrice, stockQuantity
status, rejectionReason
createdAt, updatedAt


Use a separate ProductImage table for multiple images. If you sell variable products such as clothing or shoes, add ProductVariant with size, color, SKU, and variant-level inventory.
Product approval workflow
Provider creates product

Initial status: PENDING

Admin reviews product

Approve

PUBLISHED


Reject

REJECTED



Rejected products can be corrected and resubmitted. Only authorized reviewers can approve or reject submissions.

Use explicit product status transitions instead of allowing arbitrary status changes through a generic PATCH endpoint. For example, a provider must not be able to change PENDING directly to PUBLISHED.
D. Shopping cart
Base path: /api/v1/cart

A professional e-commerce app needs a cart before checkout. A customer should be able to add products, change quantities, and remove items.
Method	Endpoint	Access	Purpose
GET	/cart	Customer	View own cart
POST	/cart/items	Customer	Add product to cart
PATCH	/cart/items/:itemId	Customer	Change quantity
DELETE	/cart/items/:itemId	Customer	Remove item
DELETE	/cart	Customer	Clear cart

Requirements:
- Prevent adding unpublished products or quantities greater than available stock.
- Recalculate prices on the server; never trust prices sent by the browser.
- Validate product variants and stock before checkout.
- Recheck price and stock when creating the order.
E. Orders and checkout
Base path: /api/v1/orders
Method	Endpoint	Access	Purpose
POST	/orders	Customer	Create order from cart
GET	/orders	Customer; admin/super admin for all	List orders
GET	/orders/:id	Order owner, admin, super admin	Order details
PATCH	/orders/:id/cancel	Customer for eligible orders; admin	Cancel order
PATCH	/orders/:id/status	Admin, super admin	Update fulfillment status
GET	/orders/my	Customer	View own orders
GET	/provider/orders	Provider	View orders containing their products
PATCH	/provider/orders/:id/items/:itemId/status	Relevant provider, admin, super admin	Update own item fulfillment
POST	/orders/:id/refund-request	Customer, for eligible paid orders	Request a refund

Recommended order statuses:

PENDING_PAYMENT → CONFIRMED → PROCESSING → SHIPPED → DELIVERED

Additional terminal or exceptional states: CANCELLED, REFUND_PENDING, REFUNDED.

Use a separate payment status rather than overloading order status.

Important: If MOFHAF is a multi-provider marketplace, store order items separately and track fulfillment per provider. One customer order can contain products from multiple providers.

Store immutable snapshots of product name, SKU, unit price, quantity, and applicable discount in each OrderItem. This preserves historical orders when a product's current details change.
F. Payment management
Base path: /api/v1/payments
Method	Endpoint	Access	Purpose
POST	/payments	Customer	Initiate payment for an eligible order
GET	/payments	Admin, super admin	List all payments
GET	/payments/my	Customer	List own payments
GET	/payments/:id	Payment owner, admin, super admin	Get payment details
POST	/payments/:id/verify	Payment owner or authorized backend flow	Verify with gateway
POST	/payments/webhooks/:provider	Payment gateway	Receive signed gateway events
POST	/payments/:id/refund	Admin, super admin	Initiate authorized refund
GET	/payments/:id/refunds	Payment owner, admin, super admin	Refund history

Recommended payment statuses:

PENDING, PROCESSING, PAID, FAILED, CANCELLED, REFUND_PENDING, REFUNDED, PARTIALLY_REFUNDED.

Payment requirements:
1. Create an order and calculate the total on the server.
2. Create a payment record with a unique transaction reference.
3. Initiate payment through the chosen gateway.
4. Verify payment status server-to-server or through a validated signed webhook.
5. Mark an order as paid only after verified payment confirmation.
6. Make webhook processing idempotent so repeated callbacks cannot charge or fulfill an order twice.
7. Record refunds as separate refund records or events instead of deleting payments.
8. Never store raw card numbers, CVVs, or gateway secrets in the database.
For Bangladesh, you could evaluate bKash or SSLCommerz based on your business account, supported payment methods, settlement needs, and integration documentation.
G. Inventory and stock management
Base path: /api/v1/inventory
Method	Endpoint	Access	Purpose
GET	/inventory/:productId	Provider owner, admin, super admin	View stock
PATCH	/inventory/:productId	Provider owner, admin, super admin	Update stock
GET	/inventory/low-stock	Provider owner, admin, super admin	Find low-stock products
GET	/inventory/transactions	Provider owner, admin, super admin	Stock adjustment history

Use database transactions to reserve or decrement stock safely during checkout. Avoid overselling when multiple customers order the same product at the same time.
H. Reviews and wishlists
Method	Endpoint	Access	Purpose
POST	/reviews	Customer with eligible purchase	Create review
GET	/products/:id/reviews	Public	List product reviews
PATCH	/reviews/:id	Review owner	Update own review
DELETE	/reviews/:id	Review owner, admin, super admin	Remove review
GET	/wishlist	Customer	View wishlist
POST	/wishlist/items	Customer	Add wishlist item
DELETE	/wishlist/items/:productId	Customer	Remove wishlist item

Prevent duplicate reviews for the same qualifying purchase and product. Calculate ratings on the server and provide moderation controls for abusive reviews.
I. Shipping, addresses, coupons, and notifications
These modules can be implemented after the core checkout workflow.
Module	Suggested endpoints	Main purpose
Addresses	GET/POST /addresses, PATCH/DELETE /addresses/:id	Customer delivery addresses
Coupons	GET /coupons, POST /coupons, PATCH /coupons/:id, POST /coupons/validate	Discounts and promotions
Shipping	GET /shipping/methods, PATCH /orders/:id/shipping	Delivery methods and tracking
Notifications	GET /notifications, PATCH /notifications/:id/read	Order, payment, and account updates
Provider applications	POST /provider-applications, GET /provider-applications, PATCH /provider-applications/:id/approve, PATCH /provider-applications/:id/reject	Provider onboarding
Reports	GET /admin/reports/sales, GET /admin/reports/orders, GET /admin/reports/products	Admin analytics

For customer addresses and notifications, enforce ownership checks. For coupons, validate expiry, usage limits, minimum purchase amounts, and applicable products on the backend.

4. Prisma database design
Start with these main entities. You do not need to implement every optional module in the first release.
User

Roles, credentials, status, profile

ProviderProfile

Business details, approval status



Category → Product → ProductImage / ProductVariant

Product ownership, status, pricing, stock

Cart → Order → OrderItem

Customer purchases and provider fulfillment

Payment → Refund

Transactions, gateway references, refund history



Core Prisma models
Recommended models and relationships:
Model	Key relationships / fields
User	Role, email, password hash, status, profile
ProviderProfile	userId, business information, approval metadata
Category	Unique slug, optional parent category
Product	providerId, categoryId, price, status
ProductImage	productId, URL, storage public ID, sort order
ProductVariant	productId, SKU, attributes, price override, stock
Cart	Unique customer relationship
CartItem	Cart, product/variant, quantity
Order	Customer, totals, status, shipping snapshot
OrderItem	Product snapshot, provider, quantity, unit price
Payment	Order, gateway, unique transaction reference, status
Refund	Payment, amount, reason, status
Address	Customer, delivery information
Review	Customer, product, rating, review text
WishlistItem	Customer, product
Coupon	Code, discount, expiry, usage limits
InventoryTransaction	Product/variant, quantity change, reason
AuditLog	Actor, action, entity, timestamp

Use UUIDs or CUIDs consistently for identifiers. Use Decimal for money rather than JavaScript floating-point arithmetic; specify your currency (for example, BDT) and store amounts at an appropriate precision.
5. Professional project folder structure
I recommend a modular monolith architecture for MOFHAF. It keeps the application easy to develop and test while allowing each feature to have its own service, controller, routes, validation, and types.
mofhaf-backend/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── env.ts
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   └── cloudinary.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── validate.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   └── upload.middleware.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── providers/
│   │   ├── categories/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── refunds/
│   │   ├── inventory/
│   │   ├── reviews/
│   │   ├── wishlist/
│   │   ├── coupons/
│   │   ├── addresses/
│   │   └── admin/
│   ├── routes/
│   │   └── index.ts
│   ├── utils/
│   │   ├── ApiError.ts
│   │   ├── catchAsync.ts
│   │   ├── ApiResponse.ts
│   │   └── pagination.ts
│   └── types/
│       └── express.d.ts
├── tests/
│   ├── auth.test.ts
│   ├── products.test.ts
│   ├── orders.test.ts
│   └── payments.test.ts
├── .env.example
├── .gitignore
├── package.json
└── tsconfig.json


Each business module should follow a consistent structure:
products/
├── product.route.ts
├── product.controller.ts
├── product.service.ts
├── product.validation.ts
└── product.interface.ts


- Route: Defines endpoints and middleware.
- Controller: Reads request data and sends responses.
- Service: Implements business rules and database operations.
- Validation: Validates request bodies, parameters, and query strings with Zod.
- Interface/types: Holds module-specific types when needed.
Keep payment gateway logic in a dedicated service and keep Prisma queries out of controllers.
6. Standard API response format
Every endpoint should follow a consistent response structure.

Successful response:
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 0,
      "totalPages": 0
    }
  }
}


Error response:
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "price",
      "message": "Price must be greater than zero"
    }
  ]
}


Use appropriate HTTP status codes:
Status	Meaning
200	Successful read/update
201	Resource created
204	Successful deletion with no response body
400	Invalid request
401	Unauthenticated
403	Insufficient permission
404	Resource not found
409	Duplicate or conflicting operation
422	Semantically invalid input, if used consistently
429	Rate limit exceeded
500	Unexpected server error

Do not expose database stack traces, password hashes, internal gateway credentials, or sensitive token information in API responses.
7. Essential security and business requirements
These are important for a professional release.
Authentication

Use short-lived access tokens and securely managed refresh tokens; revoke sessions on logout.


Authorization

Check both role and resource ownership, especially for provider products, customer orders, and payments.


Validation

Validate every body, path parameter, query parameter, and uploaded file.


Database

Use Prisma transactions for checkout, inventory changes, and related financial state updates.


Payment security

Verify transactions with the payment gateway; do not trust the frontend success redirect.


Uploads

Validate file type and size, use safe storage, and remove orphaned files when appropriate.


Reliability

Use idempotency keys for payment/order operations and safely process repeated webhooks.


Monitoring

Add structured logs, health checks, error tracking, and audit logs for sensitive admin actions.


API documentation

Maintain Swagger/OpenAPI specifications and examples for protected endpoints.


Testing

Test authorization failures, invalid input, duplicate payments, stock conflicts, and order cancellation.



8. Recommended development roadmap
Build the application in this order to reduce rework.
01

Foundation

Express + TypeScript setup, Prisma schema, database migrations, error handling, environment validation.


02

Authentication & roles

Registration, login, Google customer login, refresh/logout, provider applications, admin authorization.


03

Categories & products

CRUD, image uploads, search, pagination, filtering, provider ownership, product approval.


04

Cart & inventory

Cart operations, variant validation, stock management, safe inventory reservation.


05

Orders & payments

Checkout, order snapshots, payment gateway integration, verified webhooks, refunds.


06

Additional features

Addresses, shipping, reviews, wishlist, coupons, notifications.


07

Production readiness

Automated tests, Swagger docs, security review, deployment, monitoring, backups.



9. Final requirements checklist
MOFHAF implementation tracker

0/13



[ ] Authentication and role-based authorization
[ ] Customer and provider account management
[ ] Category and product CRUD
[ ] Product approval and publishing workflow
[ ] Product search, sorting, filtering, and pagination
[ ] Cart and inventory management
[ ] Order creation and fulfillment
[ ] Payment verification and refund processing
[ ] Address and shipping management
[ ] Reviews, wishlist, and coupons
[ ] Admin dashboard and audit logs
[ ] Swagger documentation and automated tests
[ ] Production deployment, backups, and monitoring