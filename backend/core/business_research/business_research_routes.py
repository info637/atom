"""
Business Research API Routes

FastAPI endpoints for business research functionality.
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
import json
import asyncio
from typing import Dict, Any, List

from core.business_research.business_research_service import BusinessResearchService
from core.database_manager import db_manager

# Initialize router
router = APIRouter(prefix="/api/research")

# Global service instance
research_service = BusinessResearchService()

# Task tracking
active_tasks = {}

# Pydantic models
class ResearchStartRequest:
    business_name: str

class ResearchCancelRequest:
    task_id: str

@router.post("/start")
async def start_research(request: ResearchStartRequest):
    """Start a new research task"""
    try:
        # Validate input
        if not request.business_name or not request.business_name.strip():
            raise HTTPException(status_code=400, detail="Business name is required")
        
        business_name = request.business_name.strip()
        
        # Start research in background
        task_info = await research_service.init_research(business_name)
        task_id = task_info["task_id"]
        
        # Store active task
        active_tasks[task_id] = {
            "business_name": business_name,
            "status": "RUNNING",
            "started_at": asyncio.get_event_loop().time()
        }
        
        # Execute research in background
        asyncio.create_task(execute_research_background(task_id, business_name))
        
        return {
            "task_id": task_id,
            "status": "QUEUED",
            "business_name": business_name
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start research: {str(e)}")

async def execute_research_background(task_id: str, business_name: str):
    """Execute research in background task"""
    try:
        # Update task status
        await db_manager.update_research_task(task_id, status="RUNNING")
        active_tasks[task_id]["status"] = "RUNNING"
        
        # Execute research
        results = await research_service.execute_research(business_name)
        
        # Store results
        active_tasks[task_id]["results"] = results
        active_tasks[task_id]["status"] = "COMPLETED"
        
    except Exception as e:
        # Handle errors
        await db_manager.update_research_task(task_id, status="ERROR", error_message=str(e))
        active_tasks[task_id]["status"] = "ERROR"
        active_tasks[task_id]["error"] = str(e)

@router.get("/{task_id}/status")
async def get_research_status(task_id: str):
    """Get research task status"""
    try:
        # Check active tasks first
        if task_id in active_tasks:
            task = active_tasks[task_id]
            status_response = {
                "task_id": task_id,
                "business_name": task["business_name"],
                "status": task["status"],
                "progress": 100 if task["status"] == "COMPLETED" else 0,
                "current_step": "Research completed" if task["status"] == "COMPLETED" else "Running research..."
            }
            
            # Include results if completed
            if task["status"] == "COMPLETED" and "results" in task:
                status_response["results"] = task["results"]
            elif task["status"] == "ERROR":
                status_response["error"] = task.get("error", "Unknown error")
            
            return status_response
        
        # Check database for historical data
        task_data = await db_manager.get_research_task(task_id)
        if not task_data:
            raise HTTPException(status_code=404, detail="Research task not found")
        
        # Get results if completed
        results = None
        if task_data["status"] == "COMPLETED":
            results_data = await db_manager.get_research_results(task_id)
            if results_data:
                results = {
                    "contact_data": json.loads(results_data["contact_data"]) if results_data["contact_data"] else None,
                    "technical_audit": json.loads(results_data["technical_audit"]) if results_data["technical_audit"] else None,
                    "upsell_recommendations": json.loads(results_data["upsell_recommendations"]) if results_data["upsell_recommendations"] else []
                }
        
        return {
            "task_id": task_id,
            "business_name": task_data["business_name"],
            "status": task_data["status"],
            "progress": task_data.get("progress", 0),
            "current_step": task_data.get("current_step", "Unknown"),
            "created_at": task_data["created_at"],
            "updated_at": task_data["updated_at"],
            "results": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")

@router.get("/{task_id}/results")
async def get_research_results(task_id: str):
    """Get complete research results"""
    try:
        # Check active tasks first
        if task_id in active_tasks and active_tasks[task_id]["status"] == "COMPLETED":
            return active_tasks[task_id]["results"]
        
        # Get from database
        results_data = await db_manager.get_research_results(task_id)
        if not results_data:
            raise HTTPException(status_code=404, detail="Research results not found")
        
        return {
            "task_id": task_id,
            "business_name": active_tasks.get(task_id, {}).get("business_name", "Unknown"),
            "status": "COMPLETED",
            "timestamp": results_data["created_at"],
            "contact_data": json.loads(results_data["contact_data"]) if results_data["contact_data"] else None,
            "technical_audit": json.loads(results_data["technical_audit"]) if results_data["technical_audit"] else None,
            "upsell_recommendations": json.loads(results_data["upsell_recommendations"]) if results_data["upsell_recommendations"] else []
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get results: {str(e)}")

@router.post("/{task_id}/cancel")
async def cancel_research(task_id: str):
    """Cancel running research task"""
    try:
        if task_id not in active_tasks:
            raise HTTPException(status_code=404, detail="Research task not found")
        
        task = active_tasks[task_id]
        if task["status"] not in ["RUNNING", "QUEUED"]:
            raise HTTPException(status_code=400, detail=f"Cannot cancel task with status: {task['status']}")
        
        # Cancel the task
        await research_service.cancel_research(task_id)
        await db_manager.update_research_task(task_id, status="CANCELLED")
        
        task["status"] = "CANCELLED"
        
        return {
            "success": True,
            "message": "Research cancelled successfully",
            "task_id": task_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cancel research: {str(e)}")

@router.get("/history")
async def get_research_history(limit: int = 20):
    """Get research task history"""
    try:
        history_data = await db_manager.get_research_history(limit)
        
        # Format history for frontend
        history = []
        for task in history_data:
            # Get results for completed tasks
            results = None
            contact_count = 0
            grade = "N/A"
            
            if task["status"] == "COMPLETED":
                results_data = await db_manager.get_research_results(task["id"])
                if results_data:
                    contact_data = json.loads(results_data["contact_data"]) if results_data["contact_data"] else {}
                    contact_count = len([k for k, v in contact_data.items() if v and k != "sources"])
                    grade = "B"  # Mock grade - would come from technical audit
            
            history.append({
                "task_id": task["id"],
                "business_name": task["business_name"],
                "date": task["created_at"],
                "grade": grade,
                "contact_count": contact_count,
                "status": task["status"]
            })
        
        return history
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")

@router.get("/{task_id}/logs")
async def get_research_logs(task_id: str):
    """Get research task logs"""
    try:
        logs = await db_manager.get_research_logs(task_id)
        return [
            {
                "timestamp": log["timestamp"],
                "step": log["step"],
                "progress": log["progress"],
                "status": log["status"]
            }
            for log in logs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get logs: {str(e)}")

@router.websocket("/{task_id}/stream")
async def websocket_research_stream(websocket, task_id: str):
    """WebSocket endpoint for real-time research updates"""
    await websocket.accept()
    
    try:
        # Send initial status
        await websocket.send_json({
            "type": "status_update",
            "task_id": task_id,
            "status": "connected",
            "timestamp": asyncio.get_event_loop().time()
        })
        
        # Monitor task progress
        while True:
            if task_id in active_tasks:
                task = active_tasks[task_id]
                
                # Send status update
                await websocket.send_json({
                    "type": "status_update",
                    "task_id": task_id,
                    "status": task["status"],
                    "business_name": task["business_name"],
                    "timestamp": asyncio.get_event_loop().time()
                })
                
                # Send results if completed
                if task["status"] == "COMPLETED" and "results" in task:
                    await websocket.send_json({
                        "type": "results",
                        "task_id": task_id,
                        "data": task["results"]
                    })
                    break
                
                # Send error if failed
                if task["status"] == "ERROR":
                    await websocket.send_json({
                        "type": "error",
                        "task_id": task_id,
                        "error": task.get("error", "Unknown error")
                    })
                    break
            
            # Wait before next update
            await asyncio.sleep(2)
            
    except Exception as e:
        logger = logging.getLogger(__name__)
        logger.error(f"WebSocket error: {e}")
    finally:
        try:
            await websocket.close()
        except:
            pass