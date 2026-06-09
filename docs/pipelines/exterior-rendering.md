# 외장 렌더링 파이프라인

## 개요

외장 렌더링 파이프라인은 건축 설계 초안(스케치, CAD 도면, SketchUp 뷰)을 입력으로 받아 Stable Diffusion과 ControlNet을 활용해 사실적인 외관 렌더링 이미지를 생성합니다. 기존 수작업 렌더링 대비 초안 품질의 이미지를 10분 내에 생성할 수 있어, 클라이언트 중간 보고 및 내부 디자인 검토에 활용됩니다.

---

## 인풋 요구사항

| 항목 | 형식 | 권장 해상도 | 비고 |
|------|------|-------------|------|
| 기준 이미지 | PNG / JPG | 1024×1024 이상 | SketchUp 스크린샷 또는 CAD 뷰 |
| ControlNet 소스 | Depth / Canny / Lineart | 기준 이미지와 동일 | 자동 추출 가능 |
| 프롬프트 | 텍스트 | — | 승인된 태그 사용 필수 |
| 부정 프롬프트 | 텍스트 | — | 기본 차단 목록 사용 |

!!! warning "주의"
    입력 이미지에 사람이 포함된 경우 반드시 제거 후 업로드합니다. 사람 이미지가 포함되면 결과물 품질이 저하됩니다.

---

## 단계별 프로세스

### 1단계 — 기준 이미지 준비
1. SketchUp 또는 Rhino에서 원하는 뷰 앵글로 모델을 캡처합니다.
2. 배경을 흰색 또는 회색으로 설정하고, 해상도를 1024×1024 이상으로 저장합니다.
3. 필요 시 Photoshop에서 배경 및 불필요한 요소를 제거합니다.

### 2단계 — ControlNet 소스 추출
1. WebUI의 **Extras** 탭 또는 `controlnet_preprocessor.py` 스크립트를 실행합니다.
2. 사용 목적에 따라 전처리기를 선택합니다:
    - 매스감 유지 → **Depth (Midas)**
    - 선 표현 강조 → **Canny** 또는 **Lineart**
3. 생성된 컨트롤 이미지를 별도 저장합니다.

### 3단계 — 프롬프트 작성
1. [승인된 태그](../prompt-library/approved-tags.md) 목록에서 스타일 태그를 선택합니다.
2. 건물 유형, 외장재, 환경 조건을 구체적으로 작성합니다.
3. [차단된 프롬프트](../prompt-library/blocked-prompts.md) 목록을 확인하고 해당 단어를 제거합니다.

### 4단계 — 이미지 생성
1. Stable Diffusion WebUI의 **img2img** 탭을 엽니다.
2. [고정 파라미터](#fixed-params)를 그대로 적용합니다.
3. **Generate** 버튼을 클릭하고 4장 이상 생성합니다.
4. 최적 결과물을 선택해 저장합니다.

### 5단계 — 후처리
1. 선택된 이미지를 Photoshop에서 열어 색온도·채도를 조정합니다.
2. 필요 시 배경(하늘, 조경)을 합성합니다.
3. 파일명 규칙 `YYMMDD_PJT코드_EXT_v00.png`으로 저장합니다.

---

## 고정 파라미터 { #fixed-params }

```yaml
# 외장 렌더링 고정 파라미터 (변경 금지)
model: "architecturerealmix_v2.safetensors"
sampler: "DPM++ 2M Karras"
steps: 30
cfg_scale: 7.5
seed: 4823910          # → 시드값 레지스트리 참조
denoising_strength: 0.55

controlnet:
  model: "control_v11p_sd15_canny"
  weight: 0.85
  guidance_start: 0.0
  guidance_end: 1.0
  preprocessor: "canny"
  threshold_a: 100
  threshold_b: 200

image_size:
  width: 1024
  height: 1024
```

!!! tip "파라미터 변경 시"
    위 파라미터를 변경해야 할 경우 반드시 [파라미터 레지스트리](../parameter-registry/seed-values.md)에 새 항목으로 등록하고 팀 공유 후 사용합니다.

---

## 기대 출력물

- **형식**: PNG, 1024×1024 이상
- **품질 기준**: 건물 외형 왜곡 없음, 창호 패턴 일관성 유지, 스케일감 자연스러움
- **납품 수량**: 1회 생성 시 최소 4장 → 내부 검토 후 1~2장 선택
- **소요 시간**: GPU 환경에서 장당 약 25~40초

---

## 일반적인 오류

| 오류 증상 | 원인 | 해결 방법 |
|-----------|------|-----------|
| 건물 형태가 녹아내림 | `denoising_strength` 과다 | 0.55 → 0.45로 낮춤 |
| 창문 패턴 뭉개짐 | ControlNet 가중치 부족 | `weight` 0.85 → 0.95로 올림 |
| 색상 과포화 | CFG Scale 과다 | 7.5 → 6.5로 낮춤 |
| 결과물이 매번 달라짐 | 시드 미고정 | 시드를 레지스트리 값으로 고정 |
| CUDA out of memory | 이미지 해상도 초과 | 1024 이하로 조정 후 재시도 |

더 많은 오류 사례는 [오류 로그](../error-log.md)를 참조하세요.
