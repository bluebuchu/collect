import { db, supabase } from './server/db.ts';
import { users, sentences } from './shared/schema.ts';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Supabase CRUD 테스트 시작...\n');

async function testCRUD() {
  let testUserId;
  let testSentenceId;

  try {
    // 1. CREATE - 사용자 생성
    console.log('1️⃣ 사용자 생성 테스트');
    const newUser = await db.insert(users).values({
      email: `test${Date.now()}@test.com`,
      password: 'hashedpassword123',
      nickname: '테스트유저'
    }).returning();
    
    testUserId = newUser[0].id;
    console.log('✅ 사용자 생성 성공:', newUser[0]);
    console.log('');

    // 2. READ - 사용자 조회
    console.log('2️⃣ 사용자 조회 테스트');
    const foundUser = await db.select().from(users).where(eq(users.id, testUserId));
    console.log('✅ 사용자 조회 성공:', foundUser[0]);
    console.log('');

    // 3. UPDATE - 사용자 정보 수정
    console.log('3️⃣ 사용자 정보 수정 테스트');
    const updatedUser = await db.update(users)
      .set({ bio: '테스트 사용자입니다', nickname: '수정된유저' })
      .where(eq(users.id, testUserId))
      .returning();
    console.log('✅ 사용자 수정 성공:', updatedUser[0]);
    console.log('');

    // 4. 문장 생성
    console.log('4️⃣ 문장 생성 테스트');
    const newSentence = await db.insert(sentences).values({
      userId: testUserId,
      content: '테스트 문장입니다. Supabase 연결이 잘 작동합니다!',
      bookTitle: '테스트 책',
      author: '테스트 저자',
      isPublic: 1
    }).returning();
    
    testSentenceId = newSentence[0].id;
    console.log('✅ 문장 생성 성공:', newSentence[0]);
    console.log('');

    // 5. Supabase Client로 조회 (REST API)
    console.log('5️⃣ Supabase Client REST API 테스트');
    const { data, error } = await supabase
      .from('sentences')
      .select('*, users(nickname)')
      .eq('id', testSentenceId);
    
    if (error) throw error;
    console.log('✅ Supabase REST API 조회 성공:', data);
    console.log('');

    // 6. 모든 문장 개수 확인
    console.log('6️⃣ 전체 문장 개수 조회');
    const allSentences = await db.select().from(sentences);
    console.log(`✅ 전체 문장 개수: ${allSentences.length}개`);
    console.log('');

    // 7. DELETE - 테스트 데이터 삭제
    console.log('7️⃣ 테스트 데이터 정리');
    await db.delete(sentences).where(eq(sentences.id, testSentenceId));
    console.log('✅ 문장 삭제 성공');
    
    await db.delete(users).where(eq(users.id, testUserId));
    console.log('✅ 사용자 삭제 성공');
    
    console.log('\n🎉 모든 테스트 성공!');

  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    
    // 정리 작업
    if (testSentenceId) {
      await db.delete(sentences).where(eq(sentences.id, testSentenceId)).catch(() => {});
    }
    if (testUserId) {
      await db.delete(users).where(eq(users.id, testUserId)).catch(() => {});
    }
  }

  process.exit(0);
}

testCRUD();