'use client';

import { useState } from 'react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just show success. Connect to actual backend later.
    setSubmitted(true);
  };

  return (
    <main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '8px' }}>ClawID</h1>
        <p style={{ fontSize: '1.5rem', color: '#666', margin: 0 }}>
          Cryptographic verification for AI agent skills
        </p>
      </div>

      {/* Value Prop */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '32px',
        borderRadius: '12px',
        marginBottom: '32px'
      }}>
        <h2 style={{ marginTop: 0 }}>Prove what ran, who ran it, and what it was allowed to do.</h2>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
          ClawID turns agent actions, skill bundles, and policy configs into verifiable receipts.
        </p>
      </div>

      {/* Features */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>🔑 Sign Skills</h3>
          <p style={{ color: '#666', margin: 0 }}>Create cryptographic signatures for your skill bundles</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>✅ Verify Integrity</h3>
          <p style={{ color: '#666', margin: 0 }}>Confirm skills haven't been tampered with</p>
        </div>
        <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>👤 Prove Identity</h3>
          <p style={{ color: '#666', margin: 0 }}>Link signatures to verified publisher identities</p>
        </div>
      </div>

      {/* Waitlist */}
      <div style={{
        background: '#f8f9fa',
        padding: '32px',
        borderRadius: '12px',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginTop: 0 }}>Join the Waitlist</h2>
        <p style={{ color: '#666' }}>Be the first to know when we launch.</p>

        {!submitted ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                padding: '12px 16px',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                minWidth: '250px'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Notify Me
            </button>
          </form>
        ) : (
          <div style={{ color: '#28a745', fontWeight: 'bold' }}>
            ✅ Thanks! We'll notify you when we launch.
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffc107',
        padding: '16px 20px',
        borderRadius: '8px',
        marginBottom: '32px'
      }}>
        <strong>⚠️ Important:</strong> ClawID verifies <em>integrity</em> and <em>provenance</em> — NOT safety.
        A verified skill means it hasn't been tampered with and we know who signed it.
        It does NOT mean the code has been audited for malware.
      </div>

      {/* Verify CTA */}
      <div style={{
        background: '#e8f4fd',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginTop: 0 }}>🔍 Verify a Skill Online</h3>
        <p style={{ color: '#666', marginBottom: '16px' }}>
          Upload a skill bundle and signature to verify integrity in your browser.
        </p>
        <a
          href="/verify"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#667eea',
            color: 'white',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold',
          }}
        >
          Open Verifier →
        </a>
      </div>

      {/* Links */}
      <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3>Links</h3>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <li>
            <a href="https://github.com/MythyaVerse/clawid" target="_blank" rel="noopener noreferrer"
               style={{ color: '#667eea', textDecoration: 'none' }}>
              GitHub →
            </a>
          </li>
          <li>
            <a href="https://www.npmjs.com/package/@clawid/cli" target="_blank" rel="noopener noreferrer"
               style={{ color: '#667eea', textDecoration: 'none' }}>
              npm →
            </a>
          </li>
          <li>
            <a href="/verify" style={{ color: '#667eea', textDecoration: 'none' }}>
              Verify →
            </a>
          </li>
          <li>
            <a href="/test" style={{ color: '#667eea', textDecoration: 'none' }}>
              Test Pages →
            </a>
          </li>
        </ul>
      </div>
    </main>
  );
}
