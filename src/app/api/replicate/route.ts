import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

/**
 * Replicate API Route for Cloud-based Demucs Stem Separation
 *
 * This provides a cloud fallback for:
 * - Long audio files (>5 min) that exceed browser memory
 * - Higher quality separation with more shifts
 * - Low-powered devices that can't run WebGPU/WASM
 *
 * Uses cjwbw/demucs model on Replicate (exact HTDemucs v4)
 * Cost: ~$0.02-0.07 per separation
 *
 * Required env: REPLICATE_API_TOKEN
 */

export async function POST(request: NextRequest) {
  try {
    // Check for API token
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: 'Replicate API token not configured. Set REPLICATE_API_TOKEN in environment.' },
        { status: 500 }
      );
    }

    // Parse request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const audioUrl = formData.get('audioUrl') as string | null;
    const shifts = parseInt(formData.get('shifts') as string || '1', 10);
    const overlap = parseFloat(formData.get('overlap') as string || '0.25');

    if (!audioFile && !audioUrl) {
      return NextResponse.json(
        { error: 'No audio file or URL provided' },
        { status: 400 }
      );
    }

    // Prepare audio input
    let audioInput: string;

    if (audioUrl) {
      // Use provided URL directly
      audioInput = audioUrl;
    } else if (audioFile) {
      // Convert file to base64 data URI
      const buffer = await audioFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = audioFile.type || 'audio/wav';
      audioInput = `data:${mimeType};base64,${base64}`;
    } else {
      return NextResponse.json(
        { error: 'Invalid audio input' },
        { status: 400 }
      );
    }

    // Initialize Replicate client
    const replicate = new Replicate({
      auth: apiToken,
    });

    // Run Demucs model
    // Model: cjwbw/demucs - exact HTDemucs v4 implementation
    const output = await replicate.run(
      'cjwbw/demucs:25a173108cff36ef9f80f854c162d01df9e6528be175794b81158fa03836d953',
      {
        input: {
          audio: audioInput,
          shifts: Math.min(shifts, 10), // Max 10 shifts for quality
          overlap: Math.max(0.1, Math.min(overlap, 0.5)), // 0.1-0.5 range
        },
      }
    );

    // Output format: { bass: url, drums: url, other: url, vocals: url }
    return NextResponse.json({
      success: true,
      stems: output,
      model: 'cjwbw/demucs',
      message: 'Separation complete. Download stems from the provided URLs.',
    });

  } catch (error) {
    console.error('Replicate API error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      if (error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Invalid Replicate API token.' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: `Separation failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// GET endpoint for checking API status
export async function GET() {
  const hasToken = !!process.env.REPLICATE_API_TOKEN;

  return NextResponse.json({
    available: hasToken,
    model: 'cjwbw/demucs',
    description: 'Cloud-based Demucs stem separation via Replicate',
    instructions: hasToken
      ? 'POST with form-data: audio (file) or audioUrl (string), optional: shifts (1-10), overlap (0.1-0.5)'
      : 'Set REPLICATE_API_TOKEN in environment to enable cloud processing',
  });
}
