from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from datetime import datetime
import requests
import json
import os
from typing import List, Dict

app = FastAPI(title="KIFARU API", version="1.0.0")

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store papers in memory (for demo)
papers_db = []

@app.get("/")
def root():
    return {"message": "KIFARU Research API", "status": "active"}

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/papers")
def get_papers():
    """Get all papers"""
    return {
        "papers": papers_db,
        "count": len(papers_db),
        "source": "KIFARU Database"
    }

@app.post("/initialize")
def initialize():
    """Initialize system with sample data"""
    global papers_db
    
    sample_papers = [
        {
            "id": "KIF-2024-001",
            "doi": "10.1038/s41558-024-01951-1",
            "title": "Climate Change Impacts on African Agriculture",
            "authors": ["Smith, J", "Chen, A", "Koffi, B"],
            "journal": "Nature Climate Change",
            "year": 2024,
            "citations": 42,
            "ipcc_compliant": True,
            "methodology": "Tier 2",
            "scenarios": ["SSP2-4.5"],
            "abstract": "Study of climate impacts on agricultural systems in Africa...",
            "added_date": datetime.now().isoformat()
        },
        {
            "id": "KIF-2024-002",
            "doi": "10.1126/science.adj1234",
            "title": "Renewable Energy Transition in Developing Nations",
            "authors": ["Wang, L", "Singh, R", "Adebayo, M"],
            "journal": "Science",
            "year": 2024,
            "citations": 31,
            "ipcc_compliant": True,
            "methodology": "Tier 3",
            "scenarios": ["SSP1-2.6", "SSP2-4.5"],
            "abstract": "Analysis of renewable energy adoption pathways...",
            "added_date": datetime.now().isoformat()
        }
    ]
    
    papers_db = sample_papers
    return {"message": "Initialized with 2 sample papers", "count": len(papers_db)}

@app.get("/crawl/openalex")
def crawl_openalex(limit: int = 5):
    """Crawl real papers from OpenAlex API"""
    try:
        email = os.getenv("OPENALEX_EMAIL", "research@kifaru.africa")
        
        response = requests.get(
            "https://api.openalex.org/works",
            params={
                "filter": "concepts.id:C144133970",  # Climate change
                "per-page": limit,
                "mailto": email
            }
        )
        
        if response.status_code == 200:
            new_papers = []
            for work in response.json().get('results', []):
                paper = {
                    "id": f"KIF-{datetime.now().year}-{work['id'].split('/')[-1][:6]}",
                    "doi": work.get('doi'),
                    "title": work.get('title'),
                    "authors": [author['author']['display_name'] 
                               for author in work.get('authorships', [])],
                    "journal": work.get('primary_location', {}).get('source', {}).get('display_name', 'Unknown'),
                    "year": work.get('publication_year'),
                    "citations": work.get('cited_by_count', 0),
                    "ipcc_compliant": True,  # Assuming all from climate category
                    "methodology": "Unknown",
                    "scenarios": [],
                    "abstract": work.get('abstract', '')[:300] + "...",
                    "added_date": datetime.now().isoformat(),
                    "source": "OpenAlex"
                }
                new_papers.append(paper)
                papers_db.append(paper)
            
            return {
                "message": f"Added {len(new_papers)} papers from OpenAlex",
                "papers": new_papers
            }
        else:
            return {"error": "Failed to fetch from OpenAlex", "status_code": response.status_code}
            
    except Exception as e:
        return {"error": str(e)}

@app.get("/export/sdmx")
def export_sdmx(format: str = "xml"):
    """Export papers as SDMX-ML or JSON"""
    
    sdmx_data = {
        "header": {
            "id": f"KIFARU_EXPORT_{datetime.now().strftime('%Y%m%d_%H%M')}",
            "prepared": datetime.now().isoformat(),
            "sender": "KIFARU Research System",
            "receiver": "IPCC/Research Community"
        },
        "structure": {
            "dimensions": ["paper_id", "journal", "year", "ipcc_status"],
            "attributes": ["title", "authors", "doi", "methodology"]
        },
        "data": [
            {
                "paper_id": paper["id"],
                "journal": paper["journal"],
                "year": paper["year"],
                "ipcc_status": "COMPLIANT" if paper.get("ipcc_compliant") else "NON_COMPLIANT",
                "title": paper["title"],
                "authors": ", ".join(paper["authors"][:3]),
                "doi": paper.get("doi", ""),
                "methodology": paper.get("methodology", "Unknown")
            }
            for paper in papers_db
        ]
    }
    
    if format.lower() == "json":
        return JSONResponse(
            content=sdmx_data,
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=kifaru_papers.sdmx.json"}
        )
    else:
        # Generate simple XML
        xml_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<kifaru:DataSet xmlns:kifaru="http://kifaru.africa/sdmx">
  <Header>
    <ID>{sdmx_data["header"]["id"]}</ID>
    <Prepared>{sdmx_data["header"]["prepared"]}</Prepared>
    <Sender>{sdmx_data["header"]["sender"]}</Sender>
  </Header>
  <Papers>
'''
        for item in sdmx_data["data"]:
            xml_content += f'''    <Paper>
      <ID>{item["paper_id"]}</ID>
      <Journal>{item["journal"]}</Journal>
      <Year>{item["year"]}</Year>
      <IPCCStatus>{item["ipcc_status"]}</IPCCStatus>
      <Title>{item["title"]}</Title>
      <Authors>{item["authors"]}</Authors>
    </Paper>
'''
        
        xml_content += '''  </Papers>
</kifaru:DataSet>'''
        
        return JSONResponse(
            content={"sdmx_xml": xml_content},
            headers={"Content-Disposition": "attachment; filename=kifaru_papers.sdmx.xml"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8080)))
