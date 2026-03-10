import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Mock successful login for any email containing 'kpc.com'
    if (email.includes('kpc.com')) {
      const user = {
        id: '1',
        name: email.split('@')[0],
        email: email,
        role: email.startsWith('admin') ? 'admin' : 'partner',
      };
      
      const token = 'mock-jwt-token-hxyz';

      return NextResponse.json({ token, user });
    } else {
      return NextResponse.json({ error: 'Invalid credentials. Only @kpc.com emails allowed.' }, { status: 401 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
