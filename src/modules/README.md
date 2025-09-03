# Modules Structure

This directory contains all the feature modules for the SymptomDx application. Each module follows a consistent structure for better organization and maintainability.

## Module Structure

Each module follows this structure:

```
src/modules/[module-name]/
├── api/
│   └── procedure.ts          # tRPC procedures for the module
├── schema.ts                 # Zod schemas for validation
├── ui/
│   ├── components/           # React components specific to this module
│   │   ├── index.ts         # Export all components
│   │   └── [component].tsx  # Individual components
│   └── [other-ui-files]     # Other UI-related files
└── utils/                    # Utility functions for the module
```

## Available Modules

### 1. Auth Module (`src/modules/auth/`)
Handles authentication, user management, and role-based access control.

**Components:**
- `AuthButton` - Main authentication button with role-based navigation
- `HeaderAuthButton` - Compact auth button for headers
- `PrimaryAuthButton` - Primary CTA auth button
- `OutlineAuthButton` - Outlined auth button variant

**API:**
- `completeAdminOnboarding` - Complete admin onboarding process
- `getCurrentUser` - Get current user information
- `syncMetadata` - Sync Clerk metadata with database

### 2. Onboarding Module (`src/modules/onboarding/`)
Handles user onboarding flow for different roles.

**Components:**
- `RoleSelection` - Role selection interface
- `AdminOnboarding` - Admin onboarding flow
- `DoctorOnboarding` - Doctor onboarding flow
- `PatientOnboarding` - Patient onboarding flow

**API:**
- `getOnboardingStatus` - Get current onboarding status
- `updateOnboardingStep` - Update onboarding step
- `completeOnboarding` - Complete onboarding process
- `resetOnboarding` - Reset onboarding (dev/testing)

### 3. Patients Module (`src/modules/patients/`)
Manages patient data and operations.

**API:**
- Patient CRUD operations
- Patient profile management
- Medical history management

### 4. Doctors Module (`src/modules/doctors/`)
Manages doctor data and operations.

**API:**
- Doctor CRUD operations
- Doctor verification
- Specialization management

### 5. Diagnosis Module (`src/modules/diagnosis/`)
Handles diagnosis sessions and AI predictions.

**API:**
- Diagnosis session management
- Symptom reporting
- AI prediction handling

### 6. ML Module (`src/modules/ml/`)
Machine learning and AI model management.

**API:**
- Model predictions
- Training data management
- Model performance metrics

## Best Practices

### 1. Component Organization
- Keep components focused and single-purpose
- Use functional components with hooks instead of class components
- Avoid unnecessary OOP patterns in React components
- Export components through index files for clean imports

### 2. API Design
- Use tRPC for type-safe API calls
- Implement proper error handling
- Use Zod schemas for validation
- Follow RESTful principles where applicable

### 3. File Naming
- Use kebab-case for file names
- Use PascalCase for component names
- Use camelCase for function and variable names

### 4. Imports
- Use absolute imports with `@/` prefix
- Import from module index files when possible
- Group imports: external libraries, internal modules, relative imports

### 5. Code Quality
- Remove unnecessary complexity (avoid over-engineering)
- Use TypeScript for type safety
- Follow React best practices
- Keep components small and focused

## Migration Notes

The codebase has been refactored from a class-based OOP approach to a more functional, React-friendly approach:

- Removed unnecessary class-based components
- Simplified complex inheritance hierarchies
- Moved from abstract classes to simple functions and objects
- Improved component reusability and maintainability
- Better separation of concerns

This refactoring improves:
- Code readability and maintainability
- Performance (functional components are more optimized)
- Developer experience
- Bundle size (less overhead from classes)
