# 리뷰 크롤링 API 서버

## 배포 방법

### 1. Vercel 계정 준비
https://vercel.com 에서 GitHub 계정으로 로그인

### 2. GitHub 저장소 생성
1. GitHub에서 새 저장소 생성 (예: review-scraper-api)
2. 이 폴더의 모든 파일을 저장소에 푸시

### 3. Vercel에 배포
1. Vercel 대시보드에서 "New Project" 클릭
2. GitHub 저장소 선택
3. 자동으로 배포됨

### 4. API 엔드포인트
배포 완료 후 다음 URL로 사용 가능:
- `https://your-project.vercel.app/api/scrape?type=naver&placeId=1414693656`
- `https://your-project.vercel.app/api/scrape?type=google&url=...`
- `https://your-project.vercel.app/api/scrape?type=blog&keyword=팔팔너구리`

## 사용 예시

```javascript
// 네이버 플레이스
const naverReviews = await fetch('https://your-project.vercel.app/api/scrape?type=naver&placeId=1414693656');

// 구글 리뷰
const googleReviews = await fetch('https://your-project.vercel.app/api/scrape?type=google&url=' + encodeURIComponent(googleUrl));

// 블로그
const blogs = await fetch('https://your-project.vercel.app/api/scrape?type=blog&keyword=팔팔너구리해장');
```

## 주의사항
- 네이버/구글의 구조가 바뀌면 크롤링 코드 수정 필요
- 과도한 요청은 IP 차단 가능성 있음
- 하루 1-2회 정도만 호출 권장
