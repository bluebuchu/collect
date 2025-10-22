-- Collect App Database Schema

CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" text NOT NULL,
	"nickname" varchar(50) NOT NULL,
	"profile_image" text,
	"bio" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "books" (
	"id" serial PRIMARY KEY NOT NULL,
	"isbn" varchar(20),
	"title" text NOT NULL,
	"author" text,
	"publisher" text,
	"cover" text,
	"search_count" integer DEFAULT 1 NOT NULL,
	"sentence_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "books_isbn_unique" UNIQUE("isbn")
);

CREATE TABLE "sentences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"content" text NOT NULL,
	"book_title" text,
	"author" text,
	"publisher" text,
	"page_number" integer,
	"likes" integer DEFAULT 0 NOT NULL,
	"is_public" integer DEFAULT 0 NOT NULL,
	"private_note" text,
	"is_bookmarked" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"legacy_nickname" text
);

CREATE TABLE "sentence_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"sentence_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "communities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"cover_image" text,
	"category" varchar(50),
	"related_book" varchar(255),
	"creator_id" integer NOT NULL,
	"member_count" integer DEFAULT 0 NOT NULL,
	"is_public" integer DEFAULT 1 NOT NULL,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"sentence_count" integer DEFAULT 0 NOT NULL,
	"total_likes" integer DEFAULT 0 NOT NULL,
	"total_comments" integer DEFAULT 0 NOT NULL,
	"activity_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "community_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"community_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" varchar(20) DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "community_sentences" (
	"id" serial PRIMARY KEY NOT NULL,
	"community_id" integer NOT NULL,
	"sentence_id" integer NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);

CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp NOT NULL
);

-- Add Foreign Key Constraints
ALTER TABLE "sentences" ADD CONSTRAINT "sentences_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "sentence_likes" ADD CONSTRAINT "sentence_likes_sentence_id_sentences_id_fk" 
  FOREIGN KEY ("sentence_id") REFERENCES "public"."sentences"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "sentence_likes" ADD CONSTRAINT "sentence_likes_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "communities" ADD CONSTRAINT "communities_creator_id_users_id_fk" 
  FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "community_members" ADD CONSTRAINT "community_members_community_id_communities_id_fk" 
  FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "community_members" ADD CONSTRAINT "community_members_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "community_sentences" ADD CONSTRAINT "community_sentences_community_id_communities_id_fk" 
  FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "community_sentences" ADD CONSTRAINT "community_sentences_sentence_id_sentences_id_fk" 
  FOREIGN KEY ("sentence_id") REFERENCES "public"."sentences"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;