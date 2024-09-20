export default async function UnauthorizedPage({
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const message = searchParams.message;

  return (
    <div className="mx-auto flex h-screen items-center justify-center">
      <div className="flex items-center space-x-4">
        <div className="text-4xl font-bold">401</div>
        <div>
          <h1 className="text-xl font-bold capitalize">Unauthorized error</h1>
          <div className="text-muted-foreground">
            {message ?? 'You do not have access to application.'}
          </div>
        </div>
      </div>
    </div>
  );
}
