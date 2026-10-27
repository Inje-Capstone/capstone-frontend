> 전체 MVP 사용법과 최신 구현 범위는 [mvp-guide.md](./mvp-guide.md)를 참고하세요. 아래는 1차 로그인 구현 당시의 기록입니다.

# 로그인 연동 — 1차 구현

## 실행

기존에 설치된 의존성을 사용한다.

```powershell
cd E:\frontDev\capstone-frontend
npm run dev
```

터미널에 표시된 주소에서 `/login`을 연다. 새 계정을 생성하지 않으므로 기존 테스트 계정이 필요하다.

개발 기본 연결은 `브라우저 → Vite /api/* → http://localhost:8080`이다.
`.env.development`는 기존 `.env`의 직접 호출 주소를 개발 모드에서만 덮어쓴다.
실행할 Spring 서버가 다르면 Git에서 제외되는 `.env.development.local`에 다음을 설정한다.

```dotenv
VITE_API_BASE_URL=
DEV_API_PROXY_TARGET=https://api.injecapstone.com
```

주소를 바꾼 뒤 Vite를 재시작한다. 위 운영 주소의 실제 가동 여부는 별도 확인이 필요하다.
개발 프록시는 서버 연결 실패, 백엔드 미실행, 서버 자체 오류를 해결하지 않는다.

## 이번 구현 범위

- 이메일·비밀번호 로그인: `POST /api/auth/login`
- JWT Bearer 헤더와 탭 단위 `sessionStorage` 저장 (비밀번호 저장 안 함)
- `GET /api/users/me/onboarding`으로 로그인 복구와 진입 분기
- 미완료 계정 → `/onboarding`의 다음 단계 안내
- 완료 계정 → `/`의 기존 시작 화면
- 상태 조회 실패 → 토큰 유지·재시도
- 401 또는 JWT exp 만료 → 세션 제거·로그인
- 브라우저 로컬 로그아웃 (서버 토큰 폐기 API는 없음)
- 기존 `/api-test` 유지. 로그인돼 있으면 Bearer 자동 전달

회원가입, 소셜 로그인, 비밀번호 재설정, 온보딩 입력·제출은 다음 구현 범위다.
인증·온보딩 성공을 흉내 내는 Mock 로그인은 앱에 포함하지 않는다.
디자인의 42dot Sans 폰트 파일은 기존 프로젝트에 없어 시스템 폰트로 폴백한다.

## 수동 확인

1. 서버를 실행하고 기존 계정으로 로그인한다.
2. 잘못된 비밀번호에서 안내가 나오고 다시 제출할 수 있는지 확인한다.
3. 미완료 계정은 온보딩 다음 단계, 완료 계정은 홈으로 가는지 확인한다.
4. 새로고침 후 서버 상태 조회로 복구되는지 확인한다.
5. 로그아웃 후 `/` 직접 접근 시 로그인으로 이동하는지 확인한다.
6. 상태 조회 서버 오류에서 재시도 후 복구되는지 확인한다.
7. `/api-test` 직접 접근이 가능한지 확인한다.

## 배포

Vite 프록시는 개발 전용이다. 배포 시 `.env.production.local`에서
`VITE_API_BASE_URL`을 실제 API 주소로 지정하고 서버 CORS를 맞추거나,
빈 값으로 지정하고 웹 서버에서 `/api/*`를 Spring으로 reverse proxy 해야 한다.
기존 `.env`의 localhost 주소를 그대로 운영 빌드에 쓰지 않도록 확인한다.
SPA 경로(`/login`, `/onboarding` 등)는 웹 서버에서 `index.html`로 fallback 해야 한다.

```powershell
npm run build
npm run lint
```

브라우저 응답 대체 테스트는 실제 백엔드 연동 성공을 의미하지 않는다.
