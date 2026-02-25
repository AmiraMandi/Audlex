"use client";

import { useLocale } from "@/hooks/use-locale";

export function CookiesContent() {
  const { locale } = useLocale();
  const en = locale === "en";

  return (
    <article>
      <h1 className="text-3xl font-bold text-text mb-2">
        {en ? "Cookie Policy" : "Política de Cookies"}
      </h1>
      <p className="text-text-muted mb-8">
        {en ? "Last updated: February 21, 2026" : "Última actualización: 21 de febrero de 2026"}
      </p>

      <section className="space-y-6 text-text-secondary">
        {/* 1 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "1. What Are Cookies?" : "1. ¿Qué son las cookies?"}
          </h2>
          <p>
            {en
              ? "Cookies are small text files stored on your device when you visit a website. They allow us to remember your preferences, keep you logged in, and analyze how the site is used."
              : "Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Permiten recordar tus preferencias, mantener tu sesión iniciada y analizar cómo se utiliza el sitio."}
          </p>
        </div>

        {/* 2 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "2. Cookies We Use" : "2. Cookies que utilizamos"}
          </h2>

          {/* 2.1 */}
          <h3 className="text-lg font-medium text-text mt-4 mb-2">
            {en ? "2.1 Strictly Necessary Cookies" : "2.1 Cookies estrictamente necesarias"}
          </h3>
          <p className="mb-2">
            {en
              ? "No consent required. These are essential for the Platform to function."
              : "No requieren consentimiento. Son esenciales para el funcionamiento de la Plataforma."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead>
                <tr className="bg-surface-secondary">
                  <th className="text-left px-4 py-2 border-b border-border font-medium text-text">Cookie</th>
                  <th className="text-left px-4 py-2 border-b border-border font-medium text-text">
                    {en ? "Purpose" : "Finalidad"}
                  </th>
                  <th className="text-left px-4 py-2 border-b border-border font-medium text-text">
                    {en ? "Duration" : "Duración"}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-b border-border font-mono text-xs">sb-*-auth-token</td>
                  <td className="px-4 py-2 border-b border-border">
                    {en ? "Authentication session (Supabase)" : "Sesión de autenticación (Supabase)"}
                  </td>
                  <td className="px-4 py-2 border-b border-border">
                    {en ? "7 days" : "7 días"}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b border-border font-mono text-xs">cookie-consent</td>
                  <td className="px-4 py-2 border-b border-border">
                    {en ? "Stores your cookie preference" : "Almacena tu preferencia de cookies"}
                  </td>
                  <td className="px-4 py-2 border-b border-border">
                    {en ? "365 days" : "365 días"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2.2 */}
          <h3 className="text-lg font-medium text-text mt-6 mb-2">
            {en ? "2.2 Preference Cookies" : "2.2 Cookies de preferencias"}
          </h3>
          <p className="mb-2">
            {en ? "Used to remember your usage preferences." : "Permiten recordar tus preferencias de uso."}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead>
                <tr className="bg-surface-secondary">
                  <th className="text-left px-4 py-2 border-b border-border font-medium text-text">Cookie</th>
                  <th className="text-left px-4 py-2 border-b border-border font-medium text-text">
                    {en ? "Purpose" : "Finalidad"}
                  </th>
                  <th className="text-left px-4 py-2 border-b border-border font-medium text-text">
                    {en ? "Duration" : "Duración"}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-b border-border font-mono text-xs">theme</td>
                  <td className="px-4 py-2 border-b border-border">
                    {en ? "Light/dark theme preference" : "Preferencia de tema claro/oscuro"}
                  </td>
                  <td className="px-4 py-2 border-b border-border">
                    {en ? "365 days (localStorage)" : "365 días (localStorage)"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2.3 */}
          <h3 className="text-lg font-medium text-text mt-6 mb-2">
            {en ? "2.3 Analytics Cookies" : "2.3 Cookies analíticas"}
          </h3>
          <p className="mb-2">
            {en
              ? "We currently do not use third-party analytics cookies. If we incorporate tools such as Google Analytics or similar in the future, we will update this policy and request your prior consent."
              : "Actualmente no utilizamos cookies analíticas de terceros. Si en el futuro incorporamos herramientas como Google Analytics o similares, actualizaremos esta política y solicitaremos tu consentimiento previo."}
          </p>
        </div>

        {/* 3 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "3. Third-Party Cookies" : "3. Cookies de terceros"}
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            {en ? (
              <>
                <li><strong>Stripe:</strong> may set cookies during the payment process for fraud prevention (strictly necessary).</li>
                <li><strong>Supabase:</strong> sets session cookies for authentication (strictly necessary).</li>
              </>
            ) : (
              <>
                <li><strong>Stripe:</strong> puede establecer cookies durante el proceso de pago para prevenir fraude (estrictamente necesarias).</li>
                <li><strong>Supabase:</strong> establece cookies de sesión para la autenticación (estrictamente necesarias).</li>
              </>
            )}
          </ul>
        </div>

        {/* 4 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "4. Consent Management" : "4. Gestión del consentimiento"}
          </h2>
          {en ? (
            <>
              <p>
                When you first visit our website, we display a cookie banner where you can:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Accept all:</strong> all cookies are activated.</li>
                <li><strong>Essential only:</strong> only cookies essential for the Platform to function are activated.</li>
              </ul>
              <p className="mt-2">
                You can change your preference at any time via the &ldquo;Cookie settings&rdquo; link
                available in the footer.
              </p>
            </>
          ) : (
            <>
              <p>
                Al acceder a nuestra web por primera vez, te mostramos un banner de cookies donde puedes:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Aceptar todas:</strong> se activan todas las cookies.</li>
                <li><strong>Solo necesarias:</strong> solo se activan las cookies esenciales para el funcionamiento.</li>
              </ul>
              <p className="mt-2">
                Puedes cambiar tu preferencia en cualquier momento desde el enlace &ldquo;Configurar cookies&rdquo;
                disponible en el pie de página.
              </p>
            </>
          )}
        </div>

        {/* 5 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "5. How to Disable Cookies in Your Browser" : "5. Cómo desactivar cookies en tu navegador"}
          </h2>
          <p>
            {en
              ? "You can configure your browser to block or delete cookies:"
              : "Puedes configurar tu navegador para bloquear o eliminar cookies:"}
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">Safari</a></li>
            <li><a href="https://support.microsoft.com/es-es/topic/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">Microsoft Edge</a></li>
          </ul>
          <p className="mt-2">
            {en
              ? "Please note that disabling essential cookies may prevent the Platform from functioning correctly."
              : "Ten en cuenta que desactivar las cookies esenciales puede impedir el correcto funcionamiento de la Plataforma."}
          </p>
        </div>

        {/* 6 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "6. Changes to This Policy" : "6. Cambios en esta política"}
          </h2>
          <p>
            {en
              ? "We will update this policy if we add new cookies or change the existing ones. Changes will be reflected in the last updated date at the top of this page."
              : "Actualizaremos esta política si incorporamos nuevas cookies o cambiamos las existentes. Los cambios se reflejarán en la fecha de última actualización al inicio de esta página."}
          </p>
        </div>

        {/* 7 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "7. Contact" : "7. Contacto"}
          </h2>
          <p>
            {en ? (
              <>
                If you have questions about our cookie policy, contact us at{" "}
                <a href="mailto:privacidad@audlex.com" className="text-brand-500 hover:underline">privacidad@audlex.com</a>.
              </>
            ) : (
              <>
                Si tienes preguntas sobre nuestra política de cookies, contacta con nosotros en{" "}
                <a href="mailto:privacidad@audlex.com" className="text-brand-500 hover:underline">privacidad@audlex.com</a>.
              </>
            )}
          </p>
        </div>
      </section>
    </article>
  );
}
