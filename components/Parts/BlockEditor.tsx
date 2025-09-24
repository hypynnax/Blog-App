import { useState, useRef, useCallback, useEffect } from "react";
import {
  Plus,
  Type,
  Heading1,
  List,
  Quote,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  TextAlignJustify,
  MoreHorizontal,
  Trash2,
  Move,
  Eye,
  Edit3,
  Bold,
  Italic,
  Underline,
  Link2,
  Video,
  Table,
  Space,
  Minus,
  Columns,
  TextInitial,
  Indent,
  Code2,
  Copy,
} from "lucide-react";

interface Block {
  id: string;
  type:
    | "paragraph"
    | "heading"
    | "list"
    | "quote"
    | "image"
    | "divider"
    | "spacer"
    | "table"
    | "columns"
    | "code"
    | "video";
  content: string;
  properties: {
    level?: number;
    align?: "left" | "center" | "right" | "justify";
    fontSize?: number;
    color?: string;
    backgroundColor?: string;
    ordered?: boolean;
    listStyle?:
      | "disc"
      | "circle"
      | "square"
      | "decimal"
      | "lower-alpha"
      | "upper-alpha"
      | "lower-roman"
      | "upper-roman";
    url?: string;
    alt?: string;
    videoTitle?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    link?: string;
    videoUrl?: string;
    spacing?: number;
    indent?: boolean;
    indentAll?: boolean;
    dropCap?: boolean;
    tableRows?: number;
    tableCols?: number;
    tableData?: string[][];
    columnCount?: number;
    columnGap?: number;
    columnTypes?: ("text" | "image" | "code" | "video")[];
    columnContents?: string[];
    language?: string;
  };
}

interface BlockEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  initialValue?: string;
}

// YouTube URL'sini embed formatına çevir
const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return "";

  // YouTube watch URL'sini embed formatına çevir
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(youtubeRegex);

  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  // Vimeo URL'si için
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);

  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Eğer zaten embed URL'si ise
  if (url.includes("embed")) {
    return url;
  }

  return url;
};

// Html parse et
const parseHtmlToBlocks = (html: string): Block[] => {
  if (!html || html.trim() === "")
    return [{ id: "block_1", type: "paragraph", content: "", properties: {} }];

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  const blocks: Block[] = [];
  let blockCounter = 1;

  Array.from(tempDiv.children).forEach((element) => {
    const tagName = element.tagName.toLowerCase();
    const content = element.textContent || "";
    const htmlElement = element as HTMLElement;

    if (tagName.startsWith("h")) {
      const level = parseInt(tagName.charAt(1)) || 1;
      blocks.push({
        id: `block_${blockCounter++}`,
        type: "heading",
        content,
        properties: {
          level,
          fontSize: level === 1 ? 32 : level === 2 ? 28 : 24,
        },
      });
    } else if (tagName === "p") {
      blocks.push({
        id: `block_${blockCounter++}`,
        type: "paragraph",
        content,
        properties: { fontSize: 16 },
      });
    } else if (["ul", "ol"].includes(tagName)) {
      const listItems = Array.from(element.querySelectorAll("li"))
        .map((li) => li.textContent || "")
        .join("\n");
      blocks.push({
        id: `block_${blockCounter++}`,
        type: "list",
        content: listItems,
        properties: {
          ordered: tagName === "ol",
          listStyle: tagName === "ol" ? "decimal" : "disc",
        },
      });
    } else if (tagName === "blockquote") {
      blocks.push({
        id: `block_${blockCounter++}`,
        type: "quote",
        content,
        properties: {},
      });
    } else if (tagName === "pre" || element.querySelector("code")) {
      const codeContent = element.querySelector("code")?.textContent || content;
      blocks.push({
        id: `block_${blockCounter++}`,
        type: "code",
        content: codeContent,
        properties: {
          language: "javascript",
          backgroundColor: "#1e1e1e",
          color: "#d4d4d4",
        },
      });
    } else if (tagName === "hr") {
      blocks.push({
        id: `block_${blockCounter++}`,
        type: "divider",
        content: "",
        properties: {},
      });
    } else if (
      element.querySelector("img") &&
      !element.querySelector('div[style*="inline-block"]')
    ) {
      const img = element.querySelector("img");
      blocks.push({
        id: `block_${blockCounter++}`,
        type: "image",
        content: "",
        properties: {
          url: img?.src || "",
          alt: img?.alt || "",
          align: "center",
        },
      });
    } else if (element.querySelector("table")) {
      const table = element.querySelector("table");
      const rows = Array.from(table?.querySelectorAll("tr") || []);
      const tableData = rows.map((row) =>
        Array.from(row.querySelectorAll("td, th")).map(
          (cell) => cell.textContent || ""
        )
      );
      blocks.push({
        id: `block_${blockCounter++}`,
        type: "table",
        content: "",
        properties: {
          tableRows: tableData.length,
          tableCols: tableData[0]?.length || 3,
          tableData,
        },
      });
    } else if (element.querySelector('div[style*="inline-block"]')) {
      const columnDivs = Array.from(
        element.querySelectorAll('div[style*="inline-block"]')
      );
      const columnCount = columnDivs.length;
      const columnTypes: ("text" | "image" | "code")[] = [];
      const columnContents: string[] = [];

      columnDivs.forEach((colDiv) => {
        if (colDiv.querySelector("img")) {
          columnTypes.push("image");
          columnContents.push(colDiv.querySelector("img")?.src || "");
        } else if (colDiv.querySelector("pre, code")) {
          columnTypes.push("code");
          columnContents.push(
            colDiv.querySelector("pre, code")?.textContent || ""
          );
        } else {
          columnTypes.push("text");
          columnContents.push(colDiv.textContent || "");
        }
      });

      blocks.push({
        id: `block_${blockCounter++}`,
        type: "columns",
        content: "",
        properties: {
          columnCount,
          columnGap: 20,
          columnTypes,
          columnContents,
        },
      });
    } else if (
      htmlElement.style &&
      htmlElement.style.height &&
      htmlElement.style.height.includes("px")
    ) {
      const height = parseInt(htmlElement.style.height) || 40;
      blocks.push({
        id: `block_${blockCounter++}`,
        type: "spacer",
        content: "",
        properties: { spacing: height },
      });
    } else {
      if (content.trim()) {
        blocks.push({
          id: `block_${blockCounter++}`,
          type: "paragraph",
          content,
          properties: { fontSize: 16 },
        });
      }
    }
  });

  return blocks.length > 0
    ? blocks
    : [{ id: "block_1", type: "paragraph", content: "", properties: {} }];
};

