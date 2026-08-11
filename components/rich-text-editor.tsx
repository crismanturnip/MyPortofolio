"use client";

import { useEffect, useState } from "react";
import { Extension, Mark, mergeAttributes, type Editor } from "@tiptap/core";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CaseSensitive,
  Droplet,
  Eye,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  Italic,
  Link,
  List,
  ListIndentDecrease,
  ListIndentIncrease,
  ListOrdered,
  Quote,
  Upload,
  Underline as UnderlineIcon,
} from "lucide-react";

type ImageAlign = "left" | "center" | "right";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
  minHeightClassName?: string;
  compact?: boolean;
};

const fontFamilies = [
  { label: "Default", value: "" },
  { label: "Inter", value: "Inter, ui-sans-serif, system-ui, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: '"Times New Roman", Times, serif' },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Courier New", value: '"Courier New", Courier, monospace' },
];

const fontSizes = ["Default", "12px", "14px", "16px", "18px", "20px", "24px", "32px"];
const imageSizes = [
  { label: "Kecil", value: "35%" },
  { label: "Sedang", value: "60%" },
  { label: "Besar", value: "85%" },
  { label: "Full", value: "100%" },
];

const MAX_PARAGRAPH_INDENT = 8;

function changeParagraphIndent(editor: Editor, delta: -1 | 1) {
  if (!editor.isActive("paragraph") || editor.isActive("bulletList") || editor.isActive("orderedList")) {
    return false;
  }

  const current = Number(editor.getAttributes("paragraph").indent || 0);
  const indent = Math.max(0, Math.min(MAX_PARAGRAPH_INDENT, current + delta));
  return editor.chain().focus().updateAttributes("paragraph", { indent }).run();
}

const ParagraphIndent = Extension.create({
  name: "paragraphIndent",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => Math.max(0, Math.min(MAX_PARAGRAPH_INDENT, Number(element.getAttribute("data-indent")) || 0)),
            renderHTML: (attributes) => {
              const indent = Math.max(0, Math.min(MAX_PARAGRAPH_INDENT, Number(attributes.indent) || 0));
              return indent ? { "data-indent": String(indent), style: `text-indent: ${indent * 2}em` } : {};
            },
          },
        },
      },
    ];
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => changeParagraphIndent(this.editor, 1),
      "Shift-Tab": () => changeParagraphIndent(this.editor, -1),
    };
  },
});

const TextStyle = Mark.create({
  name: "textStyle",

  addAttributes() {
    return {
      fontFamily: {
        default: null,
        parseHTML: (element) => element.style.fontFamily || null,
      },
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize || null,
      },
      color: {
        default: null,
        parseHTML: (element) => element.style.color || null,
      },
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || null,
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[style]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const style = [
      HTMLAttributes.fontFamily ? `font-family: ${HTMLAttributes.fontFamily}` : "",
      HTMLAttributes.fontSize ? `font-size: ${HTMLAttributes.fontSize}` : "",
      HTMLAttributes.color ? `color: ${HTMLAttributes.color}` : "",
      HTMLAttributes.backgroundColor ? `background-color: ${HTMLAttributes.backgroundColor}` : "",
    ]
      .filter(Boolean)
      .join("; ");

    const { fontFamily, fontSize, color, backgroundColor, ...rest } = HTMLAttributes;
    return ["span", mergeAttributes(rest, style ? { style } : {}), 0];
  },
});

const CustomImage = ImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (element) => element.style.width || element.getAttribute("width") || "100%",
      },
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align") || "center",
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const { align, width, style, ...rest } = HTMLAttributes;
    const alignStyle =
      align === "left"
        ? "display: block; margin-left: 0; margin-right: auto"
        : align === "right"
          ? "display: block; margin-left: auto; margin-right: 0"
          : "display: block; margin-left: auto; margin-right: auto";
    const widthStyle = width ? `width: ${width}` : "width: 100%";
    const imageStyle = [style, widthStyle, "max-width: 100%", "height: auto", alignStyle].filter(Boolean).join("; ");

    return ["img", mergeAttributes(rest, { "data-align": align, style: imageStyle })];
  },
});

function ToolbarButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid h-9 w-9 place-items-center rounded-lg border text-sm transition ${
        active
          ? "border-blue-500 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarSelect({
  label,
  value,
  onChange,
  children,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700">
      {icon}
      <select
        aria-label={label}
        title={label}
        className="h-full min-w-20 bg-transparent text-sm outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  onUploadImage,
  minHeightClassName = "min-h-[390px]",
  compact = false,
}: RichTextEditorProps) {
  const [preview, setPreview] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false,
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      ParagraphIndent,
      TextStyle,
      CustomImage.configure({
        resize: {
          enabled: true,
          directions: ["left", "right", "bottom-left", "bottom-right"],
          minWidth: 120,
          alwaysPreserveAspectRatio: true,
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value || "",
    parseOptions: { preserveWhitespace: "full" },
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `${minHeightClassName} text-slate-800`,
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false, parseOptions: { preserveWhitespace: "full" } });
    }
  }, [editor, value]);

  async function addImage(file?: File) {
    if (!editor || !file || !onUploadImage) return;
    setUploadError("");
    try {
      const url = await onUploadImage(file);
      editor.chain().focus().setImage({ src: url, alt: file.name, width: "100%", align: "center" } as never).run();
    } catch (cause) {
      setUploadError(cause instanceof Error ? cause.message : "Gambar gagal diunggah.");
    }
  }

  function addImageUrl() {
    if (!editor) return;
    const src = window.prompt("Masukkan URL gambar", "https://");
    if (!src?.trim()) return;
    const alt = window.prompt("Alt text gambar", "") || "";
    editor.chain().focus().setImage({ src, alt, width: "100%", align: "center" } as never).run();
  }

  function addLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Masukkan URL link", previous || "https://");
    if (href === null) return;
    if (href.trim() === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }

  function updateTextStyle(nextStyle: Record<string, string | null>) {
    if (!editor) return;
    const current = editor.getAttributes("textStyle");
    editor.chain().focus().setMark("textStyle", { ...current, ...nextStyle }).run();
  }

  function setImageWidth(width: string) {
    if (!editor) return;
    editor.chain().focus().updateAttributes("image", { width }).run();
  }

  function setImageAlign(align: ImageAlign) {
    if (!editor) return;
    editor.chain().focus().updateAttributes("image", { align }).run();
  }

  if (!editor) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">Memuat editor...</div>;
  }

  const imageSelected = editor.isActive("image");

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50/70 p-3">
        <ToolbarSelect
          label="Format paragraf"
          value={
            editor.isActive("heading", { level: 1 })
              ? "h1"
              : editor.isActive("heading", { level: 2 })
                ? "h2"
                : editor.isActive("heading", { level: 3 })
                  ? "h3"
                  : "p"
          }
          onChange={(value) => {
            if (value === "p") editor.chain().focus().setParagraph().run();
            if (value === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
            if (value === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
            if (value === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          icon={<CaseSensitive size={16} />}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </ToolbarSelect>

        <ToolbarSelect
          label="Font family"
          value={(editor.getAttributes("textStyle").fontFamily as string | undefined) || ""}
          onChange={(fontFamily) => updateTextStyle({ fontFamily: fontFamily || null })}
        >
          {fontFamilies.map((font) => (
            <option key={font.label} value={font.value}>
              {font.label}
            </option>
          ))}
        </ToolbarSelect>

        <ToolbarSelect
          label="Ukuran font"
          value={(editor.getAttributes("textStyle").fontSize as string | undefined) || "Default"}
          onChange={(fontSize) => updateTextStyle({ fontSize: fontSize === "Default" ? null : fontSize })}
        >
          {fontSizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </ToolbarSelect>

        <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700" title="Warna teks">
          <Droplet size={16} />
          <input
            aria-label="Warna teks"
            className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
            type="color"
            value={(editor.getAttributes("textStyle").color as string | undefined) || "#111827"}
            onChange={(event) => updateTextStyle({ color: event.target.value })}
          />
        </label>

        <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700" title="Highlight">
          <Highlighter size={16} />
          <input
            aria-label="Highlight"
            className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
            type="color"
            value={(editor.getAttributes("textStyle").backgroundColor as string | undefined) || "#fef08a"}
            onChange={(event) => updateTextStyle({ backgroundColor: event.target.value })}
          />
        </label>

        <ToolbarButton active={editor.isActive("bold")} label="Bold" onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={17} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("italic")} label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={17} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("underline")} label="Underline" onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={17} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("heading", { level: 1 })} label="H1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={17} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("heading", { level: 2 })} label="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={17} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("heading", { level: 3 })} label="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={17} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("bulletList")} label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={17} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("orderedList")} label="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={17} />
        </ToolbarButton>
        <ToolbarButton label="Kurangi indentasi paragraf (Shift+Tab)" onClick={() => changeParagraphIndent(editor, -1)}>
          <ListIndentDecrease size={17} />
        </ToolbarButton>
        <ToolbarButton label="Tambah indentasi paragraf (Tab)" onClick={() => changeParagraphIndent(editor, 1)}>
          <ListIndentIncrease size={17} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("blockquote")} label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={17} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("link")} label="Link" onClick={addLink}>
          <Link size={17} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive("image")} label="Gambar dari URL" onClick={addImageUrl}>
          <ImagePlus size={17} />
        </ToolbarButton>
        <label className="grid h-9 w-9 cursor-pointer place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50" title="Upload gambar">
          <Upload size={17} />
          <input
            className="hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => addImage(event.target.files?.[0])}
          />
        </label>
        {imageSelected ? (
          <>
            <span className="mx-1 h-7 w-px bg-slate-200" aria-hidden="true" />
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Gambar</span>
            <ToolbarSelect
              label="Ukuran gambar"
              value={(editor.getAttributes("image").width as string | undefined) || "100%"}
              onChange={setImageWidth}
            >
              {imageSizes.map((size) => (
                <option key={size.label} value={size.value}>
                  {size.label}
                </option>
              ))}
            </ToolbarSelect>
            <input
              aria-label="Ukuran gambar manual"
              title="Ukuran gambar manual, contoh: 420px atau 70%"
              className="h-9 w-24 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none"
              value={(editor.getAttributes("image").width as string | undefined) || ""}
              onChange={(event) => setImageWidth(event.target.value)}
              placeholder="70%"
            />
            <ToolbarButton active={editor.isActive("image", { align: "left" })} label="Gambar kiri" onClick={() => setImageAlign("left")}>
              <AlignLeft size={17} />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive("image", { align: "center" })} label="Gambar tengah" onClick={() => setImageAlign("center")}>
              <AlignCenter size={17} />
            </ToolbarButton>
            <ToolbarButton active={editor.isActive("image", { align: "right" })} label="Gambar kanan" onClick={() => setImageAlign("right")}>
              <AlignRight size={17} />
            </ToolbarButton>
          </>
        ) : null}
        <span className="mx-1 h-7 w-px bg-slate-200" aria-hidden="true" />
        <ToolbarButton active={editor.isActive({ textAlign: "left" })} label="Align left" onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft size={17} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive({ textAlign: "center" })} label="Align center" onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter size={17} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive({ textAlign: "right" })} label="Align right" onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight size={17} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive({ textAlign: "justify" })} label="Justify" onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
          <AlignJustify size={17} />
        </ToolbarButton>
        <button
          type="button"
          onClick={() => setPreview((current) => !current)}
          className={`ml-auto inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold ${
            preview ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          <Eye size={16} />
          Preview
        </button>
      </div>
      {uploadError ? <p role="alert" className="border-x border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{uploadError}</p> : null}
      {preview ? (
        <div className={`reader-content p-6 ${compact ? "min-h-[180px]" : "min-h-[390px]"}`} dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
      ) : (
        <div className={`cms-editor ${compact ? "cms-editor-compact" : ""}`}>
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  );
}
