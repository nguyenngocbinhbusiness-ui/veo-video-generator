module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat',     // New feature
                'fix',      // Bug fix
                'docs',     // Documentation only
                'style',    // Code style (formatting, semicolons, etc)
                'refactor', // Code refactoring
                'perf',     // Performance improvement
                'test',     // Adding/updating tests
                'build',    // Build system changes
                'ci',       // CI configuration changes
                'chore',    // Other changes (e.g., updating deps)
                'revert',   // Revert previous commit
            ],
        ],
        'subject-case': [0], // Disable subject case check
    },
};
