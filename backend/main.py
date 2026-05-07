import os
import sys
import uuid
import fitz
import threading
import webbrowser
from pathlib import Path
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

if sys.stdout is None:
    sys.stdout = open(os.devnull, "w")
if sys.stderr is None:
    sys.stderr = open(os.devnull, "w")

# ======================================================
# تحديد مسارات الملفات سواء في وضع التطوير أو الحزمة .exe
# ======================================================
if getattr(sys, 'frozen', False):
    # نحن داخل exe مُحزَّم بـ PyInstaller
    BASE_DIR = Path(sys._MEIPASS)
else:
    BASE_DIR = Path(__file__).parent

# دائماً نستخدم مجلد Documents\CourEditer لتجنب مشاكل OneDrive والصلاحيات
DATA_DIR = Path.home() / "Documents" / "CourEditer"

DIST_DIR = BASE_DIR / "dist"
UPLOAD_DIR = DATA_DIR / "uploads"
OUTPUT_DIR = DATA_DIR / "outputs"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ======================================================
# FastAPI App
# ======================================================
app = FastAPI(title="Cour Editer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================================
# منطق معالجة PDF
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
        
        # Sanitize input filename
        safe_input_name = "".join([c for c in file.filename if c.isalpha() or c.isdigit() or c in (' ', '.', '_', '-')]).rstrip()
        if not safe_input_name.endswith(".pdf"):
            safe_input_name += ".pdf"
            
        # Determine output filename
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
        return FileResponse(str(file_path), filename=filename, media_type='application/pdf')
    return JSONResponse(status_code=404, content={"error": "File not found"})

# ======================================================
# تقديم ملفات الواجهة الأمامية React المبنية
# ======================================================
if DIST_DIR.exists():
    app.mount("/", StaticFiles(directory=str(DIST_DIR), html=True), name="static")

# ======================================================
# نقطة الإطلاق
# ======================================================
def run_server():
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")

if __name__ == "__main__":
    import time
    import webview
    import shutil
    
    class Api:
        def __init__(self):
            self.window = None

        def save_file_dialog(self, filename):
            source_path = OUTPUT_DIR / filename
            if not source_path.exists():
                return {"success": False, "error": "File not found"}
                
            file_types = ('PDF files (*.pdf)', 'All files (*.*)')
            result = self.window.create_file_dialog(
                webview.SAVE_DIALOG, 
                directory='', 
                save_filename=filename, 
                file_types=file_types
            )
            
            if result and len(result) > 0:
                dest_path = result[0]
                try:
                    shutil.copy2(source_path, dest_path)
                    return {"success": True, "path": dest_path}
                except Exception as e:
                    return {"success": False, "error": str(e)}
            return {"success": False, "error": "Cancelled"}

    # تشغيل خادم FastAPI في مسار خلفي
    t = threading.Thread(target=run_server)
    t.daemon = True
    t.start()
    
    # انتظار الخادم ليبدأ
    time.sleep(1.5)
    
    api = Api()
    # فتح نافذة التطبيق المستقلة
    window = webview.create_window("Cour Editer", "http://127.0.0.1:8000", width=1200, height=800, js_api=api)
    api.window = window
    webview.start()
