# ICMA - Advanced Hadith Chain Analysis Platform

A comprehensive web application for Islamic hadith research featuring ICMA methodology implementation, AI-powered narrator extraction, advanced grading systems, and interactive chain analysis tools for academic scholars and researchers.

## ✨ Core Features

### 🧠 **AI-Powered Narrator Extraction & Analysis**
- **Google Gemini AI Integration**: Advanced natural language processing for extracting narrators from Arabic hadith text
- **Intelligent Chain Parsing**: Handles complex multi-narrator chains with high accuracy
- **Real-time Processing**: Live feedback with loading states and progress indicators
- **Automatic Biographical Matching**: Fuzzy matching against comprehensive narrator database
- **Scholarly Reputation Grading**: Automated assignment of authenticity grades based on historical scholarly opinions

### 📊 **Advanced Grading & Scoring System**
- **Frequency-Weighted Grading**: Narrator reputations weighted by frequency of scholarly citations
- **Conflict Resolution**: Automatic penalty system for conflicting scholarly opinions
- **Chain-wide Analysis**: Aggregate scoring across entire transmission chains
- **Visual Grade Indicators**: Color-coded reputation display with detailed explanations
- **Custom Grading Interface**: Manual reputation assignment and editing capabilities

### 🎯 **Comprehensive Chain Management**
- **Multi-Input Methods**: LLM extraction, manual builder, narrator search, and hadith database integration
- **Full Edit Capabilities**: Modify chain titles, narrator names, and reputation grades
- **Dynamic Narrator Addition/Removal**: Add or remove narrators with automatic renumbering
- **Professional Drag & Drop**: @dnd-kit powered reordering with visual feedback
- **Bulk Operations**: Import/export chains, manage multiple chains simultaneously

### 📈 **Advanced Visualization & Analysis**
- **Mermaid.js Integration**: Interactive flowchart visualization with pan/zoom capabilities
- **Multi-Chain Comparison**: Combined view for analyzing multiple chains simultaneously
- **Color-Coded Narrators**: Visual distinction based on reputation grades
- **Interactive Elements**: Clickable nodes with detailed narrator information
- **Export Capabilities**: Generate shareable chain diagrams and data exports

### 🔍 **Powerful Research Tools**
- **Narrator Biographical Database**: 10,000+ entries from Shamela.ws with full biographical details
- **Advanced Search**: Multi-field search across names, death years, and scholarly opinions
- **Detailed Narrator Profiles**: Complete biographical information with scholarly assessments
- **Relationship Mapping**: Narrator connections and lineage visualization
- **Cross-Reference System**: Links between related narrators and hadith collections

### 📚 **Multiple Input Sources**
- **LLM Tab**: AI-powered extraction from Arabic text input
- **Manual Builder**: Step-by-step chain construction with narrator search
- **Narrators Tab**: Direct narrator database browsing and selection
- **Hadith Tab**: Integration with Sunnah.com API for authentic hadith sourcing
- **File Import**: Load saved chain configurations from JSON files
- **Library Import**: Access pre-built example chains and templates

### 🎨 **Enhanced User Experience**
- **Dark/Light Theme Support**: Automatic system adaptation with manual toggle
- **Collapsible Interface**: Expand/collapse chains for organized multi-chain analysis
- **Persistent Local Storage**: Automatic saving with cache management options
- **Full Keyboard Navigation**: Accessibility-compliant controls throughout
- **Mobile-Responsive Design**: Touch-optimized interface for tablets and phones
- **Progressive Web App**: Installable on mobile devices for offline access
- **Settings Management**: API key configuration and application preferences

### 🔧 **Technical Architecture**
- **Next.js 15**: Latest React framework with App Router and server components
- **TypeScript**: Complete type safety with strict mode and advanced types
- **Tailwind CSS**: Utility-first styling with dark mode support
- **@dnd-kit**: Professional drag-and-drop with keyboard and screen reader support
- **Google Gemini AI**: Advanced AI integration for Arabic text processing
- **SQLite Database**: Comprehensive biographical database with optimized queries
- **RESTful API Design**: Clean backend endpoints with proper error handling
- **State Management**: useReducer pattern with predictable state transitions
- **Component Architecture**: Modular, feature-based component organization

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

