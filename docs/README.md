# Spicy Shop API Documentation

This directory contains the API documentation and Postman collection for the Spicy Shop e-commerce application.

## Postman Collection

The `spicy-shop-api.postman_collection.json` file contains a complete collection of API endpoints that you can import into Postman.

### How to Import the Collection

1. Open Postman
2. Click on "Import" in the top left corner
3. Drag and drop the `spicy-shop-api.postman_collection.json` file or click "Upload Files" to select it
4. Click "Import"

### Environment Setup

Delete file

The collection uses a variable called `baseUrl` which is set to `http://localhost:3000` by default. To set up your environment:

1. Click on "Environments" in the sidebar
2. Click "Create Environment"
3. Name it "Spicy Shop Local"
4. Add a variable:
   - Variable name: `baseUrl`
   - Initial value: `http://localhost:3000`
5. Click "Save"
6. Select the "Spicy Shop Local" environment from the environment dropdown in the top right corner

### Available Endpoints

The collection includes the following endpoint groups:

#### Authentication
- Register (POST /auth/register)
- Login (POST /auth/login)
- Logout (POST /auth/logout)

#### Products
- Get All Products (GET /products)
- Get Product by ID (GET /products/:id)

#### Admin
- Get Dashboard Stats (GET /admin/dashboard)
- Get All Orders (GET /admin/orders)
- Get All Users (GET /admin/users)

### Testing the API

1. Make sure your server is running (`npm start` or `node server.js`)
2. In Postman, select the endpoint you want to test
3. For POST requests, check the "Body" tab to see the required request body format
4. Click "Send" to make the request
5. The response will appear in the lower panel

### Authentication

For protected routes (admin endpoints), you'll need to:
1. First login using the Login endpoint
2. Copy the session cookie from the response
3. Add it to your requests in the "Headers" tab:
   - Key: `Cookie`
   - Value: `connect.sid=<your-session-cookie>`

## Notes

- All responses are in JSON format
- Error responses include a message explaining what went wrong
- Admin routes require admin privileges
- The server must be running to test the endpoints 
