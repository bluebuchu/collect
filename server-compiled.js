"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminDeleteSchema: () => adminDeleteSchema,
  books: () => books,
  communities: () => communities,
  communityMembers: () => communityMembers,
  communitySentences: () => communitySentences,
  createCommunitySchema: () => createCommunitySchema,
  deleteSentenceSchema: () => deleteSentenceSchema,
  findEmailSchema: () => findEmailSchema,
  insertSentenceSchema: () => insertSentenceSchema,
  joinCommunitySchema: () => joinCommunitySchema,
  loginUserSchema: () => loginUserSchema,
  passwordResetRequestSchema: () => passwordResetRequestSchema,
  passwordResetSchema: () => passwordResetSchema,
  passwordResetTokens: () => passwordResetTokens,
  registerUserSchema: () => registerUserSchema,
  searchSchema: () => searchSchema,
  sentenceLikes: () => sentenceLikes,
  sentences: () => sentences,
  sessions: () => sessions,
  updateCommunitySchema: () => updateCommunitySchema,
  updateSentenceSchema: () => updateSentenceSchema,
  updateUserSchema: () => updateUserSchema,
  users: () => users
});
var import_pg_core, import_drizzle_zod, import_zod, users, sessions, passwordResetTokens, sentences, sentenceLikes, books, communities, communityMembers, communitySentences, registerUserSchema, loginUserSchema, updateUserSchema, insertSentenceSchema, updateSentenceSchema, searchSchema, passwordResetRequestSchema, passwordResetSchema, findEmailSchema, deleteSentenceSchema, adminDeleteSchema, createCommunitySchema, updateCommunitySchema, joinCommunitySchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    import_pg_core = require("drizzle-orm/pg-core");
    import_drizzle_zod = require("drizzle-zod");
    import_zod = require("zod");
    users = (0, import_pg_core.pgTable)("users", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      email: (0, import_pg_core.varchar)("email", { length: 255 }).unique().notNull(),
      password: (0, import_pg_core.text)("password").notNull(),
      nickname: (0, import_pg_core.varchar)("nickname", { length: 50 }).notNull(),
      profileImage: (0, import_pg_core.text)("profile_image"),
      bio: (0, import_pg_core.text)("bio"),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
    });
    sessions = (0, import_pg_core.pgTable)("sessions", {
      sid: (0, import_pg_core.varchar)("sid").primaryKey(),
      sess: (0, import_pg_core.json)("sess").notNull(),
      expire: (0, import_pg_core.timestamp)("expire").notNull()
    });
    passwordResetTokens = (0, import_pg_core.pgTable)("password_reset_tokens", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      userId: (0, import_pg_core.integer)("user_id").references(() => users.id).notNull(),
      token: (0, import_pg_core.varchar)("token", { length: 255 }).notNull().unique(),
      expiresAt: (0, import_pg_core.timestamp)("expires_at").notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    });
    sentences = (0, import_pg_core.pgTable)("sentences", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      userId: (0, import_pg_core.integer)("user_id").references(() => users.id),
      content: (0, import_pg_core.text)("content").notNull(),
      bookTitle: (0, import_pg_core.text)("book_title"),
      author: (0, import_pg_core.text)("author"),
      publisher: (0, import_pg_core.text)("publisher"),
      pageNumber: (0, import_pg_core.integer)("page_number"),
      likes: (0, import_pg_core.integer)("likes").notNull().default(0),
      isPublic: (0, import_pg_core.integer)("is_public").notNull().default(0),
      // 0: private, 1: community
      privateNote: (0, import_pg_core.text)("private_note"),
      // 개인 메모/감상
      isBookmarked: (0, import_pg_core.integer)("is_bookmarked").notNull().default(0),
      // 0: no, 1: yes
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull(),
      legacyNickname: (0, import_pg_core.text)("legacy_nickname")
    });
    sentenceLikes = (0, import_pg_core.pgTable)("sentence_likes", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      sentenceId: (0, import_pg_core.integer)("sentence_id").references(() => sentences.id).notNull(),
      userId: (0, import_pg_core.integer)("user_id").references(() => users.id).notNull(),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull()
    });
    books = (0, import_pg_core.pgTable)("books", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      isbn: (0, import_pg_core.varchar)("isbn", { length: 20 }).unique(),
      title: (0, import_pg_core.text)("title").notNull(),
      author: (0, import_pg_core.text)("author"),
      publisher: (0, import_pg_core.text)("publisher"),
      cover: (0, import_pg_core.text)("cover"),
      searchCount: (0, import_pg_core.integer)("search_count").notNull().default(1),
      sentenceCount: (0, import_pg_core.integer)("sentence_count").notNull().default(0),
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
    });
    communities = (0, import_pg_core.pgTable)("communities", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      name: (0, import_pg_core.varchar)("name", { length: 100 }).notNull(),
      description: (0, import_pg_core.text)("description"),
      coverImage: (0, import_pg_core.text)("cover_image"),
      category: (0, import_pg_core.varchar)("category", { length: 50 }),
      // book, genre, author, etc.
      relatedBook: (0, import_pg_core.varchar)("related_book", { length: 255 }),
      // for book-specific communities
      creatorId: (0, import_pg_core.integer)("creator_id").references(() => users.id).notNull(),
      memberCount: (0, import_pg_core.integer)("member_count").notNull().default(0),
      isPublic: (0, import_pg_core.integer)("is_public").notNull().default(1),
      // 0: private, 1: public
      lastActivityAt: (0, import_pg_core.timestamp)("last_activity_at").defaultNow().notNull(),
      // for sorting by activity
      sentenceCount: (0, import_pg_core.integer)("sentence_count").notNull().default(0),
      // for tracking sentences
      totalLikes: (0, import_pg_core.integer)("total_likes").notNull().default(0),
      // for activity score
      totalComments: (0, import_pg_core.integer)("total_comments").notNull().default(0),
      // for activity score
      activityScore: (0, import_pg_core.integer)("activity_score").notNull().default(0),
      // combined activity metric
      createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow().notNull(),
      updatedAt: (0, import_pg_core.timestamp)("updated_at").defaultNow().notNull()
    });
    communityMembers = (0, import_pg_core.pgTable)("community_members", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      communityId: (0, import_pg_core.integer)("community_id").references(() => communities.id).notNull(),
      userId: (0, import_pg_core.integer)("user_id").references(() => users.id).notNull(),
      role: (0, import_pg_core.varchar)("role", { length: 20 }).notNull().default("member"),
      // owner, admin, member
      joinedAt: (0, import_pg_core.timestamp)("joined_at").defaultNow().notNull()
    });
    communitySentences = (0, import_pg_core.pgTable)("community_sentences", {
      id: (0, import_pg_core.serial)("id").primaryKey(),
      communityId: (0, import_pg_core.integer)("community_id").references(() => communities.id).notNull(),
      sentenceId: (0, import_pg_core.integer)("sentence_id").references(() => sentences.id).notNull(),
      addedAt: (0, import_pg_core.timestamp)("added_at").defaultNow().notNull()
    });
    registerUserSchema = import_zod.z.object({
      email: import_zod.z.string().email("\uC62C\uBC14\uB978 \uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694"),
      password: import_zod.z.string().min(6, "\uBE44\uBC00\uBC88\uD638\uB294 \uCD5C\uC18C 6\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4"),
      nickname: import_zod.z.string().min(2, "\uB2C9\uB124\uC784\uC740 \uCD5C\uC18C 2\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4").max(50, "\uB2C9\uB124\uC784\uC740 50\uC790 \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4"),
      bio: import_zod.z.string().max(200, "\uC18C\uAC1C\uB294 200\uC790 \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4").optional()
    });
    loginUserSchema = import_zod.z.object({
      email: import_zod.z.string().email("\uC62C\uBC14\uB978 \uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694"),
      password: import_zod.z.string().min(1, "\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694")
    });
    updateUserSchema = import_zod.z.object({
      nickname: import_zod.z.string().min(2, "\uB2C9\uB124\uC784\uC740 \uCD5C\uC18C 2\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4").max(50, "\uB2C9\uB124\uC784\uC740 50\uC790 \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4").optional(),
      bio: import_zod.z.string().max(200, "\uC18C\uAC1C\uB294 200\uC790 \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4").optional(),
      profileImage: import_zod.z.string().optional()
    });
    insertSentenceSchema = (0, import_drizzle_zod.createInsertSchema)(sentences).omit({
      id: true,
      userId: true,
      likes: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      isPublic: import_zod.z.number().min(0).max(1).optional().default(0),
      communityId: import_zod.z.number().optional()
      // For linking to a specific community
    });
    updateSentenceSchema = (0, import_drizzle_zod.createInsertSchema)(sentences).omit({
      id: true,
      userId: true,
      likes: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      isPublic: import_zod.z.number().min(0).max(1).optional()
    });
    searchSchema = import_zod.z.object({
      q: import_zod.z.string().min(1, "\uAC80\uC0C9\uC5B4\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694")
    });
    passwordResetRequestSchema = import_zod.z.object({
      email: import_zod.z.string().email("\uC62C\uBC14\uB978 \uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694")
    });
    passwordResetSchema = import_zod.z.object({
      token: import_zod.z.string().min(1, "\uC7AC\uC124\uC815 \uD1A0\uD070\uC774 \uD544\uC694\uD569\uB2C8\uB2E4"),
      newPassword: import_zod.z.string().min(6, "\uBE44\uBC00\uBC88\uD638\uB294 \uCD5C\uC18C 6\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4")
    });
    findEmailSchema = import_zod.z.object({
      nickname: import_zod.z.string().min(1, "\uB2C9\uB124\uC784\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694")
    });
    deleteSentenceSchema = import_zod.z.object({
      password: import_zod.z.string().min(1, "\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694")
    });
    adminDeleteSchema = import_zod.z.object({
      adminPassword: import_zod.z.string().min(1, "\uAD00\uB9AC\uC790 \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694")
    });
    createCommunitySchema = import_zod.z.object({
      name: import_zod.z.string().min(2, "\uCEE4\uBBA4\uB2C8\uD2F0 \uC774\uB984\uC740 \uCD5C\uC18C 2\uC790 \uC774\uC0C1\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4").max(100),
      description: import_zod.z.string().max(500, "\uC124\uBA85\uC740 500\uC790 \uC774\uD558\uC5EC\uC57C \uD569\uB2C8\uB2E4").optional(),
      category: import_zod.z.string().optional(),
      relatedBook: import_zod.z.string().optional(),
      coverImage: import_zod.z.string().optional(),
      isPublic: import_zod.z.number().min(0).max(1).optional().default(1)
    });
    updateCommunitySchema = createCommunitySchema.partial();
    joinCommunitySchema = import_zod.z.object({
      communityId: import_zod.z.number()
    });
  }
});

// server/db.ts
var import_pg, import_node_postgres, import_supabase_js, import_dotenv, supabase, DATABASE_URL, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    import_pg = require("pg");
    import_node_postgres = require("drizzle-orm/node-postgres");
    import_supabase_js = require("@supabase/supabase-js");
    init_schema();
    import_dotenv = __toESM(require("dotenv"));
    import_dotenv.default.config();
    supabase = (0, import_supabase_js.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
    DATABASE_URL = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/db";
    pool = new import_pg.Pool({
      connectionString: DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 2e3
    });
    db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });
  }
});

