# 승인된 프롬프트 태그

파이프라인별 공식 승인 프롬프트 태그입니다. 조합하여 사용하며, 순서는 권장 순서를 따릅니다.

---

## 외장 렌더링용 태그

### 품질 태그 (필수 — 항상 앞에 배치)
```
masterpiece, best quality, ultra-detailed, photorealistic, 8k resolution
```

### 건물 유형 태그
| 건물 유형 | 태그 |
|-----------|------|
| 공동주택 | `apartment building, residential complex` |
| 업무시설 | `office building, commercial tower` |
| 문화시설 | `cultural facility, museum, arts center` |
| 혼합용도 | `mixed-use development` |
| 단독주택 | `single family house, villa` |

### 외장재 태그
| 외장재 | 태그 |
|--------|------|
| 노출 콘크리트 | `exposed concrete facade, brutalist texture` |
| 커튼월 유리 | `glass curtain wall, reflective facade` |
| 금속 패널 | `metal panel cladding, aluminum facade` |
| 벽돌 | `brick facade, masonry wall` |
| 석재 | `stone cladding, granite facade` |
| 목재 | `timber facade, wood cladding` |

### 환경 및 조명 태그
| 상황 | 태그 |
|------|------|
| 맑은 낮 | `daytime, clear sky, golden hour lighting` |
| 흐린 날 | `overcast sky, diffused light, soft shadow` |
| 야경 | `nighttime, architectural lighting, city lights` |
| 계절 (봄/여름) | `green trees, lush vegetation, spring` |
| 계절 (가을) | `autumn trees, warm tones, fall foliage` |
| 계절 (겨울) | `bare trees, snow, winter scene` |

### 뷰 타입 태그
```
eye-level perspective, street view, pedestrian view   # 보행자 시점
bird's eye view, aerial view                          # 조감도
worm's eye view, dramatic perspective                 # 앙각
axonometric view                                      # 등각투시
```

---

## 배치도 렌더링용 태그

### 품질 태그 (필수)
```
top-down view, aerial plan view, orthographic, high resolution, detailed site plan
```

### 조경 스타일 태그
| 스타일 | 태그 |
|--------|------|
| 자연 조경 | `lush green vegetation, natural landscape, organic planting` |
| 정형 조경 | `formal garden, geometric planting, manicured lawn` |
| 도시 가로수 | `urban trees, street trees, tree canopy` |
| 수공간 | `water feature, pond, reflecting pool` |

### 도로 및 포장 태그
```
asphalt road, concrete pavement, brick paving, pedestrian path
```

---

## 공통 부정 프롬프트 (Negative Prompt)

모든 파이프라인에서 아래 부정 프롬프트를 기본으로 사용합니다:

```
worst quality, low quality, blurry, out of focus, distorted, deformed,
watermark, text, signature, logo, jpeg artifacts, overexposed, underexposed,
extra limbs, missing limbs, floating elements, unrealistic proportions
```

---

## 프롬프트 조합 예시

=== "외장 렌더링 — 공동주택 낮"
    ```
    masterpiece, best quality, ultra-detailed, photorealistic, 8k resolution,
    apartment building, residential complex, glass curtain wall, reflective facade,
    daytime, clear sky, golden hour lighting, green trees, lush vegetation,
    eye-level perspective, street view
    ```

=== "배치도 렌더링 — 자연 조경"
    ```
    top-down view, aerial plan view, orthographic, high resolution, detailed site plan,
    lush green vegetation, natural landscape, organic planting, urban trees, tree canopy,
    asphalt road, pedestrian path
    ```
