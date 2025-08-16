import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { ConversationExporter } from "@/lib/export/exporter";
import { z } from "zod";
import logger from "@/lib/logger";

const exportSchema = z.object({
  format: z.enum(["pdf", "markdown", "json", "html"]),
  conversationIds: z.array(z.string()).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  includeMetadata: z.boolean().default(false),
  includeInsights: z.boolean().default(true),
  includeStorytellingElements: z.boolean().default(false),
  includeHermeticContext: z.boolean().default(true),
  filename: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const exportOptions = exportSchema.parse(body);

    const exporter = new ConversationExporter(session.user.id);

    const startTime = Date.now();
    
    const result = await exporter.export({
      ...exportOptions,
      dateFrom: exportOptions.dateFrom
        ? new Date(exportOptions.dateFrom)
        : undefined,
      dateTo: exportOptions.dateTo ? new Date(exportOptions.dateTo) : undefined,
    });

    const exportTime = Date.now() - startTime;

    // Determine filename
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `hermes-conversations-${timestamp}`;
    const filename = exportOptions.filename || defaultFilename;

    // Set appropriate headers and content type based on format
    const headers: HeadersInit = {};
    let contentType: string;
    let fileExtension: string;

    switch (exportOptions.format) {
      case "pdf":
        contentType = "application/pdf";
        fileExtension = "pdf";
        break;
      case "markdown":
        contentType = "text/markdown";
        fileExtension = "md";
        break;
      case "json":
        contentType = "application/json";
        fileExtension = "json";
        break;
      case "html":
        contentType = "text/html";
        fileExtension = "html";
        break;
      default:
        throw new Error("Unsupported format");
    }

    headers["Content-Type"] = contentType;
    headers["Content-Disposition"] = `attachment; filename="${filename}.${fileExtension}"`;
    
    // Add export metadata headers
    headers["X-Export-Format"] = exportOptions.format;
    headers["X-Export-Time"] = exportTime.toString();
    headers["X-Export-Date"] = new Date().toISOString();

    // Add CORS headers for download
    headers["Access-Control-Expose-Headers"] = "Content-Disposition, X-Export-Format, X-Export-Time";

    logger.info({
      userId: session.user.id,
      format: exportOptions.format,
      conversationCount: exportOptions.conversationIds?.length || "all",
      includeMetadata: exportOptions.includeMetadata,
      includeInsights: exportOptions.includeInsights,
      exportTime,
    }, "Conversation export completed");

    return new Response(result as BodyInit, { headers });
  } catch (error) {
    logger.error({ error }, "Export API error");

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid export parameters", details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes("Unsupported")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get('format') as 'pdf' | 'markdown' | 'json' | 'html' || 'json';
    const preview = searchParams.get('preview') === 'true';

    if (preview) {
      // Return export preview/metadata
      const exporter = new ConversationExporter(session.user.id);
      
      // Get basic stats for preview
      const stats = await exporter.getExportStats();
      
      return NextResponse.json({
        stats,
        formats: [
          {
            type: 'pdf',
            name: 'PDF Document',
            description: 'Beautifully formatted document perfect for reading and archiving',
            features: ['Professional layout', 'Hermetic styling', 'Offline reading'],
          },
          {
            type: 'markdown',
            name: 'Markdown',
            description: 'Plain text format that preserves formatting and is easy to edit',
            features: ['Universal compatibility', 'Version control friendly', 'Easy editing'],
          },
          {
            type: 'json',
            name: 'JSON Data',
            description: 'Structured data format perfect for analysis and backup',
            features: ['Complete metadata', 'Machine readable', 'Easy parsing'],
          },
          {
            type: 'html',
            name: 'HTML Web Page',
            description: 'Interactive web page with mystical styling',
            features: ['Web browser viewing', 'Beautiful design', 'Interactive elements'],
          },
        ],
        estimatedSize: exporter.estimateExportSize(format),
      });
    }

    // Return export options/capabilities
    return NextResponse.json({
      supportedFormats: ['pdf', 'markdown', 'json', 'html'],
      maxConversations: 1000,
      features: {
        includeMetadata: 'Include conversation metadata and hermetic context',
        includeInsights: 'Include spiritual insights and revelations',
        includeStorytellingElements: 'Include mystical narrative elements',
        includeHermeticContext: 'Include hermetic principles and spiritual context',
      },
      estimatedExportTime: '5-30 seconds depending on size',
    });
  } catch (error) {
    logger.error({ error }, "Export GET API error");
    return NextResponse.json({ error: "Failed to get export info" }, { status: 500 });
  }
}