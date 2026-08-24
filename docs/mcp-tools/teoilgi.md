# 터읽기 — MCP 설정

주소 하나로 그 대지의 인문·생활맥락(인구·수급진단·재해위험·설계 드라이버)을 읽습니다.

!!! danger "인증(공유 키)이 필요합니다 — 가장 비싼 도구입니다"
    호출 한 번에 **Claude API 토큰**과 **정부 API 17종**(KOSIS·SGIS·Kakao·TMAP·부동산원 등)이
    나갑니다. `synthesize=true` 옵션을 쓰면 Claude 를 2번 더 호출합니다.
    키는 **김정현에게 Slack DM으로 요청**하세요.

---

## 1. 설정

키를 받으면 로컬 환경변수로 저장합니다(PowerShell 예시):

```powershell
[System.Environment]::SetEnvironmentVariable("ARCH_SITE_CONTEXT_MCP_KEY", "받은키값", "User")
```

터미널을 재시작한 뒤 `.mcp.json` 에 추가합니다:

```json
{
  "mcpServers": {
    "teoilgi": {
      "type": "http",
      "url": "https://arch-site-context-30350777436.asia-northeast3.run.app/mcp",
      "headers": { "Authorization": "Bearer ${ARCH_SITE_CONTEXT_MCP_KEY}" }
    }
  }
}
```

!!! danger "키를 `.mcp.json` 에 직접 적지 마세요"
    `${ARCH_SITE_CONTEXT_MCP_KEY}` 처럼 환경변수 참조로만 적습니다. `.mcp.json` 을 git 에
    커밋하면 키가 새어나갑니다.

## 2. 확인

```
서울 종로구 세종대로 172 주변 이 동네 뭐가 부족한지 알려줘
```

## 3. 제공 도구 2개

| 도구 | 하는 일 | 비용 |
|---|---|---|
| `read_site_context` | 대지 종합 읽기(인구지수·수급·재해·교차·설계드라이버) | API 다수. `synthesize=true` 면 Claude 2콜 추가 |
| `diagnose_supply` | 수급진단만(인구수요 × 시설공급 교차) — 경량 | API 다수, Claude 안 씀 |

가볍게 확인만 하고 싶으면 `diagnose_supply` 를, 종합 리포트가 필요하면
`read_site_context` 를 씁니다. `synthesize=true` 는 느리고 비싸니 꼭 필요할 때만.

## 4. 사람용 웹앱과의 관계

같은 엔진을 웹에서 쓰려면 [터읽기 웹앱](https://arch-site-context-30350777436.asia-northeast3.run.app) 을 쓰세요.
REST API는 지금처럼 공개이고, MCP(`/mcp`)만 인증이 걸려 있습니다.

## 5. 문제가 있다면

- `401 Unauthorized` → 키가 안 맞거나 환경변수가 비어 있음
- 응답이 느리다 → 정상입니다. 외부 API 여러 개를 순차 조회합니다(`synthesize=true` 면 더 느림)
- 그래도 안 되면 김정현에게 문의
