"use client";

import { useLocale } from "@/hooks/use-locale";

export function TermsContent() {
  const { locale } = useLocale();
  const en = locale === "en";

  return (
    <article>
      <h1 className="text-3xl font-bold text-text mb-2">
        {en ? "Terms and Conditions of Use" : "Términos y Condiciones de Uso"}
      </h1>
      <p className="text-text-muted mb-8">
        {en ? "Last updated: March 5, 2026" : "Última actualización: 5 de marzo de 2026"}
      </p>

      <section className="space-y-6 text-text-secondary">
        {/* 1 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "1. Purpose" : "1. Objeto"}
          </h2>
          <p>
            {en
              ? "These Terms and Conditions govern access to and use of the Audlex platform (hereinafter \"the Platform\"), a SaaS tool designed to help organizations assess and document compliance with Regulation (EU) 2024/1689 — the EU AI Act."
              : "Estos Términos y Condiciones regulan el acceso y uso de la plataforma Audlex (en adelante, “la Plataforma”), una herramienta SaaS diseñada para ayudar a las organizaciones a evaluar y documentar el cumplimiento del Reglamento (UE) 2024/1689 — EU AI Act."}
          </p>
        </div>

        {/* 2 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "2. Acceptance" : "2. Aceptación"}
          </h2>
          <p>
            {en
              ? "By registering or using the Platform, you accept these Terms in full. If you do not agree, you must not use the Platform."
              : "Al registrarte o utilizar la Plataforma, aceptas estos Términos en su totalidad. Si no estás de acuerdo, no debes utilizar la Plataforma."}
          </p>
        </div>

        {/* 3 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "3. Service Description" : "3. Descripción del servicio"}
          </h2>
          <p>{en ? "Audlex provides:" : "Audlex proporciona:"}</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            {en ? (
              <>
                <li>AI system inventory and registration.</li>
                <li>Automated risk classification under the EU AI Act.</li>
                <li>Compliance documentation generation (risk management, technical sheets, impact assessments, etc.).</li>
                <li>Interactive compliance checklist with obligation tracking.</li>
                <li>Monitoring dashboard and deadline alerts.</li>
                <li>Document export in PDF and DOCX formats.</li>
              </>
            ) : (
              <>
                <li>Inventario y registro de sistemas de inteligencia artificial.</li>
                <li>Clasificación automatizada de riesgo según el EU AI Act.</li>
                <li>Generación de documentación de compliance (gestión de riesgos, fichas técnicas, evaluaciones de impacto, etc.).</li>
                <li>Checklist interactivo de cumplimiento con seguimiento de obligaciones.</li>
                <li>Dashboard de monitorización y alertas de plazos.</li>
                <li>Exportación de documentos en PDF y DOCX.</li>
              </>
            )}
          </ul>
        </div>

        {/* 4 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "4. Important Limitation" : "4. Limitación importante"}
          </h2>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="font-medium text-amber-700 dark:text-amber-400">
              {en
                ? "Audlex is an informational and support tool. It does not constitute legal advice nor replace the judgment of a lawyer specialized in AI regulation. Risk classifications and generated documentation must be reviewed by qualified personnel before official use."
                : "Audlex es una herramienta informativa y de apoyo. No constituye asesoramiento legal ni sustituye el criterio de un abogado especializado en regulación de IA. Las clasificaciones de riesgo y la documentación generada deben ser revisadas por personal cualificado antes de su uso oficial."}
            </p>
          </div>
        </div>

        {/* 5 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "5. Registration and Account" : "5. Registro y cuenta"}
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            {en ? (
              <>
                <li>To access the Platform you must create an account providing truthful and up-to-date information.</li>
                <li>You are responsible for maintaining the confidentiality of your access credentials.</li>
                <li>Each account is linked to an organization. The owner can invite other users according to their plan limits.</li>
                <li>We reserve the right to suspend accounts that violate these Terms.</li>
              </>
            ) : (
              <>
                <li>Para acceder a la Plataforma debes crear una cuenta proporcionando información veraz y actualizada.</li>
                <li>Eres responsable de mantener la confidencialidad de tus credenciales de acceso.</li>
                <li>Cada cuenta está vinculada a una organización. El propietario puede invitar a otros usuarios según los límites de su plan.</li>
                <li>Nos reservamos el derecho de suspender cuentas que infrinjan estos Términos.</li>
              </>
            )}
          </ul>
        </div>

        {/* 6 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "6. Plans and Pricing" : "6. Planes y precios"}
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            {en ? (
              <>
                <li><strong>Free Plan:</strong> 1 AI system, limited functionality. No cost.</li>
                <li><strong>Paid plans (Starter, Business, Enterprise):</strong> monthly billing through Stripe. Current prices are displayed in the Pricing section of the website.</li>
                <li><strong>Consultant Plan:</strong> monthly base rate plus a fee per managed client.</li>
                <li>Prices may be updated with 30 days&apos; notice to existing users.</li>
                <li>You can cancel your subscription at any time from your settings panel. See section 7 for full details on cancellation, withdrawal rights, and refunds.</li>
              </>
            ) : (
              <>
                <li><strong>Plan Gratis:</strong> 1 sistema de IA, funcionalidad limitada. Sin coste.</li>
                <li><strong>Planes de pago (Starter, Business, Enterprise):</strong> facturación mensual a través de Stripe. Los precios vigentes se muestran en la sección de Precios de la web.</li>
                <li><strong>Plan Consultora:</strong> tarifa base mensual más un coste por cliente gestionado.</li>
                <li>Los precios pueden actualizarse con 30 días de preaviso a los usuarios existentes.</li>
                <li>Puedes cancelar tu suscripción en cualquier momento desde tu panel de configuración. Consulta la sección 7 para todos los detalles sobre cancelación, derecho de desistimiento y reembolsos.</li>
              </>
            )}
          </ul>
        </div>

        {/* 7 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "7. Cancellation, Withdrawal and Refunds" : "7. Cancelación, desistimiento y reembolsos"}
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            {en ? (
              <>
                <li>
                  <strong>Right of withdrawal (14 days):</strong> In accordance with Directive 2011/83/EU on consumer rights, you have the right to withdraw from your subscription within 14 calendar days from the date of your first payment, without giving any reason. If you exercise this right, we will refund the full amount paid using the same payment method. To exercise this right, cancel your subscription from Settings &gt; Plan &gt; &ldquo;Cancel immediately + refund&rdquo;, or contact us at <a href="mailto:info@audlex.com" className="text-brand-500 hover:underline">info@audlex.com</a>.
                </li>
                <li>
                  <strong>Cancellation after 14 days:</strong> You may cancel your subscription at any time from your Settings panel. Cancellation takes effect at the end of your current billing period. You retain full access until that date. No partial refund is issued for the remaining period.
                </li>
                <li>
                  <strong>Monthly plans:</strong> Access continues until the end of the current monthly cycle.
                </li>
                <li>
                  <strong>Annual plans:</strong> Access continues until the end of the current annual cycle. No prorated refund is issued after the 14-day withdrawal period.
                </li>
                <li>
                  <strong>Downgrade after cancellation:</strong> When your billing period ends, your account reverts to the Free plan (1 AI system, 1 user). All your data is preserved and you can resubscribe at any time.
                </li>
                <li>
                  <strong>Refund processing:</strong> Approved refunds are processed within 5–10 business days via the original payment method (Stripe).
                </li>
              </>
            ) : (
              <>
                <li>
                  <strong>Derecho de desistimiento (14 días):</strong> De conformidad con la Directiva 2011/83/UE sobre derechos de los consumidores, tienes derecho a desistir de tu suscripción en un plazo de 14 días naturales desde la fecha de tu primer pago, sin necesidad de justificación. Si ejerces este derecho, te reembolsaremos el importe íntegro abonado a través del mismo método de pago. Para ejercer este derecho, cancela tu suscripción desde Configuración &gt; Plan &gt; &ldquo;Cancelar ahora + reembolso&rdquo;, o escríbenos a <a href="mailto:info@audlex.com" className="text-brand-500 hover:underline">info@audlex.com</a>.
                </li>
                <li>
                  <strong>Cancelación después de 14 días:</strong> Puedes cancelar tu suscripción en cualquier momento desde tu panel de Configuración. La cancelación se hace efectiva al final de tu periodo de facturación vigente. Conservas acceso completo hasta esa fecha. No se realiza reembolso parcial por el tiempo restante.
                </li>
                <li>
                  <strong>Planes mensuales:</strong> El acceso continúa hasta el final del ciclo mensual en curso.
                </li>
                <li>
                  <strong>Planes anuales:</strong> El acceso continúa hasta el final del ciclo anual en curso. No se realiza reembolso prorrateado después del periodo de desistimiento de 14 días.
                </li>
                <li>
                  <strong>Degradación tras cancelación:</strong> Cuando tu periodo de facturación finalice, tu cuenta vuelve al plan Free (1 sistema de IA, 1 usuario). Todos tus datos se conservan y puedes volver a suscribirte cuando quieras.
                </li>
                <li>
                  <strong>Procesamiento de reembolsos:</strong> Los reembolsos aprobados se procesan en un plazo de 5–10 días hábiles a través del método de pago original (Stripe).
                </li>
              </>
            )}
          </ul>
        </div>

        {/* 8 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "8. Intellectual Property" : "8. Propiedad intelectual"}
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            {en ? (
              <>
                <li>The Platform, its code, design, brand, and content are the property of Audlex.</li>
                <li>Documents and data generated from the user&apos;s information are the property of the user.</li>
                <li>You do not acquire any intellectual property rights over the Platform through its use.</li>
              </>
            ) : (
              <>
                <li>La Plataforma, su código, diseño, marca y contenido son propiedad de Audlex.</li>
                <li>Los documentos y datos generados a partir de la información del usuario son propiedad del usuario.</li>
                <li>No adquieres ningún derecho de propiedad intelectual sobre la Plataforma por su uso.</li>
              </>
            )}
          </ul>
        </div>

        {/* 9 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "9. Acceptable Use" : "9. Uso aceptable"}
          </h2>
          <p>{en ? "You agree to:" : "Te comprometes a:"}</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            {en ? (
              <>
                <li>Use the Platform only for lawful purposes related to EU AI Act compliance.</li>
                <li>Not attempt to access data belonging to other organizations.</li>
                <li>Not reverse engineer, decompile, or attempt to extract the source code.</li>
                <li>Not use the Platform for activities that violate the law or the rights of third parties.</li>
                <li>Not intentionally overload servers or carry out denial-of-service attacks.</li>
              </>
            ) : (
              <>
                <li>Usar la Plataforma únicamente para fines lícitos relacionados con el cumplimiento del EU AI Act.</li>
                <li>No intentar acceder a datos de otras organizaciones.</li>
                <li>No realizar ingeniería inversa, descompilar o intentar extraer el código fuente.</li>
                <li>No utilizar la Plataforma para actividades que infrinjan la ley o los derechos de terceros.</li>
                <li>No sobrecargar intencionadamente los servidores ni realizar ataques de denegación de servicio.</li>
              </>
            )}
          </ul>
        </div>

        {/* 10 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "10. Service Availability" : "10. Disponibilidad del servicio"}
          </h2>
          <p>
            {en
              ? "We strive to keep the Platform available 24/7, but we do not guarantee 100% uptime. Interruptions may occur due to planned maintenance, updates, or circumstances beyond our control."
              : "Nos esforzamos por mantener la Plataforma disponible 24/7, pero no garantizamos un tiempo de actividad del 100%. Pueden producirse interrupciones por mantenimiento planificado, actualizaciones o circunstancias fuera de nuestro control."}
          </p>
        </div>

        {/* 11 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "11. Liability Limitation" : "11. Limitación de responsabilidad"}
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            {en ? (
              <>
                <li>Audlex is provided &ldquo;as is&rdquo;. We do not guarantee that risk classifications or generated documentation will comply with all regulatory interpretations.</li>
                <li>We are not liable for sanctions, fines, or damages arising from decisions made based on the information provided by the Platform.</li>
                <li>Our maximum liability is limited to the total amount paid by the user in the last 12 months.</li>
              </>
            ) : (
              <>
                <li>Audlex se proporciona &ldquo;tal cual&rdquo; (as is). No garantizamos que las clasificaciones de riesgo o la documentación generada cumplan con todas las interpretaciones regulatorias.</li>
                <li>No somos responsables de sanciones, multas o perjuicios derivados de decisiones tomadas con base en la información proporcionada por la Plataforma.</li>
                <li>Nuestra responsabilidad máxima se limita al importe total pagado por el usuario en los últimos 12 meses.</li>
              </>
            )}
          </ul>
        </div>

        {/* 12 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "12. Data Protection" : "12. Protección de datos"}
          </h2>
          <p>
            {en ? (
              <>
                The processing of personal data is governed by our{" "}
                <a href="/legal/privacidad" className="text-brand-500 hover:underline">Privacy Policy</a>.
              </>
            ) : (
              <>
                El tratamiento de datos personales se rige por nuestra{" "}
                <a href="/legal/privacidad" className="text-brand-500 hover:underline">Política de Privacidad</a>.
              </>
            )}
          </p>
        </div>

        {/* 13 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "13. Dispute Resolution" : "13. Resolución de conflictos"}
          </h2>
          <p>
            {en
              ? "These Terms are governed by Spanish law. For any dispute, both parties submit to the jurisdiction of the courts and tribunals of Madrid (Spain), without prejudice to the consumer's right to bring proceedings in their domicile."
              : "Estos Términos se rigen por la legislación española. Para cualquier controversia, ambas partes se someten a la jurisdicción de los juzgados y tribunales de Madrid (España), sin perjuicio del derecho del consumidor a acudir a los tribunales de su domicilio."}
          </p>
        </div>

        {/* 14 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "14. Modifications" : "14. Modificaciones"}
          </h2>
          <p>
            {en
              ? "We reserve the right to modify these Terms. Substantial changes will be notified via email with at least 15 days' notice. Continued use of the Platform after the changes take effect implies acceptance."
              : "Nos reservamos el derecho de modificar estos Términos. Los cambios sustanciales serán notificados por correo electrónico con al menos 15 días de antelación. El uso continuado de la Plataforma tras la entrada en vigor de los cambios implica su aceptación."}
          </p>
        </div>

        {/* 15 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "15. Contact" : "15. Contacto"}
          </h2>
          <p>
            {en ? (
              <>
                For any questions about these Terms, you can contact us at{" "}
                <a href="mailto:info@audlex.com" className="text-brand-500 hover:underline">info@audlex.com</a>.
              </>
            ) : (
              <>
                Para cualquier consulta sobre estos Términos, puedes contactarnos en{" "}
                <a href="mailto:info@audlex.com" className="text-brand-500 hover:underline">info@audlex.com</a>.
              </>
            )}
          </p>
        </div>
      </section>
    </article>
  );
}
