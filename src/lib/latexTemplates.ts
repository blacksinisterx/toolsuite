/** Real, minimal LaTeX using only standard document classes/packages that
 * ship in any base TeX Live install (and therefore in Tectonic's default
 * bundle) -- no exotic class files (ieeetran, moderncv, ...) that might not
 * be present, since a template that fails to compile on first use would be
 * worse than no template. */
export const LATEX_TEMPLATES: Record<string, string> = {
  Article: String.raw`\documentclass[11pt]{article}
\usepackage[margin=1in]{geometry}
\usepackage{amsmath}

\title{Document Title}
\author{Your Name}
\date{\today}

\begin{document}
\maketitle

\section{Introduction}
Start writing here.

\section{Method}
An equation: $E = mc^2$.

\end{document}
`,
  Report: String.raw`\documentclass[11pt]{report}
\usepackage[margin=1in]{geometry}

\title{Report Title}
\author{Your Name}
\date{\today}

\begin{document}
\maketitle
\tableofcontents

\chapter{Introduction}
Start writing here.

\chapter{Results}
More content here.

\end{document}
`,
  Beamer: String.raw`\documentclass{beamer}
\usetheme{default}

\title{Presentation Title}
\author{Your Name}
\date{\today}

\begin{document}

\frame{\titlepage}

\begin{frame}{Overview}
\begin{itemize}
  \item First point
  \item Second point
  \item Third point
\end{itemize}
\end{frame}

\begin{frame}{Details}
More content here.
\end{frame}

\end{document}
`,
  Resume: String.raw`\documentclass[11pt]{article}
\usepackage[margin=0.75in]{geometry}
\pagestyle{empty}

\begin{document}

\begin{center}
{\LARGE \textbf{Your Name}}\\[2pt]
email@example.com \textbar\ (555) 123-4567 \textbar\ City, Country
\end{center}

\section*{Experience}
\textbf{Job Title} --- Company Name \hfill 2024--Present\\
Brief description of what you did and the impact it had.

\section*{Education}
\textbf{Degree} --- University Name \hfill 2020--2024

\section*{Skills}
Skill one, skill two, skill three.

\end{document}
`,
}
