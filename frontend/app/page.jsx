'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, compliant: 0 })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

  useEffect(() => {
    fetchPapers()
  }, [])

  async function fetchPapers() {
    try {
      const response = await fetch(`${apiUrl}/papers`)
      const data = await response.json()
      setPapers(data.papers || [])
      
      // Calculate stats
      const total = data.papers?.length || 0
      const compliant = data.papers?.filter(p => p.ipcc_compliant).length || 0
      setStats({ total, compliant })
    } catch (error) {
      console.error('Error fetching papers:', error)
    } finally {
      setLoading(false)
    }
  }

  async function crawlNewPapers() {
    try {
      const response = await fetch(`${apiUrl}/crawl/openalex?limit=5`)
      const data = await response.json()
      alert(data.message || 'Crawl completed')
      fetchPapers() // Refresh list
    } catch (error) {
      alert('Error crawling papers')
    }
  }

  function downloadSDMX(format) {
    window.open(`${apiUrl}/export/sdmx?format=${format}`, '_blank')
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#1a5fb4' }}>KIFARU Research Dashboard</h1>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>
          Climate Research Knowledge Management System
        </p>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: '#f0f9ff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #bae6fd'
        }}>
          <h3 style={{ marginTop: 0 }}>Total Papers</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' }}>
            {stats.total}
          </p>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Collected from research databases</p>
        </div>

        <div style={{
          backgroundColor: '#f0fdf4',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #86efac'
        }}>
          <h3 style={{ marginTop: 0 }}>IPCC Compliant</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0', color: '#16a34a' }}>
            {stats.compliant}
          </p>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Meets IPCC AR7 criteria</p>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={crawlNewPapers}
          style={{
            padding: '12px 24px',
            backgroundColor: '#1a5fb4',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            marginRight: '10px'
          }}
        >
          Fetch New Papers
        </button>

        <button
          onClick={() => downloadSDMX('xml')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem',
            marginRight: '10px'
          }}
        >
          Export SDMX-ML
        </button>

        <button
          onClick={() => downloadSDMX('json')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Export SDMX-JSON
        </button>
      </div>

      {loading ? (
        <p>Loading papers...</p>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '15px 20px',
            backgroundColor: '#f9fafb',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h3 style={{ margin: 0 }}>Recent Research Papers</h3>
          </div>

          <div style={{ padding: '20px' }}>
            {papers.length === 0 ? (
              <p>No papers yet. Click "Fetch New Papers" to start.</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {papers.map((paper) => (
                  <div
                    key={paper.id}
                    style={{
                      padding: '20px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      backgroundColor: paper.ipcc_compliant ? '#f0fdf4' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ marginTop: 0, marginBottom: '8px' }}>
                          {paper.title}
                        </h4>
                        <p style={{ color: '#666', marginBottom: '10px' }}>
                          {paper.authors?.join(', ')} • {paper.journal} ({paper.year})
                        </p>
                        <p style={{ fontSize: '0.9rem', color: '#555' }}>
                          {paper.abstract || 'No abstract available'}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '4px 12px',
                          backgroundColor: paper.ipcc_compliant ? '#dcfce7' : '#fee2e2',
                          color: paper.ipcc_compliant ? '#166534' : '#991b1b',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}>
                          {paper.ipcc_compliant ? 'IPCC Compliant' : 'Review Needed'}
                        </span>
                        <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#666' }}>
                          Citations: {paper.citations || 0}
                        </p>
                      </div>
                    </div>
                    {paper.doi && (
                      <a
                        href={`https://doi.org/${paper.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-block',
                          marginTop: '10px',
                          color: '#1a5fb4',
                          textDecoration: 'none'
                        }}
                      >
                        View Paper →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <footer style={{
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
        color: '#666',
        fontSize: '0.9rem'
      }}>
        <p>KIFARU Research System • Data sources: OpenAlex, arXiv • SDMX Export Compatible</p>
        <p>API Status: <a href={`${apiUrl}/health`} target="_blank" style={{ color: '#1a5fb4' }}>Check Health</a></p>
      </footer>
    </div>
  )
}
