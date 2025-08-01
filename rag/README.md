# RoomSpot RAG System

Retrieval-Augmented Generation system for intelligent housing recommendations and support.

## 🚀 Features

- **Vector Search**: Semantic search across housing data
- **LLM Integration**: OpenAI/Claude for natural responses
- **Document Processing**: PDF, text, and web content ingestion
- **Real-time Updates**: Dynamic knowledge base updates
- **Multi-modal**: Text and image processing capabilities

## 📁 Structure

```
rag/
├── src/
│   ├── __init__.py
│   └── main.py            # FastAPI application
├── data/
│   ├── documents/         # Source documents
│   ├── processed/         # Processed chunks
│   └── samples/           # Sample data
├── models/
│   ├── embeddings/        # Embedding models
│   └── llm/               # Language models
├── embeddings/
│   ├── __init__.py
│   └── generator.py       # Embedding generation
├── vector_store/
│   ├── __init__.py
│   ├── chroma_store.py    # ChromaDB integration
│   └── faiss_store.py     # FAISS integration
├── retrieval/
│   ├── __init__.py
│   ├── retriever.py       # Document retrieval
│   └── ranker.py          # Result ranking
├── generation/
│   ├── __init__.py
│   ├── generator.py       # Response generation
│   └── prompts.py         # Prompt templates
├── config/
│   ├── __init__.py
│   └── settings.py        # Configuration
├── requirements.txt       # Python dependencies
└── README.md              # This file
```

## 🛠️ Getting Started

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env

# Download models
python -m spacy download en_core_web_sm

# Start the API server
uvicorn src.main:app --reload --port 8000
```

## 🔧 Environment Variables

```env
# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Vector Database
CHROMA_HOST=localhost
CHROMA_PORT=8001
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=your-environment

# Models
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
LLM_MODEL=gpt-3.5-turbo

# API
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=info
```

## 📚 API Endpoints

### Search
- `POST /search` - Semantic search
- `POST /ask` - Ask questions with context

### Documents
- `POST /documents/upload` - Upload documents
- `GET /documents` - List documents
- `DELETE /documents/{id}` - Remove document

### Embeddings
- `POST /embeddings/generate` - Generate embeddings
- `GET /embeddings/stats` - Embedding statistics

## 🎯 Use Cases

### Housing Recommendations
- Find similar properties based on preferences
- Match students with compatible roommates
- Location-based recommendations

### Support Assistant
- Answer questions about housing policies
- Provide guidance on rental processes
- Help with maintenance requests

### Content Understanding
- Process property descriptions
- Extract key features from listings
- Analyze user reviews and feedback

## 🚀 Deployment

Ready for deployment to:
- Docker containers
- AWS Lambda/ECS
- Google Cloud Run
- Azure Container Instances 