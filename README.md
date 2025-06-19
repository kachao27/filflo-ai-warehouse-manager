# 🚀 FilFlo AI Warehouse Manager

**A Production-Ready AI-Powered Warehouse Management System**

The FilFlo AI Warehouse Manager is an intelligent, enterprise-grade solution designed to bring the power of AI to your warehouse operations. It provides real-time data analysis, advanced analytics, and a conversational AI interface to help you make smarter, faster decisions.

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![MySQL](https://img.shields.io/badge/MySQL-8.x-orange)
![AI Model](https://img.shields.io/badge/AI_Model-OpenAI_o3--mini-purple)

---

## 🌟 Core Features

### **🧠 Conversational AI Analyst**
- **Natural Language Queries**: Ask complex questions about your warehouse in plain English.
- **Deep Data Analysis**: Get instant insights from your **3.7 Million+** sales records.
- **Intelligent SQL Generation**: The AI automatically translates your questions into optimized, secure SQL queries.
- **Context-Aware Conversations**: The AI remembers your conversation history for seamless follow-up questions and deeper analysis.

### **📊 Real-Time Analytics Dashboard**
- **Live Metrics**: Track key performance indicators (KPIs) like revenue, order volume, and inventory status.
- **Interactive Visualizations**: Explore sales trends, product performance, and inventory levels with dynamic charts.
- **Responsive & Modern UI**: A clean, beautiful user interface built with Material-UI that works perfectly on any device.

### **💼 Business Intelligence Suite**
- **Inventory Optimization**: Identify overstocked/understocked products and analyze inventory age.
- **Sales & Procurement**: Analyze sales velocity, supplier turnaround times, and procurement needs.
- **Production & Fulfillment**: Generate production plans and monitor fulfillment efficiency.

---

## 🏗️ System Architecture

The application is built with a modern frontend and a robust backend, ensuring scalability and performance.

### **Frontend (React + TypeScript)**
Located in the `client/` directory, the frontend is a responsive single-page application (SPA) built with React and Material-UI.

### **Backend (Node.js + Express)**
Located in the `server/` directory, the backend provides a secure REST API, handles database connections, and integrates with the OpenAI `o3-mini` model for AI-powered analysis.

### **Folder Structure**
```
filflo/
├── client/              # React Frontend Application
│   ├── src/
│   └── public/
├── server/              # Node.js Backend API
│   ├── controllers/
│   ├── services/      # Contains the AI Service
│   ├── routes/
│   └── config/
├── scripts/             # Setup & Environment Scripts
├── .env                 # Environment Variables (IMPORTANT: Not committed)
├── package.json         # Project dependencies and scripts
└── README.md            # This file
```

---

## 🚀 Getting Started

Follow these steps to set up and run the FilFlo AI Warehouse Manager on your local machine.

### **Prerequisites**
- **Node.js**: Version 18.x or higher
- **npm**: (Comes with Node.js)
- **Git**: For cloning the repository
- **MySQL Database**: A running instance of MySQL (e.g., local, Docker, or a managed service like DigitalOcean).
- **OpenAI API Key**: A valid API key with access to the `o3-mini` model.

### **Installation & Setup**

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/kachao27/filflo-ai-warehouse-manager.git
    cd filflo-ai-warehouse-manager
    ```

2.  **Install Dependencies**
    This project uses a single `package.json` at the root. We'll install both server and client dependencies and run them concurrently.
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory of the project. You can copy the example file to get started:
    ```bash
    cp env.example .env
    ```
    Now, open the `.env` file and fill in your specific credentials:
    ```env
    # Database Configuration
    DB_HOST=your-mysql-host
    DB_PORT=25060
    DB_USER=your-username
    DB_PASSWORD=your-password
    DB_NAME=filflo_db

    # AI Configuration (OpenAI o3-mini)
    OPENAI_API_KEY=your_openai_api_key_here

    # Server Configuration
    PORT=5001
    NODE_ENV=development
    ```
    **IMPORTANT**: Make sure your database credentials and OpenAI API key are correct.

### **Running the Application**

Once the setup is complete, you can start the entire application (both frontend and backend) with a single command from the root directory:

```bash
npm run dev
```

This command will:
- Start the backend API server on **`http://localhost:5001`**.
- Start the frontend React development server on **`http://localhost:3000`**.

Your browser should automatically open to the application. If not, you can access it at `http://localhost:3000`.

---

## 🔧 API Endpoints

The backend exposes the following REST API endpoints:

- `POST /api/brain/query`: The primary endpoint for sending natural language queries to the AI.
- `GET /api/brain/suggestions`: Retrieves a list of sample questions to ask.
- `GET /api/brain/history/:userId`: Fetches the query history for a specific user.
- `GET /api/brain/conversation/:userId`: Retrieves the conversation history for debugging.
- `DELETE /api/brain/conversation/:userId`: Clears the conversation history for a user.

---

## 🔒 Security

Security is a top priority for the FilFlo Warehouse Manager:

- **Environment Variables**: All sensitive keys and credentials are loaded from a `.env` file, which is not committed to source control.
- **SQL Injection Prevention**: The system uses parameterized queries to prevent SQL injection attacks. The AI-generated SQL is also validated against a strict allowlist of commands (only `SELECT` and `WITH` are permitted).
- **Input Validation**: User inputs are validated and sanitized on the backend.
- **Secure Database Connection**: Supports SSL connections to your MySQL database for data-in-transit encryption.

---

## 🛠️ Technology Stack

- **Frontend**: React 18 (with TypeScript), Material-UI, Recharts, Axios
- **Backend**: Node.js (with Express), `mysql2`
- **AI**: OpenAI `o3-mini` for advanced reasoning and SQL generation
- **Database**: MySQL 8.x
- **Development**: `concurrently` to run frontend and backend together, `nodemon` for live server reloads.

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