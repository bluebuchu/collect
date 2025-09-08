import { db } from './server/db.ts';
import { users, sentences } from './shared/schema.ts';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

console.log('🌱 Seeding database...\n');

async function seed() {
  try {
    // 1. 테스트 사용자 생성
    console.log('Creating test users...');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const [demoUser] = await db.insert(users).values({
      email: 'demo@example.com',
      password: hashedPassword,
      nickname: '데모 사용자'
    }).returning();
    
    const [testUser] = await db.insert(users).values({
      email: 'test@example.com',
      password: hashedPassword,
      nickname: '테스트 사용자'
    }).returning();
    
    console.log('✅ Users created:', demoUser.email, testUser.email);
    
    // 2. 샘플 문장 추가
    console.log('\nAdding sample sentences...');
    
    const sampleSentences = [
      {
        userId: demoUser.id,
        content: '삶이 있는 한 희망은 있다.',
        bookTitle: '돈키호테',
        author: '세르반테스',
        isPublic: 1,
        likes: 42
      },
      {
        userId: demoUser.id,
        content: '겨울이 오면 봄이 멀지 않으리.',
        bookTitle: '서풍에 부치는 노래',
        author: '셸리',
        isPublic: 1,
        likes: 35
      },
      {
        userId: testUser.id,
        content: '인생은 속도가 아니라 방향이다.',
        bookTitle: '느리게 사는 것의 의미',
        author: '칼 오노레',
        isPublic: 1,
        likes: 28
      },
      {
        userId: testUser.id,
        content: '오늘 할 수 있는 일을 내일로 미루지 마라.',
        bookTitle: '벤자민 프랭클린 자서전',
        author: '벤자민 프랭클린',
        isPublic: 1,
        likes: 21
      },
      {
        userId: demoUser.id,
        content: '행복은 습관이다. 그것을 몸에 지니라.',
        bookTitle: '행복론',
        author: '알랭',
        isPublic: 1,
        likes: 18
      }
    ];
    
    for (const sentence of sampleSentences) {
      await db.insert(sentences).values(sentence);
      console.log(`✅ Added: "${sentence.content.substring(0, 30)}..."`);
    }
    
    console.log('\n🎉 Database seeding completed!');
    console.log('📝 Test accounts:');
    console.log('   - demo@example.com / demo123');
    console.log('   - test@example.com / demo123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
  
  process.exit(0);
}

seed();