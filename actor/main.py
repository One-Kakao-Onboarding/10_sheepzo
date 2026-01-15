"""
Gemini API Integration Module
"""

from dotenv import load_dotenv
from google import genai
import os
import sys
import json
# import requests
import cloudscraper
from bs4 import BeautifulSoup

load_dotenv()

def generate_content(prompt: str, model: str = "gemini-3-pro-preview") -> str:
    if not os.getenv("GEMINI_API_KEY"):
        raise ValueError("GEMINI_API_KEY not set.")
    
    try:
        client = genai.Client()
        response = client.models.generate_content(
            model=model,
            contents=prompt
        )
        return response.text
    except Exception as e:
        raise Exception(f"Failed to generate content: {str(e)}")



import cloudscraper
# import requests # Removed as we are using cloudscraper

# ... (rest of imports)


from playwright.sync_api import sync_playwright

def fetch_url_content(url: str) -> tuple[str, str]:
    with sync_playwright() as p:
        # Launch browser (headless=True by default)
        browser = p.chromium.launch(headless=True)
        
        # Create a new page with a realistic User-Agent
        context = browser.new_context(
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )
        page = context.new_page()
        
        try:
            # Go to URL with a generous timeout
            page.goto(url, timeout=60000, wait_until="domcontentloaded")
            
            # Wait for specific element that indicates content is loaded, or fixed time
            # Using a simplified wait strategy: wait for valid text content or network idle
            # Namuwiki SPA might need a bit of time to hydrate
            page.wait_for_timeout(5000) # Wait 5 seconds for JS to execute
            
            # Check for generic "Loading..." text removal or presence of main content
            # Assuming if title is not "Loading...", we might be good
            
            raw_html = page.content()
            
            # Use readability or just getting text from the body
            # We'll stick to the existing Beautifulsoup pattern for text extraction consistent with previous logic
            # but getting the DOM *after* JS execution is key.
            
            # However, BS4 handles text extraction well.
            # Let's clean up script/style here using BS4 as before, or use Playwright to get text.
            # To minimize changes to valid extraction logic downstream, let's keep BS4 parsing.
            
        finally:
            browser.close()

    soup = BeautifulSoup(raw_html, 'html.parser')
    
    for script in soup(["script", "style"]):
        script.decompose()
    
    text_content = soup.get_text(separator='\n', strip=True)
    
    if "Loading..." in text_content[:200]:
         raise Exception("Still blocked/loading (Playwright failed to wait enough?)")

    return text_content, raw_html




def extract_profile_image_url(raw_html: str, model: str = "gemini-3-pro-preview") -> str:
    html_snippet = raw_html[:8000]
    
    prompt = f"""다음 HTML에서 배우의 대표 프로필 이미지 URL을 찾아주세요.

조건:
- namu.la 또는 i.namu.wiki 도메인의 이미지 URL을 찾으세요
- 가장 먼저 나오는 프로필 사진 이미지를 선택하세요
- URL만 출력하세요. 다른 텍스트 없이 URL만 응답하세요.
- 이미지를 찾을 수 없으면 "정보 없음"이라고만 응답하세요.

HTML:
{html_snippet}
"""

    result = generate_content(prompt, model)
    url = result.strip()
    
    if url.startswith("http") and ("namu" in url):
        return url
    return "정보 없음"


def extract_personality_spectrum(content: str, model: str = "gemini-3-pro-preview") -> str:
    prompt = f"""다음은 배우에 대한 나무위키 페이지 내용입니다.
이 배우의 "성격 스펙트럼"을 분석해주세요.

분석할 내용:
1. 주로 맡는 캐릭터 유형 (예: 우울한 역, 명랑한 역, 악역 등)
2. 연기 스타일과 스펙트럼 (예: 감성적, 코믹, 카리스마 등)
3. 잘 어울리는 장르 (예: 드라마, 코미디, 스릴러 등)
4. 강점/특기 캐릭터
5. 연기 특징이나 평가

중요 지시사항:
- 한국어로 상세하게 작성해주세요.
- 문장 형태로 자연스럽게 작성해주세요.
- JSON이 아닌 일반 텍스트로 응답해주세요.
- 정보가 없으면 "정보 없음"이라고만 응답하세요.

나무위키 페이지 내용:
{content}
"""

    result = generate_content(prompt, model)
    return result.strip()


def extract_emotional_spectrum(content: str, model: str = "gemini-3-pro-preview") -> dict:
    prompt = f"""다음은 배우에 대한 나무위키 페이지 내용입니다.
이 배우의 "감정 스펙트럼" (연기톤 스펙트럼)을 분석해주세요.

5가지 스펙트럼 축을 1~10 점수로 평가하고, 각각에 대한 설명을 작성해주세요:

1. cold_warm: 차가움(1) ↔ 따뜻함(10)
2. active_passive: 능동적(1) ↔ 수동적(10)
3. intensity: 미세한 감정(1) ↔ 강렬한 감정(10)
4. extrovert_introvert: 외향적(1) ↔ 내향적(10)
5. comic_level: 진지함(1) ↔ 코믹함(10)

중요 지시사항:
- 반드시 JSON 형식으로만 응답하세요.
- 각 축마다 점수(1~10)와 설명을 작성하세요.
- 모든 값은 한국어로 작성하세요.

{{
  "cold_warm": 5,
  "cold_warm_description": "설명",
  "active_passive": 5,
  "active_passive_description": "설명",
  "intensity": 5,
  "intensity_description": "설명",
  "extrovert_introvert": 5,
  "extrovert_introvert_description": "설명",
  "comic_level": 5,
  "comic_level_description": "설명"
}}

나무위키 페이지 내용:
{content}
"""

    result = generate_content(prompt, model)
    
    try:
        json_str = result.strip()
        if json_str.startswith("```"):
            json_str = json_str.split("```")[1]
            if json_str.startswith("json"):
                json_str = json_str[4:]
        json_str = json_str.strip()
        
        return json.loads(json_str)
    except json.JSONDecodeError:
        return {"error": "Failed to parse JSON", "raw_response": result}


