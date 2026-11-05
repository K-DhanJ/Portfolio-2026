"""Build the English one-page CV from the supplied French PDF.

The source PDF supplies the portrait and facts. Project descriptions are
translated, not expanded. Airbus is kept as a title until its duplicated
French description is clarified by the CV owner.
"""

from io import BytesIO
from pathlib import Path
from xml.sax.saxutils import escape

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "cv-kevidu-kussiyage.pdf"
OUTPUT = ROOT / "assets" / "cv-kevidu-kussiyage-en.pdf"

pdfmetrics.registerFont(TTFont("Arial", r"C:\Windows\Fonts\arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", r"C:\Windows\Fonts\arialbd.ttf"))
pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold")

PAGE_W, PAGE_H = A4
SIDEBAR_W = 185
RIGHT_X = 202
RIGHT_W = PAGE_W - RIGHT_X - 24
INK = colors.HexColor("#24211e")
MUTED = colors.HexColor("#5e5b57")
GOLD = colors.HexColor("#9a713c")
PAPER = colors.HexColor("#f7f4ee")
DARK = colors.HexColor("#25211f")
WHITE = colors.HexColor("#f5f1ec")

cv = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
cv.setTitle("Kevidu Kussiyage - CV - English")
cv.setAuthor("Kevidu Kussiyage")
cv.setSubject("Global design and computer engineering CV")
cv.setFillColor(PAPER)
cv.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
cv.setFillColor(DARK)
cv.roundRect(-16, 32, SIDEBAR_W + 16, PAGE_H - 20, 20, fill=1, stroke=0)


def paragraph(text, x, top, width, *, size=8.8, leading=12.2, color=INK, bold=False):
    """Place a wrapping paragraph and return its lower edge."""
    style = ParagraphStyle(
        "cv", fontName="Arial-Bold" if bold else "Arial", fontSize=size,
        leading=leading, textColor=color, alignment=TA_LEFT, spaceAfter=0,
        allowWidows=0, allowOrphans=0,
    )
    item = Paragraph(text, style)
    _, height = item.wrap(width, PAGE_H)
    item.drawOn(cv, x, top - height)
    return top - height


def section(name, top, *, first=False):
    if not first:
        top -= 11
        cv.setStrokeColor(colors.HexColor("#bc985f"))
        cv.setLineWidth(1.2)
        cv.line(RIGHT_X, top, RIGHT_X + RIGHT_W, top)
        top -= 11
    top = paragraph(escape(name.upper()), RIGHT_X, top, RIGHT_W,
                    size=7, leading=9, color=GOLD, bold=True)
    return top - 5


def entry(title, date, body, top, *, extra=None):
    heading = f'<b>{escape(title)}</b> <font color="#927043">| {escape(date)}</font>'
    top = paragraph(heading, RIGHT_X, top, RIGHT_W, size=9.1, leading=11.5)
    if body:
        top = paragraph(escape(body), RIGHT_X, top - 2, RIGHT_W,
                        size=8.15, leading=10.5)
    if extra:
        top = paragraph(escape(extra), RIGHT_X, top - 1, RIGHT_W,
                        size=7.75, leading=10, color=MUTED)
    return top - 7


def side_section(name, top, lines):
    top = paragraph(escape(name.upper()), 24, top, SIDEBAR_W - 40,
                    size=7.4, leading=10, color=colors.HexColor("#d9bc8b"), bold=True) - 5
    for line in lines:
        top = paragraph(escape(line), 24, top, SIDEBAR_W - 40,
                        size=8, leading=11.1, color=WHITE)
    return top - 18


# Reuse the exact portrait embedded in the supplied CV.
portrait = PdfReader(str(SOURCE)).pages[0].images[0]
photo = ImageReader(BytesIO(portrait.data))
cv.saveState()
photo_x, photo_y, photo_w, photo_h = 18, PAGE_H - 173, 149, 112
clip = cv.beginPath()
clip.roundRect(photo_x, photo_y, photo_w, photo_h, 9)
cv.clipPath(clip, stroke=0)
cv.drawImage(photo, photo_x, photo_y, photo_w, photo_h, preserveAspectRatio=True)
cv.restoreState()

left_top = PAGE_H - 194
left_top = paragraph("KUSSIYAGE D. Kevidu", 24, left_top, SIDEBAR_W - 40,
                     size=13.2, leading=16, color=WHITE, bold=True) - 29
left_top = paragraph("Global Designer<br/>&amp; Computer Engineer", 24, left_top,
                     SIDEBAR_W - 40, size=18, leading=22, color=WHITE, bold=True) - 51
