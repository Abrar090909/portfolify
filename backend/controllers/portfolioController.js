const Portfolio = require('../models/Portfolio');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');

/**
 * Get portfolio by ID
 * GET /api/portfolio/:id
 */
async function getPortfolio(req, res) {
    try {
        const { id } = req.params;

        const portfolio = await Portfolio.findById(id);

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio not found'
            });
        }

        res.json({
            success: true,
            data: portfolio
        });

    } catch (error) {
        console.error('❌ Get portfolio error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve portfolio'
        });
    }
}

/**
 * Update portfolio
 * PUT /api/portfolio/:id
 */
async function updatePortfolio(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove fields that shouldn't be updated directly
        delete updates._id;
        delete updates.sessionId;
        delete updates.createdAt;

        const portfolio = await Portfolio.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio not found'
            });
        }

        console.log(`✅ Portfolio updated: ${id}`);

        res.json({
            success: true,
            data: portfolio
        });

    } catch (error) {
        console.error('❌ Update portfolio error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update portfolio'
        });
    }
}

/**
 * Export portfolio as static site (ZIP)
 * GET /api/portfolio/:id/export
 */
async function exportPortfolio(req, res) {
    try {
        const { id } = req.params;

        const portfolio = await Portfolio.findById(id);

        if (!portfolio) {
            return res.status(404).json({
                success: false,
                error: 'Portfolio not found'
            });
        }

        console.log(`📦 Generating static site for portfolio: ${id}`);

        // Generate HTML, CSS, and README
        const html = generateHTML(portfolio);
        const css = generateCSS(portfolio);
        const readme = generateREADME();

        // Set response headers for ZIP download
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=portfolio-${portfolio.name.replace(/\s+/g, '-').toLowerCase()}.zip`);

        // Create ZIP archive
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        archive.on('error', (err) => {
            throw err;
        });

        // Pipe archive to response
        archive.pipe(res);

        // Add files to archive
        archive.append(html, { name: 'index.html' });
        archive.append(css, { name: 'styles.css' });
        archive.append(readme, { name: 'README.md' });

        // Finalize archive
        await archive.finalize();

        console.log(`✅ Static site exported successfully`);

    } catch (error) {
        console.error('❌ Export error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export portfolio'
        });
    }
}

/**
 * Generates HTML for the portfolio
 */
function generateHTML(portfolio) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${portfolio.name} - Portfolio</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <!-- Hero Section -->
        <header class="hero">
            <h1>${portfolio.name}</h1>
            <p class="headline">${portfolio.headline}</p>
            ${portfolio.links.email ? `<p class="contact">
                <a href="mailto:${portfolio.links.email}">${portfolio.links.email}</a>
                ${portfolio.links.phone ? ` | ${portfolio.links.phone}` : ''}
            </p>` : ''}
            <div class="social-links">
                ${portfolio.links.github ? `<a href="${portfolio.links.github}" target="_blank">GitHub</a>` : ''}
                ${portfolio.links.linkedin ? `<a href="${portfolio.links.linkedin}" target="_blank">LinkedIn</a>` : ''}
                ${portfolio.links.website ? `<a href="${portfolio.links.website}" target="_blank">Website</a>` : ''}
            </div>
        </header>

        <!-- About Section -->
        ${portfolio.summary ? `<section class="about">
            <h2>About Me</h2>
            <p>${portfolio.summary}</p>
        </section>` : ''}

        <!-- Skills Section -->
        ${portfolio.skills.length > 0 ? `<section class="skills">
            <h2>Skills</h2>
            <div class="skills-grid">
                ${portfolio.skills.map(skillGroup => `
                    <div class="skill-category">
                        <h3>${skillGroup.category}</h3>
                        <ul>
                            ${skillGroup.items.map(skill => `<li>${skill}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        </section>` : ''}

        <!-- Experience Section -->
        ${portfolio.experience.length > 0 ? `<section class="experience">
            <h2>Experience</h2>
            <div class="timeline">
                ${portfolio.experience.map(exp => `
                    <div class="timeline-item">
                        <h3>${exp.role}</h3>
                        <p class="company">${exp.company} ${exp.duration ? `| ${exp.duration}` : ''}</p>
                        ${exp.description ? `<p class="description">${exp.description}</p>` : ''}
                        ${exp.highlights.length > 0 ? `
                            <ul class="highlights">
                                ${exp.highlights.map(h => `<li>${h}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </section>` : ''}

        <!-- Projects Section -->
        ${portfolio.projects.length > 0 ? `<section class="projects">
            <h2>Projects</h2>
            <div class="projects-grid">
                ${portfolio.projects.map(project => `
                    <div class="project-card">
                        <h3>${project.title}</h3>
                        ${project.description ? `<p>${project.description}</p>` : ''}
                        ${project.tech.length > 0 ? `
                            <p class="tech-stack"><strong>Tech:</strong> ${project.tech.join(', ')}</p>
                        ` : ''}
                        ${project.link ? `<a href="${project.link}" target="_blank" class="project-link">View Project →</a>` : ''}
                    </div>
                `).join('')}
            </div>
        </section>` : ''}

        <!-- Education Section -->
        ${portfolio.education.length > 0 ? `<section class="education">
            <h2>Education</h2>
            <div class="education-list">
                ${portfolio.education.map(edu => `
                    <div class="education-item">
                        <h3>${edu.degree}</h3>
                        <p class="institution">${edu.institution} ${edu.year ? `| ${edu.year}` : ''}</p>
                        ${edu.details ? `<p class="details">${edu.details}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </section>` : ''}

        <!-- Footer -->
        <footer>
            <p>© ${new Date().getFullYear()} ${portfolio.name}. All rights reserved.</p>
            <p class="generated">Generated with Portlify</p>
        </footer>
    </div>
</body>
</html>`;
}

/**
 * Generates CSS for the portfolio
 */
function generateCSS(portfolio) {
    const colors = portfolio.customizations?.colors || {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#60A5FA'
    };

    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    line-height: 1.6;
    color: #1f2937;
    background: #f9fafb;
}

.container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
}

/* Hero Section */
.hero {
    text-align: center;
    padding: 4rem 0;
    background: white;
    border-radius: 12px;
    margin-bottom: 2rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.hero h1 {
    font-size: 3rem;
    font-weight: 700;
    color: ${colors.primary};
    margin-bottom: 0.5rem;
}

.hero .headline {
    font-size: 1.5rem;
    color: #6b7280;
    margin-bottom: 1rem;
}

.hero .contact {
    font-size: 1.1rem;
    color: #4b5563;
    margin-bottom: 1rem;
}

.social-links {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 1.5rem;
}

.social-links a {
    padding: 0.5rem 1.5rem;
    background: ${colors.primary};
    color: white;
    text-decoration: none;
    border-radius: 8px;
    transition: background 0.3s;
}

.social-links a:hover {
    background: ${colors.secondary};
}

/* Section Styles */
section {
    background: white;
    padding: 3rem;
    margin-bottom are: 2rem;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

section h2 {
    font-size: 2rem;
    color: ${colors.primary};
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 3px solid ${colors.accent};
}

/* Skills Grid */
.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.skill-category h3 {
    color: ${colors.secondary};
    margin-bottom: 1rem;
    font-size: 1.25rem;
}

.skill-category ul {
    list-style: none;
}

.skill-category li {
    padding: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;
}

.skill-category li::before {
    content: "▹";
    position: absolute;
    left: 0;
    color: ${colors.accent};
    font-weight: bold;
}

/* Timeline */
.timeline-item {
    margin-bottom: 2.5rem;
    padding-left: 2rem;
    border-left: 3px solid ${colors.accent};
}

.timeline-item h3 {
    font-size: 1.5rem;
    color: ${colors.secondary};
    margin-bottom: 0.5rem;
}

.timeline-item .company {
    color: #6b7280;
    font-weight: 600;
    margin-bottom: 1rem;
}

.timeline-item .highlights {
    list-style: none;
    margin-top: 1rem;
}

.timeline-item .highlights li {
    padding: 0.5rem 0;
    padding-left: 1.5rem;
    position: relative;
}

.timeline-item .highlights li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: ${colors.accent};
    font-weight: bold;
}

/* Projects Grid */
.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.project-card {
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 2rem;
    transition: all 0.3s;
}

.project-card:hover {
    border-color: ${colors.accent};
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    transform: translateY(-4px);
}

.project-card h3 {
    color: ${colors.secondary};
    margin-bottom: 1rem;
}

.project-card .tech-stack {
    margin-top: 1rem;
    color: #6b7280;
    font-size: 0.9rem;
}

.project-link {
    display: inline-block;
    margin-top: 1rem;
    color: ${colors.primary};
    text-decoration: none;
    font-weight: 600;
}

.project-link:hover {
    text-decoration: underline;
}

/* Education */
.education-item {
    margin-bottom: 2rem;
}

.education-item h3 {
    color: ${colors.secondary};
    margin-bottom: 0.5rem;
}

.education-item .institution {
    color: #6b7280;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

/* Footer */
footer {
    text-align: center;
    padding: 2rem 0;
    color: #6b7280;
}

.generated {
    font-size: 0.9rem;
    margin-top: 0.5rem;
    opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
    .hero h1 {
        font-size: 2rem;
    }
    
    section {
        padding: 2rem 1.5rem;
    }
    
    .skills-grid,
    .projects-grid {
        grid-template-columns: 1fr;
    }
}`;
}

/**
 * Generates deployment README
 */
function generateREADME() {
    return `# Portfolio Website

This is your personal portfolio website generated by Portlify.

## Deployment Options

### Option 1: GitHub Pages

1. Create a new GitHub repository
2. Upload all files (index.html, styles.css)
3. Go to repository Settings > Pages
4. Select "main" branch as source
5. Your site will be live at \`https://yourusername.github.io/repository-name\`

### Option 2: Netlify

1. Create a free account at [netlify.com](https://netlify.com)
2. Drag and drop this folder into Netlify
3. Your site will be live instantly with a custom URL
4. Optionally, add a custom domain

### Option 3: Vercel

1. Create a free account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: \`npm install -g vercel\`
3. Run \`vercel\` in this directory
4. Follow the prompts
5. Your site will be deployed with a URL

## Local Preview

To preview locally, simply open \`index.html\` in your web browser.

## Customization

- Edit \`index.html\` to change content
- Edit \`styles.css\` to customize colors and styling
- All colors use CSS variables for easy theming

---

Generated with ❤️ by [Portlify](https://portlify.com)
`;
}

module.exports = {
    getPortfolio,
    updatePortfolio,
    exportPortfolio
};