def extract_narrative_role(content: str, model: str = "gemini-3-pro-preview") -> dict:
    prompt = f"""다음은 배우에 대한 나무위키 페이지 내용입니다.

페이지에서 "출연 작품" 또는 "필모그래피" 섹션을 찾아서, 각 작품에서의 서사적 역할 정보를 추출해주세요.
연극, 드라마, 영화, 뮤지컬 등 모든 장르의 작품을 포함합니다.

각 작품별로 다음 정보를 추출하세요:
1. work_title: 작품명 (연도가 있다면 포함)
2. character_name: 캐릭터명/배역명 (페이지에 나온 그대로)
3. role_type: 역할 유형 (주연, 조연, 악역, 조력자, 카메오 등으로 추정)
4. character_description: 캐릭터가 어떤 인물인지 설명 (페이지 내용이나 작품 정보 기반 추정)
5. emotional_experiences: 해당 캐릭터가 겪었을 감정들 (배열: 분노, 절망, 사랑, 불안, 슬픔, 죄책감 등)

마지막에 recurring_pattern으로 전체 필모그래피에서 반복되는 이미지/캐릭터 패턴을 요약해주세요.

중요 지시사항:
- 반드시 JSON 형식으로만 응답하세요.
- 모든 값은 한국어로 작성하세요.
- 페이지에서 확인 가능한 주요 작품 5~7개를 추출하세요. 없으면 빈 배열로 응답하세요.
- character_description과 emotional_experiences는 작품과 배역 정보를 바탕으로 추정해서 작성하세요.

{{
  "narrative_roles": [
    {{
      "work_title": "작품명",
      "character_name": "캐릭터명",
      "role_type": "역할 유형",
      "character_description": "캐릭터 설명",
      "emotional_experiences": ["감정1", "감정2"]
    }}
  ],
  "recurring_pattern": "전체 필모그래피에서 반복되는 이미지 패턴 요약"
}}

나무위키 페이지 내용:
{content}
"""

    result = generate_content(prompt, model)
    
    try:
        json_str = result.strip()
        if json_str.startswith("```"):
            json_str = json_str.split("```")[1]
            if json_str.startswith("json"):
                json_str = json_str[4:]
        json_str = json_str.strip()
        
        return json.loads(json_str)
    except json.JSONDecodeError:
        return {"narrative_roles": [], "recurring_pattern": "정보 없음", "error": "Failed to parse JSON"}


def extract_actor_info(url: str, model: str = "gemini-3-pro-preview") -> dict:
    content, raw_html = fetch_url_content(url)
    content = content[:15000]
    
    prompt = f"""다음은 배우에 대한 나무위키 페이지 내용입니다. 
이 내용을 분석하여 배우의 외적 이미지 정보를 JSON 형식으로 추출해주세요.

추출할 정보:
1. 이름
2. 나이대 (예: 30대 초반, 40대 중반)
3. 성별 (남성 또는 여성)
4. 키/덩치
5. 목소리 특징
6. 인상/분위기 - 가능한 상세하게 작성 (외모 특징, 분위기, 연기 스타일, 이미지 등)

중요 지시사항:
- 반드시 아래 JSON 형식으로만 응답해주세요. 다른 텍스트 없이 JSON만 출력하세요.
- 모든 값은 한국어로 작성해주세요.
- 정보를 찾을 수 없는 경우 "정보 없음"으로 표시하세요.
- impression 필드는 최대한 상세하게 작성해주세요.

{{
  "name": "배우 이름",
  "age_range": "나이대 (예: 30대 초반)",
  "gender": "남성 또는 여성",
  "height_build": "키와 체형 정보",
  "voice": "목소리 특징",
  "impression": "전체적인 인상과 분위기를 상세하게"
}}

나무위키 페이지 내용:
{content}
"""

    result = generate_content(prompt, model)
    
    try:
        json_str = result.strip()
        if json_str.startswith("```"):
            json_str = json_str.split("```")[1]
            if json_str.startswith("json"):
                json_str = json_str[4:]
        json_str = json_str.strip()
        
        parsed = json.loads(json_str)
        
        parsed["profile_image_url"] = extract_profile_image_url(raw_html, model)
        parsed["personality_spectrum"] = extract_personality_spectrum(content, model)
        parsed["emotional_spectrum"] = extract_emotional_spectrum(content, model)
        
        narrative_data = extract_narrative_role(content, model)
        parsed["narrative_roles"] = narrative_data.get("narrative_roles", [])
        parsed["recurring_pattern"] = narrative_data.get("recurring_pattern", "정보 없음")
        
        return parsed
    except json.JSONDecodeError:
        return {"raw_response": result, "error": "Failed to parse JSON"}


def main():
    try:
        test_url = "https://namu.wiki/w/%EA%B0%95%EC%8A%B9%ED%98%B8(%EB%B0%B0%EC%9A%B0)"
        result = extract_actor_info(test_url)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
