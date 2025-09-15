const fs = require('fs')
const path = require('path')

// Unified file storage adapter for local (default) and optional S3 (scaffold)

const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true })
}

const getUploadRoot = () => {
  const root = process.env.UPLOAD_ROOT || path.join(process.cwd(), 'uploads')
  ensureDir(root)
  return root
}

const generateFileName = (prefix, originalName) => {
  const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
  const ext = path.extname(originalName || '') || ''
  return `${prefix}-${unique}${ext}`
}

// Local storage implementation
const saveLocal = async (folder, file) => {
  const root = getUploadRoot()
  const dir = path.join(root, folder)
  ensureDir(dir)

  let filename
  let absolutePath

  if (file.path && fs.existsSync(file.path)) {
    // multer diskStorage already saved it; move into our folder if needed
    filename = path.basename(file.path)
    absolutePath = file.path
    if (!absolutePath.startsWith(dir)) {
      // move to target folder
      filename = generateFileName(folder, file.originalname)
      absolutePath = path.join(dir, filename)
      fs.copyFileSync(file.path, absolutePath)
      try { fs.unlinkSync(file.path) } catch (_) {}
    }
  } else if (file.buffer) {
    // memory storage; write buffer
    filename = generateFileName(folder, file.originalname)
    absolutePath = path.join(dir, filename)
    fs.writeFileSync(absolutePath, file.buffer)
  } else {
    throw new Error('Invalid file payload for local storage')
  }

  const relativePath = path.relative(process.cwd(), absolutePath).replace(/\\/g, '/')
  const servedUrl = `/${relativePath}`
  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    path: relativePath,
    url: servedUrl
  }
}

const deleteLocal = async (meta) => {
  if (!meta || !meta.path) return
  const absolutePath = path.isAbsolute(meta.path) ? meta.path : path.join(process.cwd(), meta.path)
  if (fs.existsSync(absolutePath)) {
    try { fs.unlinkSync(absolutePath) } catch (_) {}
  }
}

// S3 scaffold (falls back to local if not configured)
const isS3Enabled = () => process.env.BOOK_STORAGE === 's3' && process.env.BOOK_S3_BUCKET

const saveS3 = async (_folder, _file) => {
  // To keep dependencies light, we fall back to local unless S3 is fully wired
  console.warn('S3 storage not configured. Falling back to local storage.')
  return saveLocal(_folder, _file)
}

const deleteS3 = async (_meta) => {
  // If you wire S3 later, delete by key here
  return
}

// Public API
const saveFile = async (folder, file) => {
  if (isS3Enabled()) return saveS3(folder, file)
  return saveLocal(folder, file)
}

const deleteFile = async (meta) => {
  if (isS3Enabled()) return deleteS3(meta)
  return deleteLocal(meta)
}

module.exports = { saveFile, deleteFile }


