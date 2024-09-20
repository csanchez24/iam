import { env } from '@/env';
import fs from 'fs';
import handlebars, { type TemplateDelegate } from 'handlebars';
import path from 'path';

type ParseHbsTmplData<T> = {
  logo?: string;
} & T;

/**
 * Parses handlerbars template with provided data. Provides some defaults
 * such as `logo` which is expected to be /public/images/company-logo.png.
 * However, we can override this value by passing whatever path we want.
 * We can also omit the `logo` by assigning `withLogo = false`.
 *
 * Notice directory can be extended. As of right now we're only looking into
 * /templates/email, however pass in to `tmplDir` prop any other dir name
 * we might want to extend to.
 */
export function parseHbs<T = void>({
  tmplName,
  tmplDir,
  tmplLogo,
  withLogo,
  ...tmplData
}: {
  tmplName: string;
  tmplDir: 'email';
  tmplLogo?: string;
  withLogo?: boolean;
} & T) {
  const logo =
    typeof withLogo === undefined || withLogo !== false
      ? tmplLogo ?? `${env.NEXT_PUBLIC_APP_URL}/images/company-logo.png`
      : undefined;

  const source = fs.readFileSync(
    path.resolve(process.cwd(), 'src', 'templates', tmplDir, `${tmplName}.hbs`),
    'utf8'
  );
  const template = handlebars.compile(source) as TemplateDelegate<ParseHbsTmplData<T>>;
  return logo
    ? template({ logo, ...tmplData } as unknown as ParseHbsTmplData<T>)
    : template(tmplData as unknown as ParseHbsTmplData<T>);
}
