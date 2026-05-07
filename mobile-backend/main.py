import os
import sys
import uuid
import fitz
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Adaptive storage paths (Cloud vs Local)
if os.environ.get("RAILWAY_ENVIRONMENT") or os.environ.get("RENDER") or os.name != 'nt':
    # Cloud environments or Linux (Docker)
    DATA_DIR = Path("/tmp/CourEditer")
else:
    # Local Windows development
    DATA_DIR = Path(__file__).parent / "data"

UPLOAD_DIR = DATA_DIR / "uploads"
OUTPUT_DIR = DATA_DIR / "outputs"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ======================================================
# FastAPI App
# ======================================================
app = FastAPI(title="Cour Editer Mobile API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Cour Editer Mobile API is Running!", "status": "online"}

# ======================================================
# PDF Grid Logic
# ======================================================
def make_grid(input_pdf: str, output_pdf: str, rows: int = 3, cols: int = 2, border_thickness: float = 0.7):
    doc = fitz.open(input_pdf)
    n_pages = doc.page_count
    n_cells = rows * cols
    a4_width, a4_height = fitz.paper_size("a4")
    new_doc = fitz.open()

    for start in range(0, n_pages, n_cells):
        page = new_doc.new_page(width=a4_width, height=a4_height)
        cell_w = a4_width / cols
        cell_h = a4_height / rows
        for i in range(n_cells):
            idx = start + i
            if idx >= n_pages:
                break
            row, col = divmod(i, cols)
            x0 = col * cell_w
            y0 = row * cell_h
            rect = fitz.Rect(x0, y0, x0 + cell_w, y0 + cell_h)
            page.show_pdf_page(rect, doc, idx)
            if border_thickness > 0:
                shape = page.new_shape()
                shape.draw_rect(rect)
                shape.finish(width=border_thickness, color=(0, 0, 0))
                shape.commit()

    new_doc.save(output_pdf)
    doc.close()
    new_doc.close()

# ======================================================
# API Routes
# ======================================================
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "Cour Editer Mobile API", "version": "1.0.0"}

@app.post("/api/generate")
async def generate_pdf(
    file: UploadFile = File(...),
    rows: int = Form(3),
    cols: int = Form(2),
    borderThickness: float = Form(0.7),
    customName: str = Form(None)
):
    try:
        file_id = str(uuid.uuid4())
        
        # Sanitize input name
        safe_input_name = "".join([c for c in file.filename if c.isalpha() or c.isdigit() or c in (' ', '.', '_', '-')]).rstrip()
        if not safe_input_name.endswith(".pdf"):
            safe_input_name += ".pdf"

        # Determine output name
        if customName:
            safe_custom_name = "".join([c for c in customName if c.isalpha() or c.isdigit() or c in (' ', '.', '_', '-')]).rstrip()
            if not safe_custom_name.lower().endswith(".pdf"):
                safe_custom_name += ".pdf"
            output_filename = f"{safe_custom_name}"
        else:
            output_filename = f"grid_{file_id}_{safe_input_name}"

        input_filename = f"{file_id}_{safe_input_name}"
        input_path = str(UPLOAD_DIR / input_filename)
        output_path = str(OUTPUT_DIR / output_filename)

        with open(input_path, "wb") as f:
            f.write(await file.read())

        make_grid(input_path, output_path, rows, cols, borderThickness)

        return JSONResponse(content={
            "success": True,
            "filename": output_filename,
            "download_url": f"/api/download/{output_filename}"
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    file_path = OUTPUT_DIR / filename
    if file_path.exists():
        return FileResponse(
            str(file_path),
            filename=filename,
            media_type='application/pdf',
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    return JSONResponse(status_code=404, content={"error": "File not found"})

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
