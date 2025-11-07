# ICMA - Hadith Chain Analysis

A modern web application for analyzing and visualizing Islamic hadith chains (isnad) with advanced AI-powered narrator extraction and interactive chain management.

## ✨ Features

### 🔍 **AI-Powered Narrator Extraction**
- Uses Google Gemini AI to automatically extract narrators from Arabic hadith text
- Intelligent parsing of complex hadith chains with multiple narrators
- Real-time processing with loading indicators
- Automatic narrator matching against biographical database
- Auto-assignment of reputation grades based on scholarly opinions

### 🎯 **Interactive Chain Management**
- **Edit Mode**: Full editing capabilities for chain titles and narrator names
- **Add Narrators**: Manually add new narrators to existing chains
- **Remove Narrators**: Delete unwanted narrators with automatic renumbering
- **Drag & Drop**: Reorder narrators by dragging with visual feedback

### 📊 **Advanced Visualization**
- **Mermaid.js Integration**: Beautiful flowchart visualization of hadith chains
- **Combined View**: See all chains in one comprehensive visualization
- **Theme Support**: Automatic dark/light mode adaptation
- **Responsive Design**: Works seamlessly on all screen sizes

### 🎨 **User Experience**
- **Collapsible Cards**: Expand/collapse individual chains for better organization
- **Persistent Storage**: All data automatically saved to localStorage
- **Keyboard Navigation**: Full accessibility support with keyboard controls
- **Mobile Optimized**: Touch-friendly interface for mobile devices

### 🔧 **Technical Features**
- **Next.js 15**: Latest React framework with App Router
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Modern utility-first styling
- **@dnd-kit**: Professional drag-and-drop functionality
- **Google Gemini AI**: Advanced AI integration for text analysis
- **SQLite Database**: Comprehensive narrator biographical database
- **Narrator Matching**: Intelligent fuzzy matching against historical records

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ICMA
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Basic Workflow
1. **Paste Hadith Text**: Enter Arabic hadith text in the input field
2. **Extract Narrators**: Click "Extract Narrators" to use AI analysis
3. **Review & Edit**: Edit chain titles, narrator names, or add/remove narrators
4. **Visualize**: View the beautiful chain visualization
5. **Organize**: Collapse chains to manage multiple analyses

### Advanced Features
- **Drag narrators** to reorder them in the chain
- **Click anywhere on headers** to collapse/expand chains
- **Add multiple chains** for comparative analysis
- **Edit existing chains** to correct or modify data
- **Automatic narrator matching** against biographical database
- **Reputation grade assignment** based on scholarly opinions

## 🔌 API Endpoints

### Narrator Extraction
- `POST /api/extract-narrators` - Extract narrators from hadith text using AI

### Narrator Matching
- `POST /api/match-narrators` - Match extracted narrators to database and assign grades

### Narrator Search
- `GET /api/narrators` - Search narrators by name, death year, etc.
- `GET /api/narrators/[id]` - Get detailed narrator information

### Chain Management
- `GET /api/chains` - List all saved chains
- `POST /api/chains` - Load a specific chain by path

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: Google Gemini AI
- **Drag & Drop**: @dnd-kit
- **Visualization**: Mermaid.js
- **State Management**: React Hooks
- **Data Persistence**: localStorage

## 📁 Project Structure

```
ICMA/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chains/
│   │   │   │   └── route.ts          # Chain storage and retrieval API
│   │   │   ├── extract-narrators/
│   │   │   │   └── route.ts          # AI narrator extraction API
│   │   │   ├── match-narrators/
│   │   │   │   └── route.ts          # Narrator matching and grading API
│   │   │   └── narrators/
│   │   │       ├── route.ts          # Narrator search API
│   │   │       └── [id]/
│   │   │           └── route.ts     # Individual narrator details API
│   │   ├── layout.tsx                # Root layout with theme provider
│   │   ├── page.tsx                  # Main application page
│   │   ├── privacy-policy/          # Privacy policy page
│   │   └── terms-of-service/        # Terms of service page
│   ├── components/
│   │   └── HadithAnalyzer.tsx        # Main analyzer component
│   └── contexts/
│       └── ThemeContext.tsx          # Dark/light theme context
├── data/
│   ├── db.ts                         # Database connection utilities
│   ├── types.ts                      # TypeScript type definitions
│   ├── schema.sql                    # Database schema
│   ├── narrator-matcher.ts          # Narrator matching algorithms
│   ├── grade-extractor.ts            # Reputation grade extraction
│   ├── import-shamela-to-db.ts       # Shamela data import utilities
│   └── narrators.db                  # SQLite database file
├── scripts/                          # Utility scripts
├── chains/                           # Exported chain JSON files
├── docs/                             # Documentation and examples
├── public/                           # Static assets
└── README.md                         # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful text analysis capabilities
- **Mermaid.js** for beautiful diagram generation
- **@dnd-kit** for professional drag-and-drop functionality
- **Next.js** and **React** communities for excellent frameworks