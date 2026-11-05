"""Build the corrected French one-page CV from the supplied facts."""

from pathlib import Path
from xml.sax.saxutils import escape

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
PORTRAIT = ROOT / "assets" / "cv-portrait.png"
OUTPUT = ROOT / "assets" / "cv-kevidu-kussiyage.pdf"

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
cv.setTitle("Kevidu Kussiyage - CV - Français")
cv.setAuthor("Kevidu Kussiyage")
cv.setSubject("CV ingénierie informatique et design global")
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


# Reuse the exact portrait extracted from the supplied CV.
photo = ImageReader(str(PORTRAIT))
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
left_top = paragraph("Designer global<br/>&amp; ingénieur<br/>informatique", 24, left_top,
                     SIDEBAR_W - 40, size=18, leading=22, color=WHITE, bold=True) - 51
contact_label_top = left_top
left_top = side_section("Contact", left_top, ["kevidudk@yahoo.com", "Paris, France"])
portfolio_label_top = left_top
left_top = side_section("Portfolio", left_top,
                         ["k-dhanj.github.io/Portfolio-2026/"])
left_top = side_section("Langues", left_top,
                         ["Français : langue maternelle", "Cingalais : langue maternelle", "Anglais : C1", "Espagnol : B1"])
left_top = side_section("Outils", left_top,
                         ["Suite Adobe", "Sketch", "Blender · 3ds Max",
                          "Figma · ProtoPie · Axure", "Fusion 360",
                          "HTML/CSS · JavaScript", "Python · C · Java · SQL"])
left_top = side_section("Création", left_top,
                         ["Identité visuelle", "Chartes graphiques", "Maquettes et prototypes",
                          "Fiches techniques", "Dessin"])
left_top = side_section("Centres d’intérêt", left_top,
                         ["Boxe · Cuisine", "Randonnée · Cinéma · Dessin"])
assert left_top > 25, f"Sidebar overflow: {left_top}"
cv.linkURL("mailto:kevidudk@yahoo.com", (24, contact_label_top - 27, 170, contact_label_top - 15), relative=0)
cv.linkURL("https://k-dhanj.github.io/Portfolio-2026/?lang=fr#work",
           (24, portfolio_label_top - 27, 170, portfolio_label_top - 15), relative=0)

top = PAGE_H - 25
top = section("Profil", top, first=True)
top = paragraph(
    "Étudiant en double diplôme Ingénieur Informatique et Designer Global à CY Tech / "
    "CY École de Design. Je combine une culture du design, la maîtrise d’outils de création "
    "et une approche structurée de la conception. Mes projets mêlent recherche utilisateur, "
    "identité visuelle, maquettes et supports techniques, avec une attention constante au détail "
    "et à la cohérence d’expérience.",
    RIGHT_X, top, RIGHT_W, size=9.0, leading=12.0,
)

top = section("Formation", top - 2)
top = entry("CY Tech / CY École de Design", "2021-2027",
            "Double diplôme Ingénieur Informatique et Designer Global", top)
top = entry("Ajou University, Corée du Sud", "2026",
            "Semestre d’échange universitaire · GPA 2,90", top,
            extra="Cours suivis : Automatic Control and Design · Digital Circuit · Management & "
                  "Commercialization of Technological Innovation · IT Professional English · Neurobiology")
top = entry("Lycée Molière, Paris", "2018-2021",
            "Baccalauréat général scientifique · Mention européenne anglais", top)
top = entry("British Council, Paris", "2010-2016",
            "Cours CAE · Certification FCE", top)

top = section("Expériences et projets pertinents", top)
top = entry("Airbus Atlantic · R&T, équipe EMiSys", "2026",
            "Étude de l’intégration du découplage numérique pour préserver l’attention et la santé "
            "des collaborateurs. Analyse du site de Méaulte et préconisations pour assurer la "
            "continuité de production face aux aléas énergétiques et informationnels.", top)
top = entry("INRAE · Design de service et aide à la décision", "2025",
            "Entretiens et analyse des freins à l’adoption du numérique en agriculture. "
            "Conception d’une plateforme intuitive qui simplifie l’information et accompagne "
            "le choix de technologies adaptées.", top)
top = entry("Numix · Projet expérience immersive", "2024",
            "Conception d’une expérience d’orientation combinant VR, AR et interactions physiques RFID. "
            "Recherche sur les usages et structuration d’un parcours immersif pour explorer différents métiers.", top)
top = entry("Renault · Projet design automobile", "2024",
            "Analyse d’un tableau de bord, définition des problématiques utilisateur, conception "
            "d’une interface plus intuitive et proposition de volant et boutons adaptés.", top)
top = entry("Viqthor · Projet de médiation scientifique", "2024",
            "Analyse et vulgarisation de concepts quantiques complexes afin de les rendre accessibles "
            "à un public non spécialiste, à travers des supports clairs et adaptés.", top)
top = entry("Métropole du Grand Paris · Projet développement urbain", "2022",
            "Recherche terrain, entretiens utilisateurs et identification des points de blocage. "
            "Réalisation d’une maquette destinée à simplifier la collecte de données.", top)
top = entry("UBIK Philippe Starck · Stage découverte", "2017",
            "Soutien à l’équipe design, découverte du processus de création et conception "
            "d’un biberon adapté aux nourrissons.", top)

top = section("Expériences professionnelles", top)
top = entry("Hôtellerie 4 étoiles · Maison Nabis et Hotellia-pro", "2025-2026",
            "Réception de nuit, préparation du petit-déjeuner, accueil client et coordination "
            "opérationnelle dans différents hôtels 4 étoiles.", top)
top = entry("Viqthor · Stage design et identité visuelle", "2025 · 4 mois",
            "Refonte d’identité de marque. Conception d’interfaces web, fiches techniques et "
            "maquettes UI/UX. Création de chartes graphiques et optimisation ergonomique.", top)

top = section("Atouts", top - 1)
top = paragraph(
    "Sensibilité esthétique et culture design · Conception de supports visuels et techniques · "
    "Maquettes, prototypage et modélisation 3D · Recherche, analyse et traduction d’insights "
    "en solutions de design · Rigueur, autonomie et collaboration avec des interlocuteurs pluridisciplinaires",
    RIGHT_X, top, RIGHT_W, size=8.15, leading=10.5,
)
assert top > 22, f"Main column overflow: {top}"
cv.showPage()
cv.save()
print(f"Created {OUTPUT} (bottom margin {top:.1f} pt)")
