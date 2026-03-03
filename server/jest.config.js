/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
    // Use the specific ESM preset
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    rootDir: "./",
    
    testMatch: ["<rootDir>/test/**/*.test.ts", "<rootDir>/test/**/*.spec.ts"],
    extensionsToTreatAsEsm: ['.ts'],
    moduleFileExtensions: ["ts", "js"],
    setupFiles: ["<rootDir>/test/setup-env.ts"],
    // Ensure this path is exactly where the file is
    setupFilesAfterEnv: ["<rootDir>/test/jest.setup.ts"],
    
    verbose: true,
    clearMocks: true,

    moduleNameMapper: {
        
        // ESM Fix: Handle imports that include the .js extension in the source code
        '^@utils/(.*)\\.js$': '<rootDir>/src/utils/$1',
        '^@configs/(.*)\\.js$': '<rootDir>/src/configs/$1',
        '^@customs/(.*)\\.js$': '<rootDir>/src/customs/$1',
        '^@db/(.*)\\.js$': '<rootDir>/src/db/$1',
        '^@routes/(.*)\\.js$': '<rootDir>/src/routes/$1',
        '^@middleware/(.*)\\.js$': '<rootDir>/src/middleware/$1',
        '^@/(.*)\\.js$': '<rootDir>/src/$1',
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },

    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                useESM: true,
                tsconfig: 'tsconfig.test.json',
            },
        ],
    },
    // collectCoverage: true,
    // coverageProvider: "v8",
    // coverageReporters: ["html", "text", "json"],
}