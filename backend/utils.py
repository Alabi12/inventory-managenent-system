import os
import uuid
from PIL import Image
import barcode 
from barcode.writer import ImageWriter
from io import BytesIO
import base64
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import csv
from openpyxl import Workbook
from flask import send_file

def save_image(file, folder='uploads'):
    if not os.path.exists(folder):
        os.makedirs(folder)
    
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    filepath = os.path.join(folder, filename)
    file.save(filepath)
    
    # Create thumbnail
    img = Image.open(filepath)
    img.thumbnail((300, 300))
    thumbnail_path = os.path.join(folder, f"thumb_{filename}")
    img.save(thumbnail_path)
    
    return filename, f"thumb_{filename}"

def generate_barcode(data, filename):
    try:
        if not os.path.exists('barcodes'):
            os.makedirs('barcodes')
        
        code = barcode.get_barcode_class('code128')
        barcode_image = code(data, writer=ImageWriter())
        barcode_path = f"barcodes/{filename}"
        barcode_image.save(barcode_path)
        return barcode_path
    except Exception as e:
        print(f"Error generating barcode: {e}")
        return None

def export_to_csv(data, filename):
    try:
        with open(filename, 'w', newline='', encoding='utf-8') as file:
            if data:
                writer = csv.writer(file)
                writer.writerow(data[0].keys())
                for row in data:
                    writer.writerow(row.values())
        return filename
    except Exception as e:
        print(f"Error exporting to CSV: {e}")
        return None

def export_to_excel(data, filename):
    try:
        wb = Workbook()
        ws = wb.active
        if data:
            ws.append(list(data[0].keys()))
            for row in data:
                ws.append(list(row.values()))
        wb.save(filename)
        return filename
    except Exception as e:
        print(f"Error exporting to Excel: {e}")
        return None

def export_to_pdf(data, filename, title):
    try:
        c = canvas.Canvas(filename, pagesize=letter)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(100, 750, title)
        
        c.setFont("Helvetica", 10)
        y = 700
        for row in data:
            for key, value in row.items():
                c.drawString(100, y, f"{key}: {value}")
                y -= 15
            y -= 10
            if y < 100:
                c.showPage()
                y = 750
                c.setFont("Helvetica", 10)
        
        c.save()
        return filename
    except Exception as e:
        print(f"Error exporting to PDF: {e}")
        return None