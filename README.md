# Node.js Express TypeScript Template

A comprehensive template for building scalable Express.js applications with TypeScript, featuring built-in Swagger documentation, multi-app support, and robust development tooling.

## Features

- 🚀 Multiple Express applications support (app1, app2 structure)
- 📚 Integrated Swagger documentation with auto-generation
- ✨ TypeScript support with strict type checking
- 🛡️ ESLint + Prettier code formatting
- 🔄 Hot reloading with Nodemon
- 📦 Module aliasing support
- 🔒 Security with Helmet middleware
- 📝 Winston logger integration
- 🎯 API input validation with Joi

## Project Structure

```
├── src/                    # Source code directory
│   ├── index.ts           # Main application entry
│   ├── app1/              # First Express application
│   │   ├── index.ts       # App1 configuration
│   │   └── routes/        # App1 routes
│   └── app2/              # Second Express application
│       ├── index.ts       # App2 configuration
│       └── routes/        # App2 routes
└── swaggers/              # Swagger documentation tools
    ├── helpers/           # Swagger helper utilities
    ├── interfaces/        # TypeScript interfaces
    └── types/             # Custom type definitions
```

## Prerequisites

- Node.js >= 22
- npm >= 10.0.0

## Using as a Dependency

1. Add the template to your project:
   ```bash
   npm install nodejs-linter-template
   ```

2. Import and use the swagger helpers in your Express app:
   ```typescript
   import SwaggerHelper from 'nodejs-linter-template/swaggers/helpers/swagger';
   import { IServeSwaggerOptions } from 'nodejs-linter-template/swaggers/interfaces/swaggerOptions';

   // Configure swagger options
   const swaggerOptions: IServeSwaggerOptions = {
     app: yourExpressApp,
     swaggerDocPath: '/api-docs',
     // ... other options
   };

   // Initialize swagger
   await new SwaggerHelper().serveSwagger(swaggerOptions);
   ```

## Available Scripts

- `npm run build` - Build the TypeScript code
- `npm run start` - Start the production server
- `npm run watch` - Start development server with hot reloading
- `npm run lint` - Run ESLint checks
- `npm run format` - Fix code formatting with ESLint

## Environment Support

The template includes configurations for:
- TypeScript compilation (tsconfig.json)
- ESLint and Prettier formatting
- Nodemon for development
- Winston logging
- Swagger UI for API documentation

## API Documentation Generation

The template provides automatic Swagger documentation generation for your API endpoints. Here's how to use it:

1. Define your routes with Joi validation schemas:
```typescript
import { validationV2 } from "@/swaggers/index";
import JoiRequestSchema from "@/swaggers/types/requestSchema";
import { Router } from "express";
import Joi from "joi";

const router = Router();

router.post(
    "/users",
    validationV2(<JoiRequestSchema>{
        description: "Create a new user",
        summary: "Create User",
        group: "Users",
        body: Joi.object({
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            age: Joi.number().integer().min(0)
        }),
        responseBody: {
            body: Joi.object({
                id: Joi.string(),
                name: Joi.string(),
                email: Joi.string(),
                created: Joi.date()
            }),
            contentType: "application/json"
        }
    }),
    userController.create
);
```

2. Configure Swagger in your app:

### Basic Configuration
```typescript
import SwaggerHelper from "@/swaggers/helpers/swagger";
import { IServeSwaggerOptions } from "@/swaggers/interfaces/swaggerOptions";

const swaggerOptions: IServeSwaggerOptions = {
    app: expressApp,
    swaggerDocPath: "/api-docs",
    apiBashPath: "/api",
    apiRoutePath: path.join(__dirname, "routes"),
    saveSwaggerDocumentFilePath: path.join(__dirname, "swagger.js"),
    serverOrigin: "http://localhost:3000",
    definition: {
        title: "My API",
        description: "API Documentation",
        version: "1.0.0"
    }
};

await new SwaggerHelper().serveSwagger(swaggerOptions);
```

### Multiple Route Paths Configuration
Use `routePaths` when you have multiple route directories or want to document different API versions/groups with different base paths:

```typescript
const swaggerOptions: IServeSwaggerOptions = {
    app: expressApp,
    swaggerDocPath: "/api-docs",
    // When using routePaths, these become optional fallbacks
    apiRoutePath: path.join(__dirname, "routes"),
    apiBashPath: "/api",
    saveSwaggerDocumentFilePath: path.join(__dirname, "swagger.js"),
    serverOrigin: "http://localhost:3000",
    // Define multiple route paths
    routePaths: [
        {
            // Path to the route files
            filePath: path.join(__dirname, "v1/routes"),
            // Base URL path for these routes
            urlBasePath: "/api/v1"
        },
        {
            filePath: path.join(__dirname, "v2/routes"),
            urlBasePath: "/api/v2"
        },
        {
            filePath: path.join(__dirname, "admin/routes"),
            urlBasePath: "/admin/api"
        }
    ],
    ignorePaths: [
        // Exclude TypeScript definition files
        path.join(__dirname, "**/*.d.ts"),
        path.join(__dirname, "**/*.d.ts.map")
    ],
    definition: {
        title: "My API",
        description: "API Documentation",
        version: "1.0.0"
    }
};

await new SwaggerHelper().serveSwagger(swaggerOptions);
```

The `routePaths` configuration is useful when:
- Your API has multiple versions (v1, v2, etc.)
- You have different API groups (public, admin, internal)
- Routes are spread across different directories
- Each route group needs a different base URL path

Each route path object requires:
- `filePath`: Absolute path to the directory containing route files
- `urlBasePath`: The base URL path where these routes will be mounted

The swagger documentation will combine all routes from the different paths and organize them based on their respective base paths.
```

3. Access your API documentation:
   - Navigate to `http://localhost:3000/api-docs` (or your configured path)
   - The documentation includes:
     - All endpoints with methods
     - Request/response schemas
     - Example payloads
     - Try-it-out functionality

### Example API Payloads

Here are some example payload structures that demonstrate the validation and documentation capabilities:

1. Basic Request with Validation:
```typescript
{
    params: Joi.object({
        id: Joi.string().required()
    }),
    query: Joi.object({
        page: Joi.number().integer().min(1),
        limit: Joi.number().integer().min(1).max(100)
    }),
    body: Joi.object({
        data: Joi.object().required()
    })
}
```

2. File Upload Request:
```typescript
import JoiRequestSchemaWithFile from "@/swaggers/types/requestschemawithfile";

{
    body: Joi.object({
        name: Joi.string().required()
    }),
    files: {
        document: {
            required: true,
            maxCount: 1,
            accept: ["image/jpeg", "image/png"]
        }
    }
}
```

3. Custom Response Schema:
```typescript
{
    responseBody: {
        body: Joi.object({
            success: Joi.boolean(),
            data: Joi.object(),
            message: Joi.string()
        }),
        contentType: "application/json"
    },
    apiResponses: {
        "200": {
            body: successResponseSchema,
            description: "Success response"
        },
        "400": {
            body: errorResponseSchema,
            description: "Bad request error"
        }
    }
}
```

## License

ISC
