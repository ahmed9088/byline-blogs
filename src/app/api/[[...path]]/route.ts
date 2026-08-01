import { NextRequest, NextResponse } from 'next/server';

// Lazy-load the Express app to catch import-time errors
let appPromise: Promise<any> | null = null;
function getApp() {
  if (!appPromise) {
    appPromise = import('../../../backend/server.js')
      .then(mod => mod.default)
      .catch(err => {
        console.error('[API Route] Failed to load Express app:', err);
        appPromise = null; // retry on next request
        throw err;
      });
  }
  return appPromise;
}

// Convert Web API Request → Express mock req/res with full error handling
function handleExpress(req: NextRequest): Promise<NextResponse> {
  return new Promise(async (resolve) => {
    // Set a safety timeout so we never hang
    const timeout = setTimeout(() => {
      console.error('[API Route] Request timed out after 25s');
      resolve(NextResponse.json(
        { success: false, message: 'Request timed out' },
        { status: 504 }
      ));
    }, 25000);

    try {
      const app = await getApp();
      const url = new URL(req.url);
      
      // Create mock req for Express
      const mockReq: any = {
        method: req.method,
        url: url.pathname + url.search,
        path: url.pathname,
        query: Object.fromEntries(url.searchParams.entries()),
        headers: Object.fromEntries(req.headers.entries()),
        connection: { remoteAddress: req.headers.get('x-forwarded-for') || '127.0.0.1' },
        socket: { remoteAddress: req.headers.get('x-forwarded-for') || '127.0.0.1' },
        ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1',
        on: () => mockReq,
        removeListener: () => mockReq,
        get: (name: string) => req.headers.get(name),
        header: (name: string) => req.headers.get(name),
        params: {},
      };

      const resHeaders: Record<string, string> = {};
      let resStatusCode = 200;
      let resolved = false;

      const finalize = (body: any) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timeout);
        const headers = new Headers();
        for (const [k, v] of Object.entries(resHeaders)) {
          headers.set(k, v);
        }
        if (body === null || body === undefined || body === '') {
          resolve(new NextResponse(null, { status: resStatusCode, headers }));
        } else if (typeof body === 'object' && !Buffer.isBuffer(body)) {
          headers.set('content-type', 'application/json');
          resolve(new NextResponse(JSON.stringify(body), { status: resStatusCode, headers }));
        } else {
          const str = Buffer.isBuffer(body) ? body.toString('utf-8') : String(body);
          resolve(new NextResponse(str, { status: resStatusCode, headers }));
        }
      };

      const mockRes: any = {
        statusCode: 200,
        headersSent: false,
        setHeader: (name: string, value: string) => {
          resHeaders[name.toLowerCase()] = String(value);
          return mockRes;
        },
        getHeader: (name: string) => resHeaders[name.toLowerCase()],
        removeHeader: (name: string) => {
          delete resHeaders[name.toLowerCase()];
        },
        writeHead: (status: number, headers?: Record<string, string>) => {
          resStatusCode = status;
          if (headers) {
            for (const [k, v] of Object.entries(headers)) {
              resHeaders[k.toLowerCase()] = String(v);
            }
          }
          return mockRes;
        },
        status: (code: number) => {
          resStatusCode = code;
          return mockRes;
        },
        write: (chunk: any) => {
          // For streaming — we collect and finalize in end()
          return true;
        },
        end: (chunk?: any) => {
          finalize(chunk || '');
        },
        json: (data: any) => {
          resHeaders['content-type'] = 'application/json';
          finalize(data);
        },
        send: (data: any) => {
          if (typeof data === 'object' && !Buffer.isBuffer(data)) {
            resHeaders['content-type'] = 'application/json';
          } else {
            resHeaders['content-type'] = resHeaders['content-type'] || 'text/html';
          }
          finalize(data);
        },
        // Methods that compression/helmet may call
        on: () => mockRes,
        once: () => mockRes,
        emit: () => mockRes,
        removeListener: () => mockRes,
        flush: () => {},
      };

      // Parse body for POST/PUT/PATCH requests
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        try {
          mockReq.body = await req.json();
        } catch {
          mockReq.body = {};
        }
      } else {
        mockReq.body = {};
      }

      // Call Express — wrap in try/catch so crashes don't leave the promise hanging
      try {
        app(mockReq, mockRes);
      } catch (expressErr: any) {
        console.error('[API Route] Express sync error:', expressErr?.message || expressErr);
        clearTimeout(timeout);
        resolve(NextResponse.json(
          { success: false, message: expressErr?.message || 'Internal server error' },
          { status: 500 }
        ));
      }

    } catch (loadErr: any) {
      clearTimeout(timeout);
      console.error('[API Route] App load error:', loadErr?.message || loadErr);
      resolve(NextResponse.json(
        { success: false, message: 'Server initialization failed: ' + (loadErr?.message || 'Unknown error') },
        { status: 500 }
      ));
    }
  });
}

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(req: NextRequest) { return handleExpress(req); }
export async function POST(req: NextRequest) { return handleExpress(req); }
export async function PUT(req: NextRequest) { return handleExpress(req); }
export async function PATCH(req: NextRequest) { return handleExpress(req); }
export async function DELETE(req: NextRequest) { return handleExpress(req); }
