# Aerial CAD Generation
A system that converts OpenStreetMap data into CAD-compatible geometry.
---


## Tech Stack

* Backend: Python, FastAPI
* Frontend: Next.js, Tailwind CSS

---

## Flow

1. Input aerial image or spatial data
2. Detect features
3. Extract geometry
4. Build spatial relationships
5. Export CAD output

---

## Getting Started
Please consult `.template_env` for the format of the required `.env` file.

```bash
git clone https://github.com/JZ-Zhou-UofC/aerial-cad-generation.git
cd aerial-cad-generation
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```