//const parseHtmlToBlocks = (html: string): Block[] => {
//  if (!html || html.trim() === "")
//    return [{ id: "block_1", type: "paragraph", content: "", properties: {} }];
//
//  const tempDiv = document.createElement("div");
//  tempDiv.innerHTML = html;
//
//  const blocks: Block[] = [];
//  let blockCounter = 1;
//
//  Array.from(tempDiv.children).forEach((element) => {
//    const tagName = element.tagName.toLowerCase();
//    const content = element.textContent || "";
//    const htmlElement = element as HTMLElement;
//
//    if (tagName.startsWith("h")) {
//      // Başlık parsing
//      const level = parseInt(tagName.charAt(1)) || 1;
//      blocks.push({
//        id: `block_${blockCounter++}`,
//        type: "heading",
//        content,
//        properties: {
//          level,
//          fontSize: level === 1 ? 32 : level === 2 ? 28 : 24,
//        },
//      });
//    } else if (tagName === "p") {
//      // Paragraf parsing - link kontrolü ile
//      const link = element.querySelector("a");
//      blocks.push({
//        id: `block_${blockCounter++}`,
//        type: "paragraph",
//        content,
//        properties: {
//          fontSize: 16,
//          link: link?.href || undefined,
//        },
//      });
//    } else if (["ul", "ol"].includes(tagName)) {
//      // Liste parsing
//      const listItems = Array.from(element.querySelectorAll("li"))
//        .map((li) => li.textContent || "")
//        .join("\n");
//      blocks.push({
//        id: `block_${blockCounter++}`,
//        type: "list",
//        content: listItems,
//        properties: {
//          ordered: tagName === "ol",
//          listStyle: tagName === "ol" ? "decimal" : "disc",
//        },
//      });
//    } else if (tagName === "blockquote") {
//      // Alıntı parsing
//      blocks.push({
//        id: `block_${blockCounter++}`,
//        type: "quote",
//        content,
//        properties: {},
//      });
//    } else if (tagName === "pre" || element.querySelector("code")) {
//      // Kod bloğu parsing
//      const codeContent = element.querySelector("code")?.textContent || content;
//      blocks.push({
//        id: `block_${blockCounter++}`,
//        type: "code",
//        content: codeContent,
//        properties: {
//          language: "javascript",
//          backgroundColor: "#1e1e1e",
//          color: "#d4d4d4",
//        },
//      });
//    } else if (tagName === "hr") {
//      // Ayırıcı parsing
//      blocks.push({
//        id: `block_${blockCounter++}`,
//        type: "divider",
//        content: "",
//        properties: {},
//      });
//    } else if (tagName === "iframe") {
//      // Video iframe parsing
//      const src = (element as HTMLIFrameElement).src;
//      if (src && (src.includes("youtube") || src.includes("vimeo"))) {
//        blocks.push({
//          id: `block_${blockCounter++}`,
//          type: "video",
//          content: "",
//          properties: {
//            videoUrl: src,
//            align: "center",
//          },
//        });
//      }
//    } else if (element.querySelector("iframe")) {
//      // Video içeren div parsing
//      const iframe = element.querySelector("iframe");
//      const src = iframe?.src;
//      if (src && (src.includes("youtube") || src.includes("vimeo"))) {
//        blocks.push({
//          id: `block_${blockCounter++}`,
//          type: "video",
//          content: "",
//          properties: {
//            videoUrl: src,
//            align:
//              (htmlElement.style.textAlign as
//                | "center"
//                | "left"
//                | "right"
//                | "justify") || "center",
//          },
//        });
//      }
//    } else if (
//      element.querySelector("img") &&
//      !element.querySelector('div[style*="inline-block"]')
//    ) {
//      // Resim parsing
//      const img = element.querySelector("img");
//      blocks.push({
//        id: `block_${blockCounter++}`,
//        type: "image",
//        content: "",
//        properties: {
//          url: img?.src || "",
//          alt: img?.alt || "",
//          align:
//            (htmlElement.style.textAlign as
//              | "center"
//              | "left"
//              | "right"
//              | "justify") || "center",
//        },
//      });
//    } else if (element.querySelector("table")) {
//      // Gelişmiş tablo parsing
//      const table = element.querySelector("table");
//      const rows = Array.from(table?.querySelectorAll("tr") || []);
//      const tableData = rows.map((row) =>
//        Array.from(row.querySelectorAll("td, th")).map(
//          (cell) => cell.textContent || ""
//        )
//      );
//
//      if (tableData.length > 0 && tableData[0].length > 0) {
//        blocks.push({
//          id: `block_${blockCounter++}`,
//          type: "table",
//          content: "",
//          properties: {
//            tableRows: tableData.length,
//            tableCols: tableData[0].length,
//            tableData,
//          },
//        });
//      }
//    } else if (element.querySelector('div[style*="inline-block"]')) {
//      // Kolon sistemi parsing - video desteği ile
//      const columnDivs = Array.from(
//        element.querySelectorAll('div[style*="inline-block"]')
//      );
//      const columnCount = columnDivs.length;
//      const columnTypes: ("text" | "image" | "code" | "video")[] = [];
//      const columnContents: string[] = [];
//
//      columnDivs.forEach((colDiv) => {
//        if (colDiv.querySelector("iframe")) {
//          columnTypes.push("video");
//          columnContents.push(colDiv.querySelector("iframe")?.src || "");
//        } else if (colDiv.querySelector("img")) {
//          columnTypes.push("image");
//          columnContents.push(colDiv.querySelector("img")?.src || "");
//        } else if (colDiv.querySelector("pre, code")) {
//          columnTypes.push("code");
//          columnContents.push(
//            colDiv.querySelector("pre, code")?.textContent || ""
//          );
//        } else {
//          columnTypes.push("text");
//          columnContents.push(colDiv.textContent || "");
//        }
//      });
//
//      blocks.push({
//        id: `block_${blockCounter++}`,
//        type: "columns",
//        content: "",
//        properties: {
//          columnCount,
//          columnGap: 20,
//          columnTypes,
//          columnContents,
//        },
//      });
//    } else if (
//      htmlElement.style &&
//      htmlElement.style.height &&
//      htmlElement.style.height.includes("px")
//    ) {
//      // Spacer parsing
//      const height = parseInt(htmlElement.style.height) || 40;
//      blocks.push({
//        id: `block_${blockCounter++}`,
//        type: "spacer",
//        content: "",
//        properties: { spacing: height },
//      });
//    } else {
//      // Fallback - paragraph olarak ekle
//      if (content.trim()) {
//        blocks.push({
//          id: `block_${blockCounter++}`,
//          type: "paragraph",
//          content,
//          properties: { fontSize: 16 },
//        });
//      }
//    }
//  });
//
//  return blocks.length > 0
//    ? blocks
//    : [{ id: "block_1", type: "paragraph", content: "", properties: {} }];
//};

