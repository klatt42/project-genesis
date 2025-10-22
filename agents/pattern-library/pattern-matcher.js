// ================================
// PROJECT: Genesis Agent SDK - Phase 2 Week 7
// FILE: agents/pattern-library/pattern-matcher.ts
// PURPOSE: Pattern similarity matching and suggestions
// GENESIS REF: Week 7 Task 2 - Pattern Library & Cross-Project Sharing
// WSL PATH: ~/project-genesis/agents/pattern-library/pattern-matcher.ts
// ================================
export class PatternMatcher {
    /**
     * Find similar patterns
     */
    findSimilarPatterns(targetPattern, allPatterns, threshold = 0.5) {
        const matches = [];
        for (const pattern of allPatterns) {
            // Skip the target pattern itself
            if (pattern.id === targetPattern.id)
                continue;
            const score = this.calculateSimilarity(targetPattern, pattern);
            if (score >= threshold) {
                matches.push({
                    pattern,
                    score,
                    reason: this.generateMatchReason(targetPattern, pattern, score)
                });
            }
        }
        // Sort by score (highest first)
        matches.sort((a, b) => b.score - a.score);
        return matches;
    }
    /**
     * Suggest patterns for a requirement
     */
    suggestPatterns(requirement, allPatterns, limit = 5) {
        const suggestions = [];
        const keywords = this.extractKeywordsFromText(requirement);
        for (const pattern of allPatterns) {
            const relevance = this.calculateRelevance(keywords, pattern);
            if (relevance > 0.1) {
                suggestions.push({
                    pattern,
                    relevance,
                    reasoning: this.generateSuggestionReason(keywords, pattern, relevance),
                    exampleUsage: this.generateExampleUsage(pattern)
                });
            }
        }
        // Sort by relevance (highest first)
        suggestions.sort((a, b) => b.relevance - a.relevance);
        return suggestions.slice(0, limit);
    }
    /**
     * Calculate similarity between two patterns (0-1)
     */
    calculateSimilarity(pattern1, pattern2) {
        let score = 0;
        let maxScore = 0;
        // Same type (weight: 3)
        maxScore += 3;
        if (pattern1.type === pattern2.type)
            score += 3;
        // Same category (weight: 2)
        maxScore += 2;
        if (pattern1.category === pattern2.category)
            score += 2;
        // Shared keywords (weight: 0.5 per keyword, max 3)
        maxScore += 3;
        const sharedKeywords = pattern1.keywords.filter(k => pattern2.keywords.includes(k));
        score += Math.min(sharedKeywords.length * 0.5, 3);
        // Shared dependencies (weight: 0.5 per dependency, max 2)
        maxScore += 2;
        const sharedDeps = pattern1.dependencies.filter(d => pattern2.dependencies.includes(d));
        score += Math.min(sharedDeps.length * 0.5, 2);
        // Similar complexity (weight: 1)
        maxScore += 1;
        const complexityDiff = Math.abs(pattern1.complexity - pattern2.complexity);
        score += Math.max(0, 1 - complexityDiff / 10);
        return score / maxScore;
    }
    /**
     * Calculate relevance of pattern to requirement (0-1)
     */
    calculateRelevance(keywords, pattern) {
        let score = 0;
        let matches = 0;
        // Check keywords
        for (const keyword of keywords) {
            if (pattern.keywords.some(k => k.includes(keyword) || keyword.includes(k))) {
                matches++;
                score += 0.3;
            }
            if (pattern.name.toLowerCase().includes(keyword)) {
                matches++;
                score += 0.4;
            }
            if (pattern.description?.toLowerCase().includes(keyword)) {
                matches++;
                score += 0.2;
            }
        }
        // Boost score based on pattern quality
        score *= (pattern.quality / 10);
        // Boost score based on usage
        score *= (1 + Math.log(pattern.usageCount + 1) / 10);
        return Math.min(1, score);
    }
    /**
     * Extract keywords from text
     */
    extractKeywordsFromText(text) {
        const keywords = [];
        const words = text.toLowerCase().match(/\w+/g) || [];
        // Common stop words to filter out
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how']);
        for (const word of words) {
            if (word.length > 2 && !stopWords.has(word)) {
                keywords.push(word);
            }
        }
        return keywords;
    }
    /**
     * Generate match reason
     */
    generateMatchReason(pattern1, pattern2, score) {
        const reasons = [];
        if (pattern1.type === pattern2.type) {
            reasons.push(`Same type (${pattern1.type})`);
        }
        if (pattern1.category === pattern2.category) {
            reasons.push(`Same category (${pattern1.category})`);
        }
        const sharedKeywords = pattern1.keywords.filter(k => pattern2.keywords.includes(k));
        if (sharedKeywords.length > 0) {
            reasons.push(`Shared keywords: ${sharedKeywords.slice(0, 3).join(', ')}`);
        }
        const sharedDeps = pattern1.dependencies.filter(d => pattern2.dependencies.includes(d));
        if (sharedDeps.length > 0) {
            reasons.push(`Shared dependencies: ${sharedDeps.slice(0, 2).join(', ')}`);
        }
        if (reasons.length === 0) {
            reasons.push('Similar structure and complexity');
        }
        return reasons.join('; ');
    }
    /**
     * Generate suggestion reason
     */
    generateSuggestionReason(keywords, pattern, relevance) {
        const matchedKeywords = keywords.filter(k => pattern.keywords.some(pk => pk.includes(k) || k.includes(pk)) ||
            pattern.name.toLowerCase().includes(k));
        if (matchedKeywords.length > 0) {
            return `Matches keywords: ${matchedKeywords.slice(0, 3).join(', ')} (quality: ${pattern.quality}/10, used in ${pattern.usageCount} places)`;
        }
        return `High quality ${pattern.type} pattern (${pattern.quality}/10) used in ${pattern.usageCount} places`;
    }
    /**
     * Generate example usage
     */
    generateExampleUsage(pattern) {
        // Extract first few lines of code as example
        const lines = pattern.code.split('\n').filter(line => line.trim().length > 0);
        const example = lines.slice(0, 5).join('\n');
        if (example.length > 200) {
            return example.substring(0, 197) + '...';
        }
        return example;
    }
    /**
     * Find patterns used together
     */
    findPatternsUsedTogether(pattern, allPatterns) {
        const coOccurrence = new Map();
        // Find patterns in the same project
        const projectPatterns = allPatterns.filter(p => p.projectId === pattern.projectId && p.id !== pattern.id);
        for (const p of projectPatterns) {
            coOccurrence.set(p.id, (coOccurrence.get(p.id) || 0) + 1);
        }
        // Find patterns with shared dependencies
        for (const otherPattern of allPatterns) {
            if (otherPattern.id === pattern.id)
                continue;
            const sharedDeps = pattern.dependencies.filter(d => otherPattern.dependencies.includes(d));
            if (sharedDeps.length > 0) {
                coOccurrence.set(otherPattern.id, (coOccurrence.get(otherPattern.id) || 0) + sharedDeps.length);
            }
        }
        // Convert to array and sort
        const results = Array.from(coOccurrence.entries())
            .map(([id, frequency]) => ({
            pattern: allPatterns.find(p => p.id === id),
            frequency
        }))
            .filter(r => r.pattern) // Filter out undefined
            .sort((a, b) => b.frequency - a.frequency);
        return results.slice(0, 10);
    }
    /**
     * Find replacement patterns (newer/better alternatives)
     */
    findReplacements(pattern, allPatterns) {
        const replacements = [];
        // Find similar patterns with higher quality
        const similar = this.findSimilarPatterns(pattern, allPatterns, 0.6);
        for (const match of similar) {
            if (match.pattern.quality > pattern.quality + 1) {
                replacements.push({
                    pattern: match.pattern,
                    reason: `Higher quality (${match.pattern.quality}/10 vs ${pattern.quality}/10)`
                });
            }
            // Check if it's a newer version
            if (match.pattern.lastModified > pattern.lastModified &&
                match.score > 0.8) {
                replacements.push({
                    pattern: match.pattern,
                    reason: 'Newer version with similar functionality'
                });
            }
        }
        return replacements.slice(0, 5);
    }
}
//# sourceMappingURL=pattern-matcher.js.map