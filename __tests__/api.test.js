const fetch = require('node-fetch');

const BASE = 'http://localhost:3000';
const PWD_A = 'matkhau_A_2024';
const PWD_B = 'matkhau_B_2024';

let tokenA, tokenB;

async function post(path, body, token) {
  return fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/login', () => {
  test('mat khau A tra ve role A + token', async () => {
    const r = await post('/api/login', { password: PWD_A });
    const data = await r.json();
    expect(r.status).toBe(200);
    expect(data.role).toBe('A');
    expect(data.token).toBeTruthy();
    tokenA = data.token;
  });

  test('mat khau B tra ve role B + token', async () => {
    const r = await post('/api/login', { password: PWD_B });
    const data = await r.json();
    expect(r.status).toBe(200);
    expect(data.role).toBe('B');
    tokenB = data.token;
  });

  test('mat khau sai tra ve 401', async () => {
    const r = await post('/api/login', { password: 'sai' });
    expect(r.status).toBe(401);
  });

  test('khong co mat khau tra ve 400', async () => {
    const r = await post('/api/login', {});
    expect(r.status).toBe(400);
  });
});

describe('GET /api/content', () => {
  test('tra ve du 6 truong', async () => {
    const r = await fetch(`${BASE}/api/content`);
    const data = await r.json();
    expect(r.status).toBe(200);
    ['videoUrlA','captionA','updatedAtA','videoUrlB','captionB','updatedAtB']
      .forEach(key => expect(data).toHaveProperty(key));
  });
});

describe('POST /api/content/A', () => {
  test('role A cap nhat zone A thanh cong', async () => {
    const r = await post('/api/content/A', {
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      caption: 'Caption test A',
    }, tokenA);
    const data = await r.json();
    expect(r.status).toBe(200);
    expect(data.success).toBe(true);
  });

  test('role A bi chan khi sua zone B', async () => {
    const r = await post('/api/content/B', {
      videoUrl: 'https://youtu.be/abc',
      caption: 'test',
    }, tokenA);
    expect(r.status).toBe(403);
  });

  test('khong co token tra ve 401', async () => {
    const r = await post('/api/content/A', {
      videoUrl: 'https://youtu.be/abc',
      caption: 'test',
    });
    expect(r.status).toBe(401);
  });

  test('videoUrl rong tra ve 400', async () => {
    const r = await post('/api/content/A', {
      videoUrl: '',
      caption: 'test',
    }, tokenA);
    expect(r.status).toBe(400);
  });

  test('caption hon 300 tu tra ve 400', async () => {
    const r = await post('/api/content/A', {
      videoUrl: 'https://youtu.be/abc',
      caption: Array(301).fill('tu').join(' '),
    }, tokenA);
    expect(r.status).toBe(400);
  });
});

describe('POST /api/content/B', () => {
  test('role B cap nhat zone B thanh cong', async () => {
    const r = await post('/api/content/B', {
      videoUrl: 'https://www.youtube.com/watch?v=abc123',
      caption: 'Caption test B',
    }, tokenB);
    expect(r.status).toBe(200);
  });

  test('role B bi chan khi sua zone A', async () => {
    const r = await post('/api/content/A', {
      videoUrl: 'https://youtu.be/abc',
      caption: 'test',
    }, tokenB);
    expect(r.status).toBe(403);
  });
});
