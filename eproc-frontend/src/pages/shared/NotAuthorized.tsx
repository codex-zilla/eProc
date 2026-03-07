import { ErrorPage } from '@/components/common/ErrorPage';

/**
 * 403 Not Authorized page.
 */
const NotAuthorized = () => {
  return (
    <ErrorPage
      code={403}
      title="Access Denied"
      description="You don't have permission to access this page."
      codeColor="text-red-200"
    />
  );
};

export default NotAuthorized;
