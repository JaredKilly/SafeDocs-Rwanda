# SafeDocs Rwanda - Scanner & OCR Integration Guide

## 🎉 What's New

A complete **Scanner-First** interface with OCR integration has been added to SafeDocs Rwanda! You can now:

✅ Scan documents using your hardware scanner or mobile camera
✅ Batch scan multiple pages into a single PDF
✅ Process documents with OCR to extract searchable text
✅ Review and rotate pages before upload
✅ Auto-organize scanned documents with metadata

---

## 📸 Scanner Features

### **4-Step Scanning Workflow**

#### **Step 1: Scan Documents**
- **Hardware Scanner**: Click "Use Scanner or Upload Files" to select from your scanner
- **Mobile Camera**: Click "Use Camera" to capture photos with your device camera
- **Multi-page**: Add as many pages as you need for a single document
- Supports: Images (JPG, PNG) and PDFs

#### **Step 2: Review & Edit**
- Preview all scanned pages in a grid view
- **Rotate** pages with one click
- **Delete** unwanted pages
- **Add more pages** if needed
- View page details (size, format)

#### **Step 3: OCR & Metadata**
- Enter document title (auto-suggested based on scan time)
- Add optional description
- Choose destination folder
- **Enable/Disable OCR** processing
- OCR extracts text from images for search indexing

#### **Step 4: Upload**
- Review final document summary
- All pages are combined into a single PDF
- OCR text is stored as metadata
- Upload to SafeDocs with one click

---

## 🔧 Setup & Configuration

### **Backend Configuration**

Update your [`backend/.env`](backend/.env) file:

```bash
# OCR Configuration
OCR_ENABLED=true
OCR_ENDPOINT=          # Leave empty for development (uses mock OCR)
OCR_API_KEY=           # Optional: API key for external OCR service

# For Development (Mock OCR)
# Leave OCR_ENDPOINT empty - will use simulated OCR results

# For Production with External OCR API
# OCR_ENDPOINT=https://your-ocr-api.com/process
# OCR_API_KEY=your_api_key_here

# For Production with Tesseract.js (Local)
# Install: npm install tesseract.js
# Leave OCR_ENDPOINT empty - will auto-detect and use Tesseract
```

### **OCR Backend Options**

SafeDocs supports **3 OCR backends**:

#### **1. Mock OCR (Development)**
- **Default** when `OCR_ENDPOINT` is not configured
- Returns simulated OCR text for testing
- No setup required
- **Use for**: Development and testing

#### **2. External OCR API (Recommended for Production)**
- Configure `OCR_ENDPOINT` to point to your OCR service
- Supports services like:
  - Google Cloud Vision API
  - AWS Textract
  - Azure Computer Vision
  - Tesseract OCR Server
  - Custom OCR endpoints
- **Use for**: Production with high accuracy

#### **3. Tesseract.js (Local Processing)**
- Falls back to Tesseract if no external API configured
- Install: `cd backend && npm install tesseract.js`
- Runs OCR locally in Node.js
- **Use for**: Self-hosted deployments without external API

---

## 🚀 How to Use the Scanner

### **From Dashboard**
1. Login to SafeDocs
2. Click the orange **"Scan Documents"** button (Quick Actions section)
3. Or use the **"Scanner"** button in the top navigation

### **From Documents Page**
1. Navigate to Documents
2. Use the existing upload button (scanner option available in upload modal)

### **Direct Access**
- URL: `http://localhost:3000/scanner`

---

## 📱 Using Your Hardware Scanner

### **Desktop Scanner Setup**

Most hardware scanners appear as a file source in your operating system:

1. **Windows**:
   - Connect your scanner
   - Install scanner drivers (if needed)
   - In SafeDocs Scanner page, click "Use Scanner or Upload Files"
   - Your scanner should appear in the file dialog
   - Select "Scanner" or "WIA-" device

2. **macOS**:
   - Connect your scanner
   - System Preferences → Printers & Scanners
   - Add your scanner
   - In SafeDocs, click "Use Scanner"
   - Scanner appears in file picker

3. **Linux**:
   - Install SANE drivers: `sudo apt-get install sane sane-utils`
   - Configure scanner: `sudo sane-find-scanner`
   - Use scanner through file picker in SafeDocs

### **Mobile Camera as Scanner**

On mobile devices:
1. Click **"Use Camera"** button
2. Your device camera will open
3. Take a photo of the document
4. Repeat for multiple pages
5. Continue to review and upload

---

## 🔍 OCR Processing

### **How OCR Works**

1. **Automatic**: When enabled, OCR runs on Step 3 (before upload)
2. **Per-page**: Each scanned page is processed individually
3. **Text Extraction**: OCR extracts text from images
4. **Metadata**: Extracted text is stored with the document for search
5. **Progress**: Visual feedback shows processing status

### **OCR Results**

