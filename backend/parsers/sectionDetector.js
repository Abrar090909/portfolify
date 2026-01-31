/**
 * Rule-based section detection using keywords and patterns
 * This is the core parsing logic - deterministic and reliable
 */

// Common section header patterns
const SECTION_PATTERNS = {
    summary: /^(summary|objective|profile|about|about me|professional summary)/i,
    skills: /^(skills|technical skills|core competencies|expertise|technologies)/i,
    experience: /^(experience|work experience|employment|professional experience|work history)/i,
    projects: /^(projects|personal projects|key projects|portfolio)/i,
    education: /^(education|academic|qualifications|academic background)/i
};

// Email and phone patterns
const EMAIL_PATTERN = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
const PHONE_PATTERN = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

// URL patterns for GitHub, LinkedIn, etc.
const URL_PATTERNS = {
    github: /github\.com\/([a-zA-Z0-9_-]+)/i,
    linkedin: /linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i,
    website: /(https?:\/\/[^\s]+)/gi
};

/**
 * Detects name from the first few lines
 * Usually the name is in the first 1-3 lines, often near email
 */
function detectName(lines) {
    // Check first 5 lines for name
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim();

        // Skip if line contains email or phone (likely contact info)
        if (EMAIL_PATTERN.test(line) || PHONE_PATTERN.test(line)) continue;

        // Skip if line contains URLs
        if (/https?:\/\//.test(line)) continue;

        // Skip if line is too long (likely not a name)
        if (line.length > 50) continue;

        // Skip if line matches common section headers
        if (Object.values(SECTION_PATTERNS).some(pattern => pattern.test(line))) continue;

        // If line has 2-4 words, likely a name
        const words = line.split(/\s+/).filter(w => w.length > 0);
        if (words.length >= 2 && words.length <= 4) {
            // Check if words start with capital letters (name pattern)
            const allCapitalized = words.every(w => /^[A-Z]/.test(w));
            if (allCapitalized) {
                return line;
            }
        }
    }

    // Fallback: return first non-empty line
    return lines[0] || 'Unknown';
}

/**
 * Extracts contact information (email, phone)
 */
function detectContact(text) {
    const emails = text.match(EMAIL_PATTERN);
    const phones = text.match(PHONE_PATTERN);

    return {
        email: emails ? emails[0] : null,
        phone: phones ? phones[0] : null
    };
}

/**
 * Extracts links (GitHub, LinkedIn, website)
 */
function detectLinks(text) {
    const links = {
        github: null,
        linkedin: null,
        website: null
    };

    const githubMatch = text.match(URL_PATTERNS.github);
    if (githubMatch) {
        links.github = `https://github.com/${githubMatch[1]}`;
    }

    const linkedinMatch = text.match(URL_PATTERNS.linkedin);
    if (linkedinMatch) {
        links.linkedin = `https://linkedin.com/in/${linkedinMatch[1]}`;
    }

    const websiteMatches = text.match(URL_PATTERNS.website);
    if (websiteMatches) {
        // Filter out GitHub and LinkedIn URLs
        const otherUrls = websiteMatches.filter(url =>
            !url.includes('github.com') && !url.includes('linkedin.com')
        );
        if (otherUrls.length > 0) {
            links.website = otherUrls[0];
        }
    }

    return links;
}

/**
 * Finds section boundaries in the text
 * Returns an object mapping section names to their content
 */
function findSections(lines) {
    const sections = {
        summary: [],
        skills: [],
        experience: [],
        projects: [],
        education: []
    };

    let currentSection = null;
    let sectionStartIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Check if this line is a section header
        let foundSection = null;
        for (const [sectionName, pattern] of Object.entries(SECTION_PATTERNS)) {
            if (pattern.test(line)) {
                foundSection = sectionName;
                break;
            }
        }

        if (foundSection) {
            // Save previous section
            if (currentSection && sectionStartIndex >= 0) {
                sections[currentSection] = lines.slice(sectionStartIndex, i);
            }

            currentSection = foundSection;
            sectionStartIndex = i + 1; // Content starts after header
        }
    }

    // Save last section
    if (currentSection && sectionStartIndex >= 0) {
        sections[currentSection] = lines.slice(sectionStartIndex);
    }

    return sections;
}

/**
 * Detects summary/objective section
 */
function detectSummary(sectionLines) {
    if (!sectionLines || sectionLines.length === 0) return null;

    // Join all lines in the summary section
    return sectionLines
        .filter(line => line.trim().length > 0)
        .join(' ')
        .trim();
}

/**
 * Detects and extracts skills
 * Skills can be comma-separated or bullet points
 */
function detectSkills(sectionLines) {
    if (!sectionLines || sectionLines.length === 0) return [];

    const skills = [];
    const text = sectionLines.join(' ');

    // Try comma-separated skills first
    if (text.includes(',')) {
        const split = text.split(',').map(s => s.trim()).filter(s => s.length > 0);
        skills.push(...split);
    } else {
        // Otherwise, treat each line as a skill or skill category
        sectionLines.forEach(line => {
            line = line.trim();

            // Remove bullet points
            line = line.replace(/^[•\-\*]\s*/, '');

            if (line.length > 0) {
                skills.push(line);
            }
        });
    }

    return skills;
}

/**
 * Detects work experience entries
 * Format: Role at Company (Date)
 */
