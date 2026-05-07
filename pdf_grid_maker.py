# requirements:
# pip install PyMuPDF

# pyrefly: ignore [missing-import]
import fitz  # PyMuPDF

def make_grid(input_pdf, output_pdf, rows=3, cols=2, border_thickness=0.7):
    """
    تقوم هذه الدالة بأخذ ملف PDF ودمج صفحاته في شبكة (Grid) داخل صفحات A4 جديدة.
    """
    doc = fitz.open(input_pdf)
    n_pages = doc.page_count
    n_cells = rows * cols

    # حجم صفحة A4 بالنقاط (pt)
    a4_width, a4_height = fitz.paper_size("a4")

    new_doc = fitz.open()

    for start in range(0, n_pages, n_cells):
        # إنشاء صفحة A4 جديدة
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

            # إدراج الصفحة الأصلية داخل الخلية
            src_page = doc[idx]
            page.show_pdf_page(rect, doc, idx)

            # رسم الحدود السوداء الرفيعة
            shape = page.new_shape()
            shape.draw_rect(rect)
            shape.finish(width=border_thickness, color=(0, 0, 0))
            shape.commit()

    new_doc.save(output_pdf)
    print(f"تم إنشاء الملف بنجاح: {output_pdf}")

if __name__ == "__main__":
    # الاستخدام:
    # ضع مسار الملف الأصلي ومسار الملف الجديد هنا
    input_file = "موقع الملف.pdf"
    output_file = "موقع الملف و اسمه الجديد.pdf"
    
    make_grid(input_file, output_file)
