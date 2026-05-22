const axios = require('axios');
const cheerio = require('cheerio');

// CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 네이버 플레이스 리뷰 크롤링
async function scrapeNaverPlace(placeId) {
  try {
    const url = `https://pcmap.place.naver.com/restaurant/${placeId}/review/visitor`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });

    const reviews = [];
    
    // 네이버 플레이스는 동적 로딩이라 실제로는 API 호출 필요
    // 여기서는 간단한 HTML 파싱 버전
    const $ = cheerio.load(response.data);
    
    $('.place_section_content').each((i, elem) => {
      const content = $(elem).find('.ZZ4OK').text().trim();
      const author = $(elem).find('._3XamX').text().trim();
      const rating = $(elem).find('.PXMot').text().trim();
      
      if (content) {
        reviews.push({
          content,
          author: author || '익명',
          rating: parseFloat(rating) || 0,
          platform: 'naver',
          date: new Date().toISOString()
        });
      }
    });

    return reviews;
  } catch (error) {
    console.error('Naver scraping error:', error.message);
    return [];
  }
}

// 구글 리뷰 크롤링
async function scrapeGoogleReviews(placeUrl) {
  try {
    // 구글은 더 복잡해서 Puppeteer 필요하지만
    // 여기서는 간단 버전으로 구현
    const response = await axios.get(placeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    const reviews = [];
    const $ = cheerio.load(response.data);
    
    // 구글 리뷰 파싱 (실제 구조는 더 복잡함)
    $('[data-review-id]').each((i, elem) => {
      const content = $(elem).find('.MyEned').text().trim();
      const author = $(elem).find('.d4r55').text().trim();
      const rating = $(elem).find('.kvMYJc').attr('aria-label');
      
      if (content) {
        reviews.push({
          content,
          author: author || 'Anonymous',
          rating: rating ? parseFloat(rating.match(/[\d.]+/)?.[0]) : 0,
          platform: 'google',
          date: new Date().toISOString()
        });
      }
    });

    return reviews;
  } catch (error) {
    console.error('Google scraping error:', error.message);
    return [];
  }
}

// 네이버 블로그 검색
async function scrapeNaverBlog(keyword) {
  try {
    const url = `https://search.naver.com/search.naver?where=blog&query=${encodeURIComponent(keyword)}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    const blogs = [];
    const $ = cheerio.load(response.data);
    
    $('.view_wrap').each((i, elem) => {
      const title = $(elem).find('.title_link').text().trim();
      const content = $(elem).find('.dsc_link').text().trim();
      const author = $(elem).find('.name').text().trim();
      
      if (title && content) {
        blogs.push({
          title,
          content,
          author: author || '블로거',
          platform: 'blog',
          date: new Date().toISOString()
        });
      }
    });

    return blogs;
  } catch (error) {
    console.error('Blog scraping error:', error.message);
    return [];
  }
}

// Vercel Serverless Function
module.exports = async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).headers(corsHeaders).send('');
  }

  const { type, placeId, url, keyword } = req.query;

  try {
    let data = [];

    switch (type) {
      case 'naver':
        if (!placeId) {
          return res.status(400).json({ error: 'placeId required' });
        }
        data = await scrapeNaverPlace(placeId);
        break;

      case 'google':
        if (!url) {
          return res.status(400).json({ error: 'url required' });
        }
        data = await scrapeGoogleReviews(url);
        break;

      case 'blog':
        if (!keyword) {
          return res.status(400).json({ error: 'keyword required' });
        }
        data = await scrapeNaverBlog(keyword);
        break;

      default:
        return res.status(400).json({ error: 'Invalid type' });
    }

    res.status(200).headers(corsHeaders).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).headers(corsHeaders).json({
      success: false,
      error: error.message
    });
  }
};
