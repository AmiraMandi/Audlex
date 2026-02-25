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
        {en ? "Last updated: February 21, 2026" : "Última actualización: 21 de febrero de 2026"}
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
                <li>You can cancel your subscription at any time from your settings panel. Cancellation takes effect at the end of the current billing period.</li>
              </>
            ) : (
              <>
                <li><strong>Plan Gratis:</strong> 1 sistema de IA, funcionalidad limitada. Sin coste.</li>
                <li><strong>Planes de pago (Starter, Business, Enterprise):</strong> facturación mensual a través de Stripe. Los precios vigentes se muestran en la sección de Precios de la web.</li>
                <li><strong>Plan Consultora:</strong> tarifa base mensual más un coste por cliente gestionado.</li>
                <li>Los precios pueden actualizarse con 30 días de preaviso a los usuarios existentes.</li>
                <li>Puedes cancelar tu suscripción en cualquier momento desde tu panel de configuración. La cancelación se hace efectiva al final del periodo de facturación vigente.</li>
              </>
            )}
          </ul>
        </div>

        {/* 7 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "7. Intellectual Property" : "7. Propiedad intelectual"}
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

        {/* 8 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "8. Acceptable Use" : "8. Uso aceptable"}
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

        {/* 9 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "9. Service Availability" : "9. Disponibilidad del servicio"}
          </h2>
          <p>
            {en
              ? "We strive to keep the Platform available 24/7, but we do not guarantee 100% uptime. Interruptions may occur due to planned maintenance, updates, or circumstances beyond our control."
              : "Nos esforzamos por mantener la Plataforma disponible 24/7, pero no garantizamos un tiempo de actividad del 100%. Pueden producirse interrupciones por mantenimiento planificado, actualizaciones o circunstancias fuera de nuestro control."}
          </p>
        </div>

        {/* 10 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "10. Liability Limitation" : "10. Limitación de responsabilidad"}
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

        {/* 11 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "11. Data Protection" : "11. Protección de datos"}
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

        {/* 12 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "12. Dispute Resolution" : "12. Resolución de conflictos"}
          </h2>
          <p>
            {en
              ? "These Terms are governed by Spanish law. For any dispute, both parties submit to the jurisdiction of the courts and tribunals of Madrid (Spain), without prejudice to the consumer's right to bring proceedings in their domicile."
              : "Estos Términos se rigen por la legislación española. Para cualquier controversia, ambas partes se someten a la jurisdicción de los juzgados y tribunales de Madrid (España), sin perjuicio del derecho del consumidor a acudir a los tribunales de su domicilio."}
          </p>
        </div>

        {/* 13 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "13. Modifications" : "13. Modificaciones"}
          </h2>
          <p>
            {en
              ? "We reserve the right to modify these Terms. Substantial changes will be notified via email with at least 15 days' notice. Continued use of the Platform after the changes take effect implies acceptance."
              : "Nos reservamos el derecho de modificar estos Términos. Los cambios sustanciales serán notificados por correo electrónico con al menos 15 días de antelación. El uso continuado de la Plataforma tras la entrada en vigor de los cambios implica su aceptación."}
          </p>
        </div>

        {/* 14 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "14. Contact" : "14. Contacto"}
          </h2>
          <p>
            {en ? (
              <>
                For any questions about these Terms, you can contact us at{" "}
                <a href="mailto:legal@audlex.com" className="text-brand-500 hover:underline">legal@audlex.com</a>.
              </>
            ) : (
              <>
                Para cualquier consulta sobre estos Términos, puedes contactarnos en{" "}
                <a href="mailto:legal@audlex.com" className="text-brand-500 hover:underline">legal@audlex.com</a>.
              </>
            )}
          </p>
        </div>
      </section>
    </article>
  );
}