export default function BlockEditor({
  value,
  onChange,
  placeholder = "Yazmaya başlayın...",
  initialValue,
}: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(() => {
    if (initialValue && initialValue.trim() !== "") {
      return parseHtmlToBlocks(initialValue);
    }
    return [{ id: "block_1", type: "paragraph", content: "", properties: {} }];
  });

  // initialValue değiştiğinde blocks'u güncelle (sadece bir kez)
  const [hasInitialized, setHasInitialized] = useState(false);

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState<string | null>(null);
  const [showPropertyPanel, setShowPropertyPanel] = useState<string | null>(
    null
  );
  const [isPreview, setIsPreview] = useState(false);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  const lastHtmlOutputRef = useRef<string>("");
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // initialValue değiştiğinde blocks'u güncelle (edit mode için)
  useEffect(() => {
    if (initialValue && initialValue.trim() !== "" && !hasInitialized) {
      const parsedBlocks = parseHtmlToBlocks(initialValue);
      setBlocks(parsedBlocks);
      setHasInitialized(true);
    }
  }, [initialValue, hasInitialized]);

  // Blok ekle
  const addBlock = useCallback((type: Block["type"], afterId: string) => {
    const defaultProperties = {
      heading: { level: 1, fontSize: 32 },
      paragraph: { fontSize: 16 },
      table: {
        tableRows: 3,
        tableCols: 3,
        tableData: Array(3)
          .fill(null)
          .map(() => Array(3).fill("")),
      },
      columns: {
        columnCount: 2,
        columnGap: 20,
        columnTypes: ["text", "text"] as (
          | "text"
          | "image"
          | "code"
          | "video"
        )[],
        columnContents: ["", ""] as string[],
      },
      spacer: { spacing: 40 },
      code: {
        language: "javascript",
        backgroundColor: "#1e1e1e",
        color: "#d4d4d4",
      },
    };

    const newBlock: Block = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      content: "",
      properties:
        defaultProperties[type as keyof typeof defaultProperties] || {},
    };

    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === afterId);
      const newBlocks = [...prev];
      newBlocks.splice(index + 1, 0, newBlock);
      return newBlocks;
    });

    setActiveBlockId(newBlock.id);
    setShowAddMenu(null);
  }, []);

  // Blok güncelle
  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id
          ? {
              ...block,
              ...updates,
              properties: updates.properties
                ? { ...block.properties, ...updates.properties }
                : block.properties,
            }
          : block
      )
    );
  }, []);

  // Blok sil
  const deleteBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((block) => block.id !== id);
    });
    setActiveBlockId(null);
    setShowPropertyPanel(null);
  }, []);

  // Tablo verisi güncelle
  const updateTableCell = useCallback(
    (blockId: string, rowIndex: number, colIndex: number, value: string) => {
      setBlocks((prev) =>
        prev.map((block) => {
          if (block.id === blockId && block.type === "table") {
            const newTableData = [...(block.properties.tableData || [])];
            if (!newTableData[rowIndex]) newTableData[rowIndex] = [];
            newTableData[rowIndex][colIndex] = value;
            return {
              ...block,
              properties: { ...block.properties, tableData: newTableData },
            };
          }
          return block;
        })
      );
    },
    []
  );

  // HTML'e çevir
  const blocksToHtml = useCallback(() => {
    return blocks
      .map((block) => {
        const baseStyle = {
          textAlign: block.properties.align || "left",
          fontSize: block.properties.fontSize
            ? `${block.properties.fontSize}px`
            : undefined,
          color: block.properties.color,
          backgroundColor: block.properties.backgroundColor,
          fontWeight: block.properties.bold ? "bold" : undefined,
          fontStyle: block.properties.italic ? "italic" : undefined,
          textDecoration: block.properties.underline ? "underline" : undefined,
          paddingLeft: block.properties.indentAll ? "2rem" : undefined,
        };

        const styleString = Object.entries(baseStyle)
          .filter(([_, value]) => value !== undefined)
          .map(
            ([key, value]) =>
              `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${value}`
          )
          .join("; ");

        switch (block.type) {
          case "heading":
            const HeadingTag = `h${block.properties.level || 1}`;
            let headingContent = block.content || "";

            if (block.properties.dropCap && headingContent) {
              const firstChar = headingContent.charAt(0);
              const restText = headingContent.slice(1);
              headingContent = `<span style="float: left; font-size: 2em; line-height: 0.6; margin-right: 0.05em; margin-bottom: 0em; font-weight: bold;">${firstChar}</span><span style="display: inline; padding-bottom: 0em;">${restText}</span><div style="clear: both;"></div>`;
            } else if (block.properties.indent && !block.properties.indentAll) {
              headingContent = `<span style="display: inline-block; text-indent: 32px;">${headingContent}</span>`;
            }

            return `<${HeadingTag} style="${styleString}">${headingContent}</${HeadingTag}>`;

          case "paragraph":
            let paragraphContent = block.content || "";
            if (block.properties.link && paragraphContent) {
              paragraphContent = `<a href="${block.properties.link}" target="_blank" style="color: #3b82f6; text-decoration: underline;">${paragraphContent}</a>`;
            }

            if (block.properties.dropCap && paragraphContent) {
              const firstChar = paragraphContent.charAt(0);
              const restText = paragraphContent.slice(1);
              paragraphContent = `<span style="float: left; font-size: 2em; line-height: 0.6; margin-right: 0.05em; margin-bottom: 0em; font-weight: bold;">${firstChar}</span><span style="display: inline; padding-bottom: 0em;">${restText}</span><div style="clear: both;"></div>`;
            } else if (block.properties.indent && !block.properties.indentAll) {
              paragraphContent = `<span style="display: inline-block; text-indent: 32px;">${paragraphContent}</span>`;
            }

            return `<p style="${styleString}">${paragraphContent}</p>`;

          case "video":
            const embedUrl = getYouTubeEmbedUrl(
              block.properties.videoUrl || ""
            );
            return `<h1 style="font-size: 24px; font-weight: 700;">${
              block.properties.videoTitle
            }</h1>
            <div style="display: flex; justify-content: ${
              block.properties.align || "center"
            }; margin: 1rem 0;">
              <iframe src="${embedUrl}" width="560" height="315" frameborder="0" allowfullscreen style="border-radius: 8px; max-width: 100%;"></iframe>
            </div>`;

          case "list":
            const items = block.content
              .split("\n")
              .filter((item) => item.trim());
            const listStyle =
              block.properties.listStyle ||
              (block.properties.ordered ? "decimal" : "disc");
            const listItems = items
              .map((item) => {
                let itemContent = item;
                if (block.properties.indent && !block.properties.indentAll) {
                  itemContent = `<span style="display: inline-block; text-indent: 32px;">${itemContent}</span>`;
                }
                return `<li style="margin-bottom: 0.5rem; ${styleString}">${itemContent}</li>`;
              })
              .join("");
            const ListTag = block.properties.ordered ? "ol" : "ul";
            return `<${ListTag} style="list-style-type: ${listStyle}; padding-left: 2rem; margin: 1rem 0;">${listItems}</${ListTag}>`;

          case "code":
            return `<div style="position: relative; margin: 1rem 0;">
              <div style="background-color: ${
                block.properties.backgroundColor || "#1e1e1e"
              }; color: ${
              block.properties.color || "#d4d4d4"
            }; border-radius: 8px; padding: 1rem; font-family: 'Courier New', Consolas, monospace; font-size: 14px; line-height: 1.5; overflow-x: auto; border: 1px solid #333;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid #333;">
                  <span style="color: #888; font-size: 12px;">${
                    block.properties.language || "code"
                  }</span>
                  <button onclick="navigator.clipboard.writeText(this.parentNode.nextElementSibling.textContent)" style="background: #333; color: #fff; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">Copy</button>
                </div>
                <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;"><code>${
                  block.content || ""
                }</code></pre>
              </div>
            </div>`;

          case "quote":
            return `<blockquote style="border-left: 4px solid #e5e7eb; padding-left: 16px; font-style: italic; margin: 1rem 0; ${styleString}">${
              block.content || ""
            }</blockquote>`;

          case "image":
            return `<div style="display: flex; justify-content: ${
              block.properties.align || "center"
            }; margin: 1rem 0;"><img src="${block.properties.url || ""}" alt="${
              block.properties.alt || ""
            }" style="max-width: 100%; height: auto; border-radius: 8px; ${styleString}" /></div>`;

          case "table":
            if (!block.properties.tableData) return "";
            const tableRows = block.properties.tableData
              .map(
                (row) =>
                  `<tr>${row
                    .map(
                      (cell) =>
                        `<td style="border: 1px solid #e5e7eb; padding: 8px;">${cell}</td>`
                    )
                    .join("")}</tr>`
              )
              .join("");
            return `<table style="width: 100%; border-collapse: collapse; margin: 1rem 0; ${styleString}"><tbody>${tableRows}</tbody></table>`;

          case "columns":
            const columns = (block.properties.columnContents || [])
              .slice(0, block.properties.columnCount || 2)
              .map((content, i) => {
                const type = block.properties.columnTypes?.[i] || "text";
                const columnWidth = `${
                  100 / (block.properties.columnCount || 2)
                }%`;

                let columnHtml = "";
                if (type === "text") {
                  columnHtml = `<p>${content}</p>`;
                } else if (type === "image") {
                  columnHtml = `<img src="${content}" style="width: 100%; height: auto; border-radius: 4px;" />`;
                } else if (type === "code") {
                  columnHtml = `<pre style="background: #1e1e1e; color: #d4d4d4; padding: 8px; border-radius: 4px; font-size: 12px;"><code>${content}</code></pre>`;
                } else if (type === "video") {
                  const embedUrl = getYouTubeEmbedUrl(content);
                  columnHtml = `<iframe src="${embedUrl}" width="100%" height="200" frameborder="0" allowfullscreen style="border-radius: 4px;"></iframe>`;
                }

                return `<div style="width: ${columnWidth}; display: inline-block; vertical-align: top; padding-right: ${
                  block.properties.columnGap || 20
                }px;">${columnHtml}</div>`;
              })
              .join("");
            return `<div style="margin: 1rem 0; ${styleString}">${columns}</div>`;

          case "spacer":
            return `<div style="height: ${
              block.properties.spacing || 40
            }px; width: 100%;"></div>`;

          case "divider":
            return `<hr style="border: none; border-top: 2px solid #e5e7eb; margin: 2rem 0; ${styleString}" />`;

          default:
            return `<p style="${styleString}">${block.content}</p>`;
        }
      })
      .join("\n");
  }, [blocks]);

  // HTML çıktısını güncelle
  useEffect(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      const htmlOutput = blocksToHtml();
      if (htmlOutput !== lastHtmlOutputRef.current) {
        lastHtmlOutputRef.current = htmlOutput;
        onChange(htmlOutput);
      }
    }, 100);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [blocks, blocksToHtml, onChange]);

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest(".block-container") &&
        !target.closest(".menu-container")
      ) {
        setShowAddMenu(null);
        setShowPropertyPanel(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Render block
  const renderBlock = (block: Block, index: number) => {
    const isActive = activeBlockId === block.id;
    const showAdd = showAddMenu === block.id;
    const showProps = showPropertyPanel === block.id;

    const style = {
      textAlign: block.properties.align || ("left" as const),
      fontSize:
        block.properties.fontSize ||
        (block.type === "heading"
          ? block.properties.level === 1
            ? 32
            : block.properties.level === 2
            ? 28
            : 24
          : block.type === "code"
          ? 14
          : 16),
      color:
        block.properties.color ||
        (block.type === "code" ? "#d4d4d4" : "#1f2937"),
      backgroundColor:
        block.properties.backgroundColor ||
        (block.type === "code" ? "#1e1e1e" : "transparent"),
      fontWeight: block.properties.bold ? "bold" : "normal",
      fontStyle: block.properties.italic ? "italic" : "normal",
      textDecoration: block.properties.underline ? "underline" : "none",
      paddingLeft: block.properties.indentAll ? "2rem" : "0",
      fontFamily:
        block.type === "code"
          ? "'Courier New', Consolas, monospace"
          : "inherit",
    };

    return (
      <div key={block.id} className="group relative mb-4 block-container">
        <div
          className={`relative rounded-lg transition-all duration-200 ${
            isActive
              ? "ring-2 ring-blue-500 bg-blue-50/30"
              : "hover:bg-gray-50/50"
          }`}
          onClick={() => setActiveBlockId(block.id)}
        >
          {/* Sol Toolbar */}
          <div className="absolute left-0 top-0 h-full w-8 flex flex-col items-center justify-start pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPropertyPanel(showProps ? null : block.id);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded shadow-sm mb-1"
            >
              <MoreHorizontal size={14} />
            </button>

            <div
              className="p-1 text-gray-400 hover:text-gray-600 cursor-grab"
              draggable
              onDragStart={(e) => {
                e.stopPropagation();
                setDraggedBlockId(block.id);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (draggedBlockId && draggedBlockId !== block.id) {
                  setBlocks((prev) => {
                    const draggedIndex = prev.findIndex(
                      (b) => b.id === draggedBlockId
                    );
                    const dropIndex = prev.findIndex((b) => b.id === block.id);
                    const newBlocks = [...prev];
                    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);
                    newBlocks.splice(dropIndex, 0, draggedBlock);
                    return newBlocks;
                  });
                }
                setDraggedBlockId(null);
              }}
            >
              <Move size={12} />
            </div>
          </div>

          {/* Gelişmiş Property Panel */}
          {showProps && (
            <div className="absolute left-10 top-0 bg-white border shadow-lg rounded-lg p-4 z-30 w-80 max-h-96 overflow-y-auto menu-container">
              <div className="space-y-4">
                {/* Temel Özellikler */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Temel Özellikler
                  </h4>

                  {block.type === "list" && (
                    <>
                      <div className="mb-3">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          Liste Tipi
                        </label>
                        <div className="flex gap-2 mb-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateBlock(block.id, {
                                properties: {
                                  ...block.properties,
                                  ordered: false,
                                },
                              })
                            }
                            className={`px-3 py-1 rounded text-xs ${
                              !block.properties.ordered
                                ? "bg-blue-500 text-white"
                                : "border"
                            }`}
                          >
                            Madde
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateBlock(block.id, {
                                properties: {
                                  ...block.properties,
                                  ordered: true,
                                },
                              })
                            }
                            className={`px-3 py-1 rounded text-xs ${
                              block.properties.ordered
                                ? "bg-blue-500 text-white"
                                : "border"
                            }`}
                          >
                            Numara
                          </button>
                        </div>
                        <select
                          value={
                            block.properties.listStyle ||
                            (block.properties.ordered ? "decimal" : "disc")
                          }
                          onChange={(e) =>
                            updateBlock(block.id, {
                              properties: {
                                ...block.properties,
                                listStyle: e.target.value as any,
                              },
                            })
                          }
                          className="w-full text-sm border rounded px-2 py-1"
                        >
                          {block.properties.ordered ? (
                            <>
                              <option value="decimal">1, 2, 3</option>
                              <option value="lower-alpha">a, b, c</option>
                              <option value="upper-alpha">A, B, C</option>
                              <option value="lower-roman">i, ii, iii</option>
                              <option value="upper-roman">I, II, III</option>
                            </>
                          ) : (
                            <>
                              <option value="disc">● (Dolu Daire)</option>
                              <option value="circle">○ (Boş Daire)</option>
                              <option value="square">■ (Kare)</option>
                            </>
                          )}
                        </select>
                      </div>
                    </>
                  )}

                  {block.type === "code" && (
                    <div className="mb-3">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Dil
                      </label>
                      <select
                        value={block.properties.language || "javascript"}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            properties: {
                              ...block.properties,
                              language: e.target.value,
                            },
                          })
                        }
                        className="w-full text-sm border rounded px-2 py-1"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="typescript">TypeScript</option>
                        <option value="html">HTML</option>
                        <option value="css">CSS</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="php">PHP</option>
                        <option value="sql">SQL</option>
                        <option value="json">JSON</option>
                        <option value="xml">XML</option>
                        <option value="bash">Bash</option>
                        <option value="text">Plain Text</option>
                      </select>
                    </div>
                  )}

                  {block.type === "heading" && (
                    <div className="mb-3">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Seviye
                      </label>
                      <select
                        value={block.properties.level || 1}
                        onChange={(e) => {
                          const level = Number(e.target.value);
                          const fontSize =
                            level === 1 ? 32 : level === 2 ? 28 : 24;
                          updateBlock(block.id, {
                            properties: {
                              ...block.properties,
                              level,
                              fontSize,
                            },
                          });
                        }}
                        className="w-full text-sm border rounded px-2 py-1"
                      >
                        <option value={1}>Başlık 1</option>
                        <option value={2}>Başlık 2</option>
                        <option value={3}>Başlık 3</option>
                      </select>
                    </div>
                  )}

                  {block.type === "spacer" && (
                    <div className="mb-3">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Yükseklik (px)
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        value={block.properties.spacing || 40}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            properties: {
                              ...block.properties,
                              spacing: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">
                        {block.properties.spacing || 40}px
                      </span>
                    </div>
                  )}

                  {block.type === "columns" && (
                    <>
                      <div className="mb-3">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          Kolon Sayısı
                        </label>
                        <select
                          value={block.properties.columnCount || 2}
                          onChange={(e) =>
                            updateBlock(block.id, {
                              properties: {
                                ...block.properties,
                                columnCount: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full text-sm border rounded px-2 py-1"
                        >
                          <option value={2}>2 Kolon</option>
                          <option value={3}>3 Kolon</option>
                          <option value={4}>4 Kolon</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          Kolon Arası (px)
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="50"
                          value={block.properties.columnGap || 20}
                          onChange={(e) =>
                            updateBlock(block.id, {
                              properties: {
                                ...block.properties,
                                columnGap: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">
                          {block.properties.columnGap || 20}px
                        </span>
                      </div>
                    </>
                  )}

                  <div className="mb-3">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">
                      Font Boyutu
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={block.properties.fontSize || 16}
                      onChange={(e) =>
                        updateBlock(block.id, {
                          properties: {
                            ...block.properties,
                            fontSize: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">
                      {block.properties.fontSize || 16}px
                    </span>
                  </div>
                </div>

                {/* Metin Formatı */}
                {["paragraph", "heading", "list", "quote"].includes(
                  block.type
                ) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Metin Formatı
                    </h4>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          updateBlock(block.id, {
                            properties: {
                              ...block.properties,
                              bold: !block.properties.bold,
                            },
                          })
                        }
                        className={`p-2 rounded ${
                          block.properties.bold
                            ? "bg-blue-500 text-white"
                            : "border"
                        }`}
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateBlock(block.id, {
                            properties: {
                              ...block.properties,
                              italic: !block.properties.italic,
                            },
                          })
                        }
                        className={`p-2 rounded ${
                          block.properties.italic
                            ? "bg-blue-500 text-white"
                            : "border"
                        }`}
                      >
                        <Italic size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateBlock(block.id, {
                            properties: {
                              ...block.properties,
                              underline: !block.properties.underline,
                            },
                          })
                        }
                        className={`p-2 rounded ${
                          block.properties.underline
                            ? "bg-blue-500 text-white"
                            : "border"
                        }`}
                      >
                        <Underline size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateBlock(block.id, {
                            properties: {
                              ...block.properties,
                              dropCap: !block.properties.dropCap,
                            },
                          })
                        }
                        className={`p-2 rounded ${
                          block.properties.dropCap
                            ? "bg-blue-500 text-white"
                            : "border"
                        }`}
                        title="İlk Harf Büyük"
                      >
                        <TextInitial size={14} />
                      </button>
                    </div>

                    {/* Girinti Kontrolü */}
                    <div className="mb-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Indent size={12} />
                        <label className="text-xs font-medium text-gray-600 block">
                          Girinti
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, {
                              properties: {
                                ...block.properties,
                                indent: !block.properties.indent,
                                indentAll: false,
                              },
                            })
                          }
                          className={`px-3 py-1 rounded text-xs ${
                            block.properties.indent &&
                            !block.properties.indentAll
                              ? "bg-blue-500 text-white"
                              : "border"
                          }`}
                        >
                          İlk Satır
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, {
                              properties: {
                                ...block.properties,
                                indentAll: !block.properties.indentAll,
                                indent: false,
                              },
                            })
                          }
                          className={`px-3 py-1 rounded text-xs ${
                            block.properties.indentAll
                              ? "bg-blue-500 text-white"
                              : "border"
                          }`}
                        >
                          Tüm Metin
                        </button>
                      </div>
                    </div>

                    {block.type === "paragraph" && (
                      <div className="mb-3">
                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                          Link URL
                        </label>
                        <div className="w-full flex items-center text-sm border rounded pl-2">
                          <Link2 size={14} />

                          <div className="ml-2 h-3 border border-gray-400"></div>

                          <input
                            type="url"
                            value={block.properties.link || ""}
                            onChange={(e) =>
                              updateBlock(block.id, {
                                properties: {
                                  ...block.properties,
                                  link: e.target.value,
                                },
                              })
                            }
                            placeholder="https://example.com"
                            className="w-full text-sm rounded px-2 py-1 focus:outline-none focus:border-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Hizalama */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Hizalama
                  </h4>
                  <div className="flex gap-1 mb-3">
                    {(["left", "center", "right", "justify"] as const).map(
                      (align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() =>
                            updateBlock(block.id, {
                              properties: { ...block.properties, align },
                            })
                          }
                          className={`p-2 rounded ${
                            block.properties.align === align
                              ? "bg-blue-500 text-white"
                              : "border"
                          }`}
                        >
                          {align === "left" && <AlignLeft size={12} />}
                          {align === "center" && <AlignCenter size={12} />}
                          {align === "right" && <AlignRight size={12} />}
                          {align === "justify" && (
                            <TextAlignJustify size={12} />
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Renkler */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Renkler
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Metin
                      </label>
                      <input
                        type="color"
                        value={block.properties.color || "#1f2937"}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            properties: {
                              ...block.properties,
                              color: e.target.value,
                            },
                          })
                        }
                        className="w-full h-8 rounded border"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">
                        Arka Plan
                      </label>
                      <input
                        type="color"
                        value={block.properties.backgroundColor || "#ffffff"}
                        onChange={(e) =>
                          updateBlock(block.id, {
                            properties: {
                              ...block.properties,
                              backgroundColor: e.target.value,
                            },
                          })
                        }
                        className="w-full h-8 rounded border"
                      />
                    </div>
                  </div>
                </div>

                {/* Sil */}
                {blocks.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      deleteBlock(block.id);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded text-sm cursor-pointer"
                  >
                    <Trash2 size={12} /> Sil
                  </button>
                )}
              </div>
            </div>
          )}

          {/* İçerik Alanı */}
          <div className="pl-10 pr-4 py-3">
            {block.type === "heading" && (
              <input
                type="text"
                value={block.content}
                onChange={(e) =>
                  updateBlock(block.id, { content: e.target.value })
                }
                placeholder="Başlık yazın..."
                className="w-full bg-transparent border-none outline-none font-bold"
                style={style}
                onFocus={() => setActiveBlockId(block.id)}
              />
            )}

            {block.type === "paragraph" && (
              <textarea
                value={block.content}
                onChange={(e) =>
                  updateBlock(block.id, { content: e.target.value })
                }
                placeholder={
                  index === 0 && !block.content ? placeholder : "Metin yazın..."
                }
                className="w-full bg-transparent border-none outline-none resize-none overflow-hidden"
                style={style}
                rows={Math.max(1, block.content.split("\n").length)}
                onFocus={() => setActiveBlockId(block.id)}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = target.scrollHeight + "px";
                }}
              />
            )}

            {block.type === "list" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">
                    {block.properties.ordered
                      ? "Numaralı Liste"
                      : "Maddeli Liste"}
                  </span>
                  <div className="text-xs text-gray-500">
                    (
                    {block.properties.listStyle ||
                      (block.properties.ordered ? "decimal" : "disc")}
                    )
                  </div>
                </div>
                <textarea
                  value={block.content}
                  onChange={(e) =>
                    updateBlock(block.id, { content: e.target.value })
                  }
                  placeholder="• Madde 1&#10;• Madde 2&#10;• Alt satıra geçince yeni madde olur"
                  className="w-full bg-transparent border-none outline-none resize-none"
                  style={{
                    ...style,
                    listStyleType: "none",
                    paddingLeft: "1.5rem",
                  }}
                  rows={Math.max(2, block.content.split("\n").length)}
                  onFocus={() => setActiveBlockId(block.id)}
                />
                <div className="text-xs text-gray-500">
                  Her satır yeni bir madde olacak
                </div>
              </div>
            )}

            {block.type === "code" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Kod Bloğu ({block.properties.language || "javascript"})
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard?.writeText(block.content)
                    }
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 cursor-pointer"
                  >
                    <Copy size={12} /> Kopyala
                  </button>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm">
                  <textarea
                    value={block.content}
                    onChange={(e) =>
                      updateBlock(block.id, { content: e.target.value })
                    }
                    placeholder="// Kodunuzu buraya yazın..."
                    className="w-full bg-transparent border-none outline-none resize-none text-green-400"
                    style={{
                      ...style,
                      fontFamily: "'Courier New', Consolas, monospace",
                    }}
                    rows={Math.max(5, block.content.split("\n").length)}
                    onFocus={() => setActiveBlockId(block.id)}
                  />
                </div>
              </div>
            )}

            {block.type === "quote" && (
              <div className="border-l-4 border-gray-300 pl-4">
                <textarea
                  value={block.content}
                  onChange={(e) =>
                    updateBlock(block.id, { content: e.target.value })
                  }
                  placeholder="Alıntı yazın..."
                  className="w-full bg-transparent border-none outline-none resize-none italic"
                  style={style}
                  rows={Math.max(1, block.content.split("\n").length)}
                  onFocus={() => setActiveBlockId(block.id)}
                />
              </div>
            )}

            {block.type === "video" && (
              <div className="space-y-2">
                <input
                  type="text"
                  value={block.properties.videoTitle || ""}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      properties: {
                        ...block.properties,
                        videoTitle: e.target.value,
                      },
                    })
                  }
                  placeholder="Video başlığı (opsiyonel)"
                  className="w-full p-2 border rounded text-sm"
                />
                <input
                  type="url"
                  value={block.properties.videoUrl || ""}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      properties: {
                        ...block.properties,
                        videoUrl: e.target.value,
                      },
                    })
                  }
                  placeholder="Video URL'si girin..."
                  className="w-full p-2 border rounded text-sm"
                  onFocus={() => setActiveBlockId(block.id)}
                />
                {block.properties.videoTitle && (
                  <h1 className="text-2xl font-bold">
                    {block.properties.videoTitle}
                  </h1>
                )}
                {block.properties.videoUrl && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: block.properties.align ?? "center",
                      margin: "1rem 0",
                    }}
                  >
                    <iframe
                      src={getYouTubeEmbedUrl(block.properties.videoUrl)}
                      width="560"
                      height="315"
                      frameBorder="0"
                      allowFullScreen
                      style={{ borderRadius: "8px", maxWidth: "100%" }}
                    ></iframe>
                  </div>
                )}
              </div>
            )}

            {block.type === "image" && (
              <div className="space-y-2">
                <input
                  type="url"
                  value={block.properties.url || ""}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      properties: { ...block.properties, url: e.target.value },
                    })
                  }
                  placeholder="Resim URL'si girin..."
                  className="w-full p-2 border rounded text-sm"
                  onFocus={() => setActiveBlockId(block.id)}
                />
                <input
                  type="text"
                  value={block.properties.alt || ""}
                  onChange={(e) =>
                    updateBlock(block.id, {
                      properties: { ...block.properties, alt: e.target.value },
                    })
                  }
                  placeholder="Alt text (opsiyonel)"
                  className="w-full p-2 border rounded text-sm"
                />
                {block.properties.url && (
                  <div
                    className="w-full"
                    style={{
                      display: "flex",
                      justifyContent: block.properties.align,
                    }}
                  >
                    <img
                      src={block.properties.url}
                      alt={block.properties.alt || ""}
                      className="max-w-full h-auto rounded shadow-sm"
                    />
                  </div>
                )}
              </div>
            )}

            {block.type === "table" && (
              <div className="space-y-2">
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={block.properties.tableRows || 3}
                    onChange={(e) => {
                      const rows = Number(e.target.value);
                      const newTableData = Array(rows)
                        .fill(null)
                        .map((_, i) =>
                          Array(block.properties.tableCols || 3)
                            .fill(null)
                            .map(
                              (_, j) =>
                                block.properties.tableData?.[i]?.[j] || ""
                            )
                        );
                      updateBlock(block.id, {
                        properties: {
                          ...block.properties,
                          tableRows: rows,
                          tableData: newTableData,
                        },
                      });
                    }}
                    className="w-20 p-1 border rounded text-sm"
                    placeholder="Satır"
                  />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={block.properties.tableCols || 3}
                    onChange={(e) => {
                      const cols = Number(e.target.value);
                      const newTableData = Array(
                        block.properties.tableRows || 3
                      )
                        .fill(null)
                        .map((_, i) =>
                          Array(cols)
                            .fill(null)
                            .map(
                              (_, j) =>
                                block.properties.tableData?.[i]?.[j] || ""
                            )
                        );
                      updateBlock(block.id, {
                        properties: {
                          ...block.properties,
                          tableCols: cols,
                          tableData: newTableData,
                        },
                      });
                    }}
                    className="w-20 p-1 border rounded text-sm"
                    placeholder="Sütun"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <tbody>
                      {Array(block.properties.tableRows || 3)
                        .fill(null)
                        .map((_, rowIndex) => (
                          <tr key={rowIndex}>
                            {Array(block.properties.tableCols || 3)
                              .fill(null)
                              .map((_, colIndex) => (
                                <td
                                  key={colIndex}
                                  className="border border-gray-300 p-1"
                                >
                                  <input
                                    type="text"
                                    value={
                                      block.properties.tableData?.[rowIndex]?.[
                                        colIndex
                                      ] || ""
                                    }
                                    onChange={(e) =>
                                      updateTableCell(
                                        block.id,
                                        rowIndex,
                                        colIndex,
                                        e.target.value
                                      )
                                    }
                                    className="w-full bg-transparent border-none outline-none text-sm"
                                    placeholder={`${rowIndex + 1},${
                                      colIndex + 1
                                    }`}
                                  />
                                </td>
                              ))}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {block.type === "columns" && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600 mb-2">
                  Her kolon için içerik tipini seçin ve içeriğini düzenleyin
                </div>

                {/* Kolon Editörleri */}
                <div className="space-y-3">
                  {Array(block.properties.columnCount || 2)
                    .fill(null)
                    .map((_, colIndex) => {
                      const columnType =
                        block.properties.columnTypes?.[colIndex] || "text";
                      const columnContent =
                        block.properties.columnContents?.[colIndex] || "";

                      return (
                        <div
                          key={colIndex}
                          className="border rounded-lg p-3 bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Kolon {colIndex + 1}
                            </span>
                            <select
                              value={columnType}
                              onChange={(e) => {
                                const newTypes = [
                                  ...(block.properties.columnTypes || []),
                                ];
                                newTypes[colIndex] = e.target.value as any;
                                updateBlock(block.id, {
                                  properties: {
                                    ...block.properties,
                                    columnTypes: newTypes,
                                  },
                                });
                              }}
                              className="text-xs border rounded px-2 py-1"
                            >
                              <option value="text">Metin</option>
                              <option value="image">Resim</option>
                              <option value="code">Kod</option>
                            </select>
                          </div>

                          {/* İçerik Editörü */}
                          {columnType === "text" && (
                            <textarea
                              value={columnContent}
                              onChange={(e) => {
                                const newContents = [
                                  ...(block.properties.columnContents || []),
                                ];
                                newContents[colIndex] = e.target.value;
                                updateBlock(block.id, {
                                  properties: {
                                    ...block.properties,
                                    columnContents: newContents,
                                  },
                                });
                              }}
                              placeholder="Metin yazın..."
                              className="w-full bg-white border rounded p-2 text-sm resize-none"
                              rows={3}
                            />
                          )}

                          {columnType === "image" && (
                            <div className="space-y-2">
                              <input
                                type="url"
                                value={columnContent}
                                onChange={(e) => {
                                  const newContents = [
                                    ...(block.properties.columnContents || []),
                                  ];
                                  newContents[colIndex] = e.target.value;
                                  updateBlock(block.id, {
                                    properties: {
                                      ...block.properties,
                                      columnContents: newContents,
                                    },
                                  });
                                }}
                                placeholder="Resim URL'si..."
                                className="w-full bg-white border rounded p-2 text-sm"
                              />
                              {columnContent && (
                                <img
                                  src={columnContent}
                                  alt={`Kolon ${colIndex + 1} resmi`}
                                  className="w-full h-auto rounded border max-h-100 object-cover"
                                />
                              )}
                            </div>
                          )}

                          {columnType === "code" && (
                            <div className="bg-gray-900 rounded p-2">
                              <textarea
                                value={columnContent}
                                onChange={(e) => {
                                  const newContents = [
                                    ...(block.properties.columnContents || []),
                                  ];
                                  newContents[colIndex] = e.target.value;
                                  updateBlock(block.id, {
                                    properties: {
                                      ...block.properties,
                                      columnContents: newContents,
                                    },
                                  });
                                }}
                                placeholder="// Kod yazın..."
                                className="w-full bg-transparent border-none text-green-400 text-sm font-mono resize-none"
                                style={{
                                  fontFamily: "'Courier New', monospace",
                                }}
                                rows={3}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Önizleme */}
                <div className="border-t pt-3">
                  <div className="text-xs text-gray-500 mb-2">Önizleme:</div>
                  <div className="flex gap-4">
                    {Array(block.properties.columnCount || 2)
                      .fill(null)
                      .map((_, colIndex) => {
                        const columnType =
                          block.properties.columnTypes?.[colIndex] || "text";
                        const columnContent =
                          block.properties.columnContents?.[colIndex] || "";

                        return (
                          <div
                            key={colIndex}
                            className="flex-1 p-2 bg-white border rounded text-sm"
                          >
                            {columnType === "text" && (
                              <div>
                                {columnContent || `Metin kolon ${colIndex + 1}`}
                              </div>
                            )}
                            {columnType === "image" &&
                              (columnContent ? (
                                <img
                                  src={columnContent}
                                  alt=""
                                  className="w-full max-h-100 object-cover rounded"
                                />
                              ) : (
                                <div className="w-full max-h-100 bg-gray-200 rounded flex items-center justify-center text-xs">
                                  Resim {colIndex + 1}
                                </div>
                              ))}
                            {columnType === "code" && (
                              <div className="bg-gray-900 text-green-400 p-1 rounded text-xs font-mono">
                                {columnContent || `// Kod ${colIndex + 1}`}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {block.type === "spacer" && (
              <div
                className="bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500 text-sm"
                style={{ height: `${block.properties.spacing || 40}px` }}
              >
                Boşluk: {block.properties.spacing || 40}px
              </div>
            )}

            {block.type === "divider" && (
              <hr className="border-t-2 border-gray-200 my-4" />
            )}
          </div>

          {/* Add Button */}
          <div className="absolute -bottom-2 left-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowAddMenu(showAdd ? null : block.id);
              }}
              className="bg-white border-2 border-gray-300 rounded-full p-1 hover:border-blue-500 hover:text-blue-500 transition-colors shadow-sm cursor-pointer"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Gelişmiş Add Menu */}
          {showAdd && (
            <div className="absolute left-10 -bottom-2 bg-white border shadow-lg rounded-lg p-3 z-20 menu-container">
              <div className="grid grid-cols-4 gap-2 mb-3">
                {/* Temel Bloklar */}
                <button
                  type="button"
                  onClick={() => addBlock("paragraph", block.id)}
                  className="p-3 hover:bg-gray-100 rounded flex flex-col items-center gap-1"
                  title="Paragraf"
                >
                  <Type size={18} />
                  <span className="text-xs">Metin</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("heading", block.id)}
                  className="p-3 hover:bg-gray-100 rounded flex flex-col items-center gap-1"
                  title="Başlık"
                >
                  <Heading1 size={18} />
                  <span className="text-xs">Başlık</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("list", block.id)}
                  className="p-3 hover:bg-gray-100 rounded flex flex-col items-center gap-1"
                  title="Liste"
                >
                  <List size={18} />
                  <span className="text-xs">Liste</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("quote", block.id)}
                  className="p-3 hover:bg-gray-100 rounded flex flex-col items-center gap-1"
                  title="Alıntı"
                >
                  <Quote size={18} />
                  <span className="text-xs">Alıntı</span>
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                {/* Medya ve Özel Bloklar */}
                <button
                  type="button"
                  onClick={() => addBlock("image", block.id)}
                  className="p-3 hover:bg-gray-100 rounded flex flex-col items-center gap-1"
                  title="Resim"
                >
                  <Image size={18} />
                  <span className="text-xs">Resim</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("video", block.id)}
                  className="p-3 hover:bg-gray-100 rounded flex flex-col items-center gap-1"
                  title="Video"
                >
                  <Video size={18} />
                  <span className="text-xs">Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("table", block.id)}
                  className="p-3 hover:bg-gray-100 rounded flex flex-col items-center gap-1"
                  title="Tablo"
                >
                  <Table size={18} />
                  <span className="text-xs">Tablo</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("columns", block.id)}
                  className="p-3 hover:bg-gray-100 rounded flex flex-col items-center gap-1"
                  title="Kolonlar"
                >
                  <Columns size={18} />
                  <span className="text-xs">Kolon</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("code", block.id)}
                  className="p-3 hover:bg-gray-100 rounded flex flex-col items-center gap-1"
                  title="Kod"
                >
                  <Code2 size={18} />
                  <span className="text-xs">Kod</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Düzen Blokları */}
                <button
                  type="button"
                  onClick={() => addBlock("spacer", block.id)}
                  className="p-3 hover:bg-gray-100 rounded flex items-center justify-center gap-2"
                  title="Boşluk"
                >
                  <Space size={16} />
                  <span className="text-xs">Boşluk</span>
                </button>
                <button
                  type="button"
                  onClick={() => addBlock("divider", block.id)}
                  className="p-3 hover:bg-gray-100 rounded flex items-center justify-center gap-2"
                  title="Ayırıcı"
                >
                  <Minus size={16} />
                  <span className="text-xs">Ayırıcı</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              !isPreview
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
            }`}
          >
            <Edit3 size={14} className="inline mr-2" /> Düzenle
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isPreview
                ? "bg-gray-900 text-white"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
            }`}
          >
            <Eye size={14} className="inline mr-2" /> Önizle
          </button>
        </div>

        <div className="text-sm text-gray-500">{blocks.length} blok</div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {!isPreview ? (
          <div className="max-w-4xl mx-auto py-8 px-6">
            {blocks.map((block, index) => renderBlock(block, index))}

            {/* Son bloktan sonra ekleme butonu */}
            {blocks.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Type size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">İçerik oluşturmaya başlayın</p>
                <button
                  onClick={() => addBlock("paragraph", "block_1")}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  İlk bloğu ekle
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto py-8 px-6">
            <div
              className="prose prose-lg max-w-none block-editor-output"
              dangerouslySetInnerHTML={{ __html: blocksToHtml() }}
              style={{
                lineHeight: "1.7",
                fontSize: "16px",
                color: "#374151",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
