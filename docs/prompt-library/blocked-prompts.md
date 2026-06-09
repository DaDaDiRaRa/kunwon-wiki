# 차단된 프롬프트

아래 목록의 단어 및 구문은 **어떤 파이프라인에서도 사용이 금지**됩니다.  
위반 시 생성 이미지를 즉시 삭제하고 팀장에게 보고해야 합니다.

---

## 차단 목록

### 저작권 관련

| 금지 단어/구문 | 차단 사유 |
|---------------|-----------|
| `Zaha Hadid style` | 특정 건축가 스타일 상표권 침해 위험 |
| `Bjarke Ingels style`, `BIG architecture` | 동일 |
| `Herzog de Meuron` | 동일 |
| `Frank Gehry style` | 동일 |
| `Tadao Ando style` | 동일 |
| `in the style of [특정 건축가]` | 포괄적 차단 — 특정 인물 스타일 명시 금지 |

!!! info "대안"
    특정 건축가 스타일 대신 재료, 형태 언어, 공간 특성을 직접 서술하세요.  
    예: `Zaha Hadid style` → `parametric curved facade, fluid organic forms`

---

### 표현 품질 저하 단어

이 단어들은 모델이 낮은 품질의 결과물을 생성하도록 유도합니다:

```
low quality, worst quality, bad anatomy, bad architecture,
simple, sketch, draft, unfinished, rough, amateur
```

---

### 비현실적 표현 단어

건축 렌더링의 사실성을 저하시키는 단어들:

```
cartoon, anime, illustration, painting, watercolor, oil paint,
fantasy, surreal, abstract, conceptual art
```

!!! tip "예외"
    콘셉트 다이어그램 또는 스케치풍 이미지가 필요한 경우, 팀장 승인 후 별도 파이프라인으로 진행합니다.

---

### 저작권 이미지 참조 금지

- 특정 실제 건물 이름을 직접 명시하는 것은 금지합니다.
- 예: `Seoul City Hall`, `Lotte World Tower` 등

---

### 내용 안전 관련

- 사람 얼굴, 신체가 포함된 프롬프트는 금지합니다.
- 실제 장소의 사고, 재난, 붕괴를 묘사하는 프롬프트는 금지합니다.

---

## 차단 요청 절차

새로운 단어를 차단 목록에 추가해야 하는 경우:

1. 팀 내부 채널에 사유와 함께 요청합니다.
2. 팀장 검토 후 이 페이지를 업데이트합니다.
3. 변경 이력을 아래 표에 기록합니다.

---

## 변경 이력

| 날짜 | 추가/삭제 단어 | 사유 | 처리자 |
|------|--------------|------|--------|
| 2026-05-20 | 초기 목록 구성 | 위키 초기 구축 | 설계팀 |
