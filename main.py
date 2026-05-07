import os
import uuid
import fitz  # PyMuPDF
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

app = FastAPI()

# Enable CORS for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Use /tmp for cloud environments (like Railway/Render)
BASE_DIR = Path("/tmp/CourEditer")
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"

# Create directories
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Cour Editer API is Live!", "status": "online"}

def make_grid(input_path, output_path, rows, cols, border_thickness):
    doc = fitz.open(input_path)
    out_doc = fitz.open()
    
    # A4 dimensions in points (595 x 841)
    a4_w, a4_h = 595, 841
    
    cell_w = a4_w / cols
    cell_h = a4_h / rows
    
    page_idx = 0
    num_pages = len(doc)
    
    while page_idx < num_pages:
        new_page = out_doc.new_page(width=a4_w, height=a4_h)
        
        for r in range(rows):
            for c in range(cols):
                if page_idx < num_pages:
                    # Target rectangle for the current page in the grid
                    rect = fitz.Rect(
                        c * cell_w, 
                        r * cell_h, 
                        (c + 1) * cell_w, 
                        (r + 1) * cell_h
                    )
                    
                    # Insert the page
                    new_page.show_pdf_page(rect, doc, page_idx)
                    
                    # Draw border if requested
                    if border_thickness > 0:
                        new_page.draw_rect(rect, width=border_thickness, color=(0, 0, 0))
                    
                    page_idx += 1
                    
    out_doc.save(output_path)
    out_doc.close()
    doc.close()

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
        safe_input_name = "".join([c for c in file.filename if c.isalpha() or c.isdigit() or c in (' ', '.', '_', '-')]).rstrip()
        if not safe_input_name.endswith(".pdf"):
            safe_input_name += ".pdf"

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
async def download_file(filename: string):
    file_path = OUTPUT_DIR / filename
    if file_path.exists():
        return FileResponse(path=str(file_path), filename=filename, media_type='application/pdf')
    raise HTTPException(status_code=404, detail="File not found")
