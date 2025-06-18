# 🚀 FilFlo AI Warehouse Manager

**A Production-Ready AI-Powered Warehouse Management System**

FilFlo AI Warehouse Manager is a comprehensive, intelligent warehouse management solution that combines the power of artificial intelligence with real-time data analytics to optimize warehouse operations, inventory management, and business decision-making.

![FilFlo AI Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![MySQL](https://img.shields.io/badge/MySQL-8.x-orange)
![AI Powered](https://img.shields.io/badge/AI-Claude%203.5%20Sonnet-purple)

## 🌟 **Key Features**

### **🤖 AI-Powered Chat Interface**
- **Natural Language Queries**: Ask questions in plain English about your warehouse operations
- **Real-time Data Analysis**: Get instant insights from your 711K+ sales records
- **Intelligent SQL Generation**: AI automatically converts your questions into optimized database queries
- **Contextual Conversations**: AI remembers conversation history for better follow-up responses

### **📊 Advanced Analytics Dashboard**
- **Real-time Metrics**: Revenue tracking, order processing, inventory levels
- **Interactive Charts**: Sales trends, inventory analysis, performance monitoring
- **Responsive Design**: Beautiful UI that works on all devices
- **Custom Visualizations**: Recharts-powered data visualization

### **💼 Business Intelligence**
- **Inventory Management**: Track stock levels, reorder points, and product performance
- **Sales Analytics**: Analyze top-performing products, customer trends, and revenue patterns
- **Production Planning**: AI-generated production plans based on sales data
- **Supplier Analysis**: Monitor vendor performance and procurement efficiency

### **🎨 Modern UI/UX**
- **FilFlo Branding**: Custom gradient themes and glassmorphism effects
- **Material-UI Components**: Professional, accessible interface components
- **Framer Motion Animations**: Smooth, engaging user interactions
- **Mobile-First Design**: Responsive layout for all screen sizes

## 🏗️ **Architecture**

### **Frontend (React TypeScript)**
```
filflo-brain/client/
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx      # Main metrics and charts
│   │   ├── ChatInterface.tsx  # AI chat interface
│   │   ├── Analytics.tsx      # Advanced analytics
│   │   ├── Header.tsx         # Navigation header
│   │   └── Sidebar.tsx        # Navigation sidebar
│   ├── theme/
│   │   └── theme.ts          # Material-UI theme configuration
│   └── App.tsx               # Main application component
```

### **Backend (Node.js Express)**
```
filflo-brain/server/
├── controllers/
│   └── brainController.js    # Main API controller
├── services/
│   └── aiService.js          # Claude AI integration
├── config/
│   └── database.js           # MySQL connection
└── routes/
    └── brainRoutes.js        # API routes
```

### **Database Schema**
- **Dimension Tables**: Products, Customers, Suppliers, Dates
- **Fact Tables**: Sales, Inventory Activity, Purchases, Returns
- **711K+ Sales Records**: Real production data for analysis

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18.x or higher
- MySQL 8.x database
- Claude API key from Anthropic

### **Installation**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/kachao27/filflo-ai-warehouse-manager.git
   cd filflo-ai-warehouse-manager
   ```

2. **Backend Setup**
   ```bash
   cd filflo-brain/server
   npm install
   
   # Create environment file
   cp .env.example .env
   # Add your database credentials and Claude API key
   ```

3. **Frontend Setup**
   ```bash
   cd ../client
   npm install
   ```

4. **Database Configuration**
   - Ensure your MySQL database is running
   - Update `.env` file with your database credentials
   - The system will automatically connect to your existing data

5. **Start the Application**
   ```bash
   # Terminal 1: Start Backend (port 5001)
   cd filflo-brain/server
   npm start
   
   # Terminal 2: Start Frontend (port 3000)
   cd filflo-brain/client
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## 🔧 **Environment Variables**

Create a `.env` file in the `filflo-brain/server` directory:

```env
# Database Configuration
DB_HOST=your-mysql-host
DB_PORT=25060
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database-name

# AI Configuration
CLAUDE_API_KEY=your-claude-api-key

# Server Configuration
PORT=5001
NODE_ENV=production
```

## 📊 **API Endpoints**

### **Chat Interface**
- `POST /api/brain/query` - Process natural language queries
- `GET /api/brain/suggestions` - Get query suggestions
- `GET /api/brain/history/:userId` - Get user query history

### **Dashboard**
- `GET /api/brain/metrics` - Get dashboard metrics
- `GET /api/brain/tables` - List available database tables

### **Example API Usage**
```javascript
// Ask the AI a question
const response = await fetch('http://localhost:5001/api/brain/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "Show me the top 5 products by sales value",
    userId: "demo-user"
  })
});
```

## 🎯 **Sample Queries**

Try these intelligent queries with your AI assistant:

**📦 Inventory Management**
- "What products need restocking urgently?"
- "Show me inventory turnover rates"
- "Which products are overstocked right now?"

**💰 Sales Analysis**
- "What are our top-selling products this month?"
- "Show me customer sales performance"
- "Analyze revenue trends by category"

**🏭 Production Planning**
- "Generate a 3-day production plan"
- "Which raw materials are in shortage?"
- "Show me production costs analysis"

**📈 Business Intelligence**
- "What is our current fill rate?"
- "Show me supplier performance analysis"
- "Analyze order fulfillment efficiency"

## 🔒 **Security Features**

- **SQL Injection Protection**: Parameterized queries and input validation
- **Rate Limiting**: API request throttling to prevent abuse
- **Input Sanitization**: All user inputs are validated and escaped
- **SSL/TLS Encryption**: Secure database connections
- **Environment Variables**: Sensitive data stored securely

## 🚀 **Deployment**

### **Vercel Deployment (Frontend)**
```bash
cd filflo-brain/client
npx vercel --prod
```

### **Backend Deployment Options**
- **Heroku**: Easy deployment with automatic scaling
- **DigitalOcean**: App platform deployment
- **AWS EC2**: Custom server deployment
- **Docker**: Containerized deployment

### **Database Hosting**
- Currently using DigitalOcean Managed MySQL
- SSL certificate included for secure connections
- 711K+ production records ready for analysis

## 📱 **Screenshots**

### **AI Chat Interface**
![AI Chat Interface](https://via.placeholder.com/800x400/667eea/ffffff?text=AI+Chat+Interface)

### **Analytics Dashboard**
![Analytics Dashboard](https://via.placeholder.com/800x400/764ba2/ffffff?text=Analytics+Dashboard)

### **Real-time Metrics**
![Real-time Metrics](https://via.placeholder.com/800x400/4facfe/ffffff?text=Real-time+Metrics)

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18** with TypeScript
- **Material-UI v7** for components
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Axios** for API communication

### **Backend**
- **Node.js 18** with Express
- **Claude 3.5 Sonnet** for AI capabilities
- **MySQL2** for database connectivity
- **Express Validator** for input validation
- **Rate Limiting** for API protection

### **Database**
- **MySQL 8.x** with SSL
- **DigitalOcean Managed Database**
- **Optimized Schema** for warehouse operations
- **Real Production Data** (711K+ records)

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

For support and questions:
- **Email**: support@filflo.com
- **Documentation**: [Wiki](https://github.com/kachao27/filflo-ai-warehouse-manager/wiki)
- **Issues**: [GitHub Issues](https://github.com/kachao27/filflo-ai-warehouse-manager/issues)

## 🔄 **Version History**

- **v1.0.0** (Current) - Production-ready AI warehouse management system
  - ✅ Complete AI chat interface with Claude 3.5 Sonnet
  - ✅ Advanced analytics dashboard
  - ✅ Real-time metrics and visualization
  - ✅ MySQL window function optimization
  - ✅ Responsive Material-UI design
  - ✅ Production-ready backend with security features

---

**Built with ❤️ by the FilFlo Team**

*Transforming warehouse management through the power of artificial intelligence.* 