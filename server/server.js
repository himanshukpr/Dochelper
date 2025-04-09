// Modern URL handling without punycode
const { URL } = require('url'); 

const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const fsp = require('fs').promises; // Using promises version
const { PDFDocument } = require('pdf-lib');
const app = express();
const port = 8000;

function delfile(filepath) {
  fs.unlink(filepath, () => {
    console.log(`File ${filepath} has been successfully removed.`);
  });
}

// Use CORS middleware with proper support for file uploads
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Handle preflight requests
app.options('*', cors());

// Serve static files from uploads directory with absolute path
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.set('Content-Type', 'application/pdf');
      res.set('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
      res.set('Cache-Control', 'no-store');
    }
  },
  fallthrough: false // Don't continue to next middleware if file not found
}));

// Ensure uploads directory exists with absolute path
const uploadDir = path.join(__dirname, 'uploads');
(async () => {
  try {
    await fsp.mkdir(uploadDir, { recursive: true });
  } catch (err) {
    console.error('Error creating uploads directory:', err);
  }
})();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check if directory exists, create if needed
    fs.access(uploadDir, (err) => {
      if (err) {
        fs.mkdir(uploadDir, { recursive: true }, (err) => {
          if (err) {
            console.error('Error creating upload directory:', err);
            return cb(err);
          }
          cb(null, uploadDir);
        });
      } else {
        cb(null, uploadDir);
      }
    });
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    fieldSize: 50 * 1024 * 1024
  }
});
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Routes
app.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    console.log('File uploaded:', req.file.path);
    // Read the uploaded file and extract text using Tesseract.js
    Tesseract.recognize(
      req.file.path,
      'eng',
      {
        logger: m => console.log(m)
      }
    )
      .then(({ data: { text } }) => {
        console.log('Extracted text:', text);
        // Remove the file
        delfile(req.file.path)
        res.send({ message: 'File uploaded successfully', text: text });
      })
      .catch(err => {
        console.error('Error:', err);
        delfile(req.file.path)
        res.status(500).send({ message: 'Error processing image', error: err });
      });
  } else {
    delfile(req.file.path)
    res.status(400).send({ message: 'File upload failed' });
  }
});

// List merged PDFs endpoint
app.get('/api/merged-pdfs', async (req, res) => {
  try {
    const files = await fs.readdir(uploadDir);
    const pdfFiles = [];
    
    // Process files asynchronously
    for (const file of files) {
      if (file.endsWith('.pdf') && file.startsWith('merged-')) {
        try {
          const stats = await fs.stat(path.join(uploadDir, file));
          pdfFiles.push({
            name: file,
            url: `/uploads/${file}`,
            date: stats.mtime
          });
        } catch (err) {
          console.error(`Error processing file ${file}:`, err);
          // Skip problematic files but continue processing others
        }
      }
    }
    
    res.json(pdfFiles);
  } catch (error) {
    console.error('Error listing merged PDFs:', error);
    res.status(500).json({ 
      error: 'Failed to list merged PDFs',
      details: error.message 
    });
  }
});

// PDF Merge endpoint
app.post('/api/merge-pdfs', upload.array('pdfs'), async (req, res) => {
  try {
    // Validate input files
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ 
        error: 'At least 2 PDFs required for merging',
        details: `Received ${req.files?.length || 0} files` 
      });
    }

    const mergedPdf = await PDFDocument.create();
    const tempFiles = [];
    const fileDetails = [];
    
    try {
    // Collect and order files
    const orderedFiles = [];
    for (const file of req.files) {
      const orderIndex = parseInt(req.body[`order_${orderedFiles.length}`]);
      orderedFiles.push({
        file,
        order: isNaN(orderIndex) ? orderedFiles.length : orderIndex
      });
    }
    
    // Sort files by their order index
    orderedFiles.sort((a, b) => a.order - b.order);

    // Process each PDF with enhanced validation
    for (const { file } of orderedFiles) {
        try {
          // Validate file type
          if (!file.mimetype.includes('pdf')) {
            throw new Error(`Invalid file type: ${file.mimetype}`);
          }

          // Read and validate file content
          const pdfBytes = await fsp.readFile(file.path);
          tempFiles.push(file.path);
          
          // Validate PDF structure
          const pdfDoc = await PDFDocument.load(pdfBytes);
          const pageCount = pdfDoc.getPageCount();
          
          if (pageCount === 0) {
            throw new Error('PDF contains no pages');
          }

          // Track file details for debugging
          fileDetails.push({
            name: file.originalname,
            size: file.size,
            pages: pageCount,
            path: file.path
          });

          // Copy pages to merged document
          const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          pages.forEach(page => mergedPdf.addPage(page));
        } catch (err) {
          console.error(`Error processing ${file.originalname}:`, {
            error: err.message,
            stack: err.stack,
            file: {
              name: file.originalname,
              size: file.size,
              type: file.mimetype
            }
          });
          throw new Error(`Failed to process ${file.originalname}: ${err.message}`);
        }
      }

      // Generate merged PDF
      const mergedPdfBytes = await mergedPdf.save();
      const outputFilename = `merged-${Date.now()}.pdf`;
      const outputPath = path.join(uploadDir, outputFilename);
      const absolutePath = path.resolve(outputPath);
      
      // Ensure directory exists
      await fsp.mkdir(uploadDir, { recursive: true });
      
      // Write merged file
      await fsp.writeFile(outputPath, mergedPdfBytes);
      tempFiles.push(outputPath);

      console.log('Successfully merged PDFs:', {
        outputPath: absolutePath,
        size: mergedPdfBytes.length,
        sourceFiles: fileDetails
      });

      res.json({ 
        mergedPdfPath: absolutePath,
        url: `/uploads/${outputFilename}`,
        message: 'PDFs merged successfully',
        details: {
          totalPages: mergedPdf.getPageCount(),
          fileCount: req.files.length
        }
      });
    } catch (error) {
      // Clean up any created files
      await Promise.all(
        tempFiles.map(file => 
          fsp.unlink(file).catch(e => 
            console.error('Cleanup failed for:', file, e)
          )
        )
      );
      throw error;
    }
  } catch (error) {
    console.error('PDF merge failed:', {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack
      },
      request: {
        files: req.files?.map(f => ({
          name: f.originalname,
          size: f.size,
          type: f.mimetype
        }))
      }
    });

    res.status(500).json({ 
      error: 'PDF merge operation failed',
      details: error.message,
      suggestion: 'Please ensure all files are valid PDFs and try again'
    });
  }
});

