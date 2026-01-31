# Portfolify - Resume to Portfolio Converter

A production-ready web application that converts resumes into beautiful, customizable portfolio websites using deterministic parsing.

## 🌟 Features

- **Reliable Parsing**: Rule-based resume extraction ensures consistent results
- **Multiple File Formats**: Support for PDF, DOCX, and TXT files
- **Live Editor**: Real-time preview as you customize your portfolio
- **Beautiful Themes**: Choose from professional, modern templates
- **Static Site Export**: Download complete HTML/CSS/JS ready for deployment
- **One-Click Deploy**: Deployment instructions for GitHub Pages, Netlify, and Vercel

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Parsing Pipeline**: Text extraction → Section detection → Normalization
- **MongoDB**: Portfolio and session storage
- **REST API**: Upload, retrieve, update, and export endpoints
- **File Processing**: pdf-parse, mammoth for document handling

### Frontend (Next.js + React)
- **Next.js App Router**: Modern React framework
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Zustand**: Lightweight state management
- **Real-time Preview**: Live portfolio updates

## 📦 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
```bash
cd Portfolify
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your MongoDB URI
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install

# Create .env.local file
cp .env.local .env.local
# Verify API_URL points to your backend
```

4. **Start MongoDB** (if running locally)
```bash
mongod
```

5. **Run the Application**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

6. **Open your browser**
```
http://localhost:3000
```

## 🚀 Deployment

### Backend (Render/Railway)

1. Create account on Render.com or Railway.app
2. Connect your GitHub repository
3. Set environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `NODE_ENV`: production
   - `ALLOWED_ORIGINS`: Your frontend URL
4. Deploy from `backend` directory

### Frontend (Vercel)

1. Install Vercel CLI: `npm install -g vercel`
2. From frontend directory: `vercel`
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL`: Your backend URL
4. Deploy: `vercel --prod`

### MongoDB (Atlas)

1. Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP addresses (or allow all: 0.0.0.0/0)
4. Copy connection string to backend `.env`

## 📋 Parsing Limitations

The resume parser uses deterministic, rule-based extraction which has some limitations:

- **Format Dependency**: Works best with standard resume formats
- **Section Detection**: Keywords must match common patterns (Experience, Skills, Education, etc.)
- **Complex Layouts**: Multi-column or heavily designed resumes may need manual adjustment
- **Name Detection**: Assumes name is in the first few lines
- **Date Formats**: Best with standard formats (e.g., "2020-2023", "Jan 2020 - Present")

### Best Practices for Resume Formatting

- Use clear section headers (Skills, Experience, Education)
- Standard bullet points for lists
- Consistent date formats
- Plain text formatting (avoid excessive styling)
- Contact information at the top

## 🔧 Extension Ideas

- **User Accounts**: Add authentication for saving multiple portfolios
- **More Themes**: Additional portfolio templates (Dark mode, Minimalist, Creative)
- **Custom Domains**: Integration with domain providers
- **Analytics**: Track portfolio views and visitors
- **AI Enhancement**: Optional AI-powered grammar refinement (already stubbed in code)
- **PDF Export**: Generate PDF version of portfolio
- **Social Sharing**: Open Graph meta tags for better social media previews
- **Image Upload**: Allow users to add profile pictures and project screenshots
- **SEO Optimization**: Meta tags, sitemaps, and structured data

## 📁 Project Structure

```
Portfolify/
├── backend/
│   ├── config/          # Database and upload configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Error handling, validation
│   ├── models/          # MongoDB schemas
│   ├── parsers/         # Resume parsing logic
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   └── server.js        # Express app entry point
│
└── frontend/
    ├── app/             # Next.js pages and layouts
    ├── components/      # React components
    ├── lib/             # API client
    ├── store/           # State management
    └── public/          # Static assets
```

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js, React, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Parsing | pdf-parse, mammoth |
| State | Zustand |
| Deployment | Vercel (Frontend), Render (Backend) |

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload and parse resume |
| GET | `/api/portfolio/:id` | Get portfolio by ID |
| PUT | `/api/portfolio/:id` | Update portfolio |
| GET | `/api/portfolio/:id/export` | Export as static site ZIP |

## 🤝 Contributing

This is a production-ready application. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for your own purposes.

## 🙏 Acknowledgments

Built with a focus on **reliability over cleverness**. Parsing is deterministic first, AI-assisted second.

---

**Made with ❤️ by Abrar**
