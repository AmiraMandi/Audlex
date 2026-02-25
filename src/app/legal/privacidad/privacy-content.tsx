"use client";

import { useLocale } from "@/hooks/use-locale";

export function PrivacyContent() {
  const { locale } = useLocale();
  const en = locale === "en";

  return (
    <article>
      <h1 className="text-3xl font-bold text-text mb-2">
        {en ? "Privacy Policy" : "Política de Privacidad"}
      </h1>
      <p className="text-text-muted mb-8">
        {en ? "Last updated: February 21, 2026" : "Última actualización: 21 de febrero de 2026"}
      </p>

      <section className="space-y-6 text-text-secondary">
        {/* 1 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "1. Data Controller" : "1. Responsable del tratamiento"}
          </h2>
          {en ? (
            <>
              <p>
                Audlex (hereinafter &ldquo;we&rdquo; or &ldquo;the Platform&rdquo;) is the data controller
                for personal data collected through this website and the SaaS platform at{" "}
                <strong>audlex.com</strong>.
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Contact email: <a href="mailto:privacidad@audlex.com" className="text-brand-500 hover:underline">privacidad@audlex.com</a></li>
              </ul>
            </>
          ) : (
            <>
              <p>
                Audlex (en adelante, &ldquo;nosotros&rdquo; o &ldquo;la Plataforma&rdquo;) es el responsable del tratamiento
                de los datos personales recogidos a través de este sitio web y la plataforma SaaS ubicada en{" "}
                <strong>audlex.com</strong>.
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Correo electrónico de contacto: <a href="mailto:privacidad@audlex.com" className="text-brand-500 hover:underline">privacidad@audlex.com</a></li>
              </ul>
            </>
          )}
        </div>

        {/* 2 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "2. Data We Collect" : "2. Datos que recopilamos"}
          </h2>
          {en ? (
            <>
              <p>We collect the following types of personal data:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Registration data:</strong> name, email, company name, sector, organization size.</li>
                <li><strong>Usage data:</strong> registered AI systems, risk classifications, generated documents, checklist interactions.</li>
                <li><strong>Technical data:</strong> IP address, browser type, operating system, access timestamps, cookies.</li>
                <li><strong>Payment data:</strong> processed entirely by Stripe, Inc. as payment processor. We do not store credit cards or direct financial data.</li>
              </ul>
            </>
          ) : (
            <>
              <p>Recopilamos los siguientes tipos de datos personales:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Datos de registro:</strong> nombre, correo electrónico, nombre de la empresa, sector, tamaño de la organización.</li>
                <li><strong>Datos de uso:</strong> sistemas de IA registrados, clasificaciones de riesgo, documentos generados, interacciones con el checklist.</li>
                <li><strong>Datos técnicos:</strong> dirección IP, tipo de navegador, sistema operativo, marca temporal de acceso, cookies.</li>
                <li><strong>Datos de pago:</strong> procesados íntegramente por Stripe, Inc. como procesador de pagos. No almacenamos tarjetas de crédito ni datos financieros directos.</li>
              </ul>
            </>
          )}
        </div>

        {/* 3 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "3. Legal Basis for Processing" : "3. Base legal del tratamiento"}
          </h2>
          {en ? (
            <>
              <p>We process your data under the following legal bases (Art. 6 GDPR):</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Contract execution (Art. 6.1.b):</strong> to provide the platform service and manage your account.</li>
                <li><strong>Consent (Art. 6.1.a):</strong> for sending marketing communications and non-essential cookies.</li>
                <li><strong>Legitimate interest (Art. 6.1.f):</strong> to improve the platform, prevent fraud, and ensure security.</li>
                <li><strong>Legal obligation (Art. 6.1.c):</strong> to comply with tax and regulatory obligations.</li>
              </ul>
            </>
          ) : (
            <>
              <p>Tratamos tus datos con las siguientes bases legales (Art. 6 RGPD):</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Ejecución del contrato (Art. 6.1.b):</strong> para prestar el servicio de la plataforma y gestionar tu cuenta.</li>
                <li><strong>Consentimiento (Art. 6.1.a):</strong> para el envío de comunicaciones comerciales y cookies no esenciales.</li>
                <li><strong>Interés legítimo (Art. 6.1.f):</strong> para mejorar la plataforma, prevenir fraude y garantizar la seguridad.</li>
                <li><strong>Obligación legal (Art. 6.1.c):</strong> para cumplir con obligaciones fiscales y regulatorias.</li>
              </ul>
            </>
          )}
        </div>

        {/* 4 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "4. Purpose of Processing" : "4. Finalidad del tratamiento"}
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            {en ? (
              <>
                <li>Manage your account and provide access to the platform.</li>
                <li>Classify AI systems and generate EU AI Act compliance documentation.</li>
                <li>Send service-related communications (deadline alerts, regulatory updates).</li>
                <li>Process payments and manage subscriptions.</li>
                <li>Improve the platform through aggregated usage analysis.</li>
                <li>Comply with legal and regulatory obligations.</li>
              </>
            ) : (
              <>
                <li>Gestionar tu cuenta y ofrecerte acceso a la plataforma.</li>
                <li>Clasificar sistemas de IA y generar documentación de compliance del EU AI Act.</li>
                <li>Enviar comunicaciones relacionadas con el servicio (alertas de plazos, actualizaciones regulatorias).</li>
                <li>Procesar pagos y gestionar suscripciones.</li>
                <li>Mejorar la plataforma mediante análisis de uso agregado.</li>
                <li>Cumplir con obligaciones legales y regulatorias.</li>
              </>
            )}
          </ul>
        </div>

        {/* 5 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "5. Data Recipients" : "5. Destinatarios de los datos"}
          </h2>
          {en ? (
            <>
              <p>We share your data with the following providers (data processors):</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Supabase, Inc.</strong> — Database hosting and authentication (EU servers, eu-west-1 region).</li>
                <li><strong>Stripe, Inc.</strong> — Payment processing (PCI DSS compliant).</li>
                <li><strong>Resend</strong> — Transactional email delivery.</li>
                <li><strong>Vercel, Inc.</strong> — Web application hosting.</li>
              </ul>
              <p className="mt-2">
                All providers have Standard Contractual Clauses (SCCs) or are certified under the
                EU-US Data Privacy Framework when processing data outside the EEA.
              </p>
            </>
          ) : (
            <>
              <p>Compartimos tus datos con los siguientes proveedores (encargados del tratamiento):</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Supabase, Inc.</strong> — Alojamiento de bases de datos y autenticación (servidores en la UE, región eu-west-1).</li>
                <li><strong>Stripe, Inc.</strong> — Procesamiento de pagos (cumple con PCI DSS).</li>
                <li><strong>Resend</strong> — Envío de correos electrónicos transaccionales.</li>
                <li><strong>Vercel, Inc.</strong> — Alojamiento de la aplicación web.</li>
              </ul>
              <p className="mt-2">
                Todos los proveedores cuentan con cláusulas contractuales tipo (SCCs) o están certificados bajo el
                EU-US Data Privacy Framework cuando procesan datos fuera del EEE.
              </p>
            </>
          )}
        </div>

        {/* 6 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "6. International Transfers" : "6. Transferencias internacionales"}
          </h2>
          <p>
            {en
              ? "Our main database is hosted on Supabase servers within the European Union (AWS eu-west-1, Ireland). For transfers to the US (Stripe, Vercel), the safeguards under Art. 46 GDPR are applied through Standard Contractual Clauses."
              : "Nuestra base de datos principal está alojada en servidores de Supabase dentro de la Unión Europea (AWS eu-west-1, Irlanda). En caso de transferencias a EE.UU. (Stripe, Vercel), se aplican las garantías del Art. 46 RGPD mediante cláusulas contractuales tipo."}
          </p>
        </div>

        {/* 7 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "7. Retention Period" : "7. Plazo de conservación"}
          </h2>
          <ul className="list-disc pl-6 space-y-1">
            {en ? (
              <>
                <li><strong>Account data:</strong> retained while your account is active. After a deletion request, we delete your data within 30 days.</li>
                <li><strong>Billing data:</strong> retained for 5 years due to tax obligations.</li>
                <li><strong>Audit logs:</strong> retained for 3 years for compliance traceability.</li>
                <li><strong>Cookies:</strong> as described in our <a href="/legal/cookies" className="text-brand-500 hover:underline">Cookie Policy</a>.</li>
              </>
            ) : (
              <>
                <li><strong>Datos de cuenta:</strong> mientras mantengas tu cuenta activa. Tras solicitar la baja, eliminamos tus datos en un plazo de 30 días.</li>
                <li><strong>Datos de facturación:</strong> conservados durante 5 años por obligación fiscal.</li>
                <li><strong>Logs de auditoría:</strong> conservados durante 3 años para trazabilidad de compliance.</li>
                <li><strong>Cookies:</strong> según lo indicado en nuestra <a href="/legal/cookies" className="text-brand-500 hover:underline">Política de Cookies</a>.</li>
              </>
            )}
          </ul>
        </div>

        {/* 8 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "8. Your Rights" : "8. Tus derechos"}
          </h2>
          {en ? (
            <>
              <p>Under the GDPR, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Access:</strong> request a copy of your personal data.</li>
                <li><strong>Rectification:</strong> correct inaccurate or incomplete data.</li>
                <li><strong>Erasure:</strong> request the deletion of your data (&ldquo;right to be forgotten&rdquo;).</li>
                <li><strong>Portability:</strong> receive your data in a structured, machine-readable format.</li>
                <li><strong>Objection:</strong> object to processing based on legitimate interest.</li>
                <li><strong>Restriction:</strong> request restriction of processing in certain circumstances.</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, contact us at{" "}
                <a href="mailto:privacidad@audlex.com" className="text-brand-500 hover:underline">privacidad@audlex.com</a>.
                We will respond within 30 days.
              </p>
            </>
          ) : (
            <>
              <p>Conforme al RGPD, tienes derecho a:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Acceso:</strong> solicitar una copia de tus datos personales.</li>
                <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
                <li><strong>Supresión:</strong> solicitar la eliminación de tus datos (&ldquo;derecho al olvido&rdquo;).</li>
                <li><strong>Portabilidad:</strong> recibir tus datos en un formato estructurado y legible por máquina.</li>
                <li><strong>Oposición:</strong> oponerte al tratamiento basado en interés legítimo.</li>
                <li><strong>Limitación:</strong> solicitar la limitación del tratamiento en determinadas circunstancias.</li>
              </ul>
              <p className="mt-2">
                Para ejercer estos derechos, escríbenos a{" "}
                <a href="mailto:privacidad@audlex.com" className="text-brand-500 hover:underline">privacidad@audlex.com</a>.
                Responderemos en un plazo máximo de 30 días.
              </p>
            </>
          )}
        </div>

        {/* 9 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "9. Security" : "9. Seguridad"}
          </h2>
          <p>
            {en
              ? "We implement appropriate technical and organizational measures to protect your data: encryption in transit (TLS 1.3), encryption at rest (AES-256), role-based access control, automatic backups, and access monitoring."
              : "Implementamos medidas técnicas y organizativas apropiadas para proteger tus datos: cifrado en tránsito (TLS 1.3), cifrado en reposo (AES-256), control de acceso basado en roles, copias de seguridad automáticas y monitorización de accesos."}
          </p>
        </div>

        {/* 10 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "10. Supervisory Authority" : "10. Autoridad de control"}
          </h2>
          <p>
            {en ? (
              <>
                If you believe that the processing of your data does not comply with the regulations, you may file
                a complaint with the{" "}
                <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
                  Spanish Data Protection Agency (AEPD)
                </a>.
              </>
            ) : (
              <>
                Si consideras que el tratamiento de tus datos no se ajusta a la normativa, puedes presentar
                una reclamación ante la{" "}
                <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline">
                  Agencia Española de Protección de Datos (AEPD)
                </a>.
              </>
            )}
          </p>
        </div>

        {/* 11 */}
        <div>
          <h2 className="text-xl font-semibold text-text mb-3">
            {en ? "11. Changes to This Policy" : "11. Cambios en esta política"}
          </h2>
          <p>
            {en
              ? "We reserve the right to modify this policy. Any substantial changes will be communicated to registered users via email and the last updated date will be revised."
              : "Nos reservamos el derecho de modificar esta política. Cualquier cambio sustancial será comunicado a los usuarios registrados por correo electrónico y se actualizará la fecha de última modificación."}
          </p>
        </div>
      </section>
    </article>
  );
}
