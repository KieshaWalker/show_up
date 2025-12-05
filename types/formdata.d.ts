export {};

// Augment FormData to ensure TypeScript sees .get in non-DOM builds
declare global {
  interface FormData {
    get(name: string): FormDataEntryValue | null;
  }
}
