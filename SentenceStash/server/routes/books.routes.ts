import { Router } from "express";
import { getStorage } from "../storage";

const router = Router();

// Search cached books first, then Aladin API
router.get("/api/books/search", async (req, res) => {
  try {
    const { query } = req.query;
    const storage = getStorage();
    
    if (!query) {
      return res.status(400).json({ error: "검색어를 입력해주세요" });
    }
    
    // First, search in cached books
    const cachedBooks = await storage.searchCachedBooks(query.toString());
    
    if (cachedBooks.length > 0) {
      const books = cachedBooks.map(book => ({
        title: book.title,
        author: book.author || "저자 미상",
        publisher: book.publisher || "출판사 미상",
        isbn: book.isbn || "",
        cover: book.cover || "https://via.placeholder.com/120x174",
        cached: true
      }));
      
      return res.json({ items: books });
    }
    
    // If no cached results, search Aladin API
    const TTBKey = "ttbkiyu001041002";
    const searchUrl = `http://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${TTBKey}&Query=${encodeURIComponent(
      query.toString()
    )}&QueryType=Title&MaxResults=20&start=1&SearchTarget=Book&output=js&Version=20131101`;
    
    try {
      const response = await fetch(searchUrl);
      const data = await response.json();
      
      if (!data.item || data.item.length === 0) {
        return res.json({ items: [] });
      }
      
      // Convert Aladin API response and cache the results
      const books = await Promise.all(data.item.map(async (item: any) => {
        const bookData = {
          title: item.title || "제목 없음",
          author: item.author || "저자 미상",
          publisher: item.publisher || "출판사 미상",
          isbn: item.isbn13 || item.isbn || "",
          cover: item.cover || "https://via.placeholder.com/120x174"
        };
        
        // Cache the book
        await storage.getOrCreateBook(bookData);
        
        return { ...bookData, cached: false };
      }));
      
      res.json({ items: books });
    } catch (fetchError) {
      console.error("Aladin API error:", fetchError);
      // API 호출 실패 시 Mock 데이터 반환
      const mockBooks = [
        {
          title: "데미안",
          author: "헤르만 헤세",
          publisher: "민음사",
          isbn: "9788937460449",
          cover: "https://via.placeholder.com/120x174"
        },
        {
          title: "어린 왕자",
          author: "앙투안 드 생텍쥐페리",
          publisher: "문학동네",
          isbn: "9788954699914",
          cover: "https://via.placeholder.com/120x174"
        },
        {
          title: "1984",
          author: "조지 오웰",
          publisher: "민음사",
          isbn: "9788937460777",
          cover: "https://via.placeholder.com/120x174"
        }
      ].filter(book => 
        book.title.toLowerCase().includes(query.toString().toLowerCase()) ||
        book.author.toLowerCase().includes(query.toString().toLowerCase())
      );
      
      res.json({ items: mockBooks });
    }
  } catch (error) {
    console.error("Book search error:", error);
    res.status(500).json({ error: "도서 검색 중 오류가 발생했습니다" });
  }
});

// Get popular books (most quoted)
router.get("/api/books/popular", async (req, res) => {
  try {
    const storage = getStorage();
    const limit = parseInt(req.query.limit as string) || 10;
    const books = await storage.getPopularBooks(limit);
    res.json(books);
  } catch (error) {
    console.error("Popular books error:", error);
    res.status(500).json({ error: "인기 책 목록을 가져오는 중 오류가 발생했습니다" });
  }
});

// Get recent books
router.get("/api/books/recent", async (req, res) => {
  try {
    const storage = getStorage();
    const limit = parseInt(req.query.limit as string) || 10;
    const books = await storage.getRecentBooks(limit);
    res.json(books);
  } catch (error) {
    console.error("Recent books error:", error);
    res.status(500).json({ error: "최근 책 목록을 가져오는 중 오류가 발생했습니다" });
  }
});

// Get author statistics
router.get("/api/books/authors", async (req, res) => {
  try {
    const storage = getStorage();
    const stats = await storage.getAuthorStats();
    res.json(stats);
  } catch (error) {
    console.error("Author stats error:", error);
    res.status(500).json({ error: "저자 통계를 가져오는 중 오류가 발생했습니다" });
  }
});

// Get sentences for a specific book
router.get("/api/books/:bookTitle/sentences", async (req, res) => {
  try {
    const storage = getStorage();
    const { bookTitle } = req.params;
    const sentences = await storage.getBookSentences(decodeURIComponent(bookTitle));
    res.json(sentences);
  } catch (error) {
    console.error("Book sentences error:", error);
    res.status(500).json({ error: "책의 문장 목록을 가져오는 중 오류가 발생했습니다" });
  }
});

// Get book statistics
router.get("/api/books/stats", async (req, res) => {
  try {
    const storage = getStorage();
    const [popular, recent, authors] = await Promise.all([
      storage.getPopularBooks(5),
      storage.getRecentBooks(5),
      storage.getAuthorStats()
    ]);
    
    res.json({
      popularBooks: popular,
      recentBooks: recent,
      topAuthors: authors.slice(0, 5)
    });
  } catch (error) {
    console.error("Book stats error:", error);
    res.status(500).json({ error: "책 통계를 가져오는 중 오류가 발생했습니다" });
  }
});

export default router;