- Confidence score (if available)
- Processing time
- Language detection
- Full text extraction

### **Best Practices for OCR**

✅ **Use high-quality scans** (300 DPI or higher)
✅ **Ensure good lighting** for camera scans
✅ **Align documents** properly (not skewed)
✅ **Use clear fonts** for better accuracy
✅ **Avoid handwritten text** (lower accuracy)

---

## 🗂️ Organizing Scanned Documents

### **Naming Convention**

Default title format: `Scan [Date] [Time]`
Example: `Scan Jan 15, 2026 10:30 AM`

**Best Practice**: Rename to descriptive titles
- ❌ `Scan Jan 15, 2026 10:30 AM`
- ✅ `Invoice #1234 - Acme Corp`
- ✅ `Contract - John Doe - 2026`

### **Folder Organization**

Create folders for different document types:
- 📁 Invoices
- 📁 Contracts
- 📁 Receipts
- 📁 Legal Documents
- 📁 Personal

Select folder during Step 3 (OCR & Metadata)

---

## 🎨 Scanner UI Features

### **Drag & Drop**
- Drag files directly onto the scanner interface
- Supports multiple files
- Visual feedback when dragging

### **Preview Grid**
- Thumbnail view of all pages
- Page numbers
- File size display
- Quick actions (rotate, delete, preview)

### **Full Preview**
- Click "eye" icon to view full-size preview
- Zoom and inspect scan quality
- Close and return to grid

### **Page Management**
- **Rotate**: 90° clockwise rotation per click
- **Delete**: Remove unwanted pages
- **Reorder**: (Coming soon)

---

## 🔐 Security & Privacy

- **Encrypted Storage**: All documents stored securely
- **Access Control**: Permission-based document access
- **Audit Logging**: All scanning activities logged
- **Temporary Files**: Uploaded files cleaned up after processing
- **No External Sharing**: OCR processed locally or via configured API only

---

## 🧪 Testing the Scanner

### **Development Mode Testing**

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm start`
3. Navigate to: `http://localhost:3000/scanner`
4. Upload test images
5. Verify mock OCR works (returns simulated text)

### **Check OCR Status**

API Endpoint: `GET /api/ocr/status`

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/ocr/status
```

Response:
```json
{
  "available": true,
  "enabled": true,
  "configured": false,
  "endpoint": "Not configured",
  "mode": "Mock (Development)"
}
```

---

## 🐛 Troubleshooting

### **Scanner not detected**
- Install scanner drivers
- Check USB connection
- Restart browser
- Try "Upload Files" instead

### **OCR not working**
- Check `OCR_ENABLED=true` in `.env`
- Verify backend is running
- Check browser console for errors
- Test with `/api/ocr/status` endpoint

### **Upload fails**
- Check file size limit (default 50MB)
- Verify `MAX_FILE_SIZE` in `.env`
- Check network connection
- Look at backend logs

### **Poor OCR quality**
- Use higher resolution scans
- Improve lighting
- Ensure document is not skewed
- Try grayscale instead of color

---

## 📊 Scanner Workflow Diagram

```
┌─────────────────┐
│  1. Scan Pages  │
│  - Scanner      │
│  - Camera       │
│  - Upload       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 2. Review Pages │
│  - Preview      │
│  - Rotate       │
│  - Delete       │
│  - Add More     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 3. OCR & Meta   │
│  - Title        │
│  - Description  │
│  - Folder       │
│  - Enable OCR   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   4. Upload     │
│  - Combine PDF  │
│  - Save OCR     │
│  - Store Docs   │
└─────────────────┘
```

---

## 🎯 Next Steps

### **For Production Deployment**

1. **Configure External OCR**:
   - Sign up for Google Cloud Vision, AWS Textract, or Azure
   - Add `OCR_ENDPOINT` and `OCR_API_KEY` to `.env`

2. **Install Tesseract (Alternative)**:
   ```bash
   cd backend
   npm install tesseract.js
   ```

3. **Optimize Scanner Settings**:
   - Adjust `MAX_FILE_SIZE` for scanner needs
   - Configure rate limiting for OCR endpoint

4. **Test End-to-End**:
   - Scan real documents
   - Verify OCR accuracy
   - Check search functionality

### **Optional Enhancements**

- [ ] Add page reordering (drag-and-drop)
- [ ] Image cropping/rotation tools
- [ ] Auto-brightness adjustment
- [ ] Batch folder assignment
- [ ] Custom OCR language selection
- [ ] Document templates

---

## 📞 Support

For issues or questions:
- Check backend logs: `backend/logs/`
- Check browser console (F12)
- Review API responses in Network tab
- File issue on GitHub

---

## 🎉 Enjoy Scanning!

Your SafeDocs Rwanda instance is now equipped with a powerful, scanner-optimized interface. Happy scanning! 📄✨
