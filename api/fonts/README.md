# Bundled fonts

Real, freely-redistributable, metric-compatible substitutes for common proprietary fonts that
LaTeX documents (especially resume templates) commonly request via `fontspec`. "Times New Roman"
and friends can never legally be bundled -- these are Google's own official replacements, chosen
so line-wrapping and spacing match the original almost exactly.

| Requested (proprietary) | Substituted with | License |
|---|---|---|
| Times New Roman | Tinos | Apache License 2.0 |
| Arial | Arimo | Apache License 2.0 |
| Courier New | Cousine | Apache License 2.0 |
| Calibri | Carlito | SIL Open Font License 1.1 |
| Cambria | Caladea | SIL Open Font License 1.1 |

Fetched from Google Fonts (`fonts.googleapis.com`/`fonts.gstatic.com`). Full license texts are
included alongside (`LICENSE-*.txt`), as both licenses require.

`compile-latex.ts` generates a fontconfig config per request that points at this directory and
aliases each proprietary family name to its substitute here, so a document written against
"Times New Roman" compiles without the author needing to change anything.