## 📖 Usage Guide

### Quick Start Workflow
1. **Choose Input Method**: Select from LLM, Manual, Narrators, or Hadith tabs
2. **Enter Content**: Paste Arabic text, search narrators, or load from hadith database
3. **AI Processing**: Let Gemini AI extract and analyze narrators automatically
4. **Review Matches**: Accept/reject AI-suggested narrator identifications
5. **Edit & Refine**: Modify grades, reorder narrators, or add missing ones
6. **Visualize**: Explore interactive chain diagrams with reputation indicators
7. **Export Results**: Save chains for research documentation

### Advanced Research Workflows

#### **Academic Hadith Analysis**
- Use **Hadith Tab** to source authentic narrations from Sunnah.com
- Apply **ICMA methodology** with automated grading calculations
- Compare **multiple chains** side-by-side for isnad analysis
- Export **visual diagrams** for publications and presentations

#### **Narrator Biographical Research**
- Browse **10,000+ narrator database** with full biographical details
- Search by **name, death year, or scholarly reputation**
- View **detailed profiles** with scholarly opinions and relationships
- Analyze **narrator networks** and transmission patterns

#### **Multi-Chain Comparative Analysis**
- Import **multiple chains** for comparative isnad studies
- Use **combined visualization** to identify common narrators
- Apply **frequency-weighted grading** across transmission networks
- Detect **conflicting scholarly opinions** automatically

### Input Methods Overview

#### **LLM Extraction Tab**
- Paste Arabic hadith text for AI analysis
- Automatic narrator extraction with confidence scores
- Real-time matching against biographical database
- Batch processing for multiple hadiths

#### **Manual Builder Tab**
- Step-by-step chain construction
- Interactive narrator search and selection
- Manual grade assignment with expert guidance
- Full control over chain structure

#### **Narrators Tab**
- Direct database browsing and filtering
- Advanced search with multiple criteria
- Quick chain building from known narrators
- Biographical preview before selection

#### **Hadith Tab**
- Integration with Sunnah.com API
- Authenticated hadith sourcing
- Automatic chain extraction from collections
- Cross-reference with existing analyses

## 🔌 API Endpoints

### Core Analysis APIs
- `POST /api/extract-narrators` - AI-powered narrator extraction from Arabic text
- `POST /api/match-narrators` - Intelligent narrator matching with biographical database
- `POST /api/grading/calculate` - Advanced reputation grade calculations

### Narrator Research APIs
- `GET /api/narrators` - Advanced narrator search with filtering and pagination
- `GET /api/narrators/[id]` - Complete biographical profiles with scholarly opinions
- `POST /api/narrators/search` - Multi-field search across narrator database
- `GET /api/narrators/import-shamela` - Import narrator data from Shamela.ws

### Chain Management APIs
- `GET /api/chains` - List and manage saved chain configurations
- `POST /api/chains` - Save/load chain data with full state preservation
- `DELETE /api/chains/[id]` - Remove unwanted chain analyses

### External Integrations
- `GET /api/sunnah` - Fetch authentic hadith from Sunnah.com API
- `GET /api/hadith/[collection]/[number]` - Retrieve specific hadith entries

## 🛠️ Technology Stack

### Frontend Architecture
- **Next.js 15**: App Router with server components and API routes
- **React 19**: Latest React with concurrent features and hooks
- **TypeScript**: Strict type checking with advanced type definitions
- **Tailwind CSS**: Utility-first styling with dark mode and responsive design

### Core Libraries & Integrations
- **@dnd-kit**: Professional drag-and-drop with accessibility support
- **Mermaid.js**: Interactive diagram generation and visualization
- **Google Gemini AI**: Advanced natural language processing for Arabic text
- **Better SQLite3**: High-performance database operations

