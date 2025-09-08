"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_js_1 = require("../auth.js");
const storage_js_1 = require("../storage.js");
const router = express_1.default.Router();
// Helper function to format date in Korean
function formatKoreanDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}년 ${month}월 ${day}일`;
}
// Helper function to convert data to CSV format with better structure
function convertToCSV(data) {
    if (data.length === 0)
        return "";
    const headers = ["번호", "문장", "책 제목", "저자", "페이지", "좋아요", "등록일", "메모"];
    const csvHeaders = headers.join(",");
    const csvRows = data.map((row, index) => {
        const values = [
            index + 1,
            `"${(row.content || "").replace(/"/g, '""')}"`,
            `"${(row.bookTitle || "").replace(/"/g, '""')}"`,
            `"${(row.author || "").replace(/"/g, '""')}"`,
            row.pageNumber || "",
            row.likes || 0,
            formatKoreanDate(new Date(row.createdAt)),
            ""
        ];
        return values.join(",");
    });
    return [csvHeaders, ...csvRows].join("\n");
}
// Helper function to convert data to beautiful text format
function convertToText(sentences, title = "문장 모음") {
    const lines = [];
    // Header
    lines.push("╔" + "═".repeat(78) + "╗");
    lines.push("║" + title.padStart(39 + title.length / 2).padEnd(78) + "║");
    lines.push("╠" + "═".repeat(78) + "╣");
    lines.push("║ 총 " + sentences.length + "개의 문장" + " ".repeat(78 - 10 - sentences.length.toString().length) + "║");
    lines.push("║ 생성일: " + formatKoreanDate(new Date()) + " ".repeat(78 - 18 - formatKoreanDate(new Date()).length) + "║");
    lines.push("╚" + "═".repeat(78) + "╝");
    lines.push("");
    // Group sentences by book
    const bookGroups = new Map();
    sentences.forEach(s => {
        const bookKey = s.bookTitle || "분류 없음";
        if (!bookGroups.has(bookKey)) {
            bookGroups.set(bookKey, []);
        }
        bookGroups.get(bookKey).push(s);
    });
    // Sort books and sentences
    const sortedBooks = Array.from(bookGroups.entries()).sort(([a], [b]) => a.localeCompare(b));
    sortedBooks.forEach(([bookTitle, bookSentences], bookIndex) => {
        // Sort sentences by page number
        bookSentences.sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
        // Book header
        lines.push("");
        lines.push("┌" + "─".repeat(78) + "┐");
        lines.push("│ 📚 " + bookTitle + " ".repeat(Math.max(0, 74 - bookTitle.length)) + "│");
        if (bookSentences[0]?.author) {
            lines.push("│ ✍️  " + bookSentences[0].author + " ".repeat(Math.max(0, 73 - bookSentences[0].author.length)) + "│");
        }
        lines.push("│ 📝 " + bookSentences.length + "개 문장" + " ".repeat(Math.max(0, 67 - bookSentences.length.toString().length)) + "│");
        lines.push("└" + "─".repeat(78) + "┘");
        lines.push("");
        // Sentences
        bookSentences.forEach((s, index) => {
            const sentenceNum = `【${index + 1}】`;
            // Sentence content with word wrap
            const maxWidth = 70;
            const words = s.content.split(' ');
            let currentLine = '';
            const wrappedLines = [];
            words.forEach(word => {
                if ((currentLine + ' ' + word).length > maxWidth) {
                    if (currentLine)
                        wrappedLines.push(currentLine);
                    currentLine = word;
                }
                else {
                    currentLine = currentLine ? currentLine + ' ' + word : word;
                }
            });
            if (currentLine)
                wrappedLines.push(currentLine);
            lines.push(sentenceNum);
            wrappedLines.forEach(line => {
                lines.push("    " + line);
            });
            // Metadata
            const metadata = [];
            if (s.pageNumber)
                metadata.push(`p.${s.pageNumber}`);
            if (s.likes > 0)
                metadata.push(`♥ ${s.likes}`);
            metadata.push(formatKoreanDate(new Date(s.createdAt)));
            if (metadata.length > 0) {
                lines.push("    ▸ " + metadata.join(" | "));
            }
            lines.push("");
        });
    });
    // Footer
    lines.push("");
    lines.push("─".repeat(80));
    lines.push("✨ 문장수집가 - 당신의 문장을 소중히 간직합니다");
    return lines.join("\n");
}
// Helper function to convert data to Markdown format
function convertToMarkdown(sentences, title = "문장 모음") {
    const lines = [];
    // Header
    lines.push(`# ${title}`);
    lines.push("");
    lines.push(`> 📅 생성일: ${formatKoreanDate(new Date())}`);
    lines.push(`> 📚 총 ${sentences.length}개의 문장`);
    lines.push("");
    lines.push("---");
    lines.push("");
    // Group sentences by book
    const bookGroups = new Map();
    sentences.forEach(s => {
        const bookKey = s.bookTitle || "분류 없음";
        if (!bookGroups.has(bookKey)) {
            bookGroups.set(bookKey, []);
        }
        bookGroups.get(bookKey).push(s);
    });
    // Sort books
    const sortedBooks = Array.from(bookGroups.entries()).sort(([a], [b]) => a.localeCompare(b));
    sortedBooks.forEach(([bookTitle, bookSentences]) => {
        // Sort sentences by page number
        bookSentences.sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
        lines.push(`## 📖 ${bookTitle}`);
        if (bookSentences[0]?.author) {
            lines.push(`*저자: ${bookSentences[0].author}*`);
        }
        lines.push("");
        bookSentences.forEach((s, index) => {
            lines.push(`### ${index + 1}. ${s.pageNumber ? `(p.${s.pageNumber})` : ""}`);
            lines.push("");
            lines.push(`> ${s.content}`);
            lines.push("");
            const metadata = [];
            if (s.likes > 0)
                metadata.push(`❤️ ${s.likes}`);
            metadata.push(`📅 ${formatKoreanDate(new Date(s.createdAt))}`);
            if (metadata.length > 0) {
                lines.push(`*${metadata.join(" • ")}*`);
                lines.push("");
            }
        });
        lines.push("---");
        lines.push("");
    });
    lines.push("");
    lines.push("*✨ 문장수집가에서 내보냄*");
    return lines.join("\n");
}
// Helper function to convert data to JSON format with better structure
function convertToJSON(sentences) {
    const exportData = {
        metadata: {
            title: "문장수집가 내보내기",
            exportDate: new Date().toISOString(),
            totalSentences: sentences.length,
            totalBooks: new Set(sentences.map(s => s.bookTitle).filter(Boolean)).size
        },
        sentences: sentences.map((s, index) => ({
            id: index + 1,
            content: s.content,
            book: {
                title: s.bookTitle || null,
                author: s.author || null,
                pageNumber: s.pageNumber || null
            },
            stats: {
                likes: s.likes || 0,
                createdAt: s.createdAt
            }
        }))
    };
    return JSON.stringify(exportData, null, 2);
}
// Optimized export endpoint - all formats
router.get("/export", auth_js_1.requireAuth, async (req, res) => {
    try {
        const { format = "txt", type = "all", bookTitle, startDate, endDate } = req.query;
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        let sentences = await storage_js_1.storage.getUserSentences(userId);
        let filename = "sentences";
        let exportTitle = "나의 문장 모음";
        // Apply filters based on type
        if (type === "book" && bookTitle) {
            const decodedTitle = decodeURIComponent(bookTitle);
            sentences = sentences.filter(s => s.bookTitle === decodedTitle);
            filename = `${decodedTitle}_sentences`;
            exportTitle = `${decodedTitle} - 문장 모음`;
        }
        else if (type === "date" && startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            sentences = sentences.filter(s => {
                const createdAt = new Date(s.createdAt);
                return createdAt >= start && createdAt <= end;
            });
            filename = `sentences_${startDate}_to_${endDate}`;
            exportTitle = `${formatKoreanDate(start)} ~ ${formatKoreanDate(end)} 문장 모음`;
        }
        // Sort sentences
        sentences.sort((a, b) => {
            // First by book title
            const bookCompare = (a.bookTitle || "").localeCompare(b.bookTitle || "");
            if (bookCompare !== 0)
                return bookCompare;
            // Then by page number
            return (a.pageNumber || 0) - (b.pageNumber || 0);
        });
        // Generate export based on format
        let content;
        let contentType;
        let extension;
        switch (format) {
            case "csv":
                content = "\uFEFF" + convertToCSV(sentences); // BOM for Excel UTF-8
                contentType = "text/csv; charset=utf-8";
                extension = "csv";
                break;
            case "json":
                content = convertToJSON(sentences);
                contentType = "application/json; charset=utf-8";
                extension = "json";
                break;
            case "markdown":
                content = convertToMarkdown(sentences, exportTitle);
                contentType = "text/markdown; charset=utf-8";
                extension = "md";
                break;
            case "txt":
            default:
                content = convertToText(sentences, exportTitle);
                contentType = "text/plain; charset=utf-8";
                extension = "txt";
                break;
        }
        // Set headers for download
        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `attachment; filename="${filename}.${extension}"`);
        res.setHeader("Cache-Control", "no-cache");
        res.send(content);
    }
    catch (error) {
        console.error("Export error:", error);
        res.status(500).json({ error: "Failed to export sentences" });
    }
});
// Get export statistics
router.get("/export/stats", auth_js_1.requireAuth, async (req, res) => {
    try {
        const userId = req.session?.userId;
        if (!userId) {
            return res.status(401).json({ error: "Authentication required" });
        }
        const sentences = await storage_js_1.storage.getUserSentences(userId);
        // Calculate statistics
        const stats = {
            totalSentences: sentences.length,
            totalBooks: new Set(sentences.filter(s => s.bookTitle).map(s => s.bookTitle)).size,
            totalLikes: sentences.reduce((sum, s) => sum + (s.likes || 0), 0),
            averageLength: sentences.length > 0
                ? Math.round(sentences.reduce((sum, s) => sum + s.content.length, 0) / sentences.length)
                : 0,
            dateRange: {
                earliest: sentences.length > 0
                    ? sentences.reduce((min, s) => new Date(s.createdAt) < new Date(min) ? s.createdAt : min, sentences[0].createdAt)
                    : null,
                latest: sentences.length > 0
                    ? sentences.reduce((max, s) => new Date(s.createdAt) > new Date(max) ? s.createdAt : max, sentences[0].createdAt)
                    : null
            },
            bookList: Array.from(new Set(sentences.filter(s => s.bookTitle).map(s => s.bookTitle)))
                .map(title => ({
                title,
                count: sentences.filter(s => s.bookTitle === title).length,
                author: sentences.find(s => s.bookTitle === title)?.author || null
            }))
                .sort((a, b) => b.count - a.count)
        };
        res.json(stats);
    }
    catch (error) {
        console.error("Export stats error:", error);
        res.status(500).json({ error: "Failed to get export statistics" });
    }
});
exports.default = router;
