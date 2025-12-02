/**
 * Loading Component
 *
 * Next.js loading UI component that displays during page transitions and data fetching.
 * This component is automatically rendered by Next.js when using React Suspense boundaries.
 *
 * Currently returns an empty fragment as the loading state is handled by individual
 * components with their own loading indicators (spinners, skeletons, etc.).
 *
 * For more information about Next.js loading conventions:
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/loading
 */
export default function Loading() {
  // Stack uses React Suspense, which will render this page while user data is being fetched.
  // See: https://nextjs.org/docs/app/api-reference/file-conventions/loading
  return <></>;
}
