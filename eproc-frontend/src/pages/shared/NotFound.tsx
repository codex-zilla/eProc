import { ErrorPage } from '@/components/common/ErrorPage';

/**
 * 404 Not Found page.
 */
const NotFound = () => {
  return (
    <ErrorPage
      code={404}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      codeColor="text-slate-200"
    />
  );
};

export default NotFound;
