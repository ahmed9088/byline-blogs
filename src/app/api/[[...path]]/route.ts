import { NextRequest, NextResponse } from 'next/server';
import app from '../../../backend/server.js';

// Convert Web API Request → Node.js IncomingMessage & ServerResponse
function handleExpress(req: NextRequest): Promise<NextResponse> {
  return new Promise((resolve) => {
    const url = new URL(req.url);
    
    // Create mock req and res for Express
    const mockReq: any = {
      method: req.method,
      url: url.pathname + url.search,
      headers: Object.fromEntries(req.headers.entries()),
      connection: { remoteAddress: req.headers.get('x-forwarded-for') || '127.0.0.1' },
      socket: { remoteAddress: req.headers.get('x-forwarded-for') || '127.0.0.1' },
      ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
      on: () => mockReq,
      removeListener: () => mockReq,
    };

    const resHeaders: Record<string, string> = {};
    let resStatusCode = 200;
    const bodyChunks: Buffer[] = [];

    const mockRes: any = {
      statusCode: 200,
      headersSent: false,
      setHeader: (name: string, value: string) => {
        resHeaders[name.toLowerCase()] = value;
      },
      getHeader: (name: string) => resHeaders[name.toLowerCase()],
      removeHeader: (name: string) => {
        delete resHeaders[name.toLowerCase()];
      },
      writeHead: (status: number, headers?: Record<string, string>) => {
        resStatusCode = status;
        if (headers) {
          for (const [k, v] of Object.entries(headers)) {
            resHeaders[k.toLowerCase()] = v;
          }
        }
        return mockRes;
      },
      status: (code: number) => {
        resStatusCode = code;
        return mockRes;
      },
      write: (chunk: any) => {
        if (chunk) bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        return true;
      },
      end: (chunk?: any) => {
        if (chunk) bodyChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        const bodyBuffer = Buffer.concat(bodyChunks);
        const headers = new Headers();
        for (const [k, v] of Object.entries(resHeaders)) {
          headers.set(k, v);
        }
        resolve(new NextResponse(bodyBuffer, { status: resStatusCode, headers }));
      },
      json: (data: any) => {
        resHeaders['content-type'] = 'application/json';
        const jsonStr = JSON.stringify(data);
        const headers = new Headers();
        for (const [k, v] of Object.entries(resHeaders)) {
          headers.set(k, v);
        }
        resolve(new NextResponse(jsonStr, { status: resStatusCode, headers }));
      },
      send: (data: any) => {
        if (typeof data === 'object' && !Buffer.isBuffer(data)) {
          mockRes.json(data);
        } else {
          const str = typeof data === 'string' ? data : String(data);
          resHeaders['content-type'] = resHeaders['content-type'] || 'text/html';
          const headers = new Headers();
          for (const [k, v] of Object.entries(resHeaders)) {
            headers.set(k, v);
          }
          resolve(new NextResponse(str, { status: resStatusCode, headers }));
        }
      }
    };

    // Parse body for POST/PUT/PATCH requests before passing to Express
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      req.json().then((parsedBody) => {
        mockReq.body = parsedBody;
        app(mockReq, mockRes);
      }).catch(() => {
        mockReq.body = {};
        app(mockReq, mockRes);
      });
    } else {
      mockReq.body = {};
      app(mockReq, mockRes);
    }
  });
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) { return handleExpress(req); }
export async function POST(req: NextRequest) { return handleExpress(req); }
export async function PUT(req: NextRequest) { return handleExpress(req); }
export async function PATCH(req: NextRequest) { return handleExpress(req); }
export async function DELETE(req: NextRequest) { return handleExpress(req); }
