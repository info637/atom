"""
Database Manager

Handles SQLite database connections and operations using aiosqlite.
Provides async methods for executing queries and managing transactions.
"""

import os
import logging
import json
import time
from datetime import datetime
import aiosqlite
from typing import Optional, List, Dict, Any, Tuple
from core.config import get_config

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self):
        self.config = get_config()
        # Extract path from sqlite:///path/to/db
        db_url = self.config.database.url
        if db_url.startswith("sqlite:///"):
            self.db_path = db_url.replace("sqlite:///", "")
        else:
            self.db_path = "atom_data.db"
            
        self.connection: Optional[aiosqlite.Connection] = None
        
    async def initialize(self):
        """Initialize database connection and schema"""
        try:
            self.connection = await aiosqlite.connect(self.db_path)
            self.connection.row_factory = aiosqlite.Row
            logger.info(f"Connected to database: {self.db_path}")
            
            await self._create_tables()
            
        except Exception as e:
            logger.error(f"Database initialization failed: {e}")
            raise
    
    async def _create_tables(self):
        """Create necessary tables if they don't exist"""
        # Workflow Executions Table
        await self.execute("""
            CREATE TABLE IF NOT EXISTS workflow_executions (
                execution_id TEXT PRIMARY KEY,
                workflow_id TEXT NOT NULL,
                status TEXT NOT NULL,
                input_data TEXT,
                steps TEXT,
                outputs TEXT,
                context TEXT,
                created_at TEXT,
                updated_at TEXT,
                error TEXT
            )
        """)

        # Business Research Tables
        await self.execute("""
            CREATE TABLE IF NOT EXISTS research_tasks (
                id TEXT PRIMARY KEY,
                business_name TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT,
                updated_at TEXT,
                user_id TEXT,
                progress INTEGER DEFAULT 0,
                current_step TEXT,
                error_message TEXT
            )
        """)

        await self.execute("""
            CREATE TABLE IF NOT EXISTS research_results (
                id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                contact_data TEXT,
                technical_audit TEXT,
                upsell_recommendations TEXT,
                created_at TEXT,
                FOREIGN KEY (task_id) REFERENCES research_tasks (id)
            )
        """)

        await self.execute("""
            CREATE TABLE IF NOT EXISTS research_logs (
                id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                step TEXT,
                progress INTEGER,
                timestamp TEXT,
                status TEXT,
                FOREIGN KEY (task_id) REFERENCES research_tasks (id)
            )
        """)
        
        logger.info("Database tables initialized")

    async def close(self):
        """Close database connection"""
        if self.connection:
            await self.connection.close()
            self.connection = None
            logger.info("Database connection closed")
    
    async def execute(self, query: str, params: Tuple = ()) -> aiosqlite.Cursor:
        """Execute a query (INSERT, UPDATE, DELETE, CREATE)"""
        if not self.connection:
            await self.initialize()
            
        async with self.connection.execute(query, params) as cursor:
            await self.connection.commit()
            return cursor

    async def fetch_one(self, query: str, params: Tuple = ()) -> Optional[Dict[str, Any]]:
        """Fetch a single row"""
        if not self.connection:
            await self.initialize()
            
        async with self.connection.execute(query, params) as cursor:
            row = await cursor.fetchone()
            if row:
                return dict(row)
            return None

    async def fetch_all(self, query: str, params: Tuple = ()) -> List[Dict[str, Any]]:
        """Fetch all rows"""
        if not self.connection:
            await self.initialize()
            
        async with self.connection.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

    # User operations (placeholder implementations updated to use DB if needed later)
    async def create_user(self, email: str, name: Optional[str] = None):
        return {"id": "user_1", "email": email, "name": name}
    
    async def get_user_by_email(self, email: str):
        return {"id": "user_1", "email": email, "name": "Test User"}

    # Business Research Database Operations
    async def create_research_task(self, task_id: str, business_name: str, user_id: str = None):
        """Create a new research task"""
        now = datetime.now().isoformat()
        await self.execute(
            """INSERT INTO research_tasks (id, business_name, status, created_at, updated_at, user_id, progress) 
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (task_id, business_name, 'QUEUED', now, now, user_id, 0)
        )
        return {"task_id": task_id, "business_name": business_name, "status": "QUEUED"}

    async def update_research_task(self, task_id: str, **updates):
        """Update research task status and progress"""
        if not updates:
            return
            
        fields = []
        values = []
        for key, value in updates.items():
            if key in ['status', 'progress', 'current_step', 'error_message', 'updated_at']:
                fields.append(f"{key} = ?")
                values.append(value)
        
        if fields:
            values.append(task_id)
            values.append(datetime.now().isoformat())
            fields.append("updated_at = ?")
            
            await self.execute(
                f"UPDATE research_tasks SET {', '.join(fields)} WHERE id = ?",
                tuple(values)
            )

    async def get_research_task(self, task_id: str):
        """Get research task by ID"""
        return await self.fetch_one("SELECT * FROM research_tasks WHERE id = ?", (task_id,))

    async def get_research_history(self, limit: int = 20):
        """Get research task history"""
        rows = await self.fetch_all(
            "SELECT * FROM research_tasks ORDER BY created_at DESC LIMIT ?", 
            (limit,)
        )
        return rows

    async def save_research_results(self, task_id: str, contact_data: Dict, technical_audit: Dict, upsell_recommendations: List):
        """Save research results"""
        result_id = f"result_{task_id}"
        now = datetime.now().isoformat()
        
        await self.execute(
            """INSERT INTO research_results (id, task_id, contact_data, technical_audit, upsell_recommendations, created_at) 
               VALUES (?, ?, ?, ?, ?, ?)""",
            (result_id, task_id, json.dumps(contact_data), json.dumps(technical_audit), 
             json.dumps(upsell_recommendations), now)
        )
        
        # Update task status
        await self.update_research_task(task_id, status='COMPLETED', progress=100)
        return {"result_id": result_id}

    async def get_research_results(self, task_id: str):
        """Get research results by task ID"""
        return await self.fetch_one("SELECT * FROM research_results WHERE task_id = ?", (task_id,))

    async def add_research_log(self, task_id: str, step: str, progress: int, status: str):
        """Add a log entry for research progress"""
        import time
        log_id = f"log_{task_id}_{int(time.time() * 1000000)}"  # Add microseconds for uniqueness
        timestamp = datetime.now().isoformat()
        
        await self.execute(
            """INSERT INTO research_logs (id, task_id, step, progress, timestamp, status) 
               VALUES (?, ?, ?, ?, ?, ?)""",
            (log_id, task_id, step, progress, timestamp, status)
        )

    async def get_research_logs(self, task_id: str):
        """Get all logs for a research task"""
        return await self.fetch_all(
            "SELECT * FROM research_logs WHERE task_id = ? ORDER BY timestamp ASC", 
            (task_id,)
        )

# Global instance
db_manager = DatabaseManager()
