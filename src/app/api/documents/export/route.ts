import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users, documents } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { documentToMarkdown, type Locale, type GeneratedDocument } from "@/lib/documents/generators";
import { exportLabels } from "@/lib/documents/generators-i18n";
import {
  Document as DocxDocument,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
} from "docx";

export const dynamic = "force-dynamic";

// ============================================================
// GET /api/documents/export?id=xxx&format=pdf|docx
// ============================================================

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("id");
    const format = searchParams.get("format") || "pdf";
    const locale = (searchParams.get("locale") || "es") as Locale;

    if (!documentId) {
      return NextResponse.json({ error: locale === "en" ? "Document ID required" : "ID de documento requerido" }, { status: 400 });
    }

    // Auth
    const supabase = await createSupabaseServer();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: locale === "en" ? "Not authenticated" : "No autenticado" }, { status: 401 });
    }

    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.authProviderId, authUser.id))
      .limit(1);

    if (!dbUser) {
      return NextResponse.json({ error: locale === "en" ? "User not found" : "Usuario no encontrado" }, { status: 404 });
    }

    // Get document
    const [doc] = await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.id, documentId),
          eq(documents.organizationId, dbUser.organizationId)
        )
      )
      .limit(1);

    if (!doc) {
      return NextResponse.json({ error: locale === "en" ? "Document not found" : "Documento no encontrado" }, { status: 404 });
    }

    const markdown = doc.content ? documentToMarkdown(doc.content as unknown as GeneratedDocument, locale) : "";
    const title = doc.title || (locale === "en" ? "Document" : "Documento");
    const safeFileName = title.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s_-]/g, "").replace(/\s+/g, "_");

    if (format === "docx") {
      return await generateDocx(markdown, title, safeFileName, locale);
    } else {
      // PDF: generate using simple HTML-to-PDF approach
      return await generatePdf(markdown, title, safeFileName, locale);
    }
  } catch (error: unknown) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Export error / Error al exportar" },
      { status: 500 }
    );
  }
}

// ============================================================
// DOCX Generation using docx library
// ============================================================

function parseMarkdownToDocxChildren(markdown: string): Paragraph[] {
  const lines = markdown.split("\n");
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: "" }));
      continue;
    }

    // Heading 1
    if (trimmed.startsWith("# ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: trimmed.replace(/^#\s+/, ""),
              bold: true,
              size: 32,
              color: "1e3a5f",
            }),
          ],
          spacing: { before: 400, after: 200 },
        })
      );
      continue;
    }

    // Heading 2
    if (trimmed.startsWith("## ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: trimmed.replace(/^##\s+/, ""),
              bold: true,
              size: 28,
              color: "2563eb",
            }),
          ],
          spacing: { before: 300, after: 150 },
        })
      );
      continue;
    }

    // Heading 3
    if (trimmed.startsWith("### ")) {
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_3,
          children: [
            new TextRun({
              text: trimmed.replace(/^###\s+/, ""),
              bold: true,
              size: 24,
              color: "374151",
            }),
          ],
          spacing: { before: 200, after: 100 },
        })
      );
      continue;
    }

    // Bullet list
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const text = trimmed.replace(/^[-*]\s+/, "");
      const runs = parseInlineMarkdown(text);
      paragraphs.push(
        new Paragraph({
          children: [new TextRun({ text: "• " }), ...runs],
          spacing: { before: 60, after: 60 },
          indent: { left: 360 },
        })
      );
      continue;
    }

    // Horizontal rule
    if (trimmed === "---" || trimmed === "***") {
      paragraphs.push(
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 1, color: "d1d5db" },
          },
          spacing: { before: 200, after: 200 },
        })
      );
      continue;
    }

    // Regular paragraph with inline formatting
    const runs = parseInlineMarkdown(trimmed);
    paragraphs.push(
      new Paragraph({
        children: runs,
        spacing: { before: 80, after: 80 },
      })
    );
  }

  return paragraphs;
}

