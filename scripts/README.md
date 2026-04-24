# Scripts de generation

Ce dossier contient les scripts pour generer les artefacts statiques du projet.

## Guide pedagogique (guide.pdf)

Le guide de 34 pages "Comprendre la bourse et utiliser CLIKXIA" est genere
en 2 etapes depuis du code versionne.

### Prerequis

```bash
pip install playwright
playwright install chromium
```

### Regenerer le guide

```bash
# 1. Generer le HTML source depuis le script Python
python scripts/build_guide_html.py

# 2. Convertir le HTML en PDF (ecrit dans public/guide.pdf)
python scripts/generate_guide.py
```

### Modifier le contenu du guide

Le contenu HTML est dans `scripts/build_guide_html.py` dans la variable
`HTML_CONTENT`. Pour modifier le guide :

1. Editer la variable `HTML_CONTENT` dans `build_guide_html.py`
2. Relancer les 2 commandes ci-dessus
3. Committer le nouveau `public/guide.pdf`

### Fichiers generes

- `scripts/guide.html` - Source intermediaire (non versionne, dans .gitignore)
- `public/guide.pdf` - PDF final servi publiquement sur clikxia.com/guide.pdf

### Dependances

- `playwright` : moteur de rendu (Chromium headless)
- Chromium : installe automatiquement par `playwright install chromium`
