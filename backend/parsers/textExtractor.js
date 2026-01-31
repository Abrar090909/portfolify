const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;

/**
 * Extracts plain text from PDF files
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} Extracted text
 */
async function extractFromPDF(filePath) {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
}

/**
 * Extracts plain text from DOCX files
 * @param {string} filePath - Path to DOCX file
 * @returns {Promise<string>} Extracted text
 */
async function extractFromDOCX(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        throw new Error(`Failed to extract text from DOCX: ${error.message}`);
    }
}

/**
 * Reads plain text from TXT files
 * @param {string} filePath - Path to TXT file
 * @returns {Promise<string>} File contents
 */
async function extractFromTXT(filePath) {
    try {
        return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
        throw new Error(`Failed to read TXT file: ${error.message}`);
    }
}

/**
 * Normalizes extracted text
 * - Removes excessive whitespace
 * - Normalizes line breaks
 * - Trims each line
 * @param {string} rawText - Raw extracted text
 * @returns {string} Normalized text
 */
function normalizeText(rawText) {
    return rawText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n')
        .replace(/\n{3,}/g, '\n\n'); // Max 2 consecutive line breaks
}

/**
 * Main extraction function - automatically detects file type
 * @param {string} filePath - Path to resume file
 * @param {string} mimetype - MIME type of the file
 * @returns {Promise<string>} Normalized extracted text
 */
async function extractText(filePath, mimetype) {
    let rawText;

    switch (mimetype) {
        case 'application/pdf':
            rawText = await extractFromPDF(filePath);
            break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            rawText = await extractFromDOCX(filePath);
            break;
        case 'text/plain':
            rawText = await extractFromTXT(filePath);
            break;
        default:
            throw new Error(`Unsupported file type: ${mimetype}`);
    }

    return normalizeText(rawText);
}

module.exports = {
    extractText,
    extractFromPDF,
    extractFromDOCX,
    extractFromTXT,
    normalizeText
};