contact_label_top = left_top
left_top = side_section("Contact", left_top, ["kkussiyage@yahoo.fr", "Paris, France"])
portfolio_label_top = left_top
left_top = side_section("Portfolio", left_top,
                         ["k-dhanj.github.io/Portfolio-2026/"])
left_top = side_section("Languages", left_top,
                         ["French: Native", "Sinhala: Native", "English: C1", "Spanish: B1"])
left_top = side_section("Tools", left_top,
                         ["Adobe Creative Cloud", "Sketch", "Blender · 3ds Max",
                          "Figma · ProtoPie · Axure", "Fusion 360",
                          "HTML/CSS · JavaScript", "Python · C · Java · SQL"])
left_top = side_section("Design skills", left_top,
                         ["Visual identity", "Brand guidelines", "Mockups & prototypes",
                          "Technical sheets", "Drawing"])
left_top = side_section("Interests", left_top,
                         ["Boxing · Cooking", "Hiking · Cinema · Drawing"])
assert left_top > 25, f"Sidebar overflow: {left_top}"
cv.linkURL("mailto:kkussiyage@yahoo.fr", (24, contact_label_top - 27, 170, contact_label_top - 15), relative=0)
cv.linkURL("https://k-dhanj.github.io/Portfolio-2026/?lang=en#work",
           (24, portfolio_label_top - 27, 170, portfolio_label_top - 15), relative=0)

top = PAGE_H - 25
top = section("Profile", top, first=True)
top = paragraph(
    "Student in a dual degree in Computer Engineering and Global Design at CY Tech / "
    "CY École de Design. I combine a design perspective, creative tools and a structured "
    "approach to design. My projects bring together user research, visual identity, "
    "mockups and technical materials, with close attention to detail and a coherent user experience.",
    RIGHT_X, top, RIGHT_W, size=9.0, leading=12.0,
)

top = section("Education", top - 2)
top = entry("CY Tech / CY École de Design", "2021-2027",
            "Dual degree in Computer Engineering and Global Design", top)
top = entry("Ajou University, South Korea", "2026",
            "University exchange semester · GPA 2.90", top,
            extra="Courses: Automatic Control and Design · Digital Circuit · Management & "
                  "Commercialization of Technological Innovation · IT Professional English · Neurobiology")
top = entry("Lycée Molière, Paris", "2018-2021",
            "French general baccalaureate, science focus · European English section", top)
top = entry("British Council, Paris", "2010-2016",
            "CAE courses · FCE certification", top)

top = section("Relevant experience and projects", top)
top = entry("Airbus Atlantique · Service design and decision support", "2026", "", top)
top = entry("INRAE · Service design and decision support", "2025",
            "Interviews and analysis of barriers to adopting digital tools in agriculture. "
            "Designed an intuitive platform to clarify information and support technology choices.", top)
top = entry("Numix · Immersive experience project", "2024",
            "Designed a career exploration experience combining VR, AR and physical RFID interactions. "
            "Researched user needs and structured an immersive journey to explore different professions.", top)
top = entry("Renault · Automotive design project", "2024",
            "Analysed a dashboard, defined user issues, designed a more intuitive interface "
            "and proposed adapted steering-wheel controls and buttons.", top)
top = entry("Viqthor · Science communication project", "2024",
            "Analysed and explained complex quantum concepts for a non-specialist audience "
            "through clear, adapted materials.", top)
top = entry("Greater Paris Metropolis · Urban development project", "2022",
            "Field research, user interviews and identification of obstacles. Created a mockup "
            "to simplify data collection.", top)
top = entry("UBIK Philippe Starck · Discovery internship", "2017",
            "Supported the design team, observed the creative process and designed a baby bottle for infants.", top)

top = section("Professional experience", top)
top = entry("Four-star hotels · Maison Nabis and Hotellia-pro", "2025-2026",
            "Night reception, breakfast preparation, guest welcome and operational coordination "
            "across several four-star hotels.", top)
top = entry("Viqthor · Design and visual identity internship", "2025 · 4 months",
            "Redesigned the brand identity. Created web interfaces, technical sheets and UI/UX "
            "mockups. Developed brand guidelines and improved ergonomics.", top)

top = section("Strengths", top - 1)
top = paragraph(
    "Visual sensitivity and design culture · Visual and technical materials · Mockups, "
    "prototyping and 3D modelling · Research and insight translation into design solutions · "
    "Rigour, autonomy and collaboration across disciplines",
    RIGHT_X, top, RIGHT_W, size=8.15, leading=10.5,
)
assert top > 22, f"Main column overflow: {top}"
cv.showPage()
cv.save()
print(f"Created {OUTPUT} (bottom margin {top:.1f} pt)")