function parseInlineMarkdown(text: string): TextRun[] {
  const runs: TextRun[] = [];
  // Handle **bold** and *italic* patterns
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]*\]\([^)]*\))/);

  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (part.startsWith("*") && part.endsWith("*")) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
    } else if (part.match(/\[([^\]]*)\]\(([^)]*)\)/)) {
      const match = part.match(/\[([^\]]*)\]\(([^)]*)\)/)!;
      runs.push(new TextRun({ text: match[1], color: "2563eb", underline: {} }));
    } else if (part) {
      runs.push(new TextRun({ text: part }));
    }
  }

  if (runs.length === 0) {
    runs.push(new TextRun({ text }));
  }

  return runs;
}

async function generateDocx(
  markdown: string,
  title: string,
  fileName: string,
  locale: Locale = "es"
): Promise<NextResponse> {
  const children = parseMarkdownToDocxChildren(markdown);

  const doc = new DocxDocument({
    creator: "Audlex",
    title,
    description: exportLabels.docxDescription[locale],
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Audlex — EU AI Act Compliance",
                    size: 16,
                    color: "94a3b8",
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: exportLabels.docxFooter[locale],
                    size: 16,
                    color: "94a3b8",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: "94a3b8",
                  }),
                  new TextRun({
                    text: " / ",
                    size: 16,
                    color: "94a3b8",
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: "94a3b8",
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${fileName}.docx"`,
    },
  });
}

// ============================================================
// PDF generation using simple HTML approach (no heavy deps)
// ============================================================

function markdownToHtml(md: string): string {
  let html = md
    // Headings
    .replace(/^### (.+)$/gm, '<h3 style="color:#374151;font-size:14px;margin:16px 0 8px;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="color:#2563eb;font-size:16px;margin:20px 0 10px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="color:#1e3a5f;font-size:20px;margin:24px 0 12px;">$1</h1>')
    // Bold & italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^[-*] (.+)$/gm, '<li style="margin:2px 0;">$1</li>')
    // Horizontal rules
    .replace(/^(---|\*\*\*)$/gm, '<hr style="border:none;border-top:1px solid #d1d5db;margin:16px 0;">')
    // Paragraphs (non-empty lines)
    .replace(/^(?!<[hlu]|<li|<hr)(.+)$/gm, '<p style="margin:4px 0;line-height:1.6;">$1</p>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul style="padding-left:20px;margin:8px 0;">${match}</ul>`)
    // Empty lines
    .replace(/^\s*$/gm, '');

  return html;
}

async function generatePdf(
  markdown: string, 
  title: string, 
  fileName: string,
  locale: Locale = "es"
): Promise<NextResponse> {
  const bodyHtml = markdownToHtml(markdown);
  const now = new Date().toLocaleDateString(locale === "en" ? "en-GB" : "es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @page { margin: 2cm; size: A4; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 11px;
      color: #1f2937;
      line-height: 1.6;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .header .logo { font-size: 18px; font-weight: 700; color: #2563eb; }
    .header .date { font-size: 10px; color: #6b7280; }
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 9px;
      color: #9ca3af;
      border-top: 1px solid #e5e7eb;
      padding-top: 8px;
    }
    h1 { page-break-after: avoid; }
    h2, h3 { page-break-after: avoid; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    td, th { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; font-size: 10px; }
    th { background: #f3f4f6; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🛡️ Audlex</div>
    <div class="date">${now}</div>
  </div>
  ${bodyHtml}
  <div class="footer">
    ${exportLabels.pdfFooter[locale]}
  </div>
</body>
</html>`;

  // Return as HTML-PDF (the browser can print-to-PDF, or we send as styled HTML)
  // For a proper server-side PDF, we'd need puppeteer/playwright which are heavy.
  // We return a well-formatted HTML that any browser will print perfectly as PDF.
  return new NextResponse(fullHtml, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="${fileName}.html"`,
    },
  });
}