// PDF Splitter Endpoint
app.post('/api/split-pdf', upload.single('pdf'), async (req, res, next) => {
  try {
    console.log('Split PDF request received');
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    console.log(`Processing file: ${req.file.originalname} (${req.file.size} bytes)`);
    
    // Validate PDF file
    if (!req.file.mimetype.includes('pdf')) {
      console.log('Invalid file type:', req.file.mimetype);
      await fsp.unlink(req.file.path).catch(e => console.error('Cleanup error:', e));
      return res.status(400).json({ error: 'Only PDF files are allowed' });
    }

    // Verify file exists and is readable
    try {
      await fsp.access(req.file.path, fs.constants.R_OK);
    } catch (err) {
      console.error('File access error:', err);
      return res.status(400).json({ error: 'Uploaded file is not accessible' });
    }

    let pdfDoc;
    try {
      const pdfBytes = await fsp.readFile(req.file.path);
      pdfDoc = await PDFDocument.load(pdfBytes);
    } catch (err) {
      console.error('PDF loading error:', err);
      await fsp.unlink(req.file.path).catch(e => console.error('Cleanup error:', e));
      return res.status(400).json({ error: 'Invalid or corrupted PDF file' });
    }

    const pageCount = pdfDoc.getPageCount();
    console.log(`PDF has ${pageCount} pages`);

    if (pageCount <= 1) {
      console.log('PDF has only one page - nothing to split');
      await fsp.unlink(req.file.path).catch(e => console.error('Cleanup error:', e));
      return res.status(400).json({ error: 'PDF must have more than one page to split' });
    }

    const splitResults = [];
    const tempFiles = [req.file.path]; // Track original file for cleanup

    // Split each page into separate PDFs
    for (let i = 0; i < pageCount; i++) {
      try {
        console.log(`Processing page ${i+1}/${pageCount}`);
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(page);
        
        const splitPdfBytes = await newPdf.save({ useObjectStreams: false });
        const outputFilename = `split-page-${i+1}-${Date.now()}.pdf`;
        const outputPath = path.join(uploadDir, outputFilename);
        
        // Ensure directory exists and write file with proper permissions
        await fsp.mkdir(uploadDir, { recursive: true });
        await fsp.writeFile(outputPath, Buffer.from(splitPdfBytes), { mode: 0o644 });
        tempFiles.push(outputPath);
        
        const fullPath = path.resolve(outputPath).replace(/\\/g, '/');
        console.log(`Created split page: ${fullPath}`);
        
        splitResults.push({
          fullPath: fullPath,
          pageNumber: i + 1,
          filename: outputFilename,
          url: `/uploads/${outputFilename}`,
          size: splitPdfBytes.length
        });
      } catch (err) {
        console.error(`Error splitting page ${i+1}:`, err);
        // Continue with next page even if one fails
      }
    }

    if (splitResults.length === 0) {
      console.error('Failed to split any pages');
      await Promise.all(tempFiles.map(file => 
        fsp.unlink(file).catch(e => console.error('Cleanup error:', e)))
      );
      return res.status(500).json({ 
        error: 'Failed to split any pages',
        details: 'All page splitting attempts failed' 
      });
    }

    // Clean up files after 1 hour
    setTimeout(async () => {
      console.log('Cleaning up temporary files');
      await Promise.all(tempFiles.map(file => 
        fsp.unlink(file).catch(e => console.error('Cleanup error:', e)))
      );
    }, 3600000);

    console.log(`Successfully split into ${splitResults.length} pages`);
    res.json({
      success: true,
      message: `PDF split into ${splitResults.length} pages`,
      pages: splitResults,
      originalFile: req.file.originalname
    });

  } catch (error) {
    console.error('PDF split error:', {
      message: error.message,
      stack: error.stack,
      file: req.file ? req.file.path : 'No file'
    });
    res.status(500).json({ 
      error: 'Failed to split PDF',
      details: error.message 
    });
  }
});

// PDF Download Endpoint
app.get('/download', async (req, res) => {
  try {
    const filePath = decodeURIComponent(req.query.file);
    const absolutePath = path.resolve(filePath);
    const uploadsDir = path.resolve(path.join(__dirname, 'uploads'));
    
    if (!absolutePath.startsWith(uploadsDir)) {
      return res.status(403).send('Access denied');
    }
    
    try {
      await fsp.access(absolutePath); // Check file exists
    } catch (err) {
      return res.status(404).send('File not found');
    }

    res.download(absolutePath, path.basename(absolutePath), (err) => {
      if (err) {
        console.error('Download failed:', err);
        if (!res.headersSent) {
          res.status(500).send('Error downloading file');
        }
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).send('Error downloading file');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});
