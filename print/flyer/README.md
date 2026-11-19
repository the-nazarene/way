# The flyer

One letter-size page to print and post: "What did Jesus actually teach?", five
questions, our answer, the verse for and the verse against (KJV). The site
serves the finished PDF at `nazareneway.com/flyer.pdf` (the **print a flyer**
link in the header); this folder holds its source.

- `flyer.html` is the source. `qr-site.svg` points to nazareneway.com and
  `qr-git.svg` to github.com/the-nazarene/way.
- The PDF was printed from `flyer.html` with Chrome on a Mac. Its faces are
  Avenir Next and Avenir Next Condensed, which ship with macOS; on another
  machine the fallback fonts will change the layout, so re-make the PDF on a
  Mac:

      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless \
        --no-pdf-header-footer --print-to-pdf=site/src/flyer.pdf print/flyer/flyer.html

- The answers and verses come from the cards in `questions/`. If a card's
  answer changes, change the flyer to match and re-make the PDF.
