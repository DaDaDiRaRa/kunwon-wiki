# 건축법규 Q&A — MCP 설정

건축법령을 자연어로 검색·질의하고, 주소로 용도지역을 조회하고, 건폐율·용적률·주차·높이·조경
5개 항목을 한 번에 검토합니다.

!!! warning "인증(공유 키)이 필요합니다"
    호출마다 Claude API 토큰이 나갑니다. 키는 **김정현에게 Slack DM으로 요청**하세요.

!!! info "웹앱은 여전히 로컬 전용입니다"
    이 MCP 도구는 사람용 웹앱(프로젝트·이력 관리 기능 포함)과 다른 별도 서비스입니다.
    읽기 전용 조회 3개만 클라우드에 올라가 있고, 웹앱 자체는 지금도 로컬(포트 8001)에서만
    돌아갑니다.

---

## 1. 설정

키를 받으면 로컬 환경변수로 저장합니다(PowerShell 예시):

```powershell
[System.Environment]::SetEnvironmentVariable("LAW_QA_MCP_KEY", "받은키값", "User")
```

터미널을 재시작한 뒤 `.mcp.json` 에 추가합니다:

```json
{
  "mcpServers": {
    "law-qa": {
      "type": "http",
      "url": "https://law-qa-mcp-30350777436.asia-northeast3.run.app/mcp",
      "headers": { "Authorization": "Bearer ${LAW_QA_MCP_KEY}" }
    }
  }
}
```

!!! danger "키를 `.mcp.json` 에 직접 적지 마세요"
    `${LAW_QA_MCP_KEY}` 처럼 환경변수 참조로만 적습니다.

## 2. 확인

```
건폐율 기준이 뭐야
```

## 3. 제공 도구 3개

| 도구 | 하는 일 |
|---|---|
| `search_laws` | 자연어 질문으로 건축법령 검색 + 답변 |
| `get_land_info` | 주소 → 용도지역·용도지구·용도구역 |
| `compliance_report` | 건폐율·용적률·주차·높이·조경 5개 항목 종합 검토 |

!!! info "`get_land_info` 는 [건축 법규 자동 진단](arch-law-diagnose.md)을 단일 소스로 씁니다"
    2026-08-24 확인됐던 LURIS API 403 문제(자체 구현이 국토교통부 LURIS 를 직접 호출하며
    발생)는 2026-08-25 통합으로 해결됐습니다 — 이제 자체 지오코딩·LURIS 호출 없이
    `arch-law-diagnose` 의 `/api/land_info` 를 그대로 호출합니다.

## 4. 문제가 있다면

- `401 Unauthorized` → 키가 안 맞거나 환경변수가 비어 있음
- 그래도 안 되면 김정현에게 문의
