"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.pool = exports.supabase = void 0;
exports.testConnection = testConnection;
const pg_1 = require("pg");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const supabase_js_1 = require("@supabase/supabase-js");
const schema = __importStar(require("@shared/schema"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Supabase client for additional features (auth, realtime, storage, etc.)
exports.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
// Use Supabase database URL if available, otherwise fallback to local
const DATABASE_URL = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/db";
// PostgreSQL pool for Drizzle ORM
exports.pool = new pg_1.Pool({
    connectionString: DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
// Drizzle ORM instance with schema
exports.db = (0, node_postgres_1.drizzle)(exports.pool, { schema });
// Test connection function
async function testConnection() {
    try {
        const result = await exports.pool.query('SELECT NOW()');
        console.log('✅ Database connected successfully:', result.rows[0]);
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}
