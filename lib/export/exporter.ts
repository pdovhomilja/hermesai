import { prisma } from "@/lib/db/client";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { marked } from "marked";
import { format } from "date-fns";
import logger from "@/lib/logger";

export type ExportFormat = "pdf" | "markdown" | "json" | "html";

export interface ExportOptions {
  format: ExportFormat;
  conversationIds?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  includeMetadata?: boolean;
  includeInsights?: boolean;
  includeStorytellingElements?: boolean;
  includeHermeticContext?: boolean;
}

export interface ConversationExportData {
  id: string;
  title: string;
  createdAt: Date;
  language: string;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    createdAt: Date;
    emotionalState?: string;
    hermeticPrinciples?: string[];
    metadata?: any;
  }>;
  topics?: Array<{
    name: string;
    relevance: number;
  }>;
  insights?: Array<{
    type: string;
    content: string;
    significance: string;
    createdAt: Date;
  }>;
  metadata?: any;
}

/**
 * ConversationExporter
 * 
 * Exports spiritual conversations and journey data in multiple formats,
 * preserving the sacred nature of dialogues with Hermes Trismegistus
 * while providing practical access to accumulated wisdom.
 */
export class ConversationExporter {
  constructor(private userId: string) {}

  async export(options: ExportOptions): Promise<Buffer | string> {
    const conversations = await this.getConversations(options);

    switch (options.format) {
      case "pdf":
        return this.exportToPDF(conversations, options);
      case "markdown":
        return this.exportToMarkdown(conversations, options);
      case "json":
        return this.exportToJSON(conversations, options);
      case "html":
        return this.exportToHTML(conversations, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private async getConversations(options: ExportOptions): Promise<ConversationExportData[]> {
    const where: any = {
      userId: this.userId,
      status: "ACTIVE",
    };

    if (options.conversationIds) {
      where.id = { in: options.conversationIds };
    }

    if (options.dateFrom || options.dateTo) {
      where.createdAt = {};
      if (options.dateFrom) where.createdAt.gte = options.dateFrom;
      if (options.dateTo) where.createdAt.lte = options.dateTo;
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        topics: options.includeMetadata ? {
          include: {
            topic: true,
          },
        } : false,
        insights: options.includeInsights || false,
      },
      orderBy: { createdAt: "desc" },
    });

    return conversations.map(c => ({
      id: c.id,
      title: c.title || 'Untitled Conversation',
      createdAt: c.createdAt,
      language: c.language,
      messages: c.messages.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
        emotionalState: m.emotionalState || undefined,
        hermeticPrinciples: m.hermeticPrinciples || [],
        metadata: options.includeMetadata ? m.metadata : undefined,
      })),
      topics: options.includeMetadata && c.topics ? c.topics.map((t: any) => ({
        name: t.topic.name,
        relevance: t.relevance || 1.0,
      })) : undefined,
      insights: options.includeInsights && c.insights ? c.insights.map((i: any) => ({
        type: i.type,
        content: i.content,
        significance: i.significance,
        createdAt: i.createdAt,
      })) : undefined,
      metadata: options.includeMetadata ? c.metadata : undefined,
    }));
  }

  private async exportToPDF(
    conversations: ConversationExportData[],
    options: ExportOptions
  ): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Colors
    const hermesColor = rgb(0.4, 0.2, 0.6); // Purple for Hermes
    const userColor = rgb(0.2, 0.2, 0.2); // Dark gray for user
    const accentColor = rgb(0.6, 0.4, 0.8); // Light purple for accents

    // Add title page
    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    let yPosition = height - 80;

    // Main title
    page.drawText("Conversations with Hermes Trismegistus", {
      x: 50,
      y: yPosition,
      size: 24,
      font: titleFont,
      color: hermesColor,
    });

    yPosition -= 40;

    // Subtitle
    page.drawText("Sacred Dialogues on the Path of Spiritual Wisdom", {
      x: 50,
      y: yPosition,
      size: 14,
      font: font,
      color: userColor,
    });

    yPosition -= 60;

    // Export details
    const exportDate = format(new Date(), "PPP");
    page.drawText(`Exported on: ${exportDate}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 20;

    page.drawText(`Total conversations: ${conversations.length}`, {
      x: 50,
      y: yPosition,
      size: 12,
      font: font,
    });

    yPosition -= 20;

    if (options.dateFrom || options.dateTo) {
      const dateRange = `${options.dateFrom ? format(options.dateFrom, "PPP") : "Beginning"} - ${options.dateTo ? format(options.dateTo, "PPP") : "Present"}`;
      page.drawText(`Date range: ${dateRange}`, {
        x: 50,
        y: yPosition,
        size: 12,
        font: font,
      });
    }

    yPosition -= 60;

    // Hermetic quote
    const quote = '"As above, so below; as within, so without. The conversations herein contain the seeds of transformation."';
    const quoteParts = this.wrapText(quote, 80);
    quoteParts.forEach(part => {
      page.drawText(part, {
        x: 50,
        y: yPosition,
        size: 11,
        font: font,
        color: accentColor,
      });
      yPosition -= 15;
    });

    // Process each conversation
    for (const conversation of conversations) {
      page = pdfDoc.addPage();
      yPosition = height - 50;

      // Conversation header
      page.drawText(conversation.title, {
        x: 50,
        y: yPosition,
        size: 18,
        font: boldFont,
        color: hermesColor,
      });

      yPosition -= 25;

      page.drawText(`Date: ${format(conversation.createdAt, "PPP")}`, {
        x: 50,
        y: yPosition,
        size: 11,
        font: font,
      });

      yPosition -= 15;

      if (conversation.topics && conversation.topics.length > 0) {
        const topics = conversation.topics.map(t => t.name).join(', ');
        page.drawText(`Topics: ${topics}`, {
          x: 50,
          y: yPosition,
          size: 10,
          font: font,
          color: accentColor,
        });
        yPosition -= 20;
      }

      yPosition -= 10;

      // Draw separator line
      page.drawLine({
        start: { x: 50, y: yPosition },
        end: { x: width - 50, y: yPosition },
        thickness: 1,
        color: accentColor,
      });

      yPosition -= 20;

      // Messages
      for (const message of conversation.messages) {
        if (yPosition < 100) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }

        const role = message.role === "USER" ? "You" : "Hermes";
        const roleColor = message.role === "USER" ? userColor : hermesColor;

        // Role header
        page.drawText(`${role}:`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: roleColor,
        });

        yPosition -= 18;

        // Message content
        const contentLines = this.wrapText(message.content, 80);
        for (const line of contentLines.slice(0, 15)) { // Limit lines per message
          if (yPosition < 80) {
            page = pdfDoc.addPage();
            yPosition = height - 50;
          }

          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 10,
            font: font,
          });
          yPosition -= 12;
        }

        if (contentLines.length > 15) {
          page.drawText("...", {
            x: 50,
            y: yPosition,
            size: 10,
            font: font,
            color: accentColor,
          });
          yPosition -= 12;
        }

        // Hermetic context if available
        if (options.includeHermeticContext && message.hermeticPrinciples && message.hermeticPrinciples.length > 0) {
          yPosition -= 5;
          page.drawText(`Principles: ${message.hermeticPrinciples.join(', ')}`, {
            x: 50,
            y: yPosition,
            size: 8,
            font: font,
            color: accentColor,
          });
          yPosition -= 10;
        }

        yPosition -= 15; // Space between messages
      }

      // Add insights if included
      if (conversation.insights && conversation.insights.length > 0) {
        yPosition -= 20;

        if (yPosition < 150) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }

        page.drawText("Insights from this conversation:", {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: hermesColor,
        });
        yPosition -= 20;

        for (const insight of conversation.insights) {
          if (yPosition < 60) {
            page = pdfDoc.addPage();
            yPosition = height - 50;
          }

          page.drawText(`• ${insight.content}`, {
            x: 60,
            y: yPosition,
            size: 10,
            font: font,
          });
          yPosition -= 15;
        }
      }
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  private exportToMarkdown(
    conversations: ConversationExportData[],
    options: ExportOptions
  ): string {
    let markdown = "# Conversations with Hermes Trismegistus\n\n";
    markdown += "*Sacred Dialogues on the Path of Spiritual Wisdom*\n\n";
    markdown += "---\n\n";

    // Export metadata
    markdown += `**Export Date:** ${format(new Date(), "PPP")}\n\n`;
    markdown += `**Total Conversations:** ${conversations.length}\n\n`;

    if (options.dateFrom || options.dateTo) {
      const dateRange = `${options.dateFrom ? format(options.dateFrom, "PPP") : "Beginning"} - ${options.dateTo ? format(options.dateTo, "PPP") : "Present"}`;
      markdown += `**Date Range:** ${dateRange}\n\n`;
    }

    markdown += "> *\"As above, so below; as within, so without. The conversations herein contain the seeds of transformation.\"*\n\n";
    markdown += "---\n\n";

    // Process conversations
    for (const conversation of conversations) {
      markdown += `## ${conversation.title}\n\n`;
      markdown += `**Date:** ${format(conversation.createdAt, "PPP")}\n\n`;

      if (conversation.topics && conversation.topics.length > 0) {
        markdown += `**Topics:** ${conversation.topics.map(t => t.name).join(", ")}\n\n`;
      }

      if (conversation.messages.length > 0) {
        markdown += "### Conversation\n\n";
      }

      for (const message of conversation.messages) {
        const role = message.role === "USER" ? "**You**" : "**Hermes**";
        markdown += `${role}: ${message.content}\n\n`;

        if (options.includeHermeticContext && message.hermeticPrinciples && message.hermeticPrinciples.length > 0) {
          markdown += `*Principles discussed: ${message.hermeticPrinciples.join(', ')}*\n\n`;
        }
      }

      if (conversation.insights && conversation.insights.length > 0) {
        markdown += "### Insights\n\n";
        for (const insight of conversation.insights) {
          markdown += `- **${insight.type}**: ${insight.content}\n`;
        }
        markdown += "\n";
      }

      markdown += "---\n\n";
    }

    return markdown;
  }

  private exportToJSON(conversations: ConversationExportData[], options: ExportOptions): string {
    const exportData = {
      meta: {
        title: "Conversations with Hermes Trismegistus",
        exportDate: new Date().toISOString(),
        userId: this.userId,
        totalConversations: conversations.length,
        options: {
          format: options.format,
          includeMetadata: options.includeMetadata,
          includeInsights: options.includeInsights,
          includeHermeticContext: options.includeHermeticContext,
          dateRange: {
            from: options.dateFrom?.toISOString(),
            to: options.dateTo?.toISOString(),
          },
        },
        hermeticBrief: "Sacred dialogues between seeker and the Thrice-Great master of ancient wisdom",
      },
      conversations: conversations.map((c) => ({
        id: c.id,
        title: c.title,
        createdAt: c.createdAt.toISOString(),
        language: c.language,
        messageCount: c.messages.length,
        messages: c.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
          emotionalState: m.emotionalState,
          hermeticPrinciples: m.hermeticPrinciples,
          metadata: options.includeMetadata ? m.metadata : undefined,
        })),
        topics: c.topics,
        insights: c.insights?.map(i => ({
          ...i,
          createdAt: i.createdAt.toISOString(),
        })),
        metadata: options.includeMetadata ? c.metadata : undefined,
      })),
      statistics: {
        totalMessages: conversations.reduce((sum, c) => sum + c.messages.length, 0),
        averageMessagesPerConversation: conversations.length > 0 
          ? Math.round(conversations.reduce((sum, c) => sum + c.messages.length, 0) / conversations.length)
          : 0,
        hermeticPrinciplesDiscussed: [
          ...new Set(
            conversations.flatMap(c => 
              c.messages.flatMap(m => m.hermeticPrinciples || [])
            )
          )
        ],
        conversationTopics: [
          ...new Set(
            conversations.flatMap(c => c.topics?.map(t => t.name) || [])
          )
        ],
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  private exportToHTML(conversations: ConversationExportData[], options: ExportOptions): string {
    const markdown = this.exportToMarkdown(conversations, options);
    const htmlContent = marked(markdown);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Conversations with Hermes Trismegistus</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
            background: linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%);
            color: #333;
        }
        
        h1 {
            color: #6633cc;
            text-align: center;
            border-bottom: 3px solid #e0d5ff;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        
        h2 {
            color: #8855dd;
            margin-top: 40px;
            padding-left: 10px;
            border-left: 4px solid #6633cc;
        }
        
        h3 {
            color: #aa77ee;
            margin-top: 25px;
        }
        
        blockquote {
            border-left: 4px solid #6633cc;
            padding-left: 20px;
            margin: 20px 0;
            font-style: italic;
            background: rgba(102, 51, 204, 0.05);
            padding: 15px 20px;
            border-radius: 5px;
        }
        
        p {
            margin-bottom: 15px;
        }
        
        strong {
            color: #6633cc;
        }
        
        hr {
            border: none;
            height: 2px;
            background: linear-gradient(to right, transparent, #e0d5ff, transparent);
            margin: 30px 0;
        }
        
        .meta-info {
            background: rgba(102, 51, 204, 0.1);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
            font-size: 0.9em;
        }
        
        .conversation {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(102, 51, 204, 0.1);
        }
        
        .message {
            margin: 15px 0;
            padding: 10px 15px;
            border-radius: 6px;
        }
        
        .user-message {
            background: rgba(102, 51, 204, 0.05);
            border-left: 3px solid #6633cc;
        }
        
        .hermes-message {
            background: rgba(136, 85, 221, 0.05);
            border-left: 3px solid #8855dd;
        }
        
        .principles {
            font-size: 0.85em;
            color: #8855dd;
            font-style: italic;
            margin-top: 8px;
        }
        
        .insights {
            background: rgba(170, 119, 238, 0.1);
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
        }
        
        .insights h4 {
            color: #aa77ee;
            margin-top: 0;
        }
        
        .footer {
            text-align: center;
            margin-top: 50px;
            padding: 20px;
            color: #666;
            font-style: italic;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .conversation {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    ${htmlContent}
    
    <div class="footer">
        <p>🔮 Sacred wisdom preserved for eternity 🔮</p>
        <p><em>May these conversations continue to guide you on your spiritual journey</em></p>
        <p>Exported from IALchemist.app on ${format(new Date(), "PPP")}</p>
    </div>
</body>
</html>`;
  }

  async getExportStats(): Promise<{
    totalConversations: number;
    totalMessages: number;
    dateRange: { oldest: Date | null; newest: Date | null };
    avgMessagesPerConversation: number;
    topTopics: string[];
    hermeticPrinciples: string[];
  }> {
    const conversations = await prisma.conversation.findMany({
      where: { userId: this.userId, status: "ACTIVE" },
      include: {
        messages: {
          select: {
            hermeticPrinciples: true,
          },
        },
        topics: {
          include: {
            topic: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);
    const avgMessages = conversations.length > 0 ? Math.round(totalMessages / conversations.length) : 0;

    const allPrinciples = conversations.flatMap(c =>
      c.messages.flatMap(m => m.hermeticPrinciples || [])
    );
    const uniquePrinciples = [...new Set(allPrinciples)];

    const allTopics = conversations.flatMap(c =>
      c.topics?.map((t: any) => t.topic.name) || []
    );
    const topicCounts = allTopics.reduce((acc: Record<string, number>, topic) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {});
    const topTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    return {
      totalConversations: conversations.length,
      totalMessages,
      dateRange: {
        oldest: conversations.length > 0 ? conversations[0].createdAt : null,
        newest: conversations.length > 0 ? conversations[conversations.length - 1].createdAt : null,
      },
      avgMessagesPerConversation: avgMessages,
      topTopics,
      hermeticPrinciples: uniquePrinciples,
    };
  }

  estimateExportSize(format: ExportFormat): string {
    // Rough estimates based on format
    const sizeEstimates = {
      pdf: "2-10 MB depending on conversation count",
      markdown: "100 KB - 2 MB as plain text",
      json: "500 KB - 5 MB with full metadata",
      html: "200 KB - 3 MB with styling",
    };

    return sizeEstimates[format];
  }

  private wrapText(text: string, maxChars: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      if ((currentLine + word).length > maxChars && currentLine.length > 0) {
        lines.push(currentLine.trim());
        currentLine = word + " ";
      } else {
        currentLine += word + " ";
      }
    }

    if (currentLine) {
      lines.push(currentLine.trim());
    }

    return lines;
  }
}