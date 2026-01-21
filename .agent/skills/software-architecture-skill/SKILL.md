---
name: software-architecture
description: "품질 중심의 소프트웨어 아키텍처 가이드입니다. Clean Architecture, SOLID 원칙, DDD를 기반으로 지속 가능한 설계를 돕습니다."
---

# Software Architecture Development Skill

이 스킬은 Clean Architecture 및 Domain Driven Design(DDD) 원칙을 기반으로 고품질 소프트웨어 개발을 위한 지침을 제공합니다.

## 핵심 원칙 (General Principles)

- **Early Return 패턴**: 가독성을 위해 중첩된 조건문보다 이른 반환을 선호합니다.
- **중복 제거**: 재사용 가능한 함수와 모듈을 통해 코드 중복을 피합니다.
- **컴포넌트 분해**: 80줄 이상의 함수나 컴포넌트는 작게 분해합니다. 파일이 200줄을 넘으면 분리하는 것을 권장합니다.
- **Naming**: `utils`, `helpers`와 같은 모호한 이름 대신 `OrderCalculator`, `InvoiceGenerator`와 같은 도메인 중심 이름을 사용합니다.

## 라이브러리 우선 접근 (Library-First Approach)

- **직접 구현하기 전에 기존 솔루션을 먼저 검색하세요.**
  - npm 라이브러리, SaaS 솔루션, 타사 API를 적극 활용합니다.
  - 직접 구현(Custom Code)이 정당화되는 경우: 특정 비즈니스 로직, 성능 임계값, 보안 민감성, 기존 솔루션 부재 시.

## 아키텍처 및 설계 (Architecture and Design)

- **Clean Architecture & DDD**:
  - 도메인 엔티티와 인프라 관심사를 분리합니다.
  - 비즈니스 로직은 프레임워크로부터 독립적이어야 합니다.
  - 유스케이스(Use Cases)를 명확히 정의하고 격리합니다.
- **관심사 분리 (Separation of Concerns)**:
  - UI 컴포넌트에 비즈니스 로직을 섞지 마세요.
  - 컨트롤러에 직접 데이터베이스 쿼리를 넣지 마세요.
  - 컨텍스트 간의 명확한 경계를 유지합니다.

## 피해야 할 안티 패턴 (Anti-Patterns)

- **NIH (Not Invented Here) 증후군**: 이미 잘 만들어진 라이브러리(Zustand, React Query 등)가 있다면 직접 만들지 마세요.
- **쓰레기통 파일**: `utils.js`나 `common.js`에 관련 없는 함수 50개를 몰아넣지 마세요.
- **모든 줄의 커스텀 코드는 유지보수 부채**임을 기억하세요.

## 코드 품질 (Code Quality)

- 적절한 에러 핸들링과 타입 지정된 Catch 블록을 사용합니다.
- 중첩 깊이는 최대 3단계까지만 허용합니다.
- 함수는 50줄 이내로 유지하려고 노력합니다.
