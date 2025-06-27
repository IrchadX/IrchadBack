# IrchadBack

IrchadBack is the backend API service for the **Irchad** platform, a smart navigation system web dashboard. Built with NestJS, it provides secure, scalable RESTful APIs with role-based access control for Admin, Commercial, and Decideur user roles.

## 🚀 Features

- 🔐 JWT-based authentication and authorization
- 👥 Role-based access control (Admin, Commercial, Decideur)
- 🗄️ PostgreSQL database with Prisma ORM
- 📁 Static asset management
- 🛡️ Custom guards and decorators
- 🔄 Real-time data processing
- 📊 Analytics and reporting endpoints
- 🌐 CORS-enabled for frontend integration

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Class-validator, Class-transformer
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Railway

## 🧪 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/IrchadX/IrchadBack.git
cd IrchadBack
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
```bash
DATABASE_URL="postgresql://postgres.rsctlmexmrtoamsucnsp:kitxiV-0gofce-henboq@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.rsctlmexmrtoamsucnsp:kitxiV-0gofce-henboq@aws-0-eu-west-3.pooler.supabase.com:6543/postgres"
JWT_SECRET="9b33622f0fe0486cff5f5bc4bee3716f9652db6d9d86e953a25c75b8694be71b666d106eaf65bc637213a4d21aed2f232e414c1fab34ba4447b3250d83dd4079d5b31762a9c809b335a1fa7f1253488afeed06a09973092fc7d424e185224ac2bac97a9ec5f263794a05f670d7f84899eb4d995d93c10a9c34c015948fa7869aac6e6b4d476cda4b7164d4db54e1708fddcbcd86016955c19afb949801cb466a83045005d744530a5fed7d45cee9b0d209d548ed3f891e3f399e8198a692f28e25d93cad2529ea5f066c306b79c97f2b28942b8982c6344765f6c4ed347bb3c68ba76682015f8616c10f75745a9006593865429ebdbd97b0e33243810749b7f0"
PORT=3000
```

### 4. Set up the database
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run the development server
```bash
npm run start:dev
```

The API will be available at [http://localhost:3000](http://localhost:3000)

## 🗂️ Project Structure

```
/src
  /api                # Main API modules and controllers
    /auth             # Authentication endpoints
    /users            # User management
    /admin            # Admin-specific endpoints
    /commercial       # Commercial role endpoints
    /decideur         # Decideur role endpoints
    
  /assets             # Static assets and file uploads
  /decorators         # Custom decorators (roles, validation, etc.)
  /guards             # Authentication and authorization guards
  /prisma             # Database schema and migrations
    /migrations       # Database migration files
    schema.prisma     # Database schema definition
    
  /common             # Shared utilities and constants
  /config             # Configuration modules
  main.ts             # Application entry point
```

## 🔐 Authentication & Authorization

The API uses JWT tokens for authentication with role-based access control:

### User Roles
- **Admin**: Full system access and user management
- **Commercial**: Access to commercial data and client management
- **Decideur**: Executive-level analytics and reporting access

### Demo Accounts
- **Admin**: lw_messikh@esi.dz / wissal123
- **Commercial**: cerise@gmail.com / cerise
- **Decideur**: lb_bouchra@esi.dz / bouchra123

## 🛡️ Security Features

### Custom Guards
- `JwtAuthGuard`: Validates JWT tokens
- `GatewayRolesGuard`: Enforces role-based access control

### Custom Decorators
- `@Roles()`: Define required roles for endpoints
- `@Public()`: Mark endpoints as publicly accessible

## 🗄️ Database

### Prisma ORM
The application uses Prisma as the ORM with PostgreSQL database hosted on Supabase.

### Available Scripts
```bash
npx prisma studio          # Open Prisma Studio
npx prisma generate         # Generate Prisma client
npx prisma migrate dev      # Create and apply migration
npx prisma migrate deploy   # Deploy migrations to production
npx prisma db seed          # Seed the database
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - List users (Admin only)

## 🌐 Deployment

### Railway Deployment
The application is deployed on Railway platform:
- **Production URL**: `https://apigateway-production-b99d.up.railway.app`
- **API Base**: `/api/v1/web`

### Environment Variables
Ensure the following environment variables are set in Railway:
- `DATABASE_URL`: PostgreSQL connection string
- `DIRECT_URL`: Direct database connection (for migrations)
- `JWT_SECRET`: Secret key for JWT token signing
- `PORT`: Application port (automatically set by Railway)

## 🔧 Development

### Available Scripts
```bash
npm run start         # Start production server
npm run start:dev     # Start development server with hot reload
npm run start:debug   # Start server in debug mode
npm run build         # Build for production
npm run test          # Run unit tests
npm run test:e2e      # Run end-to-end tests
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
```

### Code Style
- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks

## 📊 Monitoring & Logging

- Built-in NestJS logging
- Request/response logging middleware
- Error handling and validation
- Health check endpoints

## 🔍 API Documentation

API documentation is available via Swagger UI:
- **Local**: `http://localhost:3000/api/docs`
- **Production**: `https://apigateway-production-b99d.up.railway.app/api/docs`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow NestJS best practices
- Write unit tests for new features
- Update API documentation
- Follow the existing code style

## 📄 License

This project is proprietary software developed for the Irchad platform.

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

## 🚀 Production

**Live API**: [https://apigateway-production-b99d.up.railway.app](https://apigateway-production-b99d.up.railway.app)

The backend is fully deployed and operational on Railway, providing reliable API services for the frontend application.
