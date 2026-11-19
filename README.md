# PHDME project page

Static project website for *PHDME: Physics-Informed Diffusion Models without Explicit Governing Equations*.

## Structure

```
index.html                 single-page site
assets/css/style.css       styles (dark theme matched to the overview animation)
assets/js/main.js          KaTeX rendering, interactive results chart (Table 1 data), scroll reveal, BibTeX copy
assets/video/              overview video (H.264 MP4 converted from Figure/PHDME.gif) + poster frame
assets/img/                paper figures exported from the PDF as WebP
paper/PHDME.pdf            paper linked from the "Paper" button
```

`Figure/PHDME.gif` (37 MB) is the source for `assets/video/phdme_overview.mp4` (~4 MB) and does not need to be deployed.

## Preview

Open `index.html` directly, or serve the folder:

```
python -m http.server 8000
```

## Deploy

Any static host works (GitHub Pages: push this folder and enable Pages on the branch root).

## Before publishing

Search `index.html` for `TODO`: author list and affiliations, arXiv/OpenReview link, code repository link, and the BibTeX entry.
