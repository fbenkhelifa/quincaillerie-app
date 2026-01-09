# LaTeX Report Build Instructions

This document explains how to compile the Quincaillerie Application technical report from LaTeX source files.

## Prerequisites

### Required Software

1. **LaTeX Distribution** (choose one):
   - **Windows**: [MiKTeX](https://miktex.org/download) or [TeX Live](https://tug.org/texlive/)
   - **macOS**: [MacTeX](https://www.tug.org/mactex/)
   - **Linux**: `sudo apt-get install texlive-full` (Debian/Ubuntu)

2. **PDF Viewer**:
   - Windows: Sumatra PDF, Adobe Acrobat Reader
   - macOS: Preview (built-in)
   - Linux: Evince, Okular

### Required LaTeX Packages

The following packages are used and should be installed automatically by modern LaTeX distributions:

- `inputenc`, `fontenc`, `babel` (text encoding and language)
- `geometry` (page layout)
- `graphicx` (images)
- `hyperref`, `xcolor` (hyperlinks and colors)
- `listings` (code syntax highlighting)
- `tikz` (diagrams)
- `longtable`, `booktabs`, `caption` (tables)
- `amsmath`, `amssymb` (mathematical symbols)
- `fancyhdr` (headers and footers)
- `enumitem` (lists)

If any package is missing, MiKTeX will prompt to install it automatically. For manual installation:
```bash
# TeX Live
tlmgr install <package-name>

# MiKTeX
mpm --install=<package-name>
```

## Directory Structure

```
docs/report/
├── main.tex                  # Main document
├── references.bib            # Bibliography database
├── README_BUILD.md           # This file
├── sections/                 # Section files
│   ├── abstract.tex
│   ├── introduction.tex
│   ├── objectives.tex
│   ├── features.tex
│   ├── architecture.tex
│   ├── workflows.tex
│   ├── performance.tex
│   ├── ux_design.tex
│   ├── testing.tex
│   ├── demo.tex
│   └── conclusion.tex
└── figures/                  # Images/diagrams (optional)
    └── logo.png              # Placeholder
```

## Compilation Methods

### Method 1: Using `latexmk` (Recommended)

`latexmk` automates the build process, running LaTeX multiple times as needed and handling bibliography generation.

```bash
cd docs/report
latexmk -pdf main.tex
```

**Options:**
```bash
# Continuous compilation (rebuilds on file changes)
latexmk -pdf -pvc main.tex

# Clean auxiliary files
latexmk -c

# Clean all generated files including PDF
latexmk -C
```

**Output:** `main.pdf`

### Method 2: Using `pdflatex` (Manual)

For more control, run `pdflatex` manually:

```bash
cd docs/report

# First pass: generate aux files
pdflatex main.tex

# Generate bibliography (if references present)
bibtex main

# Second pass: resolve references
pdflatex main.tex

# Third pass: finalize cross-references
pdflatex main.tex
```

**Why multiple passes?**
- First pass: Creates `.aux` file with reference placeholders
- BibTeX: Generates `.bbl` file with formatted citations
- Second pass: Inserts citations, updates cross-references
- Third pass: Ensures all references are resolved

### Method 3: Using TeXstudio/TeXworks (GUI)

1. Install [TeXstudio](https://www.texstudio.org/) or TeXworks (included with MiKTeX/MacTeX)
2. Open `main.tex`
3. Set compiler to `pdflatex` (Options → Configure → Build)
4. Press **F5** or click **Build & View**

### Method 4: Using Overleaf (Online)

1. Create account at [Overleaf.com](https://www.overleaf.com/)
2. Create new blank project
3. Upload all files from `docs/report/` directory
4. Set compiler to `pdfLaTeX` (Menu → Compiler)
5. Click **Recompile** button

**Advantages:** No local installation required, collaborative editing, automatic compilation.

## Troubleshooting

### Error: Missing `logo.png`

If you see an error about missing `figures/logo.png`:

**Option 1:** Comment out the logo line in `main.tex`:
```latex
% \includegraphics[width=0.3\textwidth]{figures/logo.png}\\[1cm]
```

**Option 2:** Create placeholder logo:
```bash
mkdir -p docs/report/figures
# Add any image file and rename to logo.png
```

### Error: Package not found

```
! LaTeX Error: File `tikz.sty' not found.
```

**Solution:** Install missing package:
```bash
# MiKTeX
mpm --install=pgf  # tikz is part of pgf package

# TeX Live
tlmgr install pgf
```

### Error: References undefined

```
LaTeX Warning: Reference `fig:erd' on page 10 undefined
```

**Solution:** Run `pdflatex` again (references require multiple passes).

### Error: Overfull/Underfull hbox

```
Overfull \hbox (2.34567pt too wide) in paragraph at lines 123--125
```

**Solution:** These are warnings (not errors) about line breaking. The PDF is still generated. To fix:
- Reword text to fit better
- Add `\sloppy` before paragraph for looser spacing
- Ignore if visually acceptable

### Error: Encoding issues (French/Arabic characters)

```
! Package inputenc Error: Unicode character ... not set up for use with LaTeX
```

**Solution:** Ensure file encoding is UTF-8:
```latex
\usepackage[utf8]{inputenc}  % Already in main.tex
```

## Customization

### Change Page Size

Edit `main.tex`:
```latex
\geometry{
    a4paper,          % Change to letterpaper for US Letter
    left=25mm,
    right=25mm,
    top=30mm,
    bottom=30mm
}
```

### Change Font

Add to preamble:
```latex
\usepackage{times}      % Times New Roman
% or
\usepackage{helvet}     % Helvetica
```

### Change Theme Colors

Edit color definitions in `main.tex`:
```latex
\definecolor{primaryblue}{RGB}{37,99,235}      % Change RGB values
\definecolor{secondarypurple}{RGB}{124,58,237}
```

### Add New Section

1. Create `docs/report/sections/newsection.tex`
2. Add content to the file
3. Include in `main.tex`:
```latex
\input{sections/newsection}
```

## Output Files

After successful compilation:

- `main.pdf` - **Final report** (this is your deliverable)
- `main.aux` - Auxiliary file with references
- `main.log` - Compilation log (check for warnings/errors)
- `main.toc` - Table of contents data
- `main.out` - Hyperlink data
- `main.bbl` - Formatted bibliography
- `main.blg` - Bibliography log

**Clean up auxiliary files:**
```bash
latexmk -c        # Keep PDF
latexmk -C        # Delete PDF too
```

## Performance Tips

### Fast Compilation During Editing

Comment out slow sections temporarily:
```latex
% \input{sections/workflows}  % Skip this section
```

Or use `\includeonly{}` in preamble:
```latex
\includeonly{sections/introduction,sections/conclusion}
```

### Reduce Image Processing Time

If compiling slowly due to images:
```latex
\usepackage[draft]{graphicx}  % Show placeholder boxes instead of images
```

Remove `draft` for final build.

## CI/CD Integration (Optional)

For automated PDF generation on git push:

**GitHub Actions** (`.github/workflows/latex.yml`):
```yaml
name: Build LaTeX
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: xu-cheng/latex-action@v2
        with:
          root_file: docs/report/main.tex
      - uses: actions/upload-artifact@v3
        with:
          name: report-pdf
          path: docs/report/main.pdf
```

## Viewing the PDF

### Command Line
```bash
# Windows
start main.pdf

# macOS
open main.pdf

# Linux
xdg-open main.pdf
```

### Recommended Viewers
- **Sumatra PDF** (Windows): Lightweight, auto-refreshes on rebuild
- **Skim** (macOS): PDF viewer with TeX synchronization
- **Evince** (Linux): Fast and simple

## Quick Reference

| Task | Command |
|------|---------|
| Build PDF | `latexmk -pdf main.tex` |
| Continuous build | `latexmk -pdf -pvc main.tex` |
| Clean aux files | `latexmk -c` |
| Full clean | `latexmk -C` |
| Manual build | `pdflatex main.tex` (3x) |
| Build with bib | `pdflatex → bibtex → pdflatex → pdflatex` |

## Support

If compilation issues persist:
1. Check `main.log` for detailed error messages
2. Ensure all files are UTF-8 encoded
3. Update LaTeX distribution: `tlmgr update --all` (TeX Live) or MiKTeX Console
4. Verify all section files exist in `sections/` directory
5. Try online compiler (Overleaf) to isolate local vs. source issues

## Expected Output

A professional PDF report (~30-40 pages) including:
- Title page with project name and date
- Abstract summarizing the application
- Table of contents with hyperlinks
- 10 main sections with technical details
- Code listings with syntax highlighting
- Tables (RBAC matrix, database schema)
- TikZ diagrams (architecture, test pyramid)
- Bibliography (if references cited)

**Estimated build time:** 15-30 seconds (first build), 5-10 seconds (subsequent builds)

---

**Report Generated:** This document was created on 2026-01-09.  
**LaTeX Version Required:** pdfLaTeX or XeLaTeX (2020 or later)  
**Tested On:** MiKTeX 23.x, TeX Live 2023, Overleaf (2024)
