# md-maker

YAML 템플릿을 사용하여 마크다운 파일을 생성하는 CLI 도구입니다.

## 기능

- YAML 템플릿을 사용한 마크다운 파일 생성
- 다국어 지원 (한국어, 영어, 일본어)
- 커스터마이즈 가능한 템플릿
- 자동 ID 생성
- 파일 덮어쓰기 방지
- 마지막 사용 경로 기억

## 설치

```bash
npm install -g @h9/md-maker
```

## 사용법

```bash
md-maker create
```

## 템플릿 형식

다음과 같은 형식으로 YAML 파일을 생성하세요:

```yaml
name: 템플릿 이름
description: 템플릿 설명
language: ko  # ko, en, ja 중 선택
fields:
  - name: 필드이름
    type: input  # input, list, checkbox 중 선택
    message: 필드 메시지
    choices:  # list 타입일 경우
      - 선택지 1
      - 선택지 2
    default: 기본값
    when: (answers) => true  # 조건부 필드
stepFormat: |
  ### {{index}}단계
  - 시간: {{time}}
  - 물: {{water}}
  - 총량: {{total}}
  - 설명: {{description}}
template: |
  # {{title}}
  {{description}}
  ...
```

## 예제 템플릿

`md-format-coffee-recipe-*.yml` 파일들을 참고하세요.

## 라이선스

ISC 