function detectExperience(sectionLines) {
    if (!sectionLines || sectionLines.length === 0) return [];

    const experiences = [];
    let currentExp = null;

    // Date patterns to identify experience headers
    const datePattern = /(\d{4}|\w+\s+\d{4}|present|current)/i;

    for (const line of sectionLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Check if this line contains a date (likely a role/company line)
        if (datePattern.test(trimmed)) {
            // Save previous experience
            if (currentExp) {
                experiences.push(currentExp);
            }

            // Parse new experience entry
            currentExp = {
                role: '',
                company: '',
                duration: '',
                description: '',
                highlights: []
            };

            // Try to extract role, company, and date
            // Common patterns:
            // "Software Engineer at Google | 2020 - 2023"
            // "Senior Developer, Microsoft (Jan 2020 - Present)"

            let parts = trimmed.split(/\||,|\(/).map(p => p.trim());

            if (parts.length > 0) {
                // First part is usually role
                const firstPart = parts[0];
                if (firstPart.toLowerCase().includes(' at ')) {
                    const [role, company] = firstPart.split(' at ').map(s => s.trim());
                    currentExp.role = role;
                    currentExp.company = company;
                } else {
                    currentExp.role = firstPart;
                }
            }

            // Try to extract duration from the line
            const durMatch = trimmed.match(/(\w+\s+\d{4}\s*[-–]\s*\w+\s+\d{4}|\w+\s+\d{4}\s*[-–]\s*present|\d{4}\s*[-–]\s*\d{4})/i);
            if (durMatch) {
                currentExp.duration = durMatch[0];
            }

        } else if (currentExp) {
            // This line is part of the description/highlights
            const cleaned = trimmed.replace(/^[•\-\*]\s*/, '');
            if (cleaned.length > 0) {
                currentExp.highlights.push(cleaned);
            }
        }
    }

    // Save last experience
    if (currentExp) {
        experiences.push(currentExp);
    }

    // Build descriptions from highlights
    experiences.forEach(exp => {
        exp.description = exp.highlights.join(' ');
    });

    return experiences;
}

/**
 * Detects project entries
 */
function detectProjects(sectionLines) {
    if (!sectionLines || sectionLines.length === 0) return [];

    const projects = [];
    let currentProject = null;

    for (const line of sectionLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Check if this line looks like a project title (not a bullet point)
        const isBullet = /^[•\-\*]/.test(trimmed);

        if (!isBullet && trimmed.length > 5 && !trimmed.includes(':')) {
            // Likely a project title
            if (currentProject) {
                projects.push(currentProject);
            }

            currentProject = {
                title: trimmed,
                tech: [],
                description: '',
                link: null
            };
        } else if (currentProject) {
            // Part of project description or tech stack
            const cleaned = trimmed.replace(/^[•\-\*]\s*/, '');

            // Check if this line contains tech keywords
            if (cleaned.toLowerCase().includes('technologies:') ||
                cleaned.toLowerCase().includes('tech stack:') ||
                cleaned.toLowerCase().includes('built with:')) {
                const techPart = cleaned.split(':')[1];
                if (techPart) {
                    currentProject.tech = techPart.split(',').map(t => t.trim());
                }
            } else {
                currentProject.description += (currentProject.description ? ' ' : '') + cleaned;
            }

            // Extract link if present
            const linkMatch = cleaned.match(/(https?:\/\/[^\s]+)/);
            if (linkMatch) {
                currentProject.link = linkMatch[0];
            }
        }
    }

    // Save last project
    if (currentProject) {
        projects.push(currentProject);
    }

    return projects;
}

/**
 * Detects education entries
 */
function detectEducation(sectionLines) {
    if (!sectionLines || sectionLines.length === 0) return [];

    const education = [];
    let currentEdu = null;

    // Degree keywords
    const degreePattern = /(bachelor|master|phd|doctorate|b\.s\.|m\.s\.|b\.a\.|m\.a\.|b\.tech|m\.tech)/i;

    for (const line of sectionLines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Check if this line contains a degree
        if (degreePattern.test(trimmed)) {
            if (currentEdu) {
                education.push(currentEdu);
            }

            currentEdu = {
                degree: trimmed,
                institution: '',
                year: '',
                details: ''
            };

            // Try to extract year
            const yearMatch = trimmed.match(/\d{4}/);
            if (yearMatch) {
                currentEdu.year = yearMatch[0];
            }
        } else if (currentEdu && !currentEdu.institution && trimmed.length > 5) {
            // Next line is likely the institution
            currentEdu.institution = trimmed;
        } else if (currentEdu) {
            // Additional details
            currentEdu.details += (currentEdu.details ? ' ' : '') + trimmed;
        }
    }

    // Save last education entry
    if (currentEdu) {
        education.push(currentEdu);
    }

    return education;
}

/**
 * Main section detection function
 * Orchestrates all detection functions
 */
function detectSections(text) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);

    // Detect name and contact
    const name = detectName(lines);
    const contact = detectContact(text);
    const links = detectLinks(text);

    // Find all sections
    const sections = findSections(lines);

    // Parse each section
    const summary = detectSummary(sections.summary);
    const skills = detectSkills(sections.skills);
    const experience = detectExperience(sections.experience);
    const projects = detectProjects(sections.projects);
    const education = detectEducation(sections.education);

    return {
        name,
        contact,
        links,
        summary,
        skills,
        experience,
        projects,
        education
    };
}

module.exports = {
    detectSections,
    detectName,
    detectContact,
    detectLinks,
    detectSummary,
    detectSkills,
    detectExperience,
    detectProjects,
    detectEducation
};
