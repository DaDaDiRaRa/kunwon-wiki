# 온보딩 체크리스트

신규 팀원이 AI 파이프라인 환경을 설정하고 첫 작업을 시작하기 위한 단계별 가이드입니다.  
각 단계를 완료하면 체크박스에 표시하세요.

---

## 1단계 — 기본 환경 설치

- [ ] **Python 3.10** 이상 설치 확인 (`python --version`)
- [ ] **CUDA 11.8** 이상 설치 확인 (NVIDIA GPU 보유자만)
- [ ] **Git** 설치 확인 (`git --version`)
- [ ] **팀 서버 접속 계정** 발급 — IT 담당자에게 요청
- [ ] 팀 서버 `\\SERVER\AI-Tools\` 드라이브 연결 확인

---

## 2단계 — Stable Diffusion WebUI 설치

- [ ] 팀 서버에서 WebUI 설치 가이드 문서 다운로드: `\\SERVER\AI-Tools\docs\webui-install.pdf`
- [ ] `git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui` 실행
- [ ] 팀 서버에서 모델 파일 복사:
    ```
    \\SERVER\AI-Tools\models\Checkpoints\  →  webui/models/Stable-diffusion/
    \\SERVER\AI-Tools\models\ControlNet\   →  webui/models/ControlNet/
    \\SERVER\AI-Tools\models\Upscalers\    →  webui/models/ESRGAN/
    ```
- [ ] `webui-user.bat` 실행 (`--xformers --medvram` 플래그 포함 확인)
- [ ] 브라우저에서 `http://127.0.0.1:7860` 접속 확인

---

## 3단계 — 파이프라인 환경 검증

- [ ] **외장 렌더링 테스트**:
    1. 샘플 이미지 로드: `\\SERVER\AI-Tools\test-inputs\ext_sample.png`
    2. [외장 렌더링 파라미터](parameter-registry/controlnet-settings.md) 그대로 적용
    3. 이미지 1장 생성 후 팀장에게 결과물 확인 요청
- [ ] **배치도 렌더링 테스트**:
    1. 샘플 이미지 로드: `\\SERVER\AI-Tools\test-inputs\site_sample.png`
    2. [배치도 렌더링 파라미터](parameter-registry/controlnet-settings.md) 그대로 적용
    3. 이미지 1장 생성 후 팀장에게 결과물 확인 요청

---

## 4단계 — 위키 및 정책 숙지

- [ ] [승인된 태그 목록](prompt-library/approved-tags.md) 전체 읽기
- [ ] [차단된 프롬프트 목록](prompt-library/blocked-prompts.md) 전체 읽기
- [ ] [시드값 레지스트리](parameter-registry/seed-values.md) 확인
- [ ] [오류 로그](error-log.md)의 기존 오류 사례 검토
- [ ] 파이프라인 파라미터 변경 정책 이해 (변경 시 레지스트리 등록 필수)

---

## 5단계 — 팀 채널 가입

- [ ] 팀 메신저 AI 채널 가입 (팀장에게 초대 요청)
- [ ] 파이프라인 업데이트 알림 채널 가입
- [ ] 오류 보고 채널 가입

---

## 완료 확인

모든 항목을 완료한 후 팀장에게 온보딩 완료를 보고합니다.

!!! success "온보딩 완료 후"
    실제 프로젝트 업무 투입 전 팀장과 30분 미팅을 진행하여 현재 진행 중인 프로젝트의 파이프라인 사용 방식을 확인합니다.

---

## 자주 묻는 질문 (FAQ)

**Q. WebUI가 실행되지 않아요.**  
A. VRAM이 부족한 경우 `webui-user.bat`에 `--lowvram` 플래그를 추가하세요. 그래도 안 되면 [오류 로그](error-log.md)를 확인하거나 팀장에게 문의하세요.

**Q. 모델 파일이 서버에 없어요.**  
A. IT 담당자에게 서버 접근 권한을 확인하세요. 권한이 있는데도 보이지 않으면 드라이브 연결을 다시 확인하세요.

**Q. 생성 이미지 품질이 팀원들과 달라요.**  
A. 시드값, 파라미터 설정을 레지스트리와 정확히 일치시켰는지 확인하세요. 모델 파일 버전도 함께 확인합니다.

**Q. 새로운 프롬프트 태그를 사용하고 싶어요.**  
A. 팀 채널에 제안하고 팀장 승인 후 [승인된 태그](prompt-library/approved-tags.md) 목록에 추가합니다.
