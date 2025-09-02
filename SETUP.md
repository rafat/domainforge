# DomainForge Setup Guide

A comprehensive guide to set up the DomainForge no-code platform for creating domain sales pages with on-chain negotiation capabilities.

## Enhanced Doma Protocol Integration

DomainForge features enhanced integration with Doma Protocol including:
- Comprehensive Subgraph API queries with rich domain data
- Pagination support for large datasets
- In-memory caching for improved performance
- Real-time event streaming via Poll API
- Orderbook API integration for marketplace operations

## Enhanced XMTP Chat Features

DomainForge now includes enhanced XMTP chat functionality:
- Offer integration with Doma's Orderbook API
- Real-time offer status tracking using Poll API
- Real-time notifications for offer updates
- System messages for offer events
- Notification badges in chat widget
- Persistent conversations with database storage
- Message history across sessions
- Unread message tracking
- Message deduplication and synchronization
- Improved reliability and network resilience

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation by Operating System](#installation-by-operating-system)
  - [macOS Setup](#macos-setup)
  - [Windows Setup](#windows-setup)
  - [Linux (Ubuntu/Debian) Setup](#linux-ubuntudebian-setup)
  - [Linux (CentOS/RHEL/Fedora) Setup](#linux-centosrhelfedora-setup)
- [Common Setup Steps](#common-setup-steps)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- Git
- A WalletConnect Project ID (optional for development)

## Installation by Operating System

### macOS Setup

#### 1. Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 2. Install Node.js
```bash
# Using Homebrew
brew install node

# Or using Node Version Manager (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.zshrc  # or ~/.bash_profile
nvm install 18
nvm use 18
```

#### 3. Install PostgreSQL
```bash
# Install PostgreSQL 15
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Add PostgreSQL to PATH (add this to your ~/.zshrc or ~/.bash_profile)
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
```

#### 4. Create Database
```bash
# Create the domainforge database
createdb domainforge

# Verify database creation
psql -l
```

### Windows Setup

#### 1. Install Node.js
- Download and install from [nodejs.org](https://nodejs.org/)
- Choose the LTS version (18.x or higher)
- Verify installation:
```cmd
node --version
npm --version
```

#### 2. Install PostgreSQL
- Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
- Run the installer and follow the setup wizard
- Remember the password you set for the `postgres` user
- Add PostgreSQL to your system PATH:
  - Go to System Properties → Environment Variables
  - Add `C:\Program Files\PostgreSQL\15\bin` to your PATH

#### 3. Create Database
```cmd
# Open Command Prompt as Administrator
# Create the database
createdb -U postgres domainforge

# Or using psql
psql -U postgres
CREATE DATABASE domainforge;
\q
```

### Linux (Ubuntu/Debian) Setup

#### 1. Update Package Manager
```bash
sudo apt update && sudo apt upgrade -y
```

#### 2. Install Node.js
```bash
# Using NodeSource repository (recommended)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using snap
sudo snap install node --classic
```

#### 3. Install PostgreSQL
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user and create database
sudo -u postgres createdb domainforge

# Optional: Create a dedicated user
sudo -u postgres createuser --interactive
```

### Linux (CentOS/RHEL/Fedora) Setup

#### 1. Update Package Manager
```bash
# CentOS/RHEL
sudo yum update -y

# Fedora
sudo dnf update -y
```

#### 2. Install Node.js
```bash
# CentOS/RHEL
sudo yum install -y nodejs npm

# Fedora
sudo dnf install -y nodejs npm

# Or using NodeSource repository
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs  # CentOS/RHEL
sudo dnf install -y nodejs  # Fedora
```

#### 3. Install PostgreSQL
```bash
# CentOS/RHEL
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Fedora
sudo dnf install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb domainforge
```

## Common Setup Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd domainforge
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Install Prisma CLI (Global Installation)
```bash
npm install -g prisma
```

## Environment Configuration

### 1. Create Environment File
Copy the example environment file and configure it:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/domainforge"

# WalletConnect Project ID
# Get one from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Doma API Configuration (Pre-configured for testnet)
DOMA_API_KEY=v1.93ebb5bd6e71f5a67798bf32ef482bd2910964f1a2d6857cd6d59bb68525680b
NEXT_PUBLIC_DOMA_RECORD_ADDRESS=0xF6A92E0f8bEa4174297B0219d9d47fEe335f84f8
NEXT_PUBLIC_PROXY_DOMA_RECORD_ADDRESS=0xb1508299A01c02aC3B70c7A8B0B07105aaB29E99
NEXT_PUBLIC_OWNERSHIP_TOKEN_ADDRESS=0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f
NEXT_PUBLIC_FORWARDER_ADDRESS=0xf17beC16794e018E2F0453a1282c3DA3d121f410
NEXT_PUBLIC_CROSS_CHAIN_GATEWAY_ADDRESS=0xCE1476C791ff195e462632bf9Eb22f3d3cA07388
NEXT_PUBLIC_DOMA_SUBGRAPH_URL=https://api-testnet.doma.xyz/graphql
NEXT_PUBLIC_DOMA_API_URL=https://api-testnet.doma.xyz

# Optional: XMTP Environment
NEXT_PUBLIC_XMTP_ENV=dev

# Optional: Pinata IPFS Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key
```

#### Database URL Examples:
- **macOS/Linux (default user)**: `postgresql://username:@localhost:5432/domainforge`
- **Windows**: `postgresql://postgres:your_password@localhost:5432/domainforge`
- **Linux (postgres user)**: `postgresql://postgres:your_password@localhost:5432/domainforge`

## Database Setup

### 1. Generate Prisma Client
```bash
npx prisma generate
```

### 2. Run Database Migrations
```bash
npx prisma migrate dev --name init
```

### 3. Verify Database Setup (Optional)
```bash
# Open Prisma Studio to view your database
npx prisma studio
```

## Running the Application

### 1. Start Development Server
```bash
npm run dev
```

### 2. Access the Application
Open your browser and navigate to: `http://localhost:3000`

### 3. Build for Production
```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Troubleshooting

### Common Issues and Solutions

#### 1. PostgreSQL Connection Issues

**Error**: `Can't reach database server at localhost:5432`

**Solutions**:
- **macOS**: `brew services restart postgresql@15`
- **Linux**: `sudo systemctl restart postgresql`
- **Windows**: Restart PostgreSQL service from Services panel

#### 2. Database Authentication Issues

**Error**: `password authentication failed`

**Solutions**:
- Check your username and password in the DATABASE_URL
- For Linux/Windows: Use the postgres user with the correct password
- For macOS: Usually no password is required for local connections

#### 3. Prisma Client Generation Issues

**Error**: `Prisma Client not found`

**Solution**:
```bash
npx prisma generate
```

#### 4. Migration Issues

**Error**: `Migration failed`

**Solutions**:
```bash
# Reset the database (WARNING: This deletes all data)
npx prisma migrate reset

# Or force apply migrations
npx prisma db push
```

#### 5. Port 3000 Already in Use

**Solution**:
```bash
# Kill process using port 3000
npx kill-port 3000

# Or run on different port
npm run dev -- -p 3001
```

#### 6. Node.js Version Issues

**Error**: `Node.js version not supported`

**Solution**:
```bash
# Check your Node.js version
node --version

# Install Node.js 18+ using nvm
nvm install 18
nvm use 18
```

### Database Management Commands

```bash
# View database status
npx prisma migrate status

# Reset database (deletes all data)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy

# Open database browser
npx prisma studio

# Check database connection
npx prisma db pull
```

### Development Tips

1. **Auto-restart on changes**: The dev server automatically restarts on file changes
2. **Database browser**: Use `npx prisma studio` to visually manage your database
3. **Environment variables**: Restart the dev server after changing `.env` variables
4. **Hot reload**: Frontend changes are hot-reloaded without server restart

### Getting Help

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check the project README for additional information
- **Community**: Join our Discord/Telegram for community support

---

**Note**: This documentation covers the basic setup. For production deployments, additional configuration for security, performance, and monitoring may be required.