/**
 * Normalizes detected sections into strict portfolio JSON schema
 * Ensures data consistency and structure
 */

/**
 * Normalizes name
 */
function normalizeName(rawName) {
    if (!rawName || rawName === 'Unknown') return 'Portfolio Owner';
    return rawName.trim();
}

/**
 * Creates a headline from the role in first experience
 */
function generateHeadline(name, experience) {
    if (experience && experience.length > 0 && experience[0].role) {
        return experience[0].role;
    }
    return 'Professional';
}

/**
 * Normalizes skills into categorized array
 * Groups skills by common categories
 */
function normalizeSkills(rawSkills) {
    if (!rawSkills || rawSkills.length === 0) {
        return [];
    }

    // Common skill categories and their keywords
    const categories = {
        'Languages': ['javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'typescript', 'php', 'swift', 'kotlin'],
        'Frontend': ['react', 'vue', 'angular', 'html', 'css', 'tailwind', 'bootstrap', 'sass', 'less'],
        'Backend': ['node', 'express', 'django', 'flask', 'spring', 'laravel', '.net', 'fastapi', 'nestjs'],
        'Database': ['mongodb', 'postgresql', 'mysql', 'redis', 'dynamodb', 'sql', 'nosql', 'firebase'],
        'DevOps': ['docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'jenkins', 'github actions'],
        'Tools': ['git', 'github', 'gitlab', 'jira', 'figma', 'postman', 'vscode']
    };

    const categorized = {
        'Languages': [],
        'Frontend': [],
        'Backend': [],
        'Database': [],
        'DevOps': [],
        'Tools': [],
        'Other': []
    };

    // Categorize each skill
    rawSkills.forEach(skill => {
        let categorized_flag = false;
        const skillLower = skill.toLowerCase();

        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => skillLower.includes(keyword))) {
                categorized[category].push(skill);
                categorized_flag = true;
                break;
            }
        }

        if (!categorized_flag) {
            categorized['Other'].push(skill);
        }
    });

    // Convert to array format, filtering empty categories
    const result = [];
    for (const [category, items] of Object.entries(categorized)) {
        if (items.length > 0) {
            result.push({ category, items });
        }
    }

    return result;
}

/**
 * Normalizes experience entries
 */
function normalizeExperience(rawExperience) {
    if (!rawExperience || rawExperience.length === 0) return [];

    return rawExperience.map(exp => ({
        role: exp.role || 'Position',
        company: exp.company || '',
        duration: exp.duration || '',
        description: exp.description || '',
        highlights: exp.highlights || []
    }));
}

/**
 * Normalizes project entries
 */
function normalizeProjects(rawProjects) {
    if (!rawProjects || rawProjects.length === 0) return [];

    return rawProjects.map(project => ({
        title: project.title || 'Untitled Project',
        tech: project.tech || [],
        description: project.description || '',
        link: project.link || null,
        image: null // Can be added later by user
    }));
}

/**
 * Normalizes education entries
 */
function normalizeEducation(rawEducation) {
    if (!rawEducation || rawEducation.length === 0) return [];

    return rawEducation.map(edu => ({
        degree: edu.degree || '',
        institution: edu.institution || '',
        year: edu.year || '',
        details: edu.details || ''
    }));
}

/**
 * Normalizes links object
 */
function normalizeLinks(contact, links) {
    return {
        github: links.github || null,
        linkedin: links.linkedin || null,
        email: contact.email || null,
        phone: contact.phone || null,
        website: links.website || null
    };
}

/**
 * Creates complete portfolio schema from detected sections
 * This is the final output of the parsing pipeline
 */
function createPortfolioSchema(detectedSections) {
    const name = normalizeName(detectedSections.name);
    const skills = normalizeSkills(detectedSections.skills);
    const experience = normalizeExperience(detectedSections.experience);
    const projects = normalizeProjects(detectedSections.projects);
    const education = normalizeEducation(detectedSections.education);
    const links = normalizeLinks(detectedSections.contact, detectedSections.links);

    return {
        name,
        headline: generateHeadline(name, experience),
        summary: detectedSections.summary || '',
        skills,
        experience,
        projects,
        education,
        links,
        theme: 'modern',
        customizations: {
            colors: {
                primary: '#3B82F6',
                secondary: '#1E40AF',
                accent: '#60A5FA'
            },
            fonts: {
                heading: 'Inter',
                body: 'Inter'
            },
            layout: 'default'
        }
    };
}

module.exports = {
    createPortfolioSchema,
    normalizeName,
    normalizeSkills,
    normalizeExperience,
    normalizeProjects,
    normalizeEducation,
    normalizeLinks,
    generateHeadline
};
