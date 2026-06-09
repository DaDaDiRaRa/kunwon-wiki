# ControlNet 설정 레지스트리

파이프라인별 ControlNet 모델, 전처리기, 파라미터 기준표입니다.  
각 파이프라인에서 이 표의 값을 그대로 사용합니다.

---

## 파이프라인별 기준 설정

### 외장 렌더링

| 파라미터 | 값 | 허용 범위 | 비고 |
|----------|-----|-----------|------|
| 모델 | `control_v11p_sd15_canny` | — | 변경 금지 |
| 전처리기 | `canny` | — | 변경 금지 |
| 가중치 (Weight) | `0.85` | 0.75 ~ 0.95 | 매스 유지 정도 조절 |
| Guidance Start | `0.0` | 0.0 ~ 0.1 | 시작 지점 |
| Guidance End | `1.0` | 0.9 ~ 1.0 | 종료 지점 |
| Canny Threshold A | `100` | 80 ~ 120 | 엣지 감도 (낮을수록 많은 선) |
| Canny Threshold B | `200` | 180 ~ 220 | 엣지 강도 |
| Control Mode | `Balanced` | — | My prompt / ControlNet 아님 |
| Resize Mode | `Crop and Resize` | — | — |

**매스 왜곡이 심할 때**: Weight를 0.95로 높입니다.  
**질감 표현이 부족할 때**: Weight를 0.75로 낮춥니다.

---

### 배치도 렌더링

| 파라미터 | 값 | 허용 범위 | 비고 |
|----------|-----|-----------|------|
| 모델 | `control_v11p_sd15_seg` | — | 변경 금지 |
| 전처리기 | `seg_ofade20k` | — | ADE20K 세그멘테이션 |
| 가중치 (Weight) | `0.90` | 0.80 ~ 1.00 | — |
| Guidance Start | `0.0` | — | — |
| Guidance End | `0.85` | 0.8 ~ 1.0 | — |
| Control Mode | `Balanced` | — | — |
| Resize Mode | `Just Resize` | — | — |

---

### 아파트 2D→3D (테스트 단계)

| 파라미터 | 값 | 허용 범위 | 비고 |
|----------|-----|-----------|------|
| 모델 | `control_v11p_sd15_mlsd` | — | 직선 구조 강조 |
| 전처리기 | `mlsd` | — | M-LSD 직선 감지 |
| 가중치 (Weight) | `0.80` | 0.70 ~ 0.90 | — |
| Guidance Start | `0.0` | — | — |
| Guidance End | `0.90` | — | — |
| Control Mode | `ControlNet is more important` | — | 구조 우선 |
| Resize Mode | `Just Resize` | — | — |

---

## 모델 파일 위치

팀 서버에서 ControlNet 모델 파일을 다운로드합니다:

```
\\SERVER\AI-Tools\models\ControlNet\
├── control_v11p_sd15_canny.pth
├── control_v11p_sd15_seg.pth
├── control_v11p_sd15_mlsd.pth
└── control_v11p_sd15_depth_midas.pth
```

로컬 WebUI에서는 아래 경로에 배치합니다:
```
stable-diffusion-webui/models/ControlNet/
```

---

## 전처리기 선택 가이드

```
입력 이미지 유형별 권장 전처리기:

SketchUp 스크린샷 (선 명확)  → canny
사진 (기존 건물)              → depth (midas)
CAD 도면 (직선 구조)          → mlsd
평면도 (배치도)               → seg_ofade20k
손 스케치                     → lineart_anime 또는 scribble
```

---

## 변경 이력

| 날짜 | 파이프라인 | 변경 파라미터 | 변경 사유 | 처리자 |
|------|-----------|-------------|-----------|--------|
| 2026-05-20 | 전체 | — | 초기 등록 | 설계팀 |
