"""
Genere le guide pedagogique CLIKXIA en PDF.

Usage:
    python scripts/generate_guide.py

Prerequis:
    pip install playwright
    playwright install chromium

Sortie:
    public/guide.pdf
"""

from pathlib import Path
from playwright.sync_api import sync_playwright

HTML_PATH = Path(__file__).parent / "guide.html"
PDF_PATH = Path(__file__).parent.parent / "public" / "guide.pdf"


def generate_pdf():
    """Convertit guide.html en PDF A4 dans public/guide.pdf."""
    if not HTML_PATH.exists():
        raise FileNotFoundError(
            f"HTML source not found: {HTML_PATH}\n"
            "Run scripts/build_guide_html.py first to generate it."
        )

    PDF_PATH.parent.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(f"file://{HTML_PATH.absolute()}", wait_until="networkidle")
        page.wait_for_timeout(4000)

        page.pdf(
            path=str(PDF_PATH),
            format="A4",
            print_background=True,
            margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
            prefer_css_page_size=True,
        )
        browser.close()

    size = PDF_PATH.stat().st_size
    print(f"[OK] PDF generated: {PDF_PATH}")
    print(f"[OK] Size: {size:,} bytes ({size/1024/1024:.2f} MB)")


if __name__ == "__main__":
    generate_pdf()
