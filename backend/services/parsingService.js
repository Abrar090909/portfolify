const { extractText } = require('../parsers/textExtractor');
const { detectSections } = require('../parsers/sectionDetector');
const { createPortfolioSchema } = require('../parsers/normalizer');

/**
 * Main parsing service
 * Orchestrates the entire resume parsing pipeline:
 * 1. Extract text from file
 * 2. Detect sections using rules
 * 3. Normalize to portfolio schema
 * 4. Optionally refine with AI (not yet implemented)
 */

/**
 * Parses a resume file and returns structured portfolio data
 * @param {string} filePath - Path to uploaded resume file
 * @param {string} mimetype - MIME type of the file
 * @param {Object} options - Parsing options
 * @param {boolean} options.useAI - Whether to use AI refinement (optional)
 * @returns {Promise<Object>} Portfolio data object
 */
async function parseResume(filePath, mimetype, options = {}) {
    try {
        console.log('📄 Starting resume parsing...');

        // Step 1: Extract text from file
        console.log('  Step 1/3: Extracting text...');
        const rawText = await extractText(filePath, mimetype);

        if (!rawText || rawText.length < 50) {
            throw new Error('Extracted text is too short. Please ensure the resume has readable content.');
        }

        // Step 2: Detect sections using rule-based patterns
        console.log('  Step 2/3: Detecting sections...');
        const detectedSections = detectSections(rawText);

        // Step 3: Normalize to portfolio schema
        console.log('  Step 3/3: Normalizing to portfolio schema...');
        const portfolioData = createPortfolioSchema(detectedSections);

        // Step 4: Optional AI refinement (future enhancement)
        if (options.useAI && process.env.OPENAI_API_KEY) {
            console.log('  Step 4/4: Refining with AI...');
            // TODO: Implement AI refinement
            // portfolioData = await refineWithAI(portfolioData);
        }

        console.log('✅ Resume parsing completed successfully');

        return {
            success: true,
            data: portfolioData,
            metadata: {
                textLength: rawText.length,
                sectionsFound: {
                    hasName: !!detectedSections.name,
                    hasContact: !!(detectedSections.contact.email || detectedSections.contact.phone),
                    hasSkills: detectedSections.skills.length > 0,
                    hasExperience: detectedSections.experience.length > 0,
                    hasProjects: detectedSections.projects.length > 0,
                    hasEducation: detectedSections.education.length > 0
                }
            }
        };

    } catch (error) {
        console.error('❌ Resume parsing failed:', error.message);

        return {
            success: false,
            error: error.message,
            data: null
        };
    }
}

module.exports = {
    parseResume
};
