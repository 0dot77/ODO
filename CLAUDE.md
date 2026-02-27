# Project: Interactive Web Slide SaaS (Sketch-to-Code)

## Tech Stack
- Framework: Next.js (App Router), React, TypeScript
- Styling: Tailwind CSS
- Canvas: tldraw
- Database/Auth: Supabase
- AI: Anthropic SDK (Claude 3.5 Sonnet Vision)

## Core Rules
- **No Client-side AI Calls:** 절대 클라이언트에서 직접 Anthropic API를 호출하지 마세요. 모든 AI 통신은 Next.js의 `/app/api/...` 라우트를 통과해야 합니다.
- **TypeScript & Tailwind:** 모든 컴포넌트는 TypeScript와 Tailwind CSS를 엄격하게 사용하세요.
- **Component Separation:** UI 컴포넌트는 작고 재사용 가능하게 분리하세요 (예: `SplitPane`, `CanvasArea`, `PreviewArea`).
- **Zero-Dependency Slides:** 생성되는 슬라이드 결과물은 항상 CSS/JS가 인라인으로 포함된 단일 HTML 구조를 유지해야 합니다.

## Git Workflow
- **Commit per task:** 매 작업(기능 추가, 버그 수정 등)이 완료될 때마다 반드시 커밋하세요.
- **Push after commit:** 커밋 직후 항상 원격 저장소에 푸시하세요.
- **Commit message:** 영어로 간결하게 작성하세요 (예: `feat: add presentation mode`, `fix: resolve JSON parse error`).