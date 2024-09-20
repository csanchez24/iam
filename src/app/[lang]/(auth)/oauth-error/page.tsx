export default async function AuthOAuth2Error({
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const message = searchParams.message;
  const redirectUrl = searchParams.redirect_url;

  return (
    <div className="mx-auto">
      <h1 className="text-xl font-bold capitalize">authentication error</h1>
      <div className="my-2 text-muted-foreground">
        {message ?? 'Something went wrong while completing the authorization steps.'}
      </div>
      {redirectUrl && typeof redirectUrl === 'string' && (
        <a
          href={redirectUrl}
          className="m-0 inline-flex items-center justify-center whitespace-nowrap rounded-md p-0 text-sm font-medium text-primary underline-offset-4 ring-offset-background transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        >
          Return to application
        </a>
      )}
    </div>
  );
}