### State & Data Management
- **useReducer**: Predictable state management with complex state logic
- **localStorage API**: Persistent client-side data with cache management
- **Custom Hooks**: Encapsulated business logic and API integrations
- **Service Layer**: Clean separation of business logic from UI components

### Development & Quality
- **ESLint**: Code quality and consistency enforcement
- **TypeScript Compiler**: Strict compilation with advanced error checking
- **Modular Architecture**: Feature-based component organization
- **Progressive Enhancement**: Graceful degradation and accessibility focus

## 🔬 Research Methodology

### ICMA Framework Implementation
- **Isnād-cum-Matn Analysis**: Integrated approach combining chain and text criticism
- **Automated Grading**: Frequency-weighted reputation scoring based on scholarly consensus
- **Conflict Resolution**: Penalty system for contradictory scholarly opinions
- **Chain Dating**: Relative chronology based on narrator lifespans and relationships

### AI-Powered Analysis
- **Natural Language Processing**: Advanced Arabic text analysis with Google Gemini
- **Pattern Recognition**: Automatic identification of transmission terminology
- **Contextual Understanding**: Semantic analysis of hadith transmission language
- **Confidence Scoring**: Reliability metrics for AI-generated extractions

### Scholarly Standards
- **Biographical Database**: 10,000+ narrators from authoritative Islamic sources
- **Cross-Referenced Grading**: Multiple scholarly opinions with citation tracking
- **Historical Context**: Integration of death dates and geographical factors
- **Academic Rigor**: Transparent methodology with reproducible results

## 📁 Project Structure

```
ICMA/
├── src/
│   ├── app/
│   │   ├── api/                      # REST API endpoints
│   │   │   ├── chains/               # Chain management APIs
│   │   │   ├── extract-narrators/    # AI narrator extraction
│   │   │   ├── match-narrators/      # Biographical matching
│   │   │   ├── narrators/            # Narrator database APIs
│   │   │   ├── hadith/               # Hadith integration APIs
│   │   │   └── sunnah/               # Sunnah.com integration
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── page.tsx                  # Main application interface
│   │   ├── globals.css               # Global styles and themes
│   │   ├── privacy-policy/           # Legal pages
│   │   └── terms-of-service/
│   ├── components/
│   │   ├── HadithAnalyzer.tsx        # Main analyzer component
│   │   └── hadith-analyzer/          # Feature-based components
│   │       ├── chains/               # Chain management UI
│   │       ├── input/                # Multi-tab input system
│   │       ├── narrators/            # Narrator selection UI
│   │       ├── matching/             # Match confirmation modals
│   │       ├── settings/             # Configuration interfaces
│   │       └── visualization/        # Chart and diagram components
│   ├── contexts/
│   │   └── ThemeContext.tsx          # Theme management
│   ├── hooks/
│   │   └── useHadithAnalyzer.ts      # Main business logic hook
│   ├── lib/
│   │   ├── cache/                    # Storage utilities
│   │   ├── chains/                   # Chain manipulation logic
│   │   ├── grading/                  # Reputation calculation system
│   │   └── parsers/                  # Text processing utilities
│   ├── reducers/                     # State management
│   ├── services/                     # Business logic services
│   └── types/                        # TypeScript definitions
├── data/
│   ├── db.ts                         # Database connection layer
│   ├── types.ts                      # Data type definitions
│   ├── schema.sql                    # Database schema
│   ├── *.db                          # SQLite database files
│   ├── narrator-matcher.ts           # Fuzzy matching algorithms
│   ├── grade-extractor.ts            # Reputation processing
│   ├── fetch-shamela.ts              # External data fetching
│   └── import-*.ts                   # Data import utilities
├── scripts/
│   ├── import/                       # Data import scripts
│   ├── debug/                        # Testing and debugging tools
│   ├── database/                     # Database maintenance scripts
│   └── README.md                     # Scripts documentation
├── docs/                             # Research documentation
├── chains/                           # Example chain configurations
├── public/                           # Static assets and icons
└── README.md                         # This documentation
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