# 대지모델 생성기 — MCP 설정

주소 하나로 주변 지형·건물·정사영상 3D 대지모델을 생성합니다. 실측 사용량 기준
**전 사내 도구 중 30일 요청 1위**입니다.

!!! warning "인증(공유 키)이 필요합니다"
    건축법규 탐색기와 달리 이 도구는 **연산 비용이 큽니다**(지형 타일·3D 생성).
    누구나 열어두면 부담이 크기 때문에 팀 전용 키로 막아뒀습니다.
    키는 **김정현에게 Slack DM으로 요청**하세요. 이 문서에는 키를 적지 않습니다.

---

## 1. 설정

키를 받으면 로컬 환경변수로 저장합니다(PowerShell 예시):

```powershell
[System.Environment]::SetEnvironmentVariable("ARCH_SITE_MODEL_MCP_KEY", "받은키값", "User")
```

터미널을 재시작한 뒤 `.mcp.json` 에 추가합니다:

```json
{
  "mcpServers": {
    "arch-site-model": {
      "type": "http",
      "url": "https://arch-site-model-30350777436.asia-northeast3.run.app/mcp",
      "headers": { "Authorization": "Bearer ${ARCH_SITE_MODEL_MCP_KEY}" }
    }
  }
}
```

!!! danger "키를 `.mcp.json` 에 직접 적지 마세요"
    `${ARCH_SITE_MODEL_MCP_KEY}` 처럼 환경변수 참조로만 적어야 합니다. `.mcp.json` 을
    git 에 커밋하면 키가 그대로 새어나갑니다. 값은 항상 로컬 환경변수에만 둡니다.

## 2. 확인

`/mcp` 로 연결을 확인한 뒤:

```
서울시청 주소로 대지 3D 모델 생성 가능한지 확인해줘
```

## 3. 제공 도구 4개

| 도구 | 하는 일 |
|---|---|
| `check_site_data` | 생성 가능성 선검사(실제 생성은 안 함) |
| `preview_site` | 건물 목록·층수·예상 규모 미리보기 |
| `generate_site_model` | 실제 3D 대지모델 생성(.skp/.3dm) |
| `generate_site_tiles` | 500m+ 대반경을 타일로 나눠 생성 |

## 4. 사람용 웹앱과의 관계

같은 엔진을 웹에서 쓰려면 [대지모델 생성기 웹앱](https://arch-site-model-30350777436.asia-northeast3.run.app) 을 쓰세요.
REST API(`/api/*`, `/health`)는 지금처럼 공개이고, MCP(`/mcp`)만 별도로 인증이 걸려 있습니다 —
같은 서비스, 다른 문 두 개입니다.

## 5. 문제가 있다면

- `401 Unauthorized` → 키가 안 맞거나 환경변수가 비어 있음. `.mcp.json` 의 `headers` 확인
- 연결은 되는데 도구 호출이 느리다 → 지형·정사영상 조회라 원래 몇 초 걸립니다
- 그래도 안 되면 김정현에게 문의
