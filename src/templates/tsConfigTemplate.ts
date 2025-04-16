export const tsConfigTemplate = `{
  "compilerOptions": {
    "target": "esnext",
    "module": "CommonJS",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "types": ["node"],
    "typeRoots": ["./node_modules/@types", "./src/@types"],
    "declaration": false,
    "removeComments": true,
    "paths": {
      "@src/*": ["src/*"]
    }
  },
  "exclude": ["node_modules", ".build", "/dist"]
}
`;
