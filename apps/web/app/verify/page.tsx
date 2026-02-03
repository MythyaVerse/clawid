'use client';

import { useState, useCallback } from 'react';
import * as ed from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha512';
import { sha256 } from '@noble/hashes/sha256';

// Enable synchronous methods for ed25519
ed.etc.sha512Sync = (...m: Uint8Array[]) => sha512(ed.etc.concatBytes(...m));

interface SignatureFile {
  version: string;
  signer: {
    did: string;
    publicKey: string;
    proof?: {
      type: string;
      handle?: string;
      url?: string;
    };
  };
  artifact: {
    type: string;
    hash: string;
    filename: string;
    size: number;
  };
  timestamp: string;
  signature: string;
}

type VerificationTier = 'publisher_verified' | 'integrity_verified' | 'unknown_publisher' | 'failed';

interface VerificationResult {
  tier: VerificationTier;
  valid: boolean;
  hashMatch: boolean;
  signatureValid: boolean;
  signerDid: string;
  expectedHash: string;
  actualHash: string;
  hasProof: boolean;
  proofType?: string;
  proofHandle?: string;
  error?: string;
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyInBrowser(
  zipFile: File,
  sigFile: SignatureFile
): Promise<VerificationResult> {
  // Read zip file and compute hash
  const zipBuffer = await zipFile.arrayBuffer();
  const zipBytes = new Uint8Array(zipBuffer);
  const hashBytes = sha256(zipBytes);
  const actualHash = `sha256:${bytesToHex(hashBytes)}`;

  const expectedHash = sigFile.artifact.hash;
  const hashMatch = actualHash === expectedHash;

  // Create payload for signature verification
  const payload = JSON.stringify({
    did: sigFile.signer.did,
    hash: sigFile.artifact.hash,
    filename: sigFile.artifact.filename,
    timestamp: sigFile.timestamp,
  });
  const payloadBytes = new TextEncoder().encode(payload);

  // Verify signature
  let signatureValid = false;
  try {
    const signature = hexToBytes(sigFile.signature);
    const publicKey = hexToBytes(sigFile.signer.publicKey);
    signatureValid = await ed.verifyAsync(signature, payloadBytes, publicKey);
  } catch {
    signatureValid = false;
  }

  // Check proof
  const hasProof = !!sigFile.signer.proof;

  // Determine tier
  let tier: VerificationTier;
  if (!hashMatch || !signatureValid) {
    tier = 'failed';
  } else if (hasProof) {
    // In browser, we can't verify the proof online, so show integrity verified
    tier = 'integrity_verified';
  } else {
    tier = 'unknown_publisher';
  }

  return {
    tier,
    valid: hashMatch && signatureValid,
    hashMatch,
    signatureValid,
    signerDid: sigFile.signer.did,
    expectedHash,
    actualHash,
    hasProof,
    proofType: sigFile.signer.proof?.type,
    proofHandle: sigFile.signer.proof?.handle,
  };
}

function getTierStyles(tier: VerificationTier): { bg: string; color: string; icon: string; label: string } {
  switch (tier) {
    case 'publisher_verified':
      return { bg: '#d4edda', color: '#155724', icon: '✅', label: 'PUBLISHER VERIFIED' };
    case 'integrity_verified':
      return { bg: '#d4edda', color: '#155724', icon: '✅', label: 'INTEGRITY VERIFIED' };
    case 'unknown_publisher':
      return { bg: '#fff3cd', color: '#856404', icon: '⚠️', label: 'UNKNOWN PUBLISHER' };
    case 'failed':
      return { bg: '#f8d7da', color: '#721c24', icon: '🚫', label: 'VERIFICATION FAILED' };
  }
}

export default function VerifyPage() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handleZipDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.zip')) {
      setZipFile(file);
      setResult(null);
      setError(null);
    }
  }, []);

  const handleSigDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.json')) {
      setSigFile(file);
      setResult(null);
      setError(null);
    }
  }, []);

  const handleVerify = async () => {
    if (!zipFile || !sigFile) {
      setError('Please upload both the skill zip and signature file');
      return;
    }

    setVerifying(true);
    setError(null);
    setResult(null);

    try {
      // Parse signature file
      const sigText = await sigFile.text();
      const sigData = JSON.parse(sigText) as SignatureFile;

      // Verify
      const verificationResult = await verifyInBrowser(zipFile, sigData);
      setResult(verificationResult);
    } catch (err) {
      setError(`Verification failed: ${(err as Error).message}`);
    } finally {
      setVerifying(false);
    }
  };

  const tierStyles = result ? getTierStyles(result.tier) : null;

  return (
    <main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>ClawID</h1>
        </a>
        <h2 style={{ fontSize: '1.5rem', color: '#666', margin: 0, fontWeight: 'normal' }}>
          Skill Verification
        </h2>
      </div>

      {/* Instructions */}
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px'
      }}>
        <p style={{ margin: 0 }}>
          Upload a skill bundle (<code>.zip</code>) and its signature file (<code>.clawid-sig.json</code>) to verify integrity.
        </p>
      </div>

      {/* File Upload Areas */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        {/* Zip Upload */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleZipDrop}
          style={{
            border: `2px dashed ${zipFile ? '#28a745' : '#ddd'}`,
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: zipFile ? '#f8fff8' : 'transparent',
          }}
          onClick={() => document.getElementById('zip-input')?.click()}
        >
          <input
            id="zip-input"
            type="file"
            accept=".zip"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setZipFile(file);
                setResult(null);
                setError(null);
              }
            }}
          />
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📦</div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {zipFile ? zipFile.name : 'Skill Bundle (.zip)'}
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>
            {zipFile ? `${(zipFile.size / 1024).toFixed(1)} KB` : 'Drop file or click to upload'}
          </div>
        </div>

        {/* Signature Upload */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleSigDrop}
          style={{
            border: `2px dashed ${sigFile ? '#28a745' : '#ddd'}`,
            borderRadius: '8px',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            background: sigFile ? '#f8fff8' : 'transparent',
          }}
          onClick={() => document.getElementById('sig-input')?.click()}
        >
          <input
            id="sig-input"
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setSigFile(file);
                setResult(null);
                setError(null);
              }
            }}
          />
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📝</div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {sigFile ? sigFile.name : 'Signature (.clawid-sig.json)'}
          </div>
          <div style={{ color: '#666', fontSize: '0.9rem' }}>
            {sigFile ? `${(sigFile.size / 1024).toFixed(1)} KB` : 'Drop file or click to upload'}
          </div>
        </div>
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={!zipFile || !sigFile || verifying}
        style={{
          width: '100%',
          padding: '16px',
          fontSize: '1.1rem',
          background: (!zipFile || !sigFile || verifying) ? '#ccc' : '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: (!zipFile || !sigFile || verifying) ? 'not-allowed' : 'pointer',
          marginBottom: '24px',
        }}
      >
        {verifying ? 'Verifying...' : 'Verify Skill'}
      </button>

      {/* Error */}
      {error && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
        }}>
          ❌ {error}
        </div>
      )}

      {/* Result */}
      {result && tierStyles && (
        <div style={{
          background: tierStyles.bg,
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px',
        }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: tierStyles.color,
            marginBottom: '16px',
          }}>
            {tierStyles.icon} {tierStyles.label}
          </div>

          <div style={{ display: 'grid', gap: '8px', color: tierStyles.color }}>
            <div>
              <strong>Integrity:</strong>{' '}
              {result.hashMatch ? '✓ Hash matches' : '✗ Hash mismatch'}
            </div>
            <div>
              <strong>Signature:</strong>{' '}
              {result.signatureValid ? '✓ Valid' : '✗ Invalid'}
            </div>
            <div>
              <strong>Signer:</strong>{' '}
              <code style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{result.signerDid}</code>
            </div>
            {result.hasProof && (
              <div>
                <strong>Identity Proof:</strong>{' '}
                {result.proofType}: {result.proofHandle}
                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}> (use CLI for online verification)</span>
              </div>
            )}
            {!result.hasProof && result.valid && (
              <div>
                <strong>Identity:</strong> ⚠️ No proof (review code carefully)
              </div>
            )}
          </div>

          {!result.hashMatch && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px' }}>
              <div><strong>Expected:</strong> {result.expectedHash}</div>
              <div><strong>Got:</strong> {result.actualHash}</div>
            </div>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffc107',
        padding: '16px 20px',
        borderRadius: '8px',
        marginBottom: '24px',
      }}>
        <strong>⚠️ Important:</strong> ClawID verifies <em>integrity</em> and <em>provenance</em> — NOT safety.
        A verified skill means it hasn't been tampered with.
        It does NOT mean the code has been audited for malware.
      </div>

      {/* Back Link */}
      <div style={{ textAlign: 'center' }}>
        <a href="/" style={{ color: '#667eea', textDecoration: 'none' }}>← Back to Home</a>
      </div>
    </main>
  );
}