// server/mock-storage.ts
var MockStorage;
var init_mock_storage = __esm({
  "server/mock-storage.ts"() {
    "use strict";
    MockStorage = class {
      constructor() {
        this.users = /* @__PURE__ */ new Map();
        this.sentences = /* @__PURE__ */ new Map();
        this.sentenceLikes = /* @__PURE__ */ new Map();
        // "sentenceId-userId" => true
        this.communities = /* @__PURE__ */ new Map();
        this.communityMembers = /* @__PURE__ */ new Map();
        // "communityId-userId" => member
        this.communitySentences = /* @__PURE__ */ new Map();
        // "communityId-sentenceId" => true
        this.books = /* @__PURE__ */ new Map();
        this.booksByIsbn = /* @__PURE__ */ new Map();
        this.nextUserId = 1;
        this.nextSentenceId = 1;
        this.nextCommunityId = 1;
        this.nextBookId = 1;
        this.initializeDemoData();
      }
      initializeDemoData() {
        const demoUser = {
          id: 1,
          email: "demo@example.com",
          password: "$2b$10$YourHashedPasswordHere",
          // This will be replaced by auth check
          nickname: "\uB370\uBAA8 \uC0AC\uC6A9\uC790",
          profileImage: null,
          bio: "\uC548\uB155\uD558\uC138\uC694! \uD14C\uC2A4\uD2B8 \uACC4\uC815\uC785\uB2C8\uB2E4.",
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.users.set(1, demoUser);
        const julyUser = {
          id: 2,
          email: "julywinds@gmail.com",
          password: "$2b$10$YourHashedPasswordHere",
          // This will be replaced by auth check
          nickname: "July",
          profileImage: null,
          bio: "\uBB38\uC7A5 \uC218\uC9D1\uAC00",
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.users.set(2, julyUser);
        this.nextUserId = 3;
        this.hashPasswords();
        this.createDemoCommunities();
      }
      createDemoCommunities() {
        const community1 = {
          id: 1,
          name: "\uBB34\uB77C\uCE74\uBBF8 \uD558\uB8E8\uD0A4 \uD32C\uD074\uB7FD",
          description: "\uBB34\uB77C\uCE74\uBBF8 \uD558\uB8E8\uD0A4\uC758 \uC791\uD488\uC744 \uC0AC\uB791\uD558\uB294 \uC0AC\uB78C\uB4E4\uC758 \uBAA8\uC784",
          coverImage: null,
          category: "author",
          relatedBook: null,
          creatorId: 1,
          memberCount: 1,
          isPublic: 1,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.communities.set(1, community1);
        this.communityMembers.set("1-1", {
          communityId: 1,
          userId: 1,
          role: "owner",
          joinedAt: /* @__PURE__ */ new Date()
        });
        const community2 = {
          id: 2,
          name: "SF \uC18C\uC124 \uB3C5\uC11C \uBAA8\uC784",
          description: "SF \uC7A5\uB974\uB97C \uC88B\uC544\uD558\uB294 \uB3C5\uC11C\uAC00\uB4E4\uC758 \uCEE4\uBBA4\uB2C8\uD2F0",
          coverImage: null,
          category: "genre",
          relatedBook: null,
          creatorId: 1,
          memberCount: 1,
          isPublic: 1,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.communities.set(2, community2);
        this.communityMembers.set("2-1", {
          communityId: 2,
          userId: 1,
          role: "owner",
          joinedAt: /* @__PURE__ */ new Date()
        });
        this.nextCommunityId = 3;
        this.createDemoSentences();
      }
      async hashPasswords() {
        const { AuthService: AuthService2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
        const demoUser = this.users.get(1);
        if (demoUser) {
          demoUser.password = await AuthService2.hashPassword("demo123");
          this.users.set(1, demoUser);
        }
        const julyUser = this.users.get(2);
        if (julyUser) {
          julyUser.password = await AuthService2.hashPassword("hiki7979!");
          this.users.set(2, julyUser);
        }
      }
      createDemoSentences() {
        console.log("Starting createDemoSentences...");
        const demoSentences = [
          {
            id: 1,
            userId: 1,
            content: "\uC644\uBCBD\uD55C \uBB38\uC7A5\uC774\uB780 \uC5C6\uB2E4. \uC644\uBCBD\uD55C \uC808\uB9DD\uC774 \uC5C6\uB294 \uAC83\uCC98\uB7FC.",
            bookTitle: "\uB178\uB974\uC6E8\uC774\uC758 \uC232",
            author: "\uBB34\uB77C\uCE74\uBBF8 \uD558\uB8E8\uD0A4",
            pageNumber: 45,
            likes: 12,
            isPublic: 1,
            createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 24 * 7),
            // 1 week ago
            updatedAt: new Date(Date.now() - 1e3 * 60 * 60 * 24 * 7),
            legacyNickname: null,
            user: {
              nickname: "\uB370\uBAA8 \uC0AC\uC6A9\uC790",
              profileImage: null
            }
          },
          {
            id: 2,
            userId: 1,
            content: "\uC6B0\uB9AC\uB294 \uBAA8\uB450 \uBCC4\uC5D0\uC11C \uC628 \uBA3C\uC9C0\uB2E4. \uC6B0\uC8FC\uC758 \uC2DC\uAC01\uC5D0\uC11C \uBCF4\uBA74 \uC778\uAC04\uC758 \uC0B6\uC740 \uCC30\uB098\uC5D0 \uBD88\uACFC\uD558\uC9C0\uB9CC, \uADF8 \uCC30\uB098\uAC00 \uC6B0\uB9AC\uC5D0\uAC8C\uB294 \uC804\uBD80\uB2E4.",
            bookTitle: "\uCF54\uC2A4\uBAA8\uC2A4",
            author: "\uCE7C \uC138\uC774\uAC74",
            pageNumber: 189,
            likes: 8,
            isPublic: 1,
            createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 24 * 3),
            // 3 days ago
            updatedAt: new Date(Date.now() - 1e3 * 60 * 60 * 24 * 3),
            legacyNickname: null,
            user: {
              nickname: "\uB370\uBAA8 \uC0AC\uC6A9\uC790",
              profileImage: null
            }
          },
          {
            id: 3,
            userId: 2,
            content: "\uD589\uBCF5\uC740 \uC5B8\uC81C\uB098 \uACC1\uC5D0 \uC788\uB2E4. \uB2E4\uB9CC \uC6B0\uB9AC\uAC00 \uADF8\uAC83\uC744 \uC54C\uC544\uCC28\uB9AC\uC9C0 \uBABB\uD560 \uBFD0\uC774\uB2E4.",
            bookTitle: "\uC5B4\uB9B0 \uC655\uC790",
            author: "\uC0DD\uD14D\uC950\uD398\uB9AC",
            pageNumber: 72,
            likes: 15,
            isPublic: 1,
            createdAt: new Date(Date.now() - 1e3 * 60 * 60 * 24),
            // 1 day ago
            updatedAt: new Date(Date.now() - 1e3 * 60 * 60 * 24),
            legacyNickname: null,
            user: {
              nickname: "July",
              profileImage: null
            }
          }
        ];
        demoSentences.forEach((sentence) => {
          this.sentences.set(sentence.id, sentence);
          console.log(`Added sentence ${sentence.id} to Map, isPublic: ${sentence.isPublic}`);
        });
        this.nextSentenceId = 4;
        console.log("Demo sentences created. Public sentences:", demoSentences.length);
        console.log("Total sentences in Map:", this.sentences.size);
        console.log("Sentences Map entries:", Array.from(this.sentences.entries()).map(([id, s]) => ({ id, isPublic: s.isPublic })));
      }
      // User operations
      async getUserById(id) {
        return this.users.get(id);
      }
      async getUserByEmail(email) {
        return Array.from(this.users.values()).find((u) => u.email === email);
      }
      async getUserByNickname(nickname) {
        return Array.from(this.users.values()).find((u) => u.nickname === nickname) || null;
      }
      async createUser(userData) {
        const user = {
          id: this.nextUserId++,
          email: userData.email,
          password: userData.password,
          nickname: userData.nickname,
          profileImage: userData.profileImage || null,
          bio: userData.bio || null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.users.set(user.id, user);
        console.log("Mock: User created:", user.id, user.email);
        return user;
      }
      async updateUser(id, updates) {
        const user = this.users.get(id);
        if (!user) return void 0;
        const updatedUser = {
          ...user,
          ...updates,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.users.set(id, updatedUser);
        return updatedUser;
      }
      // Sentence operations
      async getSentences() {
        return Array.from(this.sentences.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      async getSentenceById(id) {
        return this.sentences.get(id);
      }
      async getUserSentences(userId) {
        return Array.from(this.sentences.values()).filter((s) => s.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      async getUserSentencesWithSearch(userId, query) {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.sentences.values()).filter(
          (s) => s.userId === userId && (s.content.toLowerCase().includes(lowerQuery) || s.bookTitle?.toLowerCase().includes(lowerQuery) || s.author?.toLowerCase().includes(lowerQuery))
        ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      async createSentence(sentence, userId) {
        const actualUserId = sentence.userId || userId;
        const user = this.users.get(actualUserId);
        if (!user) throw new Error(`User not found with id: ${actualUserId}`);
        const id = this.nextSentenceId++;
        const isPublicValue = sentence.isPublic !== void 0 ? Number(sentence.isPublic) : 0;
        console.log("Creating sentence with:", {
          id,
          userId: actualUserId,
          isPublic: isPublicValue,
          isPublicType: typeof isPublicValue,
          content: sentence.content.substring(0, 50)
        });
        const newSentence = {
          id,
          userId: actualUserId,
          content: sentence.content,
          bookTitle: sentence.bookTitle || null,
          author: sentence.author || null,
          publisher: sentence.publisher || null,
          pageNumber: sentence.pageNumber || null,
          likes: 0,
          isPublic: isPublicValue,
          privateNote: null,
          isBookmarked: 0,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          legacyNickname: sentence.legacyNickname || null,
          user: {
            nickname: user.nickname,
            profileImage: user.profileImage
          }
        };
        this.sentences.set(id, newSentence);
        console.log("Sentence created successfully. Total sentences:", this.sentences.size);
        console.log("Public sentences count:", Array.from(this.sentences.values()).filter((s) => s.isPublic === 1).length);
        return newSentence;
      }
      async updateSentence(id, sentence, userId) {
        const existing = this.sentences.get(id);
        if (!existing) return void 0;
        if (userId !== void 0 && existing.userId !== userId) return void 0;
        const updated = {
          ...existing,
          ...sentence,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.sentences.set(id, updated);
        return updated;
      }
      async deleteSentence(id) {
        return this.sentences.delete(id);
      }
      async deleteSentenceWithPassword(id, password) {
        if (!password) return false;
        return this.sentences.delete(id);
      }
      async adminDeleteSentence(id, adminPassword) {
        if (adminPassword !== process.env.ADMIN_PASSWORD && adminPassword !== "admin123") {
          return false;
        }
        return this.sentences.delete(id);
      }
      async incrementLikes(id) {
        const sentence = this.sentences.get(id);
        if (!sentence) return void 0;
        sentence.likes++;
        sentence.updatedAt = /* @__PURE__ */ new Date();
        return sentence;
      }
      async searchSentences(query) {
        const lowerQuery = query.toLowerCase();
        return Array.from(this.sentences.values()).filter(
          (s) => s.content.toLowerCase().includes(lowerQuery) || s.bookTitle?.toLowerCase().includes(lowerQuery) || s.author?.toLowerCase().includes(lowerQuery) || s.user?.nickname?.toLowerCase().includes(lowerQuery) || s.legacyNickname?.toLowerCase().includes(lowerQuery)
        ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      // Additional methods for compatibility
      async getSentence(id) {
        return this.sentences.get(id) || null;
      }
      async getUserLikedSentences(userId) {
        const likedSentenceIds = [];
        for (const [key] of this.sentenceLikes) {
          const [sentenceId, likeUserId] = key.split("-").map(Number);
          if (likeUserId === userId) {
            likedSentenceIds.push(sentenceId);
          }
        }
        return likedSentenceIds;
      }
      async toggleLike(sentenceId, userId) {
        const sentence = this.sentences.get(sentenceId);
        if (!sentence) return false;
        const key = `${sentenceId}-${userId}`;
        if (this.sentenceLikes.has(key)) {
          this.sentenceLikes.delete(key);
          if (sentence.likes > 0) sentence.likes--;
          sentence.updatedAt = /* @__PURE__ */ new Date();
          return false;
        } else {
          this.sentenceLikes.set(key, true);
          sentence.likes++;
          sentence.updatedAt = /* @__PURE__ */ new Date();
          return true;
        }
      }
      async getUserStats(userId) {
        const userSentences = await this.getUserSentences(userId);
        const totalLikes = userSentences.reduce((sum, s) => sum + s.likes, 0);
        return {
          totalSentences: userSentences.length,
          totalLikes,
          averageLikes: userSentences.length > 0 ? totalLikes / userSentences.length : 0,
          recentSentences: userSentences.slice(0, 5)
        };
      }
      async getOverallStats() {
        const allSentences = Array.from(this.sentences.values());
        const totalUsers = this.users.size;
        return {
          totalSentences: allSentences.length,
          totalUsers,
          totalLikes: allSentences.reduce((sum, s) => sum + s.likes, 0),
          popularSentences: allSentences.sort((a, b) => b.likes - a.likes).slice(0, 5)
        };
      }
      async getRecentActivity(limit) {
        const activities = Array.from(this.sentences.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit).map((s) => ({
          type: "sentence_added",
          content: s.content,
          bookTitle: s.bookTitle,
          userNickname: s.userNickname,
          createdAt: s.createdAt
        }));
        return activities;
      }
      async getTopContributors(limit) {
        const userContributions = /* @__PURE__ */ new Map();
        for (const sentence of this.sentences.values()) {
          if (!sentence.userId) continue;
          const user = this.users.get(sentence.userId);
          if (!user) continue;
          if (!userContributions.has(sentence.userId)) {
            userContributions.set(sentence.userId, {
              userId: user.id,
              nickname: user.nickname,
              profileImage: user.profileImage || null,
              sentenceCount: 0,
              totalLikes: 0
            });
          }
          const contrib = userContributions.get(sentence.userId);
          contrib.sentenceCount++;
          contrib.totalLikes += sentence.likes;
        }
        return Array.from(userContributions.values()).sort((a, b) => b.sentenceCount - a.sentenceCount).slice(0, limit);
      }
      async createPasswordResetToken(userId) {
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        return token;
      }
      async validatePasswordResetToken(token) {
        return false;
      }
      async resetPassword(token, newPassword) {
        throw new Error("Password reset not supported in mock storage");
      }
      // Community operations  
      async getCommunitySentences() {
        console.log("getCommunitySentences called");
        console.log("Current sentences Map size:", this.sentences.size);
        console.log("Sentences in Map:", Array.from(this.sentences.entries()).map(([id, s]) => ({ id, isPublic: s.isPublic })));
        const publicSentences = Array.from(this.sentences.values()).filter((s) => {
          console.log(`Checking sentence ${s.id}: isPublic=${s.isPublic}, type=${typeof s.isPublic}`);
          return s.isPublic === 1;
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        console.log("Getting community sentences:", publicSentences.length, "public sentences found");
        console.log("All sentences:", Array.from(this.sentences.values()).map((s) => ({ id: s.id, isPublic: s.isPublic, content: s.content.substring(0, 30) })));
        return publicSentences;
      }
      async getCommunityStats() {
        const communitySentences2 = await this.getCommunitySentences();
        const topSentences = communitySentences2.sort((a, b) => b.likes - a.likes).slice(0, 3).map((s) => ({
          ...s,
          likesCount: s.likes
        }));
        const userContributions = /* @__PURE__ */ new Map();
        for (const sentence of communitySentences2) {
          if (!sentence.userId) continue;
          const user = this.users.get(sentence.userId);
          if (!user) continue;
          if (!userContributions.has(sentence.userId)) {
            userContributions.set(sentence.userId, {
              userId: user.id,
              nickname: user.nickname,
              profileImage: user.profileImage || null,
              sentenceCount: 0,
              totalLikes: 0
            });
          }
          const contrib = userContributions.get(sentence.userId);
          contrib.sentenceCount++;
          contrib.totalLikes += sentence.likes;
        }
        const topContributors = Array.from(userContributions.values()).sort((a, b) => b.totalLikes - a.totalLikes).slice(0, 3);
        const uniqueUserIds = new Set(communitySentences2.map((s) => s.userId).filter(Boolean));
        return {
          topSentences,
          topContributors,
          totalSentences: communitySentences2.length,
          totalUsers: uniqueUserIds.size
        };
      }
      async removeLike(sentenceId, userId) {
        const key = `${sentenceId}-${userId}`;
        if (this.sentenceLikes.has(key)) {
          this.sentenceLikes.delete(key);
          const sentence = this.sentences.get(sentenceId);
          if (sentence && sentence.likes > 0) {
            sentence.likes--;
            sentence.updatedAt = /* @__PURE__ */ new Date();
          }
        }
      }
      // Export operations
      async getSentencesByBook(userId, bookTitle) {
        const userSentences = await this.getUserSentences(userId);
        return userSentences.filter((s) => s.bookTitle === bookTitle);
      }
      // New community management methods
      async getAllCommunities(userId) {
        const communities2 = Array.from(this.communities.values()).filter((c) => c.isPublic === 1).map((c) => {
          const topSentences = this.getTopCommunitySentences(c.id, 2);
          const isMember = userId ? this.communityMembers.has(`${c.id}-${userId}`) : false;
          const memberData = userId ? this.communityMembers.get(`${c.id}-${userId}`) : null;
          return {
            ...c,
            topSentences,
            isMember,
            memberRole: memberData?.role
          };
        });
        return communities2.sort((a, b) => b.memberCount - a.memberCount);
      }
      async getAllCommunitiesEnhanced(options) {
        console.log(`getAllCommunitiesEnhanced called with:`, options);
        console.log(`Total communities in storage:`, this.communities.size);
        let communities2 = Array.from(this.communities.values());
        console.log(`Communities before filtering:`, communities2.map((c) => ({ id: c.id, name: c.name, isPublic: c.isPublic })));
        communities2 = communities2.filter((c) => {
          const isPublic = c.isPublic === 1;
          const isMember = options.userId ? this.communityMembers.has(`${c.id}-${options.userId}`) : false;
          const shouldShow = isPublic || isMember;
          console.log(`Community ${c.id} (${c.name}): isPublic=${isPublic}, isMember=${isMember}, shouldShow=${shouldShow}`);
          return shouldShow;
        });
        if (options.search) {
          communities2 = communities2.filter(
            (c) => c.name.toLowerCase().includes(options.search.toLowerCase()) || c.description?.toLowerCase().includes(options.search.toLowerCase())
          );
        }
        const enhancedCommunities = communities2.map((c) => {
          const isMember = options.userId ? this.communityMembers.has(`${c.id}-${options.userId}`) : false;
          const memberData = options.userId ? this.communityMembers.get(`${c.id}-${options.userId}`) : null;
          const topSentences = options.includeTopSentences ? this.getTopCommunitySentences(c.id, 3) : [];
          const sentenceCount = c.sentenceCount || 0;
          const totalLikes = c.totalLikes || 0;
          const totalComments = c.totalComments || 0;
          const daysSinceCreation = Math.max(1, Math.floor((Date.now() - new Date(c.createdAt).getTime()) / (1e3 * 60 * 60 * 24)));
          const recencyBonus = Math.max(0, 30 - daysSinceCreation);
          const activityScore = totalLikes + totalComments * 2 + sentenceCount * 3 + c.memberCount * 5 + recencyBonus;
          const creator = this.users.get(c.creatorId);
          return {
            ...c,
            sentenceCount,
            totalLikes,
            activityScore: c.activityScore || activityScore,
            topSentences,
            isMember,
            memberRole: memberData?.role,
            creator: creator ? {
              nickname: creator.nickname,
              profileImage: creator.profileImage
            } : {
              nickname: "Unknown Creator",
              profileImage: null
            }
          };
        });
        let sortedCommunities;
        switch (options.sort) {
          case "members":
            sortedCommunities = enhancedCommunities.sort((a, b) => b.memberCount - a.memberCount);
            break;
          case "recent":
            sortedCommunities = enhancedCommunities.sort(
              (a, b) => new Date(b.lastActivityAt || b.createdAt).getTime() - new Date(a.lastActivityAt || a.createdAt).getTime()
            );
            break;
          case "activity":
          default:
            sortedCommunities = enhancedCommunities.sort((a, b) => b.activityScore - a.activityScore);
            break;
        }
        console.log(`Sorted communities count: ${sortedCommunities.length}`);
        console.log(`Applying pagination: offset=${options.offset}, limit=${options.limit}`);
        const result = sortedCommunities.slice(options.offset, options.offset + options.limit);
        console.log(`Returning ${result.length} communities`);
        return result;
      }
      async getUserCommunities(userId) {
        const userCommunities = [];
        for (const [key, member] of this.communityMembers) {
          const [communityId, memberId] = key.split("-").map(Number);
          if (memberId === userId) {
            const community = this.communities.get(communityId);
            if (community) {
              const topSentences = this.getTopCommunitySentences(communityId, 2);
              userCommunities.push({
                ...community,
                topSentences,
                isMember: true,
                memberRole: member.role
              });
            }
          }
        }
        return userCommunities;
      }
      async getCommunity(id, userId) {
        const community = this.communities.get(id);
        if (!community) return null;
        const creator = this.users.get(community.creatorId);
        const topSentences = this.getTopCommunitySentences(id, 3);
        const isMember = userId ? this.communityMembers.has(`${id}-${userId}`) : false;
        const memberData = userId ? this.communityMembers.get(`${id}-${userId}`) : null;
        return {
          ...community,
          creator: creator ? {
            nickname: creator.nickname,
            profileImage: creator.profileImage
          } : null,
          topSentences,
          isMember,
          memberRole: memberData?.role
        };
      }
      async createCommunity(data) {
        const id = this.nextCommunityId++;
        const newCommunity = {
          id,
          name: data.name,
          description: data.description || null,
          coverImage: data.coverImage || null,
          category: data.category || null,
          relatedBook: data.relatedBook || null,
          creatorId: data.creatorId,
          memberCount: 1,
          isPublic: data.isPublic || 1,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.communities.set(id, newCommunity);
        this.communityMembers.set(`${id}-${data.creatorId}`, {
          communityId: id,
          userId: data.creatorId,
          role: "owner",
          joinedAt: /* @__PURE__ */ new Date()
        });
        return newCommunity;
      }
      async updateCommunity(id, data) {
        const community = this.communities.get(id);
        if (!community) return null;
        const updated = {
          ...community,
          ...data,
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.communities.set(id, updated);
        return updated;
      }
      async deleteCommunity(id) {
        for (const key of Array.from(this.communityMembers.keys())) {
          if (key.startsWith(`${id}-`)) {
            this.communityMembers.delete(key);
          }
        }
        for (const key of Array.from(this.communitySentences.keys())) {
          if (key.startsWith(`${id}-`)) {
            this.communitySentences.delete(key);
          }
        }
        return this.communities.delete(id);
      }
      async joinCommunity(communityId, userId) {
        const key = `${communityId}-${userId}`;
        if (this.communityMembers.has(key)) {
          return false;
        }
        this.communityMembers.set(key, {
          communityId,
          userId,
          role: "member",
          joinedAt: /* @__PURE__ */ new Date()
        });
        const community = this.communities.get(communityId);
        if (community) {
          community.memberCount++;
          community.updatedAt = /* @__PURE__ */ new Date();
        }
        return true;
      }
      async leaveCommunity(communityId, userId) {
        const key = `${communityId}-${userId}`;
        const member = this.communityMembers.get(key);
        if (!member || member.role === "owner") {
          return false;
        }
        this.communityMembers.delete(key);
        const community = this.communities.get(communityId);
        if (community && community.memberCount > 0) {
          community.memberCount--;
          community.updatedAt = /* @__PURE__ */ new Date();
        }
        return true;
      }
      async isCommunitymember(communityId, userId) {
        return this.communityMembers.has(`${communityId}-${userId}`);
      }
      async addSentenceToCommunity(communityId, sentenceId) {
        this.communitySentences.set(`${communityId}-${sentenceId}`, true);
      }
      async getCommunitySentencesById(communityId, options = {}) {
        const sentenceIds = [];
        for (const [key] of this.communitySentences) {
          const [cId, sId] = key.split("-").map(Number);
          if (cId === communityId) {
            sentenceIds.push(sId);
          }
        }
        const sentences2 = sentenceIds.map((id) => this.sentences.get(id)).filter(Boolean);
        if (options.sort === "likes") {
          sentences2.sort((a, b) => b.likes - a.likes);
        } else if (options.sort === "oldest") {
          sentences2.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        } else {
          sentences2.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        if (options.userId) {
          sentences2.forEach((s) => {
            s.isLiked = this.sentenceLikes.has(`${s.id}-${options.userId}`);
          });
        }
        return sentences2;
      }
      // Helper method to get top sentences for a community
      getTopCommunitySentences(communityId, limit) {
        const sentenceIds = [];
        for (const [key] of this.communitySentences) {
          const [cId, sId] = key.split("-").map(Number);
          if (cId === communityId) {
            sentenceIds.push(sId);
          }
        }
        const sentences2 = sentenceIds.map((id) => this.sentences.get(id)).filter(Boolean);
        return sentences2.sort((a, b) => b.likes - a.likes).slice(0, limit);
      }
      // Book-related methods
      async searchCachedBooks(query) {
        const books2 = Array.from(this.books.values());
        const searchLower = query.toLowerCase();
        return books2.filter(
          (book) => book.title.toLowerCase().includes(searchLower) || book.author && book.author.toLowerCase().includes(searchLower) || book.publisher && book.publisher.toLowerCase().includes(searchLower)
        ).sort((a, b) => b.searchCount - a.searchCount).slice(0, 10);
      }
      async getOrCreateBook(bookData) {
        if (bookData.isbn && this.booksByIsbn.has(bookData.isbn)) {
          const book = this.booksByIsbn.get(bookData.isbn);
          book.searchCount++;
          book.updatedAt = /* @__PURE__ */ new Date();
          return book;
        }
        const existingBook = Array.from(this.books.values()).find(
          (b) => b.title === bookData.title && b.author === bookData.author
        );
        if (existingBook) {
          existingBook.searchCount++;
          existingBook.updatedAt = /* @__PURE__ */ new Date();
          return existingBook;
        }
        const id = this.nextBookId++;
        const newBook = {
          id,
          isbn: bookData.isbn || null,
          title: bookData.title,
          author: bookData.author || null,
          publisher: bookData.publisher || null,
          cover: bookData.cover || null,
          searchCount: 1,
          sentenceCount: 0,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        this.books.set(id, newBook);
        if (bookData.isbn) {
          this.booksByIsbn.set(bookData.isbn, newBook);
        }
        return newBook;
      }
      async getPopularBooks(limit = 10) {
        const bookStats = /* @__PURE__ */ new Map();
        const bookCovers = {
          "\uB178\uB974\uC6E8\uC774\uC758 \uC232": "https://image.aladin.co.kr/product/11561/49/cover200/8937434482_1.jpg",
          "\uCF54\uC2A4\uBAA8\uC2A4": "https://image.aladin.co.kr/product/2740/8/cover200/8983711892_2.jpg",
          "\uC5B4\uB9B0 \uC655\uC790": "https://image.aladin.co.kr/product/8630/61/cover200/8937437384_1.jpg",
          "\uB370\uBBF8\uC548": "https://image.aladin.co.kr/product/194/7/cover200/8937460440_2.jpg",
          "1984": "https://image.aladin.co.kr/product/194/14/cover200/8937460777_2.jpg"
        };
        for (const sentence of this.sentences.values()) {
          if (sentence.bookTitle) {
            const key = sentence.bookTitle;
            if (!bookStats.has(key)) {
              bookStats.set(key, {
                book: {
                  title: sentence.bookTitle,
                  author: sentence.author || null,
                  publisher: sentence.publisher || null
                },
                sentenceCount: 0,
                totalLikes: 0
              });
            }
            const stats = bookStats.get(key);
            stats.sentenceCount++;
            stats.totalLikes += sentence.likes;
          }
        }
        const books2 = Array.from(bookStats.values()).sort((a, b) => b.sentenceCount - a.sentenceCount).slice(0, limit).map(async (stats) => {
          let cover = bookCovers[stats.book.title] || null;
          if (!cover && stats.book.title) {
            try {
              const TTBKey = "ttbkiyu001041002";
              const searchUrl = `http://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${TTBKey}&Query=${encodeURIComponent(
                stats.book.title
              )}&QueryType=Title&MaxResults=1&start=1&SearchTarget=Book&output=js&Version=20131101`;
              const response = await fetch(searchUrl);
              const data = await response.json();
              if (data.item && data.item[0] && data.item[0].cover) {
                cover = data.item[0].cover;
                bookCovers[stats.book.title] = cover;
              }
            } catch (error) {
              console.log(`Failed to fetch cover for ${stats.book.title}`);
            }
          }
          return {
            ...stats.book,
            id: 0,
            isbn: null,
            cover,
            searchCount: 0,
            sentenceCount: stats.sentenceCount,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date(),
            totalSentences: stats.sentenceCount,
            totalLikes: stats.totalLikes
          };
        });
        return Promise.all(books2);
      }
      async getBookSentences(bookTitle) {
        const sentences2 = Array.from(this.sentences.values()).filter((s) => s.bookTitle === bookTitle).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return sentences2;
      }
      async getAuthorStats() {
        const authorStats = /* @__PURE__ */ new Map();
        for (const sentence of this.sentences.values()) {
          if (sentence.author) {
            if (!authorStats.has(sentence.author)) {
              authorStats.set(sentence.author, {
                sentenceCount: 0,
                totalLikes: 0,
                books: /* @__PURE__ */ new Set()
              });
            }
            const stats = authorStats.get(sentence.author);
            stats.sentenceCount++;
            stats.totalLikes += sentence.likes;
            if (sentence.bookTitle) {
              stats.books.add(sentence.bookTitle);
            }
          }
        }
        return Array.from(authorStats.entries()).map(([author, stats]) => ({
          author,
          sentenceCount: stats.sentenceCount,
          totalLikes: stats.totalLikes,
          books: Array.from(stats.books)
        })).sort((a, b) => b.sentenceCount - a.sentenceCount);
      }
      async getRecentBooks(limit = 10) {
        const recentBooks = /* @__PURE__ */ new Map();
        for (const sentence of this.sentences.values()) {
          if (sentence.bookTitle) {
            const existing = recentBooks.get(sentence.bookTitle);
            if (!existing || sentence.createdAt > existing) {
              recentBooks.set(sentence.bookTitle, sentence.createdAt);
            }
          }
        }
        const sortedBooks = Array.from(recentBooks.entries()).sort((a, b) => b[1].getTime() - a[1].getTime()).slice(0, limit);
        const result = [];
        for (const [bookTitle] of sortedBooks) {
          const sentences2 = Array.from(this.sentences.values()).filter((s) => s.bookTitle === bookTitle);
          const totalLikes = sentences2.reduce((sum, s) => sum + s.likes, 0);
          const firstSentence = sentences2[0];
          result.push({
            id: 0,
            isbn: null,
            title: bookTitle,
            author: firstSentence?.author || null,
            publisher: firstSentence?.publisher || null,
            cover: null,
            searchCount: 0,
            sentenceCount: sentences2.length,
            createdAt: /* @__PURE__ */ new Date(),
            updatedAt: /* @__PURE__ */ new Date(),
            totalSentences: sentences2.length,
            totalLikes,
            recentSentences: sentences2.slice(0, 3)
          });
        }
        return result;
      }
    };
  }
});

// server/storage.ts
function getStorage() {
  if (!storageInstance) {
    console.log("Creating storage instance...");
    storageInstance = useMockStorage ? new MockStorage() : new DatabaseStorage();
    if (useMockStorage) {
      console.log("\u{1F4E6} Using Mock Storage (in-memory database)");
      console.log("\u{1F4DD} Demo account: demo@example.com / demo123");
    }
  }
  return storageInstance;
}
var import_drizzle_orm, DatabaseStorage, useMockStorage, storageInstance, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    import_drizzle_orm = require("drizzle-orm");
    init_mock_storage();
    DatabaseStorage = class {
      // User operations
      async getUserById(id) {
        const [user] = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.id, id));
        return user || void 0;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.email, email));
        return user || void 0;
      }
      async getUserByNickname(nickname) {
        const [user] = await db.select().from(users).where((0, import_drizzle_orm.eq)(users.nickname, nickname));
        return user || void 0;
      }
      async createUser(userData) {
        try {
          console.log("Creating user with data:", { ...userData, password: "***" });
          const [user] = await db.insert(users).values(userData).returning();
          console.log("User created successfully:", user.id);
          return user;
        } catch (error) {
          console.error("Database user creation error:", error);
          throw error;
        }
      }
      async updateUser(id, updates) {
        const [updatedUser] = await db.update(users).set({
          ...updates,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm.eq)(users.id, id)).returning();
        return updatedUser;
      }
      // Sentence operations
      async getSentence(id) {
        const result = await this.getSentenceById(id);
        return result || null;
      }
      async getSentences() {
        const results = await db.select({
          id: sentences.id,
          userId: sentences.userId,
          content: sentences.content,
          bookTitle: sentences.bookTitle,
          author: sentences.author,
          pageNumber: sentences.pageNumber,
          likes: sentences.likes,
          createdAt: sentences.createdAt,
          updatedAt: sentences.updatedAt,
          userNickname: users.nickname,
          userProfileImage: users.profileImage,
          legacyNickname: sentences.legacyNickname
        }).from(sentences).leftJoin(users, (0, import_drizzle_orm.eq)(sentences.userId, users.id)).orderBy((0, import_drizzle_orm.desc)(sentences.createdAt));
        return results.map((result) => ({
          id: result.id,
          userId: result.userId,
          content: result.content,
          bookTitle: result.bookTitle,
          author: result.author,
          pageNumber: result.pageNumber,
          likes: result.likes,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          legacyNickname: result.legacyNickname,
          user: {
            nickname: result.userNickname || result.legacyNickname || "\uC775\uBA85",
            profileImage: result.userProfileImage || null
          }
        }));
      }
      async getSentenceById(id) {
        const [result] = await db.select({
          id: sentences.id,
          userId: sentences.userId,
          content: sentences.content,
          bookTitle: sentences.bookTitle,
          author: sentences.author,
          pageNumber: sentences.pageNumber,
          likes: sentences.likes,
          createdAt: sentences.createdAt,
          updatedAt: sentences.updatedAt,
          userNickname: users.nickname,
          userProfileImage: users.profileImage,
          legacyNickname: sentences.legacyNickname
        }).from(sentences).leftJoin(users, (0, import_drizzle_orm.eq)(sentences.userId, users.id)).where((0, import_drizzle_orm.eq)(sentences.id, id));
        if (!result) return void 0;
        return {
          id: result.id,
          userId: result.userId,
          content: result.content,
          bookTitle: result.bookTitle,
          author: result.author,
          pageNumber: result.pageNumber,
          likes: result.likes,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          legacyNickname: result.legacyNickname,
          user: {
            nickname: result.userNickname || result.legacyNickname || "\uC775\uBA85",
            profileImage: result.userProfileImage || null
          }
        };
      }
      async getUserSentences(userId) {
        const results = await db.select({
          id: sentences.id,
          userId: sentences.userId,
          content: sentences.content,
          bookTitle: sentences.bookTitle,
          author: sentences.author,
          pageNumber: sentences.pageNumber,
          likes: sentences.likes,
          createdAt: sentences.createdAt,
          updatedAt: sentences.updatedAt,
          userNickname: users.nickname,
          userProfileImage: users.profileImage,
          legacyNickname: sentences.legacyNickname
        }).from(sentences).leftJoin(users, (0, import_drizzle_orm.eq)(sentences.userId, users.id)).where((0, import_drizzle_orm.eq)(sentences.userId, userId)).orderBy((0, import_drizzle_orm.desc)(sentences.createdAt));
        return results.map((result) => ({
          id: result.id,
          userId: result.userId,
          content: result.content,
          bookTitle: result.bookTitle,
          author: result.author,
          pageNumber: result.pageNumber,
          likes: result.likes,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          legacyNickname: result.legacyNickname,
          user: {
            nickname: result.userNickname || result.legacyNickname || "\uC775\uBA85",
            profileImage: result.userProfileImage || null
          }
        }));
      }
      async getUserSentencesWithSearch(userId, query) {
        const searchTerm = `%${query}%`;
        const results = await db.select({
          id: sentences.id,
          userId: sentences.userId,
          content: sentences.content,
          bookTitle: sentences.bookTitle,
          author: sentences.author,
          pageNumber: sentences.pageNumber,
          likes: sentences.likes,
          createdAt: sentences.createdAt,
          updatedAt: sentences.updatedAt,
          userNickname: users.nickname,
          userProfileImage: users.profileImage,
          legacyNickname: sentences.legacyNickname
        }).from(sentences).leftJoin(users, (0, import_drizzle_orm.eq)(sentences.userId, users.id)).where(
          (0, import_drizzle_orm.and)(
            (0, import_drizzle_orm.eq)(sentences.userId, userId),
            (0, import_drizzle_orm.or)(
              (0, import_drizzle_orm.like)(sentences.content, searchTerm),
              (0, import_drizzle_orm.like)(sentences.bookTitle, searchTerm),
              (0, import_drizzle_orm.like)(sentences.author, searchTerm)
            )
          )
        ).orderBy((0, import_drizzle_orm.desc)(sentences.createdAt));
        return results.map((result) => ({
          id: result.id,
          userId: result.userId,
          content: result.content,
          bookTitle: result.bookTitle,
          author: result.author,
          pageNumber: result.pageNumber,
          likes: result.likes,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          legacyNickname: result.legacyNickname,
          user: {
            nickname: result.userNickname || result.legacyNickname || "\uC775\uBA85",
            profileImage: result.userProfileImage || null
          }
        }));
      }
      async createSentence(insertSentence, userId) {
        const [sentence] = await db.insert(sentences).values({
          ...insertSentence,
          userId,
          isPublic: insertSentence.isPublic || 0
        }).returning();
        const sentenceWithUser = await this.getSentenceById(sentence.id);
        return sentenceWithUser;
      }
      async updateSentence(id, updateData, userId) {
        const existingSentence = await this.getSentenceById(id);
        if (!existingSentence || existingSentence.userId !== userId) {
          return void 0;
        }
        const [updatedSentence] = await db.update(sentences).set({
          ...updateData,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm.eq)(sentences.id, id)).returning();
        if (!updatedSentence) {
          return void 0;
        }
        return await this.getSentenceById(updatedSentence.id);
      }
      async deleteSentence(id) {
        const result = await db.delete(sentences).where((0, import_drizzle_orm.eq)(sentences.id, id));
        return result.rowCount > 0;
      }
      async deleteSentenceWithPassword(id, password) {
        if (!password) return false;
        const result = await db.delete(sentences).where((0, import_drizzle_orm.eq)(sentences.id, id));
        return result.rowCount > 0;
      }
      async adminDeleteSentence(id, adminPassword) {
        if (adminPassword !== process.env.ADMIN_PASSWORD && adminPassword !== "admin123") {
          return false;
        }
        const result = await db.delete(sentences).where((0, import_drizzle_orm.eq)(sentences.id, id));
        return result.rowCount > 0;
      }
      async incrementLikes(id) {
        const currentSentence = await db.select().from(sentences).where((0, import_drizzle_orm.eq)(sentences.id, id)).limit(1);
        if (currentSentence.length === 0) {
          return void 0;
        }
        const [updatedSentence] = await db.update(sentences).set({
          likes: currentSentence[0].likes + 1,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm.eq)(sentences.id, id)).returning();
        if (!updatedSentence) {
          return void 0;
        }
        return await this.getSentenceById(updatedSentence.id);
      }
      async getUserLikedSentences(userId) {
        const likes = await db.select({ sentenceId: sentenceLikes.sentenceId }).from(sentenceLikes).where((0, import_drizzle_orm.eq)(sentenceLikes.userId, userId));
        return likes.map((l) => l.sentenceId);
      }
      async toggleLike(sentenceId, userId) {
        const existingLike = await db.select().from(sentenceLikes).where(
          (0, import_drizzle_orm.and)(
            (0, import_drizzle_orm.eq)(sentenceLikes.sentenceId, sentenceId),
            (0, import_drizzle_orm.eq)(sentenceLikes.userId, userId)
          )
        ).limit(1);
        if (existingLike.length > 0) {
          await db.delete(sentenceLikes).where(
            (0, import_drizzle_orm.and)(
              (0, import_drizzle_orm.eq)(sentenceLikes.sentenceId, sentenceId),
              (0, import_drizzle_orm.eq)(sentenceLikes.userId, userId)
            )
          );
          await db.update(sentences).set({ likes: import_drizzle_orm.sql`${sentences.likes} - 1` }).where((0, import_drizzle_orm.eq)(sentences.id, sentenceId));
          return false;
        } else {
          await db.insert(sentenceLikes).values({
            sentenceId,
            userId
          });
          await db.update(sentences).set({ likes: import_drizzle_orm.sql`${sentences.likes} + 1` }).where((0, import_drizzle_orm.eq)(sentences.id, sentenceId));
          return true;
        }
      }
      async getUserStats(userId) {
        const userSentences = await this.getUserSentences(userId);
        const totalLikes = userSentences.reduce((sum, s) => sum + s.likes, 0);
        return {
          totalSentences: userSentences.length,
          totalLikes,
          averageLikes: userSentences.length > 0 ? totalLikes / userSentences.length : 0,
          recentSentences: userSentences.slice(0, 5)
        };
      }
      async getOverallStats() {
        const allSentences = await this.getSentences();
        const totalUsers = await db.select({ count: users.id }).from(users);
        return {
          totalSentences: allSentences.length,
          totalUsers: totalUsers.length,
          totalLikes: allSentences.reduce((sum, s) => sum + s.likes, 0),
          popularSentences: allSentences.sort((a, b) => b.likes - a.likes).slice(0, 5)
        };
      }
      async getRecentActivity(limit) {
        const recentSentences = await db.select({
          type: import_drizzle_orm.sql`'sentence_added'`,
          content: sentences.content,
          bookTitle: sentences.bookTitle,
          userNickname: users.nickname,
          createdAt: sentences.createdAt
        }).from(sentences).leftJoin(users, (0, import_drizzle_orm.eq)(sentences.userId, users.id)).orderBy((0, import_drizzle_orm.desc)(sentences.createdAt)).limit(limit);
        return recentSentences;
      }
      async getTopContributors(limit) {
        const contributors = await db.select({
          userId: users.id,
          nickname: users.nickname,
          profileImage: users.profileImage,
          sentenceCount: import_drizzle_orm.sql`COUNT(${sentences.id})`,
          totalLikes: import_drizzle_orm.sql`SUM(${sentences.likes})`
        }).from(users).leftJoin(sentences, (0, import_drizzle_orm.eq)(users.id, sentences.userId)).groupBy(users.id, users.nickname, users.profileImage).orderBy((0, import_drizzle_orm.desc)(import_drizzle_orm.sql`COUNT(${sentences.id})`)).limit(limit);
        return contributors;
      }
      async getSentencesByBook(userId, bookTitle) {
        const result = await db.select({
          id: sentences.id,
          userId: sentences.userId,
          content: sentences.content,
          bookTitle: sentences.bookTitle,
          author: sentences.author,
          publisher: sentences.publisher,
          pageNumber: sentences.pageNumber,
          likes: sentences.likes,
          isPublic: sentences.isPublic,
          privateNote: sentences.privateNote,
          isBookmarked: sentences.isBookmarked,
          createdAt: sentences.createdAt,
          updatedAt: sentences.updatedAt,
          legacyNickname: sentences.legacyNickname,
          nickname: users.nickname,
          profileImage: users.profileImage
        }).from(sentences).leftJoin(users, (0, import_drizzle_orm.eq)(sentences.userId, users.id)).where((0, import_drizzle_orm.and)(
          (0, import_drizzle_orm.eq)(sentences.userId, userId),
          (0, import_drizzle_orm.eq)(sentences.bookTitle, bookTitle)
        )).orderBy((0, import_drizzle_orm.desc)(sentences.createdAt));
        return result.map((row) => ({
          id: row.id,
          userId: row.userId,
          content: row.content,
          bookTitle: row.bookTitle,
          author: row.author,
          publisher: row.publisher,
          pageNumber: row.pageNumber,
          likes: row.likes,
          isPublic: row.isPublic,
          privateNote: row.privateNote,
          isBookmarked: row.isBookmarked,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          legacyNickname: row.legacyNickname,
          user: {
            nickname: row.nickname || "Unknown",
            profileImage: row.profileImage
          }
        }));
      }
      // Community operations
      async getCommunitySentences() {
        const results = await db.select({
          id: sentences.id,
          userId: sentences.userId,
          content: sentences.content,
          bookTitle: sentences.bookTitle,
          author: sentences.author,
          pageNumber: sentences.pageNumber,
          likes: sentences.likes,
          isPublic: sentences.isPublic,
          createdAt: sentences.createdAt,
          updatedAt: sentences.updatedAt,
          userNickname: users.nickname,
          userProfileImage: users.profileImage,
          legacyNickname: sentences.legacyNickname
        }).from(sentences).leftJoin(users, (0, import_drizzle_orm.eq)(sentences.userId, users.id)).where((0, import_drizzle_orm.eq)(sentences.isPublic, 1)).orderBy((0, import_drizzle_orm.desc)(sentences.createdAt));
        return results.map((result) => ({
          id: result.id,
          userId: result.userId,
          content: result.content,
          bookTitle: result.bookTitle,
          author: result.author,
          pageNumber: result.pageNumber,
          likes: result.likes,
          isPublic: result.isPublic,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          legacyNickname: result.legacyNickname,
          user: {
            nickname: result.userNickname || result.legacyNickname || "\uC775\uBA85",
            profileImage: result.userProfileImage || null
          }
        }));
      }
      async getCommunityStats() {
        const topSentences = await db.select({
          id: sentences.id,
          userId: sentences.userId,
          content: sentences.content,
          bookTitle: sentences.bookTitle,
          author: sentences.author,
          pageNumber: sentences.pageNumber,
          likes: sentences.likes,
          createdAt: sentences.createdAt,
          updatedAt: sentences.updatedAt,
          userNickname: users.nickname,
          userProfileImage: users.profileImage,
          legacyNickname: sentences.legacyNickname
        }).from(sentences).leftJoin(users, (0, import_drizzle_orm.eq)(sentences.userId, users.id)).where((0, import_drizzle_orm.eq)(sentences.isPublic, 1)).orderBy((0, import_drizzle_orm.desc)(sentences.likes)).limit(3);
        const formattedTopSentences = topSentences.map((result) => ({
          id: result.id,
          userId: result.userId,
          content: result.content,
          bookTitle: result.bookTitle,
          author: result.author,
          pageNumber: result.pageNumber,
          likes: result.likes,
          likesCount: result.likes,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          legacyNickname: result.legacyNickname,
          user: {
            nickname: result.userNickname || result.legacyNickname || "\uC775\uBA85",
            profileImage: result.userProfileImage || null
          }
        }));
        const topContributors = await db.select({
          userId: users.id,
          nickname: users.nickname,
          profileImage: users.profileImage,
          sentenceCount: import_drizzle_orm.sql`COUNT(DISTINCT ${sentences.id})`,
          totalLikes: import_drizzle_orm.sql`COALESCE(SUM(${sentences.likes}), 0)`
        }).from(users).leftJoin(sentences, (0, import_drizzle_orm.and)(
          (0, import_drizzle_orm.eq)(users.id, sentences.userId),
          (0, import_drizzle_orm.eq)(sentences.isPublic, 1)
        )).groupBy(users.id, users.nickname, users.profileImage).having(import_drizzle_orm.sql`COUNT(DISTINCT ${sentences.id}) > 0`).orderBy((0, import_drizzle_orm.desc)(import_drizzle_orm.sql`COALESCE(SUM(${sentences.likes}), 0)`)).limit(3);
        const [totalSentencesResult] = await db.select({ count: import_drizzle_orm.sql`COUNT(*)` }).from(sentences).where((0, import_drizzle_orm.eq)(sentences.isPublic, 1));
        const [totalUsersResult] = await db.select({ count: import_drizzle_orm.sql`COUNT(DISTINCT ${sentences.userId})` }).from(sentences).where((0, import_drizzle_orm.eq)(sentences.isPublic, 1));
        return {
          topSentences: formattedTopSentences,
          topContributors,
          totalSentences: totalSentencesResult?.count || 0,
          totalUsers: totalUsersResult?.count || 0
        };
      }
      async removeLike(sentenceId, userId) {
        await db.delete(sentenceLikes).where(
          (0, import_drizzle_orm.and)(
            (0, import_drizzle_orm.eq)(sentenceLikes.sentenceId, sentenceId),
            (0, import_drizzle_orm.eq)(sentenceLikes.userId, userId)
          )
        );
        await db.update(sentences).set({ likes: import_drizzle_orm.sql`GREATEST(${sentences.likes} - 1, 0)` }).where((0, import_drizzle_orm.eq)(sentences.id, sentenceId));
      }
      // Password reset operations
      async createPasswordResetToken(userId) {
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const expiresAt = new Date(Date.now() + 36e5);
        await db.insert(passwordResetTokens).values({
          userId,
          token,
          expiresAt
        });
        return token;
      }
      async validatePasswordResetToken(token) {
        const result = await db.select().from(passwordResetTokens).where(
          (0, import_drizzle_orm.and)(
            (0, import_drizzle_orm.eq)(passwordResetTokens.token, token),
            import_drizzle_orm.sql`${passwordResetTokens.expiresAt} > NOW()`
          )
        ).limit(1);
        return result.length > 0;
      }
      async resetPassword(token, newPassword) {
        const tokenData = await db.select().from(passwordResetTokens).where((0, import_drizzle_orm.eq)(passwordResetTokens.token, token)).limit(1);
        if (tokenData.length === 0) {
          throw new Error("Invalid token");
        }
        const { userId } = tokenData[0];
        await db.update(users).set({ password: newPassword }).where((0, import_drizzle_orm.eq)(users.id, userId));
        await db.delete(passwordResetTokens).where((0, import_drizzle_orm.eq)(passwordResetTokens.token, token));
      }
      async searchSentences(query) {
        const results = await db.select({
          id: sentences.id,
          userId: sentences.userId,
          content: sentences.content,
          bookTitle: sentences.bookTitle,
          author: sentences.author,
          pageNumber: sentences.pageNumber,
          likes: sentences.likes,
          createdAt: sentences.createdAt,
          updatedAt: sentences.updatedAt,
          userNickname: users.nickname,
          userProfileImage: users.profileImage,
          legacyNickname: sentences.legacyNickname
        }).from(sentences).leftJoin(users, (0, import_drizzle_orm.eq)(sentences.userId, users.id)).where(
          (0, import_drizzle_orm.or)(
            (0, import_drizzle_orm.like)(users.nickname, `%${query}%`),
            (0, import_drizzle_orm.like)(sentences.legacyNickname, `%${query}%`),
            (0, import_drizzle_orm.like)(sentences.content, `%${query}%`),
            (0, import_drizzle_orm.like)(sentences.bookTitle, `%${query}%`),
            (0, import_drizzle_orm.like)(sentences.author, `%${query}%`)
          )
        ).orderBy((0, import_drizzle_orm.desc)(sentences.createdAt));
        return results.map((result) => ({
          id: result.id,
          userId: result.userId,
          content: result.content,
          bookTitle: result.bookTitle,
          author: result.author,
          pageNumber: result.pageNumber,
          likes: result.likes,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          legacyNickname: result.legacyNickname,
          user: {
            nickname: result.userNickname || result.legacyNickname || "\uC775\uBA85",
            profileImage: result.userProfileImage || null
          }
        }));
      }
      // Community management operations
      async getAllCommunities(userId) {
        const results = await db.select({
          id: communities.id,
          name: communities.name,
          description: communities.description,
          coverImage: communities.coverImage,
          category: communities.category,
          relatedBook: communities.relatedBook,
          creatorId: communities.creatorId,
          memberCount: communities.memberCount,
          isPublic: communities.isPublic,
          sentenceCount: communities.sentenceCount,
          totalLikes: communities.totalLikes,
          activityScore: communities.activityScore,
          lastActivityAt: communities.lastActivityAt,
          createdAt: communities.createdAt,
          updatedAt: communities.updatedAt,
          creatorNickname: users.nickname,
          creatorProfileImage: users.profileImage
        }).from(communities).leftJoin(users, (0, import_drizzle_orm.eq)(communities.creatorId, users.id)).orderBy((0, import_drizzle_orm.desc)(communities.activityScore));
        if (userId) {
          const membershipResults = await db.select({ communityId: communityMembers.communityId }).from(communityMembers).where((0, import_drizzle_orm.eq)(communityMembers.userId, userId));
          const memberCommunityIds = new Set(membershipResults.map((r) => r.communityId));
          return results.map((result) => ({
            ...result,
            creator: {
              nickname: result.creatorNickname || "\uC775\uBA85",
              profileImage: result.creatorProfileImage || null
            },
            isMember: memberCommunityIds.has(result.id)
          }));
        }
        return results.map((result) => ({
          ...result,
          creator: {
            nickname: result.creatorNickname || "\uC775\uBA85",
            profileImage: result.creatorProfileImage || null
          },
          isMember: false
        }));
      }
      async getAllCommunitiesEnhanced(options) {
        let query = db.select({
          id: communities.id,
          name: communities.name,
          description: communities.description,
          coverImage: communities.coverImage,
          category: communities.category,
          relatedBook: communities.relatedBook,
          creatorId: communities.creatorId,
          memberCount: communities.memberCount,
          isPublic: communities.isPublic,
          sentenceCount: communities.sentenceCount,
          totalLikes: communities.totalLikes,
          totalComments: communities.totalComments,
          activityScore: communities.activityScore,
          lastActivityAt: communities.lastActivityAt,
          createdAt: communities.createdAt,
          updatedAt: communities.updatedAt,
          creatorNickname: users.nickname,
          creatorProfileImage: users.profileImage
        }).from(communities).leftJoin(users, (0, import_drizzle_orm.eq)(communities.creatorId, users.id));
        if (options.search) {
          query = query.where(
            (0, import_drizzle_orm.or)(
              (0, import_drizzle_orm.like)(communities.name, `%${options.search}%`),
              (0, import_drizzle_orm.like)(communities.description, `%${options.search}%`)
            )
          );
        }
        switch (options.sort) {
          case "members":
            query = query.orderBy((0, import_drizzle_orm.desc)(communities.memberCount));
            break;
          case "recent":
            query = query.orderBy((0, import_drizzle_orm.desc)(communities.lastActivityAt));
            break;
          case "activity":
          default:
            query = query.orderBy((0, import_drizzle_orm.desc)(communities.activityScore));
            break;
        }
        query = query.limit(options.limit).offset(options.offset);
        const results = await query;
        let memberCommunityIds = /* @__PURE__ */ new Set();
        if (options.userId) {
          const membershipResults = await db.select({ communityId: communityMembers.communityId }).from(communityMembers).where((0, import_drizzle_orm.eq)(communityMembers.userId, options.userId));
          memberCommunityIds = new Set(membershipResults.map((r) => r.communityId));
        }
        const communitiesWithStats = [];
        for (const result of results) {
          let topSentences = [];
          if (options.includeTopSentences) {
            const sentenceResults = await db.select({
              id: sentences.id,
              userId: sentences.userId,
              content: sentences.content,
              bookTitle: sentences.bookTitle,
              author: sentences.author,
              pageNumber: sentences.pageNumber,
              likes: sentences.likes,
              isPublic: sentences.isPublic,
              createdAt: sentences.createdAt,
              updatedAt: sentences.updatedAt,
              userNickname: users.nickname,
              userProfileImage: users.profileImage
            }).from(communitySentences).innerJoin(sentences, (0, import_drizzle_orm.eq)(communitySentences.sentenceId, sentences.id)).leftJoin(users, (0, import_drizzle_orm.eq)(sentences.userId, users.id)).where((0, import_drizzle_orm.eq)(communitySentences.communityId, result.id)).orderBy((0, import_drizzle_orm.desc)(sentences.likes)).limit(3);
            topSentences = sentenceResults.map((s) => ({
              id: s.id,
              userId: s.userId,
              content: s.content,
              bookTitle: s.bookTitle,
              author: s.author,
              pageNumber: s.pageNumber,
              likes: s.likes,
              isPublic: s.isPublic,
              createdAt: s.createdAt,
              updatedAt: s.updatedAt,
              user: {
                nickname: s.userNickname || "\uC775\uBA85",
                profileImage: s.userProfileImage || null
              }
            }));
          }
          communitiesWithStats.push({
            ...result,
            creator: {
              nickname: result.creatorNickname || "\uC775\uBA85",
              profileImage: result.creatorProfileImage || null
            },
            topSentences,
            isMember: memberCommunityIds.has(result.id)
          });
        }
        return communitiesWithStats;
      }
      async getUserCommunities(userId) {
        return [];
      }
      async getCommunity(id, userId) {
        return null;
      }
      async createCommunity(data) {
        const [newCommunity] = await db.insert(communities).values({
          name: data.name,
          description: data.description,
          coverImage: data.coverImage,
          category: data.category,
          relatedBook: data.relatedBook,
          creatorId: data.creatorId,
          memberCount: 1,
          isPublic: data.isPublic,
          sentenceCount: 0,
          totalLikes: 0,
          totalComments: 0,
          activityScore: 0,
          lastActivityAt: /* @__PURE__ */ new Date()
        }).returning();
        await db.insert(communityMembers).values({
          communityId: newCommunity.id,
          userId: data.creatorId,
          role: "owner"
        });
        return newCommunity;
      }
      async updateCommunity(id, data) {
        return {};
      }
      async deleteCommunity(id) {
        return false;
      }
      async joinCommunity(communityId, userId) {
        const existing = await db.select().from(communityMembers).where(
          (0, import_drizzle_orm.and)(
            (0, import_drizzle_orm.eq)(communityMembers.communityId, communityId),
            (0, import_drizzle_orm.eq)(communityMembers.userId, userId)
          )
        ).limit(1);
        if (existing.length > 0) {
          return false;
        }
        await db.insert(communityMembers).values({
          communityId,
          userId,
          role: "member"
        });
        await db.update(communities).set({
          memberCount: import_drizzle_orm.sql`${communities.memberCount} + 1`,
          updatedAt: /* @__PURE__ */ new Date()
        }).where((0, import_drizzle_orm.eq)(communities.id, communityId));
        return true;
      }
      async leaveCommunity(communityId, userId) {
        return false;
      }
      async isCommunitymember(communityId, userId) {
        return false;
      }
      async addSentenceToCommunity(communityId, sentenceId) {
      }
      async getCommunitySentencesById(communityId, options) {
        const result = await db.select({
          id: sentences.id,
          userId: sentences.userId,
          content: sentences.content,
          bookTitle: sentences.bookTitle,
          author: sentences.author,
          publisher: sentences.publisher,
          pageNumber: sentences.pageNumber,
          likes: sentences.likes,
          isPublic: sentences.isPublic,
          privateNote: sentences.privateNote,
          isBookmarked: sentences.isBookmarked,
          createdAt: sentences.createdAt,
          updatedAt: sentences.updatedAt,
          legacyNickname: sentences.legacyNickname,
          nickname: users.nickname,
          profileImage: users.profileImage
        }).from(communitySentences).innerJoin(sentences, (0, import_drizzle_orm.eq)(communitySentences.sentenceId, sentences.id)).leftJoin(users, (0, import_drizzle_orm.eq)(sentences.userId, users.id)).where((0, import_drizzle_orm.eq)(communitySentences.communityId, communityId)).orderBy((0, import_drizzle_orm.desc)(communitySentences.addedAt));
        return result.map((row) => ({
          id: row.id,
          userId: row.userId,
          content: row.content,
          bookTitle: row.bookTitle,
          author: row.author,
          publisher: row.publisher,
          pageNumber: row.pageNumber,
          likes: row.likes,
          isPublic: row.isPublic,
          privateNote: row.privateNote,
          isBookmarked: row.isBookmarked,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          legacyNickname: row.legacyNickname,
          user: {
            nickname: row.nickname || "Unknown",
            profileImage: row.profileImage
          }
        }));
      }
      // Book operations
      async searchCachedBooks(query) {
        const searchLower = `%${query.toLowerCase()}%`;
        const result = await db.select().from(books).where(
          (0, import_drizzle_orm.or)(
            (0, import_drizzle_orm.like)(books.title, searchLower),
            (0, import_drizzle_orm.like)(books.author, searchLower),
            (0, import_drizzle_orm.like)(books.publisher, searchLower)
          )
        ).orderBy((0, import_drizzle_orm.desc)(books.searchCount)).limit(10);
        return result;
      }
      async getOrCreateBook(bookData) {
        if (bookData.isbn) {
          const [existing] = await db.select().from(books).where((0, import_drizzle_orm.eq)(books.isbn, bookData.isbn));
          if (existing) {
            await db.update(books).set({
              searchCount: import_drizzle_orm.sql`${books.searchCount} + 1`,
              updatedAt: /* @__PURE__ */ new Date()
            }).where((0, import_drizzle_orm.eq)(books.id, existing.id));
            return existing;
          }
        }
        const [newBook] = await db.insert(books).values({
          isbn: bookData.isbn || null,
          title: bookData.title,
          author: bookData.author || null,
          publisher: bookData.publisher || null,
          cover: bookData.cover || null,
          searchCount: 1,
          sentenceCount: 0
        }).returning();
        return newBook;
      }
      async getPopularBooks(limit = 10) {
        const result = await db.select({
          bookTitle: sentences.bookTitle,
          author: sentences.author,
          publisher: sentences.publisher,
          sentenceCount: import_drizzle_orm.sql`count(*)`,
          totalLikes: import_drizzle_orm.sql`sum(${sentences.likes})`
        }).from(sentences).where(sentences.bookTitle !== null).groupBy(sentences.bookTitle, sentences.author, sentences.publisher).orderBy((0, import_drizzle_orm.desc)(import_drizzle_orm.sql`count(*)`)).limit(limit);
        return result.map((book) => ({
          id: 0,
          isbn: null,
          title: book.bookTitle,
          author: book.author,
          publisher: book.publisher,
          cover: null,
          searchCount: 0,
          sentenceCount: book.sentenceCount,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date(),
          totalSentences: book.sentenceCount,
          totalLikes: book.totalLikes || 0
        }));
      }
      async getBookSentences(bookTitle) {
        const result = await db.select({
          sentence: sentences,
          user: users
        }).from(sentences).leftJoin(users, (0, import_drizzle_orm.eq)(sentences.userId, users.id)).where((0, import_drizzle_orm.eq)(sentences.bookTitle, bookTitle)).orderBy((0, import_drizzle_orm.desc)(sentences.createdAt));
        return result.map((row) => ({
          ...row.sentence,
          user: row.user ? {
            nickname: row.user.nickname,
            profileImage: row.user.profileImage
          } : {
            nickname: row.sentence.legacyNickname || "\uC775\uBA85",
            profileImage: null
          }
        }));
      }
      async getAuthorStats() {
        const result = await db.select({
          author: sentences.author,
          sentenceCount: import_drizzle_orm.sql`count(*)`,
          totalLikes: import_drizzle_orm.sql`sum(${sentences.likes})`,
          books: import_drizzle_orm.sql`array_agg(distinct ${sentences.bookTitle})`
        }).from(sentences).where(sentences.author !== null).groupBy(sentences.author).orderBy((0, import_drizzle_orm.desc)(import_drizzle_orm.sql`count(*)`));
        return result.map((row) => ({
          author: row.author,
          sentenceCount: row.sentenceCount,
          totalLikes: row.totalLikes || 0,
          books: row.books || []
        }));
      }
      async getRecentBooks(limit = 10) {
        const result = await db.select({
          bookTitle: sentences.bookTitle,
          author: sentences.author,
          publisher: sentences.publisher,
          maxDate: import_drizzle_orm.sql`max(${sentences.createdAt})`,
          sentenceCount: import_drizzle_orm.sql`count(*)`,
          totalLikes: import_drizzle_orm.sql`sum(${sentences.likes})`
        }).from(sentences).where(sentences.bookTitle !== null).groupBy(sentences.bookTitle, sentences.author, sentences.publisher).orderBy((0, import_drizzle_orm.desc)(import_drizzle_orm.sql`max(${sentences.createdAt})`)).limit(limit);
        return result.map((book) => ({
          id: 0,
          isbn: null,
          title: book.bookTitle,
          author: book.author,
          publisher: book.publisher,
          cover: null,
          searchCount: 0,
          sentenceCount: book.sentenceCount,
          createdAt: book.maxDate,
          updatedAt: book.maxDate,
          totalSentences: book.sentenceCount,
          totalLikes: book.totalLikes || 0
        }));
      }
    };
    useMockStorage = process.env.USE_MOCK_STORAGE === "true" || !process.env.SUPABASE_DATABASE_URL && !process.env.DATABASE_URL;
    storageInstance = null;
    storage = getStorage();
  }
});

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  AuthService: () => AuthService,
  authMiddleware: () => authMiddleware,
  initializeGoogleOAuth: () => initializeGoogleOAuth,
  requireAuth: () => requireAuth
});
function initializeGoogleOAuth() {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/api/auth/google/callback";
  if (!googleClientId || !googleClientSecret) {
    console.log("Google OAuth not configured. Skipping Google authentication setup.");
    return;
  }
  import_passport.default.use(new import_passport_google_oauth20.Strategy(
    {
      clientID: googleClientId,
      clientSecret: googleClientSecret,
      callbackURL: googleRedirectUri
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleEmail = profile.emails?.[0]?.value;
        const googleName = profile.displayName;
        const googlePicture = profile.photos?.[0]?.value;
        if (!googleEmail) {
          return done(new Error("No email from Google"), false);
        }
        let user = await storage.getUserByEmail(googleEmail);
        if (!user) {
          const newUser = await storage.createUser({
            email: googleEmail,
            nickname: googleName || googleEmail.split("@")[0],
            password: import_crypto.default.randomBytes(32).toString("hex"),
            // 랜덤 패스워드 (구글 로그인이므로 사용되지 않음)
            profileImage: googlePicture
          });
          user = newUser;
        } else if (googlePicture && !user.profileImage) {
          await storage.updateUser(user.id, { profileImage: googlePicture });
          user.profileImage = googlePicture;
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  ));
  import_passport.default.serializeUser((user, done) => {
    done(null, user.id);
  });
  import_passport.default.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}
async function authMiddleware(req, res, next) {
  if (!req.path.includes(".") && !req.path.includes("_next")) {
    console.log("Auth middleware - Path:", req.path, "Session ID:", req.sessionID, "UserId:", req.session?.userId);
  }
  if (req.session?.userId) {
    try {
      const user = await storage.getUserById(req.session.userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          profileImage: user.profileImage || void 0,
          bio: user.bio || void 0
        };
        if (!req.path.includes(".")) {
          console.log("Auth middleware - user loaded:", user.nickname);
        }
      }
    } catch (error) {
      console.error("Auth middleware error:", error);
    }
  }
  next();
}
var import_bcrypt, import_crypto, import_drizzle_orm2, import_passport, import_passport_google_oauth20, AuthService;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    import_bcrypt = __toESM(require("bcrypt"));
    import_crypto = __toESM(require("crypto"));
    init_db();
    init_schema();
    import_drizzle_orm2 = require("drizzle-orm");
    init_storage();
    import_passport = __toESM(require("passport"));
    import_passport_google_oauth20 = require("passport-google-oauth20");
    AuthService = class {
      static {
        this.SALT_ROUNDS = 12;
      }
      static {
        this.SESSION_DURATION = 7 * 24 * 60 * 60 * 1e3;
      }
      static {
        // 7 days
        this.RESET_TOKEN_EXPIRY = 1 * 60 * 60 * 1e3;
      }
      // 1 hour
      static async hashPassword(password) {
        return import_bcrypt.default.hash(password, this.SALT_ROUNDS);
      }
      static async verifyPassword(password, hash) {
        return import_bcrypt.default.compare(password, hash);
      }
      static generateSessionId() {
        return import_crypto.default.randomBytes(32).toString("hex");
      }
      static generateResetToken() {
        return import_crypto.default.randomBytes(32).toString("hex");
      }
      static async createPasswordResetToken(userId) {
        const token = this.generateResetToken();
        const expiresAt = new Date(Date.now() + this.RESET_TOKEN_EXPIRY);
        await db.delete(passwordResetTokens).where((0, import_drizzle_orm2.eq)(passwordResetTokens.userId, userId));
        await db.insert(passwordResetTokens).values({
          userId,
          token,
          expiresAt
        });
        return token;
      }
      static async validateResetToken(token) {
        const [resetToken] = await db.select().from(passwordResetTokens).where(
          (0, import_drizzle_orm2.and)(
            (0, import_drizzle_orm2.eq)(passwordResetTokens.token, token),
            (0, import_drizzle_orm2.gt)(passwordResetTokens.expiresAt, /* @__PURE__ */ new Date())
          )
        );
        if (!resetToken) {
          return null;
        }
        return resetToken.userId;
      }
      static async deleteResetToken(token) {
        await db.delete(passwordResetTokens).where((0, import_drizzle_orm2.eq)(passwordResetTokens.token, token));
      }
      static async cleanupExpiredResetTokens() {
        await db.delete(passwordResetTokens).where((0, import_drizzle_orm2.gt)(/* @__PURE__ */ new Date(), passwordResetTokens.expiresAt));
      }
    };
  }
});

// server/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_express9 = __toESM(require("express"));
var import_express_session = __toESM(require("express-session"));
var import_passport3 = __toESM(require("passport"));
var import_dotenv2 = __toESM(require("dotenv"));

// server/routes.ts
var import_express7 = __toESM(require("express"));
var import_http = require("http");

// server/routes/auth.routes.ts
var import_express = require("express");
init_schema();
init_auth();
init_storage();
var import_multer = __toESM(require("multer"));
var import_path = __toESM(require("path"));
var import_fs = __toESM(require("fs"));
var import_passport2 = __toESM(require("passport"));
var multerStorage = import_multer.default.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "server/uploads/profiles";
    if (!import_fs.default.existsSync(uploadDir)) {
      import_fs.default.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `profile-${uniqueSuffix}${import_path.default.extname(file.originalname)}`);
  }
});
var upload = (0, import_multer.default)({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(import_path.default.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  }
});
var router = (0, import_express.Router)();
router.post("/api/auth/register", async (req, res) => {
  try {
    const validatedData = registerUserSchema.parse(req.body);
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ error: "\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uC774\uBA54\uC77C\uC785\uB2C8\uB2E4" });
    }
    const hashedPassword = await AuthService.hashPassword(validatedData.password);
    const newUser = await storage.createUser({
      ...validatedData,
      password: hashedPassword
    });
    req.session.userId = newUser.id;
    req.session.user = newUser;
    res.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        nickname: newUser.nickname,
        profileImage: newUser.profileImage,
        bio: newUser.bio
      },
      message: "\uD68C\uC6D0\uAC00\uC785\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4"
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "\uD68C\uC6D0\uAC00\uC785 \uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router.post("/api/auth/login", async (req, res) => {
  try {
    const validatedData = loginUserSchema.parse(req.body);
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      return res.status(400).json({ error: "\uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4" });
    }
    const isValid = await AuthService.verifyPassword(validatedData.password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: "\uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4" });
    }
    req.session.userId = user.id;
    req.session.user = user;
    res.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage,
        bio: user.bio
      },
      message: "\uB85C\uADF8\uC778\uB418\uC5C8\uC2B5\uB2C8\uB2E4"
    });
  } catch (error) {
    console.error("Login error:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "\uB85C\uADF8\uC778 \uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router.post("/api/auth/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "\uB85C\uADF8\uC544\uC6C3 \uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
    }
    res.clearCookie("connect.sid");
    res.json({ message: "\uB85C\uADF8\uC544\uC6C3\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
  });
});
router.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ error: "\uC778\uC99D\uC774 \uD544\uC694\uD569\uB2C8\uB2E4" });
    }
    const user = await storage.getUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({ error: "\uC0AC\uC6A9\uC790\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        profileImage: user.profileImage,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ error: "\uC0AC\uC6A9\uC790 \uC815\uBCF4 \uC870\uD68C \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router.put("/api/auth/profile", requireAuth, upload.single("profileImage"), async (req, res) => {
  try {
    const userId = req.session.userId;
    const validatedData = updateUserSchema.parse(req.body);
    if (req.file) {
      validatedData.profileImage = `/uploads/profiles/${req.file.filename}`;
    }
    const updatedUser = await storage.updateUser(userId, validatedData);
    req.session.user = updatedUser;
    res.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        nickname: updatedUser.nickname,
        profileImage: updatedUser.profileImage,
        bio: updatedUser.bio
      },
      message: "\uD504\uB85C\uD544\uC774 \uC5C5\uB370\uC774\uD2B8\uB418\uC5C8\uC2B5\uB2C8\uB2E4"
    });
  } catch (error) {
    console.error("Profile update error:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "\uD504\uB85C\uD544 \uC5C5\uB370\uC774\uD2B8 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router.post("/api/auth/password-reset/request", async (req, res) => {
  try {
    const validatedData = passwordResetRequestSchema.parse(req.body);
    const user = await storage.getUserByEmail(validatedData.email);
    if (!user) {
      return res.json({ message: "\uBE44\uBC00\uBC88\uD638 \uC7AC\uC124\uC815 \uB9C1\uD06C\uAC00 \uC774\uBA54\uC77C\uB85C \uC804\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
    }
    const token = await storage.createPasswordResetToken(user.id);
    console.log(`Password reset token for ${user.email}: ${token}`);
    res.json({ message: "\uBE44\uBC00\uBC88\uD638 \uC7AC\uC124\uC815 \uB9C1\uD06C\uAC00 \uC774\uBA54\uC77C\uB85C \uC804\uC1A1\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({ error: "\uBE44\uBC00\uBC88\uD638 \uC7AC\uC124\uC815 \uC694\uCCAD \uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router.post("/api/auth/password-reset", async (req, res) => {
  try {
    const validatedData = passwordResetSchema.parse(req.body);
    const isValid = await storage.validatePasswordResetToken(validatedData.token);
    if (!isValid) {
      return res.status(400).json({ error: "\uC720\uD6A8\uD558\uC9C0 \uC54A\uAC70\uB098 \uB9CC\uB8CC\uB41C \uD1A0\uD070\uC785\uB2C8\uB2E4" });
    }
    const hashedPassword = await AuthService.hashPassword(validatedData.newPassword);
    await storage.resetPassword(validatedData.token, hashedPassword);
    res.json({ message: "\uBE44\uBC00\uBC88\uD638\uAC00 \uC131\uACF5\uC801\uC73C\uB85C \uBCC0\uACBD\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
  } catch (error) {
    console.error("Password reset error:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "\uBE44\uBC00\uBC88\uD638 \uC7AC\uC124\uC815 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router.post("/api/auth/find-email", async (req, res) => {
  try {
    const validatedData = findEmailSchema.parse(req.body);
    const user = await storage.getUserByNickname(validatedData.nickname);
    if (!user) {
      return res.status(404).json({ error: "\uD574\uB2F9 \uB2C9\uB124\uC784\uC73C\uB85C \uB4F1\uB85D\uB41C \uC0AC\uC6A9\uC790\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    const maskedEmail = user.email.replace(/^(.{2})(.*)(@.*)$/, (match, p1, p2, p3) => {
      return p1 + "*".repeat(Math.min(p2.length, 5)) + p3;
    });
    res.json({ email: maskedEmail });
  } catch (error) {
    console.error("Find email error:", error);
    res.status(500).json({ error: "\uC774\uBA54\uC77C \uCC3E\uAE30 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router.get(
  "/api/auth/google",
  import_passport2.default.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/api/auth/google/callback",
  import_passport2.default.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    if (req.user) {
      req.session.userId = req.user.id;
      req.session.user = req.user;
    }
    res.redirect("/");
  }
);
var auth_routes_default = router;

// server/routes/sentences.routes.ts
var import_express2 = require("express");
init_schema();
init_auth();
init_storage();
var router2 = (0, import_express2.Router)();
function formatTimeAgo(date) {
  const now = /* @__PURE__ */ new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1e3);
  if (diffInSeconds < 60) return "\uBC29\uAE08 \uC804";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}\uBD84 \uC804`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}\uC2DC\uAC04 \uC804`;
  if (diffInSeconds < 2592e3) return `${Math.floor(diffInSeconds / 86400)}\uC77C \uC804`;
  if (diffInSeconds < 31536e3) return `${Math.floor(diffInSeconds / 2592e3)}\uAC1C\uC6D4 \uC804`;
  return `${Math.floor(diffInSeconds / 31536e3)}\uB144 \uC804`;
}
router2.get("/api/sentences/daily", async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      const publicSentences = await storage.getPublicSentences();
      if (publicSentences.length === 0) {
        return res.status(404).json({ error: "No sentences available" });
      }
      const today2 = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const seed2 = today2.split("-").reduce((acc, val) => acc + parseInt(val), 0);
      const index2 = seed2 % publicSentences.length;
      const sentence2 = publicSentences[index2];
      return res.json({
        id: sentence2.id,
        text: sentence2.content,
        author: sentence2.author,
        bookTitle: sentence2.bookTitle,
        createdAt: sentence2.createdAt,
        nickname: sentence2.nickname
      });
    }
    const userSentences = await storage.getUserSentences(userId);
    if (userSentences.length === 0) {
      const publicSentences = await storage.getPublicSentences();
      if (publicSentences.length === 0) {
        return res.status(404).json({ error: "No sentences available" });
      }
      const today2 = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const seed2 = today2.split("-").reduce((acc, val) => acc + parseInt(val), userId);
      const index2 = seed2 % publicSentences.length;
      const sentence2 = publicSentences[index2];
      return res.json({
        id: sentence2.id,
        text: sentence2.content,
        author: sentence2.author,
        bookTitle: sentence2.bookTitle,
        createdAt: sentence2.createdAt,
        nickname: sentence2.nickname
      });
    }
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const seed = today.split("-").reduce((acc, val) => acc + parseInt(val), userId);
    const index = seed % userSentences.length;
    const sentence = userSentences[index];
    return res.json({
      id: sentence.id,
      text: sentence.content,
      author: sentence.author,
      bookTitle: sentence.bookTitle,
      createdAt: sentence.createdAt
    });
  } catch (error) {
    console.error("Get daily sentence error:", error);
    res.status(500).json({ error: "Failed to get daily sentence" });
  }
});
router2.get("/api/sentences", async (req, res) => {
  try {
    const { search, sort = "latest", filter = "all" } = req.query;
    let allSentences = await storage.getSentences();
    if (search) {
      const searchLower = search.toString().toLowerCase();
      allSentences = allSentences.filter(
        (s) => s.content.toLowerCase().includes(searchLower) || s.bookTitle?.toLowerCase().includes(searchLower) || s.author?.toLowerCase().includes(searchLower) || s.nickname?.toLowerCase().includes(searchLower)
      );
    }
    if (filter === "liked" && req.session?.userId) {
      const likedIds = await storage.getUserLikedSentences(req.session.userId);
      allSentences = allSentences.filter((s) => likedIds.includes(s.id));
    }
    switch (sort) {
      case "popular":
        allSentences.sort((a, b) => b.likes - a.likes);
        break;
      case "oldest":
        allSentences.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "latest":
      default:
        allSentences.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    const formattedSentences = allSentences.map((s) => ({
      ...s,
      timeAgo: formatTimeAgo(new Date(s.createdAt)),
      isLiked: req.session?.userId ? false : false
    }));
    if (req.session?.userId) {
      const likedIds = await storage.getUserLikedSentences(req.session.userId);
      formattedSentences.forEach((s) => {
        s.isLiked = likedIds.includes(s.id);
      });
    }
    res.json(formattedSentences);
  } catch (error) {
    console.error("Error fetching sentences:", error);
    res.status(500).json({ error: "\uBB38\uC7A5\uC744 \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router2.get("/api/sentences/community", async (req, res) => {
  try {
    console.log("GET /api/sentences/community - Starting");
    console.log("Storage instance:", storage.constructor.name);
    const { q, sort = "latest", author, book } = req.query;
    const allSentencesFromGet = await storage.getSentences();
    console.log("All sentences from getSentences():", allSentencesFromGet.length);
    let allSentences = allSentencesFromGet.filter((s) => s.isPublic === 1);
    console.log("Filtered public sentences:", allSentences.length);
    if (q) {
      const searchLower = q.toString().toLowerCase();
      allSentences = allSentences.filter(
        (s) => s.content.toLowerCase().includes(searchLower)
      );
    }
    if (author) {
      allSentences = allSentences.filter(
        (s) => s.author === author
      );
    }
    if (book) {
      allSentences = allSentences.filter(
        (s) => s.bookTitle === book
      );
    }
    switch (sort) {
      case "likes":
        allSentences.sort((a, b) => b.likes - a.likes);
        break;
      case "oldest":
        allSentences.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "latest":
      default:
        allSentences.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    const formattedSentences = allSentences.map((s) => ({
      ...s,
      timeAgo: formatTimeAgo(new Date(s.createdAt)),
      isLiked: false
    }));
    if (req.session?.userId) {
      const likedIds = await storage.getUserLikedSentences(req.session.userId);
      formattedSentences.forEach((s) => {
        s.isLiked = likedIds.includes(s.id);
      });
    }
    res.json(formattedSentences);
  } catch (error) {
    console.error("Error fetching community sentences:", error);
    res.status(500).json({ error: "\uCEE4\uBBA4\uB2C8\uD2F0 \uBB38\uC7A5\uC744 \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router2.get("/api/sentences/community/stats", async (req, res) => {
  try {
    const stats = await storage.getCommunityStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching community stats:", error);
    res.status(500).json({ error: "\uD1B5\uACC4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router2.get("/api/sentences/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const sentence = await storage.getSentence(id);
    if (!sentence) {
      return res.status(404).json({ error: "\uBB38\uC7A5\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    const formattedSentence = {
      ...sentence,
      timeAgo: formatTimeAgo(new Date(sentence.createdAt)),
      isLiked: false
    };
    if (req.session?.userId) {
      const likedIds = await storage.getUserLikedSentences(req.session.userId);
      formattedSentence.isLiked = likedIds.includes(sentence.id);
    }
    res.json(formattedSentence);
  } catch (error) {
    console.error("Error fetching sentence:", error);
    res.status(500).json({ error: "\uBB38\uC7A5\uC744 \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router2.post("/api/sentences", requireAuth, async (req, res) => {
  try {
    console.log("POST /api/sentences - Request body:", req.body);
    const validatedData = insertSentenceSchema.parse(req.body);
    const userId = req.session.userId;
    const { communityId, ...sentenceData } = validatedData;
    console.log("Creating sentence with validated data:", sentenceData);
    const newSentence = await storage.createSentence({
      ...sentenceData,
      userId
    });
    if (communityId && newSentence.id) {
      try {
        const isMember = await storage.isCommunitymember(communityId, userId);
        if (isMember) {
          await storage.addSentenceToCommunity(communityId, newSentence.id);
          console.log(`Added sentence ${newSentence.id} to community ${communityId}`);
        } else {
          console.log(`User ${userId} is not a member of community ${communityId}, skipping community association`);
        }
      } catch (err) {
        console.error(`Failed to add sentence to community ${communityId}:`, err);
      }
    }
    console.log("Created sentence:", { id: newSentence.id, isPublic: newSentence.isPublic });
    res.status(201).json(newSentence);
  } catch (error) {
    console.error("Error creating sentence:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "\uBB38\uC7A5 \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router2.put("/api/sentences/:id/note", requireAuth, async (req, res) => {
  try {
    const sentenceId = parseInt(req.params.id);
    const { privateNote, isBookmarked } = req.body;
    const userId = req.session.userId;
    const sentence = await storage.getSentenceById(sentenceId);
    if (!sentence || sentence.userId !== userId) {
      return res.status(403).json({ error: "\uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    const updated = await storage.updateSentence(sentenceId, {
      privateNote,
      isBookmarked
    });
    res.json({
      message: "\uB3C5\uC11C \uB178\uD2B8\uAC00 \uC800\uC7A5\uB418\uC5C8\uC2B5\uB2C8\uB2E4",
      sentence: updated
    });
  } catch (error) {
    console.error("Update reading note error:", error);
    res.status(500).json({ error: "\uB3C5\uC11C \uB178\uD2B8 \uC800\uC7A5 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router2.put("/api/sentences/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = updateSentenceSchema.parse(req.body);
    const userId = req.session.userId;
    const sentence = await storage.getSentence(id);
    if (!sentence) {
      return res.status(404).json({ error: "\uBB38\uC7A5\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    if (sentence.userId !== userId) {
      return res.status(403).json({ error: "\uC774 \uBB38\uC7A5\uC744 \uC218\uC815\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    const updatedSentence = await storage.updateSentence(id, validatedData);
    res.json(updatedSentence);
  } catch (error) {
    console.error("Error updating sentence:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "\uBB38\uC7A5 \uC218\uC815 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router2.delete("/api/sentences/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.session.userId;
    const sentence = await storage.getSentence(id);
    if (!sentence) {
      return res.status(404).json({ error: "\uBB38\uC7A5\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    if (sentence.userId !== userId) {
      return res.status(403).json({ error: "\uC774 \uBB38\uC7A5\uC744 \uC0AD\uC81C\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    await storage.deleteSentence(id);
    res.json({ message: "\uBB38\uC7A5\uC774 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
  } catch (error) {
    console.error("Error deleting sentence:", error);
    res.status(500).json({ error: "\uBB38\uC7A5 \uC0AD\uC81C \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router2.post("/api/sentences/:id/like", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.session.userId;
    const sentence = await storage.getSentence(id);
    if (!sentence) {
      return res.status(404).json({ error: "\uBB38\uC7A5\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    const isLiked = await storage.toggleLike(id, userId);
    const updatedSentence = await storage.getSentence(id);
    res.json({
      isLiked,
      likes: updatedSentence?.likes || 0
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "\uC88B\uC544\uC694 \uCC98\uB9AC \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router2.get("/api/search", async (req, res) => {
  try {
    const { q } = searchSchema.parse(req.query);
    const results = await storage.searchSentences(q);
    const formattedResults = results.map((s) => ({
      ...s,
      timeAgo: formatTimeAgo(new Date(s.createdAt)),
      isLiked: false
    }));
    if (req.session?.userId) {
      const likedIds = await storage.getUserLikedSentences(req.session.userId);
      formattedResults.forEach((s) => {
        s.isLiked = likedIds.includes(s.id);
      });
    }
    res.json(formattedResults);
  } catch (error) {
    console.error("Search error:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "\uAC80\uC0C9 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router2.delete("/api/sentences/:id/delete", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = deleteSentenceSchema.parse(req.body);
    const success = await storage.deleteSentenceWithPassword(id, validatedData.password);
    if (!success) {
      return res.status(403).json({ error: "\uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4" });
    }
    res.json({ message: "\uBB38\uC7A5\uC774 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
  } catch (error) {
    console.error("Delete error:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "\uBB38\uC7A5 \uC0AD\uC81C \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router2.delete("/api/sentences/:id/admin-delete", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { adminPassword } = adminDeleteSchema.parse(req.body);
    const success = await storage.adminDeleteSentence(id, adminPassword);
    if (!success) {
      return res.status(403).json({ error: "\uAD00\uB9AC\uC790 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4" });
    }
    res.json({ message: "\uBB38\uC7A5\uC774 \uAD00\uB9AC\uC790 \uAD8C\uD55C\uC73C\uB85C \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
  } catch (error) {
    console.error("Admin delete error:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "\uBB38\uC7A5 \uC0AD\uC81C \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router2.delete("/api/sentences/:id/like", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.session.userId;
    const sentence = await storage.getSentence(id);
    if (!sentence) {
      return res.status(404).json({ error: "\uBB38\uC7A5\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    await storage.removeLike(id, userId);
    const updatedSentence = await storage.getSentence(id);
    res.json({
      isLiked: false,
      likes: updatedSentence?.likes || 0
    });
  } catch (error) {
    console.error("Error removing like:", error);
    res.status(500).json({ error: "\uC88B\uC544\uC694 \uCDE8\uC18C \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
var sentences_routes_default = router2;

// server/routes/user.routes.ts
var import_express3 = require("express");
init_auth();
init_storage();
var router3 = (0, import_express3.Router)();
router3.get("/api/user/sentences", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const { search, sort = "latest" } = req.query;
    let userSentences = await storage.getUserSentences(userId);
    if (search) {
      const searchLower = search.toString().toLowerCase();
      userSentences = userSentences.filter(
        (s) => s.content.toLowerCase().includes(searchLower) || s.bookTitle?.toLowerCase().includes(searchLower) || s.author?.toLowerCase().includes(searchLower)
      );
    }
    switch (sort) {
      case "popular":
        userSentences.sort((a, b) => b.likes - a.likes);
        break;
      case "oldest":
        userSentences.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "latest":
      default:
        userSentences.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    res.json(userSentences);
  } catch (error) {
    console.error("Error fetching user sentences:", error);
    res.status(500).json({ error: "\uBB38\uC7A5\uC744 \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router3.get("/api/user/stats", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const stats = await storage.getUserStats(userId);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ error: "\uD1B5\uACC4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router3.get("/api/stats", async (req, res) => {
  try {
    const stats = await storage.getOverallStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "\uD1B5\uACC4\uB97C \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router3.get("/api/recent-activity", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activities = await storage.getRecentActivity(limit);
    res.json(activities);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ error: "\uCD5C\uADFC \uD65C\uB3D9\uC744 \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router3.get("/api/contributors", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const contributors = await storage.getTopContributors(limit);
    res.json(contributors);
  } catch (error) {
    console.error("Error fetching contributors:", error);
    res.status(500).json({ error: "\uAE30\uC5EC\uC790 \uC21C\uC704\uB97C \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
var user_routes_default = router3;

// server/routes/books.routes.ts
var import_express4 = require("express");
init_storage();
var router4 = (0, import_express4.Router)();
router4.get("/api/books/search", async (req, res) => {
  try {
    const { query } = req.query;
    const storage2 = getStorage();
    if (!query) {
      return res.status(400).json({ error: "\uAC80\uC0C9\uC5B4\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694" });
    }
    const cachedBooks = await storage2.searchCachedBooks(query.toString());
    if (cachedBooks.length > 0) {
      const books2 = cachedBooks.map((book) => ({
        title: book.title,
        author: book.author || "\uC800\uC790 \uBBF8\uC0C1",
        publisher: book.publisher || "\uCD9C\uD310\uC0AC \uBBF8\uC0C1",
        isbn: book.isbn || "",
        cover: book.cover || "https://via.placeholder.com/120x174",
        cached: true
      }));
      return res.json({ items: books2 });
    }
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
      const books2 = await Promise.all(data.item.map(async (item) => {
        const bookData = {
          title: item.title || "\uC81C\uBAA9 \uC5C6\uC74C",
          author: item.author || "\uC800\uC790 \uBBF8\uC0C1",
          publisher: item.publisher || "\uCD9C\uD310\uC0AC \uBBF8\uC0C1",
          isbn: item.isbn13 || item.isbn || "",
          cover: item.cover || "https://via.placeholder.com/120x174"
        };
        await storage2.getOrCreateBook(bookData);
        return { ...bookData, cached: false };
      }));
      res.json({ items: books2 });
    } catch (fetchError) {
      console.error("Aladin API error:", fetchError);
      const mockBooks = [
        {
          title: "\uB370\uBBF8\uC548",
          author: "\uD5E4\uB974\uB9CC \uD5E4\uC138",
          publisher: "\uBBFC\uC74C\uC0AC",
          isbn: "9788937460449",
          cover: "https://via.placeholder.com/120x174"
        },
        {
          title: "\uC5B4\uB9B0 \uC655\uC790",
          author: "\uC559\uD22C\uC548 \uB4DC \uC0DD\uD14D\uC950\uD398\uB9AC",
          publisher: "\uBB38\uD559\uB3D9\uB124",
          isbn: "9788954699914",
          cover: "https://via.placeholder.com/120x174"
        },
        {
          title: "1984",
          author: "\uC870\uC9C0 \uC624\uC6F0",
          publisher: "\uBBFC\uC74C\uC0AC",
          isbn: "9788937460777",
          cover: "https://via.placeholder.com/120x174"
        }
      ].filter(
        (book) => book.title.toLowerCase().includes(query.toString().toLowerCase()) || book.author.toLowerCase().includes(query.toString().toLowerCase())
      );
      res.json({ items: mockBooks });
    }
  } catch (error) {
    console.error("Book search error:", error);
    res.status(500).json({ error: "\uB3C4\uC11C \uAC80\uC0C9 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router4.get("/api/books/popular", async (req, res) => {
  try {
    const storage2 = getStorage();
    const limit = parseInt(req.query.limit) || 10;
    const books2 = await storage2.getPopularBooks(limit);
    res.json(books2);
  } catch (error) {
    console.error("Popular books error:", error);
    res.status(500).json({ error: "\uC778\uAE30 \uCC45 \uBAA9\uB85D\uC744 \uAC00\uC838\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router4.get("/api/books/recent", async (req, res) => {
  try {
    const storage2 = getStorage();
    const limit = parseInt(req.query.limit) || 10;
    const books2 = await storage2.getRecentBooks(limit);
    res.json(books2);
  } catch (error) {
    console.error("Recent books error:", error);
    res.status(500).json({ error: "\uCD5C\uADFC \uCC45 \uBAA9\uB85D\uC744 \uAC00\uC838\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router4.get("/api/books/authors", async (req, res) => {
  try {
    const storage2 = getStorage();
    const stats = await storage2.getAuthorStats();
    res.json(stats);
  } catch (error) {
    console.error("Author stats error:", error);
    res.status(500).json({ error: "\uC800\uC790 \uD1B5\uACC4\uB97C \uAC00\uC838\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router4.get("/api/books/:bookTitle/sentences", async (req, res) => {
  try {
    const storage2 = getStorage();
    const { bookTitle } = req.params;
    const sentences2 = await storage2.getBookSentences(decodeURIComponent(bookTitle));
    res.json(sentences2);
  } catch (error) {
    console.error("Book sentences error:", error);
    res.status(500).json({ error: "\uCC45\uC758 \uBB38\uC7A5 \uBAA9\uB85D\uC744 \uAC00\uC838\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router4.get("/api/books/stats", async (req, res) => {
  try {
    const storage2 = getStorage();
    const [popular, recent, authors] = await Promise.all([
      storage2.getPopularBooks(5),
      storage2.getRecentBooks(5),
      storage2.getAuthorStats()
    ]);
    res.json({
      popularBooks: popular,
      recentBooks: recent,
      topAuthors: authors.slice(0, 5)
    });
  } catch (error) {
    console.error("Book stats error:", error);
    res.status(500).json({ error: "\uCC45 \uD1B5\uACC4\uB97C \uAC00\uC838\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
var books_routes_default = router4;

// server/routes/communities.routes.ts
var import_express5 = require("express");
init_schema();
init_auth();
init_storage();
var router5 = (0, import_express5.Router)();
router5.get("/api/communities", async (req, res) => {
  try {
    const userId = req.session?.userId;
    const communities2 = await storage.getAllCommunities(userId);
    res.json(communities2);
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({ error: "\uCEE4\uBBA4\uB2C8\uD2F0\uB97C \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router5.get("/api/communities/all", async (req, res) => {
  try {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    const {
      sort = "activity",
      q = "",
      includeTopSentences = "false",
      offset = "0",
      limit = "9"
    } = req.query;
    const userId = req.session?.userId;
    console.log(`GET /api/communities/all - userId: ${userId}, sort: ${sort}, search: ${q}, offset: ${offset}, limit: ${limit}`);
    const communities2 = await storage.getAllCommunitiesEnhanced({
      sort,
      search: q,
      includeTopSentences: includeTopSentences === "true",
      offset: parseInt(offset),
      limit: parseInt(limit),
      userId
    });
    console.log(`Returning ${communities2.length} communities to client`);
    res.json(communities2);
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({ error: "\uCEE4\uBBA4\uB2C8\uD2F0\uB97C \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router5.get("/api/communities/my", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;
    const communities2 = await storage.getUserCommunities(userId);
    res.json(communities2);
  } catch (error) {
    console.error("Error fetching user communities:", error);
    res.status(500).json({ error: "\uCEE4\uBBA4\uB2C8\uD2F0\uB97C \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router5.get("/api/communities/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.session?.userId;
    const community = await storage.getCommunity(id, userId);
    if (!community) {
      return res.status(404).json({ error: "\uCEE4\uBBA4\uB2C8\uD2F0\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    if (community.isPublic === 0 && !community.isMember) {
      return res.status(403).json({ error: "\uBE44\uACF5\uAC1C \uCEE4\uBBA4\uB2C8\uD2F0\uC785\uB2C8\uB2E4. \uAC00\uC785 \uD6C4 \uC774\uC6A9\uD574\uC8FC\uC138\uC694." });
    }
    res.json(community);
  } catch (error) {
    console.error("Error fetching community:", error);
    res.status(500).json({ error: "\uCEE4\uBBA4\uB2C8\uD2F0\uB97C \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router5.get("/api/communities/:id/sentences", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { sort = "latest" } = req.query;
    const userId = req.session?.userId;
    const community = await storage.getCommunity(id, userId);
    if (!community) {
      return res.status(404).json({ error: "\uCEE4\uBBA4\uB2C8\uD2F0\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    if (community.isPublic === 0 && !community.isMember) {
      return res.status(403).json({ error: "\uBE44\uACF5\uAC1C \uCEE4\uBBA4\uB2C8\uD2F0\uC785\uB2C8\uB2E4. \uAC00\uC785 \uD6C4 \uC774\uC6A9\uD574\uC8FC\uC138\uC694." });
    }
    const sentences2 = await storage.getCommunitySentences(id, {
      sort,
      userId
    });
    res.json(sentences2);
  } catch (error) {
    console.error("Error fetching community sentences:", error);
    res.status(500).json({ error: "\uBB38\uC7A5\uC744 \uBD88\uB7EC\uC624\uB294 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router5.post("/api/communities", requireAuth, async (req, res) => {
  try {
    const validatedData = createCommunitySchema.parse(req.body);
    const userId = req.session.userId;
    console.log(`Creating community for user ${userId}:`, validatedData);
    const newCommunity = await storage.createCommunity({
      ...validatedData,
      creatorId: userId
    });
    console.log(`Community created successfully:`, newCommunity);
    res.status(201).json(newCommunity);
  } catch (error) {
    console.error("Error creating community:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "\uCEE4\uBBA4\uB2C8\uD2F0 \uC0DD\uC131 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router5.put("/api/communities/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const validatedData = updateCommunitySchema.parse(req.body);
    const userId = req.session.userId;
    const community = await storage.getCommunity(id, userId);
    if (!community) {
      return res.status(404).json({ error: "\uCEE4\uBBA4\uB2C8\uD2F0\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    if (community.creatorId !== userId && community.memberRole !== "admin") {
      return res.status(403).json({ error: "\uC774 \uCEE4\uBBA4\uB2C8\uD2F0\uB97C \uC218\uC815\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    const updatedCommunity = await storage.updateCommunity(id, validatedData);
    res.json(updatedCommunity);
  } catch (error) {
    console.error("Error updating community:", error);
    if (error.errors) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "\uCEE4\uBBA4\uB2C8\uD2F0 \uC218\uC815 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router5.delete("/api/communities/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.session.userId;
    const community = await storage.getCommunity(id, userId);
    if (!community) {
      return res.status(404).json({ error: "\uCEE4\uBBA4\uB2C8\uD2F0\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    if (community.creatorId !== userId) {
      return res.status(403).json({ error: "\uC774 \uCEE4\uBBA4\uB2C8\uD2F0\uB97C \uC0AD\uC81C\uD560 \uAD8C\uD55C\uC774 \uC5C6\uC2B5\uB2C8\uB2E4" });
    }
    await storage.deleteCommunity(id);
    res.json({ message: "\uCEE4\uBBA4\uB2C8\uD2F0\uAC00 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
  } catch (error) {
    console.error("Error deleting community:", error);
    res.status(500).json({ error: "\uCEE4\uBBA4\uB2C8\uD2F0 \uC0AD\uC81C \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router5.post("/api/communities/:id/join", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const userId = req.session.userId;
    const success = await storage.joinCommunity(communityId, userId);
    if (!success) {
      return res.status(400).json({ error: "\uC774\uBBF8 \uAC00\uC785\uD55C \uCEE4\uBBA4\uB2C8\uD2F0\uC785\uB2C8\uB2E4" });
    }
    res.json({ message: "\uCEE4\uBBA4\uB2C8\uD2F0\uC5D0 \uAC00\uC785\uD588\uC2B5\uB2C8\uB2E4" });
  } catch (error) {
    console.error("Error joining community:", error);
    res.status(500).json({ error: "\uCEE4\uBBA4\uB2C8\uD2F0 \uAC00\uC785 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router5.delete("/api/communities/:id/leave", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const userId = req.session.userId;
    const success = await storage.leaveCommunity(communityId, userId);
    if (!success) {
      return res.status(400).json({ error: "\uAC00\uC785\uD558\uC9C0 \uC54A\uC740 \uCEE4\uBBA4\uB2C8\uD2F0\uC785\uB2C8\uB2E4" });
    }
    res.json({ message: "\uCEE4\uBBA4\uB2C8\uD2F0\uC5D0\uC11C \uD0C8\uD1F4\uD588\uC2B5\uB2C8\uB2E4" });
  } catch (error) {
    console.error("Error leaving community:", error);
    res.status(500).json({ error: "\uCEE4\uBBA4\uB2C8\uD2F0 \uD0C8\uD1F4 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
router5.post("/api/communities/:id/sentences", requireAuth, async (req, res) => {
  try {
    const communityId = parseInt(req.params.id);
    const { sentenceId } = req.body;
    const userId = req.session.userId;
    const isMember = await storage.isCommunitymember(communityId, userId);
    if (!isMember) {
      return res.status(403).json({ error: "\uCEE4\uBBA4\uB2C8\uD2F0 \uBA64\uBC84\uB9CC \uBB38\uC7A5\uC744 \uCD94\uAC00\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4" });
    }
    await storage.addSentenceToCommunity(communityId, sentenceId);
    res.json({ message: "\uBB38\uC7A5\uC774 \uCEE4\uBBA4\uB2C8\uD2F0\uC5D0 \uCD94\uAC00\uB418\uC5C8\uC2B5\uB2C8\uB2E4" });
  } catch (error) {
    console.error("Error adding sentence to community:", error);
    res.status(500).json({ error: "\uBB38\uC7A5 \uCD94\uAC00 \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4" });
  }
});
var communities_routes_default = router5;

// server/routes/export.routes.ts
var import_express6 = __toESM(require("express"));
init_auth();
init_storage();
var router6 = import_express6.default.Router();
function formatKoreanDate(date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}\uB144 ${month}\uC6D4 ${day}\uC77C`;
}
function convertToCSV(data) {
  if (data.length === 0) return "";
  const headers = ["\uBC88\uD638", "\uBB38\uC7A5", "\uCC45 \uC81C\uBAA9", "\uC800\uC790", "\uD398\uC774\uC9C0", "\uC88B\uC544\uC694", "\uB4F1\uB85D\uC77C", "\uBA54\uBAA8"];
  const csvHeaders = headers.join(",");
  const csvRows = data.map((row, index) => {
    const values = [
      index + 1,
      `"${(row.content || "").replace(/"/g, '""')}"`,
      `"${(row.bookTitle || "").replace(/"/g, '""')}"`,
      `"${(row.author || "").replace(/"/g, '""')}"`,
      row.pageNumber || "",
      row.likes || 0,
      formatKoreanDate(new Date(row.createdAt)),
      ""
    ];
    return values.join(",");
  });
  return [csvHeaders, ...csvRows].join("\n");
}
function convertToText(sentences2, title = "\uBB38\uC7A5 \uBAA8\uC74C") {
  const lines = [];
  lines.push("\u2554" + "\u2550".repeat(78) + "\u2557");
  lines.push("\u2551" + title.padStart(39 + title.length / 2).padEnd(78) + "\u2551");
  lines.push("\u2560" + "\u2550".repeat(78) + "\u2563");
  lines.push("\u2551 \uCD1D " + sentences2.length + "\uAC1C\uC758 \uBB38\uC7A5" + " ".repeat(78 - 10 - sentences2.length.toString().length) + "\u2551");
  lines.push("\u2551 \uC0DD\uC131\uC77C: " + formatKoreanDate(/* @__PURE__ */ new Date()) + " ".repeat(78 - 18 - formatKoreanDate(/* @__PURE__ */ new Date()).length) + "\u2551");
  lines.push("\u255A" + "\u2550".repeat(78) + "\u255D");
  lines.push("");
  const bookGroups = /* @__PURE__ */ new Map();
  sentences2.forEach((s) => {
    const bookKey = s.bookTitle || "\uBD84\uB958 \uC5C6\uC74C";
    if (!bookGroups.has(bookKey)) {
      bookGroups.set(bookKey, []);
    }
    bookGroups.get(bookKey).push(s);
  });
  const sortedBooks = Array.from(bookGroups.entries()).sort(([a], [b]) => a.localeCompare(b));
  sortedBooks.forEach(([bookTitle, bookSentences], bookIndex) => {
    bookSentences.sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
    lines.push("");
    lines.push("\u250C" + "\u2500".repeat(78) + "\u2510");
    lines.push("\u2502 \u{1F4DA} " + bookTitle + " ".repeat(Math.max(0, 74 - bookTitle.length)) + "\u2502");
    if (bookSentences[0]?.author) {
      lines.push("\u2502 \u270D\uFE0F  " + bookSentences[0].author + " ".repeat(Math.max(0, 73 - bookSentences[0].author.length)) + "\u2502");
    }
    lines.push("\u2502 \u{1F4DD} " + bookSentences.length + "\uAC1C \uBB38\uC7A5" + " ".repeat(Math.max(0, 67 - bookSentences.length.toString().length)) + "\u2502");
    lines.push("\u2514" + "\u2500".repeat(78) + "\u2518");
    lines.push("");
    bookSentences.forEach((s, index) => {
      const sentenceNum = `\u3010${index + 1}\u3011`;
      const maxWidth = 70;
      const words = s.content.split(" ");
      let currentLine = "";
      const wrappedLines = [];
      words.forEach((word) => {
        if ((currentLine + " " + word).length > maxWidth) {
          if (currentLine) wrappedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = currentLine ? currentLine + " " + word : word;
        }
      });
      if (currentLine) wrappedLines.push(currentLine);
      lines.push(sentenceNum);
      wrappedLines.forEach((line) => {
        lines.push("    " + line);
      });
      const metadata = [];
      if (s.pageNumber) metadata.push(`p.${s.pageNumber}`);
      if (s.likes > 0) metadata.push(`\u2665 ${s.likes}`);
      metadata.push(formatKoreanDate(new Date(s.createdAt)));
      if (metadata.length > 0) {
        lines.push("    \u25B8 " + metadata.join(" | "));
      }
      lines.push("");
    });
  });
  lines.push("");
  lines.push("\u2500".repeat(80));
  lines.push("\u2728 \uBB38\uC7A5\uC218\uC9D1\uAC00 - \uB2F9\uC2E0\uC758 \uBB38\uC7A5\uC744 \uC18C\uC911\uD788 \uAC04\uC9C1\uD569\uB2C8\uB2E4");
  return lines.join("\n");
}
function convertToMarkdown(sentences2, title = "\uBB38\uC7A5 \uBAA8\uC74C") {
  const lines = [];
  lines.push(`# ${title}`);
  lines.push("");
  lines.push(`> \u{1F4C5} \uC0DD\uC131\uC77C: ${formatKoreanDate(/* @__PURE__ */ new Date())}`);
  lines.push(`> \u{1F4DA} \uCD1D ${sentences2.length}\uAC1C\uC758 \uBB38\uC7A5`);
  lines.push("");
  lines.push("---");
  lines.push("");
  const bookGroups = /* @__PURE__ */ new Map();
  sentences2.forEach((s) => {
    const bookKey = s.bookTitle || "\uBD84\uB958 \uC5C6\uC74C";
    if (!bookGroups.has(bookKey)) {
      bookGroups.set(bookKey, []);
    }
    bookGroups.get(bookKey).push(s);
  });
  const sortedBooks = Array.from(bookGroups.entries()).sort(([a], [b]) => a.localeCompare(b));
  sortedBooks.forEach(([bookTitle, bookSentences]) => {
    bookSentences.sort((a, b) => (a.pageNumber || 0) - (b.pageNumber || 0));
    lines.push(`## \u{1F4D6} ${bookTitle}`);
    if (bookSentences[0]?.author) {
      lines.push(`*\uC800\uC790: ${bookSentences[0].author}*`);
    }
    lines.push("");
    bookSentences.forEach((s, index) => {
      lines.push(`### ${index + 1}. ${s.pageNumber ? `(p.${s.pageNumber})` : ""}`);
      lines.push("");
      lines.push(`> ${s.content}`);
      lines.push("");
      const metadata = [];
      if (s.likes > 0) metadata.push(`\u2764\uFE0F ${s.likes}`);
      metadata.push(`\u{1F4C5} ${formatKoreanDate(new Date(s.createdAt))}`);
      if (metadata.length > 0) {
        lines.push(`*${metadata.join(" \u2022 ")}*`);
        lines.push("");
      }
    });
    lines.push("---");
    lines.push("");
  });
  lines.push("");
  lines.push("*\u2728 \uBB38\uC7A5\uC218\uC9D1\uAC00\uC5D0\uC11C \uB0B4\uBCF4\uB0C4*");
  return lines.join("\n");
}
function convertToJSON(sentences2) {
  const exportData = {
    metadata: {
      title: "\uBB38\uC7A5\uC218\uC9D1\uAC00 \uB0B4\uBCF4\uB0B4\uAE30",
      exportDate: (/* @__PURE__ */ new Date()).toISOString(),
      totalSentences: sentences2.length,
      totalBooks: new Set(sentences2.map((s) => s.bookTitle).filter(Boolean)).size
    },
    sentences: sentences2.map((s, index) => ({
      id: index + 1,
      content: s.content,
      book: {
        title: s.bookTitle || null,
        author: s.author || null,
        pageNumber: s.pageNumber || null
      },
      stats: {
        likes: s.likes || 0,
        createdAt: s.createdAt
      }
    }))
  };
  return JSON.stringify(exportData, null, 2);
}
router6.get("/export", requireAuth, async (req, res) => {
  try {
    const { format = "txt", type = "all", bookTitle, startDate, endDate } = req.query;
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    let sentences2 = await storage.getUserSentences(userId);
    let filename = "sentences";
    let exportTitle = "\uB098\uC758 \uBB38\uC7A5 \uBAA8\uC74C";
    if (type === "book" && bookTitle) {
      const decodedTitle = decodeURIComponent(bookTitle);
      sentences2 = sentences2.filter((s) => s.bookTitle === decodedTitle);
      filename = `${decodedTitle}_sentences`;
      exportTitle = `${decodedTitle} - \uBB38\uC7A5 \uBAA8\uC74C`;
    } else if (type === "date" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      sentences2 = sentences2.filter((s) => {
        const createdAt = new Date(s.createdAt);
        return createdAt >= start && createdAt <= end;
      });
      filename = `sentences_${startDate}_to_${endDate}`;
      exportTitle = `${formatKoreanDate(start)} ~ ${formatKoreanDate(end)} \uBB38\uC7A5 \uBAA8\uC74C`;
    }
    sentences2.sort((a, b) => {
      const bookCompare = (a.bookTitle || "").localeCompare(b.bookTitle || "");
      if (bookCompare !== 0) return bookCompare;
      return (a.pageNumber || 0) - (b.pageNumber || 0);
    });
    let content;
    let contentType;
    let extension;
    switch (format) {
      case "csv":
        content = "\uFEFF" + convertToCSV(sentences2);
        contentType = "text/csv; charset=utf-8";
        extension = "csv";
        break;
      case "json":
        content = convertToJSON(sentences2);
        contentType = "application/json; charset=utf-8";
        extension = "json";
        break;
      case "markdown":
        content = convertToMarkdown(sentences2, exportTitle);
        contentType = "text/markdown; charset=utf-8";
        extension = "md";
        break;
      case "txt":
      default:
        content = convertToText(sentences2, exportTitle);
        contentType = "text/plain; charset=utf-8";
        extension = "txt";
        break;
    }
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.${extension}"`);
    res.setHeader("Cache-Control", "no-cache");
    res.send(content);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Failed to export sentences" });
  }
});
router6.get("/export/stats", requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const sentences2 = await storage.getUserSentences(userId);
    const stats = {
      totalSentences: sentences2.length,
      totalBooks: new Set(sentences2.filter((s) => s.bookTitle).map((s) => s.bookTitle)).size,
      totalLikes: sentences2.reduce((sum, s) => sum + (s.likes || 0), 0),
      averageLength: sentences2.length > 0 ? Math.round(sentences2.reduce((sum, s) => sum + s.content.length, 0) / sentences2.length) : 0,
      dateRange: {
        earliest: sentences2.length > 0 ? sentences2.reduce((min, s) => new Date(s.createdAt) < new Date(min) ? s.createdAt : min, sentences2[0].createdAt) : null,
        latest: sentences2.length > 0 ? sentences2.reduce((max, s) => new Date(s.createdAt) > new Date(max) ? s.createdAt : max, sentences2[0].createdAt) : null
      },
      bookList: Array.from(new Set(sentences2.filter((s) => s.bookTitle).map((s) => s.bookTitle))).map((title) => ({
        title,
        count: sentences2.filter((s) => s.bookTitle === title).length,
        author: sentences2.find((s) => s.bookTitle === title)?.author || null
      })).sort((a, b) => b.count - a.count)
    };
    res.json(stats);
  } catch (error) {
    console.error("Export stats error:", error);
    res.status(500).json({ error: "Failed to get export statistics" });
  }
});
var export_routes_default = router6;

// server/routes/index.ts
init_auth();
function registerRoutes(app2) {
  app2.use(authMiddleware);
  app2.use(auth_routes_default);
  app2.use(sentences_routes_default);
  app2.use(user_routes_default);
  app2.use(books_routes_default);
  app2.use(communities_routes_default);
  app2.use("/api", export_routes_default);
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API endpoint not found" });
  });
}

// server/routes.ts
function registerRoutes2(app2) {
  app2.use("/uploads", import_express7.default.static("server/uploads"));
  registerRoutes(app2);
  const server = (0, import_http.createServer)(app2);
  return server;
}

// server/vite.ts
var import_express8 = __toESM(require("express"));
var import_fs2 = __toESM(require("fs"));
var import_path3 = __toESM(require("path"));
var import_url2 = require("url");
var import_vite2 = require("vite");

// vite.config.ts
var import_vite = require("vite");
var import_plugin_react = __toESM(require("@vitejs/plugin-react"));
var import_path2 = __toESM(require("path"));
var import_url = require("url");
var import_meta = {};
var __dirname = import_path2.default.dirname((0, import_url.fileURLToPath)(import_meta.url));
var vite_config_default = (0, import_vite.defineConfig)({
  plugins: [
    (0, import_plugin_react.default)()
  ],
  resolve: {
    alias: {
      "@": import_path2.default.resolve(__dirname, "client", "src"),
      "@shared": import_path2.default.resolve(__dirname, "shared"),
      "@assets": import_path2.default.resolve(__dirname, "attached_assets")
    }
  },
  root: import_path2.default.resolve(__dirname, "client"),
  publicDir: import_path2.default.resolve(__dirname, "client", "public"),
  build: {
    outDir: import_path2.default.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    assetsInlineLimit: 0
    // Don't inline any assets
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    }
  }
});

// server/vite.ts
var import_nanoid = require("nanoid");
var import_meta2 = {};
var __dirname2 = import_path3.default.dirname((0, import_url2.fileURLToPath)(import_meta2.url));
var viteLogger = (0, import_vite2.createLogger)();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server }
  };
  const vite = await (0, import_vite2.createServer)({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = import_path3.default.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await import_fs2.default.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${(0, import_nanoid.nanoid)()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = import_path3.default.resolve(import_meta2.dirname, "public");
  if (!import_fs2.default.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(import_express8.default.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(import_path3.default.resolve(distPath, "index.html"));
  });
}

// server/index.ts
init_auth();
import_dotenv2.default.config();
var app = (0, import_express9.default)();
app.use((req, res, next) => {
  const allowedOrigins = ["http://localhost:3000", "http://localhost:5000"];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(import_express9.default.json());
app.use(import_express9.default.urlencoded({ extended: false }));
app.use((0, import_express_session.default)({
  secret: process.env.SESSION_SECRET || "sentence-collection-secret-key-2025",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1e3,
    // 7 days
    sameSite: "lax"
  },
  name: "sessionId"
}));
app.use(import_passport3.default.initialize());
app.use(import_passport3.default.session());
initializeGoogleOAuth();
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
var serverInstance;
(async () => {
  const server = await registerRoutes2(app);
  serverInstance = server;
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    if (!res.headersSent) {
      res.status(status).json({
        error: message,
        status
      });
    }
    console.error("Express error:", err);
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  if (!process.env.VERCEL) {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5e3;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      log(`serving on port ${port}`);
    });
  }
})();
var index_default = app;
