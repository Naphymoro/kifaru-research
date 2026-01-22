# kifaru-research
Climate Research Knowledge Management System
# KIFARU Research System

Knowledge Integrator for Africa's Reviewable Understanding

## Overview
KIFARU is a climate research knowledge management system that:
- Collects climate research papers from multiple sources
- Checks IPCC AR7 Annex 2 compliance
- Exports data in SDMX-ML format
- Provides a clean dashboard for researchers

## Live Deployment
- **Frontend Dashboard**: https://kifaru.vercel.app
- **Backend API**: https://kifaru-production.up.railway.app
- **API Documentation**: https://kifaru-production.up.railway.app/docs

## Architecture
- **Frontend: Next.js (Vercel)
- **Backend: FastAPI (Railway)
- **Database: PostgreSQL (Railway)
- **Crawlers: GitHub Actions (Free)

## Project Structure
kifaru-research/
├── backend/ # FastAPI application
├── frontend/ # Next.js dashboard
├── crawlers/ # Data collection scripts
└── README.md # This file


## Local Development

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
