# =========================
# IMPORTS
# =========================
import random
import pdfplumber
import numpy as np
import spacy

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

# =========================
# OPTIONAL FAISS (LINUX ONLY)
# =========================
FAISS_AVAILABLE = False


# =========================
# LOAD MODELS (ONCE)
# =========================
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
nlp = spacy.load("en_core_web_sm")

# =========================
# PDF INGESTION
# =========================
def extract_text_from_pdf(pdf_path):
    pages_text = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages_text.append(text)
    return "\n".join(pages_text)

# =========================
# FALLBACK SEARCH (WINDOWS)
# =========================
def fallback_semantic_search(query_embedding, document_embeddings, k):
    similarities = cosine_similarity(query_embedding, document_embeddings)[0]
    return similarities.argsort()[-k:][::-1]

# =========================
# VECTOR STORE
# =========================
def build_vector_store(text, model):
    sentences = [s.strip() for s in text.split(".") if len(s.strip()) > 30]
    embeddings = model.encode(sentences)
    embeddings = np.array(embeddings).astype("float32")

    if FAISS_AVAILABLE:
        index = faiss.IndexFlatL2(embeddings.shape[1])
        index.add(embeddings)
    else:
        index = None

    return {
        "sentences": sentences,
        "embeddings": embeddings,
        "index": index
    }

# =========================
# INGEST BOOK
# =========================
def ingest_new_book(pdf_path, metadata):
    text = extract_text_from_pdf(pdf_path)
    vector_store = build_vector_store(text, embedding_model)

    return {
        "metadata": metadata,
        "vector_store": vector_store
    }

# =========================
# RETRIEVAL
# =========================
def retrieve_relevant_content(book, query, top_k):
    store = book["vector_store"]
    query_embedding = embedding_model.encode([query]).astype("float32")
    document_embeddings = store["embeddings"]

    k = min(top_k, len(document_embeddings))

    if FAISS_AVAILABLE and store["index"] is not None:
        _, indices = store["index"].search(query_embedding, k)
        idxs = indices[0]
    else:
        idxs = fallback_semantic_search(query_embedding, document_embeddings, k)

    return [store["sentences"][i] for i in idxs]

# =========================
# QUESTION GENERATION
# =========================
def extract_keywords(text, limit=15):
    doc = nlp(text)
    keywords = [
        token.text for token in doc
        if token.is_alpha and not token.is_stop and token.pos_ in ["NOUN", "VERB", "PROPN"]
    ]
    return list(dict.fromkeys(keywords))[:limit]

def generate_distractors(correct, keywords, n=3):
    distractors = set()
    while len(distractors) < n:
        candidate = random.choice(keywords)
        if candidate.lower() != correct.lower():
            distractors.add(candidate.title())
    return list(distractors)

def generate_mcqs(context, count):
    keywords = extract_keywords(context)
    mcqs = []

    for kw in keywords:
        if len(mcqs) >= count:
            break

        options = generate_distractors(kw, keywords) + [kw.title()]
        random.shuffle(options)

        mcqs.append({
            "type": "mcq",
            "question": f"What best describes {kw}?",
            "options": options,
            "correct_answer": kw.title()
        })

    return mcqs

def generate_descriptive(context, count):
    keywords = extract_keywords(context)
    questions = []

    for kw in keywords[:count]:
        questions.append({
            "type": "descriptive",
            "question": f"Explain {kw}.",
            "answer": f"{kw} explanation based on the given context."
        })

    return questions

# =========================
# TEST GENERATION
# =========================
def difficulty_split(total):
    return {
        "easy": int(total * 0.4),
        "medium": int(total * 0.4),
        "hard": total - int(total * 0.8)
    }

def calculate_retrieval_size(q_count):
    return min(max(40, q_count * 2), 120)

def generate_balanced_test(book, topic, total_questions):
    split = difficulty_split(total_questions)
    k = calculate_retrieval_size(total_questions)

    context = " ".join(retrieve_relevant_content(book, topic, k))
    test = []

    test.extend(generate_mcqs(context, split["easy"]))
    test.extend(generate_descriptive(context, split["medium"] + split["hard"]))

    return test

# =========================
# EVALUATION
# =========================
def evaluate_answer(student, correct):
    emb1 = embedding_model.encode([student])
    emb2 = embedding_model.encode([correct])
    sim = cosine_similarity(emb1, emb2)[0][0]
    score = int(sim * 10)
    return min(max(score, 0), 10)

def submit_test(test, answers):
    total = 0
    max_score = 0
    results = []

    for q, ans in zip(test, answers):
        if q["type"] == "mcq":
            score = 1 if ans == q["correct_answer"] else 0
            max_q = 1
        else:
            score = evaluate_answer(ans, q["answer"])
            max_q = 10

        total += score
        max_score += max_q

        results.append({
            "question": q["question"],
            "score": score,
            "max_score": max_q
        })

    return {
        "percentage": round((total / max_score) * 100, 2),
        "results": results
    }

# =========================
# LOAD BOOK (ONCE)
# =========================
book = ingest_new_book(
    pdf_path="sample_book.pdf",  # <-- put your PDF here
    metadata={
        "book_id": "OS_001",
        "title": "Operating Systems",
        "subject": "Computer Science"
    }
)

# =========================
# FASTAPI
# =========================
app = FastAPI(title="QueryQuill Assessment API")
current_test = None

class GenerateTestRequest(BaseModel):
    topic: str
    total_questions: int

class SubmitTestRequest(BaseModel):
    answers: List[str]

@app.post("/generate-test")
def generate_test_api(data: GenerateTestRequest):
    global current_test
    current_test = generate_balanced_test(
        book,
        data.topic,
        data.total_questions
    )
    return {"questions": current_test}

@app.post("/submit-test")
def submit_test_api(data: SubmitTestRequest):
    if current_test is None:
        return {"error": "Generate a test first"}
    return submit_test(current_test, data.answers)

@app.get("/health")
def health():
    return {"status": "QueryQuill ML API running"}
