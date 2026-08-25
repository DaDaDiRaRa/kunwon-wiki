# 건축 법규 자동 진단 — MCP 설정

주소로 토지이용계획(용도지역·지구·구역)을 즉시 조회하고, 대지·건물 정보를 넣으면
건폐율·용적률·주차·높이·조경·설비소방 6개 항목을 한 번에 진단합니다.

!!! warning "인증(공유 키)이 필요합니다"
    `diagnose` 호출 1건에 Claude API 토큰과 65~110초가 나갑니다. 키는
    **김정현에게 Slack DM으로 요청**하세요.

!!! info "이미 다른 도구들이 이 앱을 거쳐가고 있습니다"
    [건축법규 Q&A](law-qa.md)와 [건축법규 탐색기](arch-law-graph.md)는 용도지역 조회를
    자체 구현하지 않고 이 앱의 `land_info` 로직을 단일 소스로 씁니다(`kunwon-ops` 저장소
    `docs/plan-app-fusion.md §5`). 세 도구가 항상 같은 답을 낸다는 뜻입니다.

---

## 1. 설정

키를 받으면 로컬 환경변수로 저장합니다(PowerShell 예시):

```powershell
[System.Environment]::SetEnvironmentVariable("ARCH_LAW_DIAGNOSE_MCP_KEY", "받은키값", "User")
```

터미널을 재시작한 뒤 `.mcp.json` 에 추가합니다:

```json
{
  "mcpServers": {
    "arch-law-diagnose": {
      "type": "http",
      "url": "https://arch-law-diagnose-30350777436.asia-northeast3.run.app/mcp",
      "headers": { "Authorization": "Bearer ${ARCH_LAW_DIAGNOSE_MCP_KEY}" }
    }
  }
}
```

!!! danger "키를 `.mcp.json` 에 직접 적지 마세요"
    `${ARCH_LAW_DIAGNOSE_MCP_KEY}` 처럼 환경변수 참조로만 적습니다.

## 2. 확인

```
서울특별시 강남구 테헤란로 152 용도지역 알려줘
```

## 3. 제공 도구 2개

| 도구 | 하는 일 |
|---|---|
| `land_info` | 주소/PNU/좌표 → 용도지역·지역지구·지목·공시지가 즉시 조회 |
| `diagnose` | 주소 + 건물정보 → 건폐율·용적률·주차·높이·조경·설비소방 종합 진단(65~110초) |

!!! tip "좌표를 이미 알고 있다면"
    `land_info` 에 `lat`/`lon` 을 같이 주면 자체 지오코딩을 생략하고 그 좌표를 그대로
    씁니다 — 상위에서 이미 신뢰할 만한 좌표를 갖고 있을 때 지오코딩 오인식을 피하는 용도.

## 4. 문제가 있다면

- `401 Unauthorized` → 키가 안 맞거나 환경변수가 비어 있음
- `diagnose` 가 오래 걸린다 → 정상입니다(Claude API 호출 포함 65~110초), 타임아웃을
  넉넉히 잡고 기다리세요
- 그래도 안 되면 김정현에게 문의
